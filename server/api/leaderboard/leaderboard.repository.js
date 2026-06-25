const db = require("../../db");

const mapEntry = (row) => ({
  extraData: row.extra_data || undefined,
  rank: Number(row.rank),
  score: Number(row.score),
  player: {
    id: row.player_id,
    name: row.player_name,
    avatar: row.avatar,
  },
});

const upsertScore = async ({
  leaderboardName,
  playerId,
  playerName,
  avatar,
  score,
  extraData,
}) => {
  const result = await db.query(
    `
      INSERT INTO leaderboard_scores (
        leaderboard_name,
        player_id,
        player_name,
        avatar,
        score,
        extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (leaderboard_name, player_id)
      DO UPDATE SET
        player_name = EXCLUDED.player_name,
        avatar = EXCLUDED.avatar,
        score = GREATEST(leaderboard_scores.score, EXCLUDED.score),
        extra_data = CASE
          WHEN EXCLUDED.score >= leaderboard_scores.score
            THEN EXCLUDED.extra_data
          ELSE leaderboard_scores.extra_data
        END,
        updated_at = CASE
          WHEN EXCLUDED.score >= leaderboard_scores.score
            THEN NOW()
          ELSE leaderboard_scores.updated_at
        END
      RETURNING *
    `,
    [leaderboardName, playerId, playerName, avatar, score, extraData || null]
  );

  return result.rows[0];
};

const getTopEntries = async (leaderboardName, limit) => {
  const result = await db.query(
    `
      SELECT
        player_id,
        player_name,
        avatar,
        score,
        extra_data,
        RANK() OVER (ORDER BY score DESC, updated_at ASC, id ASC) AS rank
      FROM leaderboard_scores
      WHERE leaderboard_name = $1
      ORDER BY score DESC, updated_at ASC, id ASC
      LIMIT $2
    `,
    [leaderboardName, limit]
  );

  return result.rows.map(mapEntry);
};

const getEntriesAroundPlayer = async (leaderboardName, playerId, quantityAround) => {
  if (!playerId || !quantityAround) return [];

  const result = await db.query(
    `
      WITH ranked_scores AS (
        SELECT
          player_id,
          player_name,
          avatar,
          score,
          extra_data,
          RANK() OVER (ORDER BY score DESC, updated_at ASC, id ASC) AS rank
        FROM leaderboard_scores
        WHERE leaderboard_name = $1
      ),
      current_player AS (
        SELECT rank
        FROM ranked_scores
        WHERE player_id = $2
      )
      SELECT ranked_scores.*
      FROM ranked_scores, current_player
      WHERE ranked_scores.rank BETWEEN
        GREATEST(1, current_player.rank - $3::INTEGER)
        AND current_player.rank + $3::INTEGER
      ORDER BY ranked_scores.rank ASC, ranked_scores.score DESC
    `,
    [leaderboardName, playerId, quantityAround]
  );

  return result.rows.map(mapEntry);
};

const getPlayerRank = async (leaderboardName, playerId) => {
  if (!playerId) return 0;

  const result = await db.query(
    `
      SELECT rank
      FROM (
        SELECT
          player_id,
          RANK() OVER (ORDER BY score DESC, updated_at ASC, id ASC) AS rank
        FROM leaderboard_scores
        WHERE leaderboard_name = $1
      ) ranked_scores
      WHERE player_id = $2
    `,
    [leaderboardName, playerId]
  );

  return result.rows[0] ? Number(result.rows[0].rank) : 0;
};

const findPlayerByName = async (playerName, playerId = "") => {
  const result = await db.query(
    `
      SELECT player_id, player_name
      FROM leaderboard_scores
      WHERE LOWER(player_name) = LOWER($1)
        AND ($2 = '' OR player_id <> $2)
      LIMIT 1
    `,
    [playerName, playerId]
  );

  return result.rows[0] || null;
};

module.exports = {
  findPlayerByName,
  getEntriesAroundPlayer,
  getPlayerRank,
  getTopEntries,
  upsertScore,
};
