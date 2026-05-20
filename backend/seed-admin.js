require("dotenv").config();
const db = require("./src/config/db");

const HASH = "$2b$12$HsZTkiYx3LxWeogaFiFjcuC7OmOf.kZOj.BNWHI7tNbyr5cVCECya";

async function run() {
  try {
    // Try update first
    const [upd] = await db.query(
      "UPDATE users SET password_hash=?, is_verified=1, role='admin' WHERE email='admin@lostnova.ai'",
      [HASH]
    );
    console.log("Updated rows:", upd.affectedRows);

    if (upd.affectedRows === 0) {
      // Insert if not exists
      await db.query(
        "INSERT IGNORE INTO users (name, email, password_hash, role, is_verified) VALUES (?,?,?,?,1)",
        ["Admin", "admin@lostnova.ai", HASH, "admin"]
      );
      console.log("Inserted admin user.");
    }

    console.log("\n✓ Admin credentials ready:");
    console.log("  Email   : admin@lostnova.ai");
    console.log("  Password: Admin@1234");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

run();
