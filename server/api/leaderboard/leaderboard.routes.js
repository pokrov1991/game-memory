const express = require("express");
const service = require("./leaderboard.service");

const router = express.Router();

const submitBuckets = new Map();
const SUBMIT_LIMIT = 10;
const SUBMIT_WINDOW_MS = 60 * 1000;

const getRateLimitKey = (req) => {
  return String(req.body?.playerId || req.ip || "anonymous");
};

const submitRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = getRateLimitKey(req);
  const bucket = submitBuckets.get(key) || {
    count: 0,
    resetAt: now + SUBMIT_WINDOW_MS,
  };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + SUBMIT_WINDOW_MS;
  }

  bucket.count += 1;
  submitBuckets.set(key, bucket);

  if (bucket.count > SUBMIT_LIMIT) {
    res.status(429).json({
      error: "rate_limited",
      message: "Too many score submissions",
    });
    return;
  }

  next();
};

const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: statusCode >= 500 ? "internal_error" : "bad_request",
    message: error.message,
  });
};

router.get("/top", async (req, res) => {
  try {
    const result = await service.getEntries({
      leaderboardName: req.query.leaderboardName || "orionBoard",
      limit: req.query.limit || req.query.quantityTop,
      playerId: req.query.playerId,
    });

    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/score", submitRateLimit, async (req, res) => {
  try {
    const result = await service.submitScore(req.body || {});
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:leaderboardName", (req, res) => {
  try {
    const leaderboardName = service.sanitizeLeaderboardName(
      req.params.leaderboardName
    );

    res.json(service.buildDescription(leaderboardName));
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:leaderboardName/entries", async (req, res) => {
  try {
    const result = await service.getEntries({
      leaderboardName: req.params.leaderboardName,
      limit: req.query.quantityTop || req.query.limit,
      playerId: req.query.playerId,
    });

    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
