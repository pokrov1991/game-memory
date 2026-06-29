const repository = require("./leaderboard.repository");

const MAX_SCORE = 100000000;
const MAX_PLAYER_NAME_LENGTH = 32;
const MAX_EXTRA_DATA_LENGTH = 512;
const MAX_AVATAR_LENGTH = 2048;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const sanitizeLeaderboardName = (value) => {
  const leaderboardName = String(value || "").trim();

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(leaderboardName)) {
    const error = new Error("Invalid leaderboardName");
    error.statusCode = 400;
    throw error;
  }

  return leaderboardName;
};

const sanitizeLimit = (value) => {
  const limit = Number(value || DEFAULT_LIMIT);

  if (!Number.isInteger(limit) || limit < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(limit, MAX_LIMIT);
};

const sanitizeAroundLimit = (value) => {
  if (value === undefined || value === null || value === "") return 0;

  return sanitizeLimit(value);
};

const assertString = (value, fieldName, maxLength) => {
  if (typeof value !== "string") {
    const error = new Error(`${fieldName} must be a string`);
    error.statusCode = 400;
    throw error;
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength) {
    const error = new Error(`${fieldName} length must be 1-${maxLength}`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

const buildDescription = (leaderboardName) => ({
  name: leaderboardName,
  title: leaderboardName,
});

const submitScore = async (body) => {
  const leaderboardName = sanitizeLeaderboardName(body.leaderboardName);
  const playerId = assertString(body.playerId, "playerId", 128);
  const playerName = assertString(
    body.playerName || "Player",
    "playerName",
    MAX_PLAYER_NAME_LENGTH
  );
  const avatar =
    typeof body.avatar === "string"
      ? body.avatar.trim().slice(0, MAX_AVATAR_LENGTH)
      : "";
  const score = Number(body.score);
  const extraData =
    typeof body.extraData === "string"
      ? body.extraData.slice(0, MAX_EXTRA_DATA_LENGTH)
      : undefined;

  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    const error = new Error(`score must be an integer from 0 to ${MAX_SCORE}`);
    error.statusCode = 400;
    throw error;
  }

  await repository.upsertScore({
    avatar,
    extraData,
    leaderboardName,
    playerId,
    playerName,
    score,
  });

  const userRank = await repository.getPlayerRank(leaderboardName, playerId);

  return {
    leaderboard: buildDescription(leaderboardName),
    userRank,
  };
};

const getEntries = async ({ leaderboardName, limit, playerId }) => {
  return getEntriesWithOptions({ leaderboardName, limit, playerId });
};

const getEntriesWithOptions = async ({
  leaderboardName,
  limit,
  playerId,
  includeUser,
  quantityAround,
}) => {
  const normalizedLeaderboardName = sanitizeLeaderboardName(leaderboardName);
  const normalizedLimit = sanitizeLimit(limit);
  const topEntries = await repository.getTopEntries(
    normalizedLeaderboardName,
    normalizedLimit
  );
  const shouldIncludeUser = includeUser === true || includeUser === "true";
  const aroundLimit = sanitizeAroundLimit(quantityAround);
  const aroundEntries = shouldIncludeUser
    ? await repository.getEntriesAroundPlayer(
        normalizedLeaderboardName,
        playerId ? String(playerId) : "",
        aroundLimit
      )
    : [];
  const entriesByPlayerId = new Map();

  topEntries.forEach((entry) => {
    entriesByPlayerId.set(entry.player.id, entry);
  });

  aroundEntries.forEach((entry) => {
    entriesByPlayerId.set(entry.player.id, entry);
  });

  const entries = Array.from(entriesByPlayerId.values()).sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;

    return b.score - a.score;
  });
  const userRank = await repository.getPlayerRank(
    normalizedLeaderboardName,
    playerId ? String(playerId) : ""
  );

  return {
    leaderboard: buildDescription(normalizedLeaderboardName),
    ranges: [
      {
        start: topEntries[0]?.rank ? topEntries[0].rank - 1 : 0,
        size: topEntries.length,
      },
      ...(aroundEntries.length
        ? [{
            start: aroundEntries[0].rank - 1,
            size: aroundEntries.length,
          }]
        : []),
    ],
    userRank,
    entries,
  };
};

const isPlayerNameAvailable = async ({ playerName, playerId }) => {
  const normalizedPlayerName = assertString(
    playerName,
    "playerName",
    MAX_PLAYER_NAME_LENGTH
  );
  const normalizedPlayerId =
    typeof playerId === "string" ? playerId.trim().slice(0, 128) : "";
  const existingPlayer = await repository.findPlayerByName(
    normalizedPlayerName,
    normalizedPlayerId
  );

  return {
    available: !existingPlayer,
  };
};

module.exports = {
  DEFAULT_LIMIT,
  MAX_PLAYER_NAME_LENGTH,
  MAX_SCORE,
  buildDescription,
  getEntries,
  getEntriesWithOptions,
  isPlayerNameAvailable,
  sanitizeLeaderboardName,
  submitScore,
};
