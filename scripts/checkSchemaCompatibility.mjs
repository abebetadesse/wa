/**
 * Checks that the MySQL baseline tables required by the application exist.
 * Run `npm run db:migrate` first when the database is empty.
 */
import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import { readTablePrefix } from "./table-prefix.mjs";

const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(DATABASE_URL|DB_TABLE_PREFIX)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}
const url = process.env.DATABASE_URL;
if (!url || !/^mysql:\/\//.test(url)) {
  console.error("Set DATABASE_URL to a MySQL connection string.");
  process.exit(1);
}

const connection = await mysql.createConnection({ uri: url, connectTimeout: 20_000 });
try {
  const [rows] = await connection.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type IN ('BASE TABLE', 'VIEW')",
  );
  const tableNames = new Set(rows.map((row) => row.table_name));
  const prefix = readTablePrefix();
  const required = ["users", "wellbeing_profiles", "wellbeing_gap_reports", "auth_sessions", "realtime_events"].map((name) => `${prefix}${name}`);
  const missing = required.filter((name) => !tableNames.has(name));
  console.log(`MySQL schema in ${new URL(url).pathname.slice(1)}: ${tableNames.size} tables/views.`);
  if (missing.length) {
    console.error(`Missing required application tables: ${missing.join(", ")}. Run npm run db:migrate.`);
    process.exitCode = 1;
  } else {
    console.log("Required MySQL tables are present.");
  }
} finally {
  await connection.end();
}
