/**
 * Applies one or more MySQL migration files from drizzle-mysql and records them as applied.
 *   node scripts/apply-sql.mjs drizzle-mysql/0001_example.sql
 *
 * Use scripts/migrate.mjs for the normal ordered deployment path.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationDir = path.join(root, "drizzle-mysql");

function loadEnv() {
  const file = path.join(root, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

loadEnv();
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
if (!requested.length) {
  console.error("Provide one or more SQL files from drizzle-mysql/.");
  process.exit(1);
}
if (!process.env.DATABASE_URL || !/^mysql:\/\//.test(process.env.DATABASE_URL)) {
  console.error("Set DATABASE_URL to a MySQL connection string in .env or the environment.");
  process.exit(1);
}

const files = requested.map((name) => path.resolve(root, name));
if (files.some((file) => !file.startsWith(`${migrationDir}${path.sep}`) || !fs.existsSync(file))) {
  console.error("Only existing migration files within drizzle-mysql/ can be applied; PostgreSQL migrations are not accepted.");
  process.exit(1);
}

const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 20_000, timezone: "Z", charset: "utf8mb4" });
try {
  await connection.query("SET time_zone = '+00:00'");
  await connection.query(
    "CREATE TABLE IF NOT EXISTS `_applied_sql` (name VARCHAR(255) NOT NULL PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB",
  );
  for (const file of files) {
    const name = path.basename(file);
    const [rows] = await connection.query("SELECT 1 FROM `_applied_sql` WHERE name = ?", [name]);
    if (rows.length) {
      console.log(`skip ${name} (already applied)`);
      continue;
    }
    const text = fs.readFileSync(file, "utf8");
    for (const statement of text.split(/-->\s*statement-breakpoint/).map((part) => part.trim()).filter(Boolean)) {
      await connection.query(statement);
    }
    await connection.query("INSERT INTO `_applied_sql` (name) VALUES (?)", [name]);
    console.log(`applied ${name}`);
  }
} catch (error) {
  console.error(`Migration stopped: ${error instanceof Error ? error.message : error}`);
  console.error("MySQL DDL may have committed earlier statements; inspect the database before retrying.");
  process.exitCode = 1;
} finally {
  await connection.end();
}
