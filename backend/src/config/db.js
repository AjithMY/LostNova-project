const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "lostnova",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           "Z",
  charset:            "utf8mb4",
});

// Test connection at startup
pool.getConnection()
  .then((conn) => {
    console.log(`   Database     :  ✓ Connected → ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    conn.release();
  })
  .catch((err) => {
    console.error(`   Database     :  ✗ FAILED — ${err.message}`);
    process.exit(1); // Kill server if DB is unreachable
  });

module.exports = pool;
