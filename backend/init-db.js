const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("Starting database initialization...");
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    console.log("Connected to MySQL server.");

    const dbName = process.env.DB_NAME || "lostnova";
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${dbName}' created or already exists.`);

    await connection.query(`USE \`${dbName}\`;`);
    console.log(`Using database '${dbName}'.`);

    const schemaPath = path.join(__dirname, "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    
    // Split by semicolon, clean up comments and empty statements
    const statements = schemaSql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements from schema.sql...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await connection.query(stmt);
      } catch (err) {
        console.error(`Error executing statement #${i + 1}:`);
        console.error(stmt);
        console.error(err.message);
        throw err;
      }
    }

    console.log("Database schema initialized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
