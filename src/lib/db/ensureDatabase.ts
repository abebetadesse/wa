import mysql from "mysql2/promise";

async function ensureDatabase() {
  const rootUrl = process.env.DATABASE_ROOT_URL || "mysql://root:root@localhost:3306";
  const client = await mysql.createConnection(rootUrl);

  try {
    const [rows] = await client.query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'ethio_wellness'");
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log("Creating database ethio_wellness...");
      await client.query("CREATE DATABASE ethio_wellness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
      console.log("Database ethio_wellness created successfully.");
    } else {
      console.log("Database ethio_wellness already exists.");
    }
  } catch (err: any) {
    console.error("Could not ensure database ethio_wellness:", err.message);
  } finally {
    await client.end();
  }
}

ensureDatabase();
