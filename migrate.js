/**
 * Migration: add 'recovered' to found_items.status ENUM
 * and add 'matched' to lost_items.status if not present
 * Run: node backend/migrate.js
 */
require("dotenv").config({ path: __dirname + "/backend/.env" });
const db = require("./backend/src/config/db");

async function run() {
  try {
    console.log("Running migrations…");

    // Allow 'recovered' on found_items.status
    await db.query(`
      ALTER TABLE found_items
      MODIFY COLUMN status ENUM('open','matched','claimed','recovered')
      NOT NULL DEFAULT 'open'
    `);
    console.log("✓  found_items.status now includes 'recovered'");

    // Ensure 'matched' is also in lost_items (it already should be but make explicit)
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
