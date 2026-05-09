/**
 * Migration: add 'recovered' to found_items.status ENUM
 * Run from backend/: node migrate.js
 */
require("dotenv").config();
const db = require("./src/config/db");

async function run() {
  try {
    console.log("Running migrations…");

    await db.query(`
      ALTER TABLE found_items
      MODIFY COLUMN status ENUM('open','matched','claimed','recovered')
      NOT NULL DEFAULT 'open'
    `);
    console.log("✓  found_items.status now includes 'recovered'");

    await db.query(`
      ALTER TABLE lost_items
      MODIFY COLUMN status ENUM('open','matched','recovered')
      NOT NULL DEFAULT 'open'
    `);
    console.log("✓  lost_items.status confirmed");

    console.log("\nAll migrations complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

run();
