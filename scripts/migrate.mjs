/**
 * Applies the MySQL migrations in drizzle-mysql in order and records each completed file.
 *
 *   node scripts/migrate.mjs            apply pending migrations
 *   node scripts/migrate.mjs --status   list applied and pending migrations
 *
 * MySQL DDL implicitly commits, so a failed migration can leave some statements applied. The
 * migration is only marked complete after every statement succeeds; repair a partial run before
 * rerunning it. Use an empty database for the initial baseline, or set DB_TABLE_PREFIX (for example
 * wa_) to keep this application's tables beside another application's in a shared database: every
 * table is then created with that prefix and tables without it are never touched.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { migrationStatements, prefixLike, readTablePrefix, trackerTable } from "./table-prefix.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationDir = path.join(root, "drizzle-mysql");

function loadEnv() {
  const searchedDirs = [root, process.cwd(), path.resolve(root, ".."), path.resolve(process.cwd(), "..")];
  const fileNames = [".env", ".env.production", ".env.local"];
  for (const dir of new Set(searchedDirs)) {
    for (const name of fileNames) {
      const file = path.join(dir, name);
      if (!fs.existsSync(file)) continue;
      for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
        if (match) {
          const key = match[1];
          const val = match[2].replace(/^(["'])(.*)\1$/, "$2").trim();
          if ((process.env[key] === undefined || process.env[key].trim() === "") && val) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();
let prefix = "";
try {
  prefix = readTablePrefix();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const tracker = trackerTable(prefix);
const lockName = `ethio_wellness_schema_migrations${prefix ? `:${prefix}` : ""}`;
const statusOnly = process.argv.includes("--status");
const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set. Configure a MySQL connection string in .env or pass it directly:");
  console.error('  DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/DATABASE" npm run db:setup');
  process.exit(1);
}
if (!/^mysql:\/\//.test(url)) {
  console.error("DATABASE_URL must be a MySQL address (mysql://…).");
  process.exit(1);
}

const files = fs.readdirSync(migrationDir).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort();
if (!files.length) {
  console.error(`No MySQL migrations found in ${migrationDir}. Generate the initial baseline with drizzle-kit.`);
  process.exit(1);
}

const connection = await mysql.createConnection({ uri: url, connectTimeout: 20_000, timezone: "Z", charset: "utf8mb4" });
let acquiredLock = false;
let failed = false;
try {
  await connection.query("SET time_zone = '+00:00'");
  const [versionRows] = await connection.query("SELECT VERSION() AS version");
  const serverVersion = String(versionRows[0]?.version ?? "");
  if (serverVersion.toLowerCase().includes("mariadb") || Number.parseInt(serverVersion, 10) < 8) {
    throw new Error(`MySQL 8.0+ is required; connected server reports ${serverVersion || "an unknown version"}.`);
  }
  const [lockRows] = await connection.query("SELECT GET_LOCK(?, 30) AS acquired", [lockName]);
  acquiredLock = Number(lockRows[0]?.acquired) === 1;
  if (!acquiredLock) throw new Error("Could not acquire the database migration lock within 30 seconds.");

  const [trackerRows] = await connection.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [tracker],
  );
  const trackerExists = trackerRows.length > 0;
  const [appliedRows] = trackerExists ? await connection.query(`SELECT name FROM \`${tracker}\``) : [[]];
  const applied = new Set(appliedRows.map((row) => row.name));
  const pending = files.filter((name) => !applied.has(name));

  if (prefix) console.log(`Table prefix: ${prefix} (tables without it are left alone).`);
  if (statusOnly) {
    console.log(`Applied: ${applied.size ? [...applied].sort().join(", ") : "nothing yet"}`);
    console.log(`Pending: ${pending.length ? pending.join(", ") : "nothing — the database is up to date"}`);
  } else if (!pending.length) {
    console.log("The database is up to date.");
  } else {
    if (!applied.size) {
      // Without a prefix the database must be empty. With one, only tables carrying it count:
      // another application's tables may be present and are not this script's business.
      const [tableRows] = prefix
        ? await connection.query(
            "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE ? AND table_name <> ?",
            [prefixLike(prefix), tracker],
          )
        : await connection.query(
            "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name <> ?",
            [tracker],
          );
      if (Number(tableRows[0]?.count) > 0) {
        throw new Error(
          prefix
            ? `Tables starting with "${prefix}" already exist but there is no migration history for them. Choose another DB_TABLE_PREFIX; no existing tables were changed.`
            : "The MySQL database is not empty but has no migration history. Use a fresh dedicated database, or set DB_TABLE_PREFIX (for example wa_) to share this one; no existing tables were changed.",
        );
      }
    }
    if (!trackerExists) {
      await connection.query(
        `CREATE TABLE \`${tracker}\` (name VARCHAR(255) NOT NULL PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB`,
      );
    }

    for (const name of pending) {
      // Prefixing happens before anything runs, so an unsupported statement stops the file untouched.
      const statements = migrationStatements(fs.readFileSync(path.join(migrationDir, name), "utf8"), prefix);
      for (const statement of statements) await connection.query(statement);
      await connection.query(`INSERT INTO \`${tracker}\` (name) VALUES (?)`, [name]);
      console.log(`applied ${name}`);
    }
    console.log("The database is up to date.");
  }
} catch (error) {
  failed = true;
  console.error(`Migration stopped: ${error instanceof Error ? error.message : error}`);
  console.error("MySQL DDL may have committed earlier statements from the failing migration; inspect and repair before retrying.");
} finally {
  if (acquiredLock) await connection.query("SELECT RELEASE_LOCK(?)", [lockName]).catch(() => {});
  await connection.end();
}
process.exitCode = failed ? 1 : 0;
