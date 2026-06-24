require("dotenv").config();

const { closePool, runMigrations } = require("./index");

runMigrations()
  .then(async () => {
    await closePool();
    console.log("Migrations completed");
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await closePool();
    process.exit(1);
  });
