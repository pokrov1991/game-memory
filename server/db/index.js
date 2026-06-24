const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
    })
  : null;

const getPool = () => {
  if (!pool) {
    throw new Error("DATABASE_URL is required for leaderboard API");
  }

  return pool;
};

const query = (text, params) => {
  return getPool().query(text, params);
};

const runMigrations = async () => {
  const client = await getPool().connect();
  const migrationsDir = path.join(__dirname, "migrations");

  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const migrationId = file.replace(/\.sql$/, "");
      const alreadyApplied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE id = $1",
        [migrationId]
      );

      if (alreadyApplied.rowCount > 0) continue;

      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [
        migrationId,
      ]);
      console.log(`Applied migration ${migrationId}`);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const closePool = async () => {
  if (pool) {
    await pool.end();
  }
};

module.exports = {
  closePool,
  getPool,
  query,
  runMigrations,
};
