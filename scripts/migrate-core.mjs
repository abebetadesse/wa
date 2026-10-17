/**
 * Applies the MySQL migrations in a folder, in order, and records each completed file.
 * Used by the command line (scripts/migrate.mjs) and by the application's own start-up set-up
 * (src/server/setup/autoSetup.ts), so both follow exactly the same rules.
 *
 * MySQL DDL commits statement by statement, so a run that is interrupted (the host restarts the
 * process, the connection drops) leaves a migration half applied. Progress is therefore recorded
 * after every statement in `<prefix>_migration_progress`, and the next run continues from there.
 * A migration is marked complete in `<prefix>_applied_sql` only after its last statement.
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { migrationStatements, prefixLike, trackerTable } from "./table-prefix.mjs";

/** "Already there" / "already gone": what a statement reports when it ran just before an interruption. */
const ALREADY_APPLIED = new Set([1050, 1051, 1060, 1061, 1091, 1826, 3822]);

/**
 * @param {{ url: string, prefix?: string, migrationDir: string, statusOnly?: boolean, log?: (line: string) => void }} options
 * @returns {Promise<{ applied: string[], pending: string[], ran: string[] }>} `ran` lists the files applied by this call.
 */
export async function runMigrations({ url, prefix = "", migrationDir, statusOnly = false, log = console.log }) {
  if (!/^mysql:\/\//.test(url ?? "")) throw new Error("DATABASE_URL must be a MySQL address (mysql://…).");
  const files = fs.existsSync(migrationDir) ? fs.readdirSync(migrationDir).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort() : [];
  if (!files.length) throw new Error(`No MySQL migrations found in ${migrationDir}.`);

  const tracker = trackerTable(prefix);
  const progress = `${prefix}_migration_progress`;
  const lockName = `ethio_wellness_schema_migrations${prefix ? `:${prefix}` : ""}`;
  const connection = await mysql.createConnection({ uri: url, connectTimeout: 20_000, timezone: "Z", charset: "utf8mb4" });
  let acquiredLock = false;
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
    const ran = [];
    const [progressTable] = await connection.query(
      "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
      [progress],
    );
    const [progressRows] = progressTable.length ? await connection.query(`SELECT name, statements FROM \`${progress}\``) : [[]];
    /** Statements already applied from a migration that was interrupted. */
    const interrupted = new Map(progressRows.map((row) => [row.name, Number(row.statements)]));

    if (prefix) log(`Table prefix: ${prefix} (tables without it are left alone).`);
    if (statusOnly) {
      log(`Applied: ${applied.size ? [...applied].sort().join(", ") : "nothing yet"}`);
      log(`Pending: ${pending.length ? pending.join(", ") : "nothing — the database is up to date"}`);
      return { applied: [...applied].sort(), pending, ran };
    }
    if (!pending.length) {
      log("The database is up to date.");
      return { applied: [...applied].sort(), pending, ran };
    }

    if (!applied.size && !interrupted.size) {
      // Without a prefix the database must be empty. With one, only tables carrying it count:
      // another application's tables may be present and are not this runner's business.
      const [tableRows] = prefix
        ? await connection.query(
            "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE ? AND table_name NOT IN (?, ?)",
            [prefixLike(prefix), tracker, progress],
          )
        : await connection.query(
            "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name NOT IN (?, ?)",
            [tracker, progress],
          );
      if (Number(tableRows[0]?.count) > 0) {
        throw new Error(
          prefix
            ? `Tables starting with "${prefix}" already exist but there is no migration history for them. Choose another DB_TABLE_PREFIX; no existing tables were changed.`
            : "The MySQL database is not empty but has no migration history. Use a fresh dedicated database, or set DB_TABLE_PREFIX (for example wa_) to share this one; no existing tables were changed.",
        );
      }
    }
    await connection.query(
      `CREATE TABLE IF NOT EXISTS \`${tracker}\` (name VARCHAR(255) NOT NULL PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB`,
    );
    await connection.query(
      `CREATE TABLE IF NOT EXISTS \`${progress}\` (name VARCHAR(255) NOT NULL PRIMARY KEY, statements INT NOT NULL DEFAULT 0) ENGINE=InnoDB`,
    );

    for (const name of pending) {
      // Prefixing happens before anything runs, so an unsupported statement stops the file untouched.
      const statements = migrationStatements(fs.readFileSync(path.join(migrationDir, name), "utf8"), prefix);
      const resumeAt = interrupted.get(name);
      if (resumeAt === undefined) await connection.query(`INSERT INTO \`${progress}\` (name, statements) VALUES (?, 0)`, [name]);
      else log(`continuing ${name} from statement ${resumeAt + 1} of ${statements.length}`);
      for (let index = resumeAt ?? 0; index < statements.length; index++) {
        try {
          await connection.query(statements[index]);
        } catch (error) {
          // Only the statement right after the recorded point can have run without being recorded.
          if (!(index === resumeAt && ALREADY_APPLIED.has(error?.errno))) throw error;
        }
        await connection.query(`UPDATE \`${progress}\` SET statements = ? WHERE name = ?`, [index + 1, name]);
      }
      await connection.query(`INSERT INTO \`${tracker}\` (name) VALUES (?)`, [name]);
      await connection.query(`DELETE FROM \`${progress}\` WHERE name = ?`, [name]);
      ran.push(name);
      log(`applied ${name}`);
    }
    log("The database is up to date.");
    return { applied: [...applied, ...ran].sort(), pending: [], ran };
  } finally {
    if (acquiredLock) await connection.query("SELECT RELEASE_LOCK(?)", [lockName]).catch(() => {});
    await connection.end();
  }
}
