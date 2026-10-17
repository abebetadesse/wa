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
 *
 * The rules live in migrate-core.mjs, which the application also runs by itself at start-up, so on
 * hosts whose script runner cannot see the settings this command is not needed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations } from "./migrate-core.mjs";
import { readTablePrefix } from "./table-prefix.mjs";

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

try {
  await runMigrations({ url, prefix, migrationDir, statusOnly });
} catch (error) {
  console.error(`Migration stopped: ${error instanceof Error ? error.message : error}`);
  console.error("If a migration had started, MySQL may have committed its earlier statements; inspect and repair before retrying.");
  process.exitCode = 1;
}
