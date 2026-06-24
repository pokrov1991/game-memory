require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");

const { attachBattleServer, WS_PATH } = require("./ws/battle-server");
const leaderboardRoutes = require("./api/leaderboard/leaderboard.routes");
const { closePool } = require("./db");

const PORT = Number(process.env.PORT || 8080);
const CLIENT_DIST_DIR = path.resolve(
  __dirname,
  process.env.CLIENT_DIST_DIR || "../dist"
);
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const app = express();

if (CORS_ORIGIN) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", CORS_ORIGIN);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });
}

app.use(express.json({ limit: "16kb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/leaderboard", leaderboardRoutes);

app.use(express.static(CLIENT_DIST_DIR));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path === WS_PATH) {
    next();
    return;
  }

  res.sendFile(path.join(CLIENT_DIST_DIR, "index.html"));
});

const server = http.createServer(app);
attachBattleServer(server);

server.listen(PORT, () => {
  console.log(`Orion7 server started on port ${PORT}`);
  console.log(`Static client dir: ${CLIENT_DIST_DIR}`);
  console.log(`WebSocket path: ${WS_PATH}`);
});

const shutdown = async () => {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
