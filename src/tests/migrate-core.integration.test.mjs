import { after, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import mysql from "mysql2/promise";
import { runMigrations } from "../../scripts/migrate-core.mjs";

// Runs inside the test database under a throwaway table prefix, with its own tiny migrations, so
// the application's real tables are never involved. Everything it creates is dropped afterwards.
const url = process.env.DATABASE_URL || "mysql://root:devroot@localhost:3307/ethio_wellness";
const prefix = `t${crypto.randomBytes(3).toString("hex")}_`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wa-migrations-"));
const BREAK = "--> statement-breakpoint\n";

fs.writeFileSync(
  path.join(dir, "0000_first.sql"),
  [
    "CREATE TABLE `authors` (`id` int NOT NULL, `name` varchar(40) NOT NULL, CONSTRAINT `authors_id` PRIMARY KEY(`id`));",
    "CREATE TABLE `books` (`id` int NOT NULL, `author_id` int NOT NULL, CONSTRAINT `books_id` PRIMARY KEY(`id`));",
    "ALTER TABLE `books` ADD CONSTRAINT `books_author_id_authors_id_fk` FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON DELETE cascade ON UPDATE no action;",
    "CREATE INDEX `books_author_idx` ON `books` (`author_id`);",
  ].join(BREAK),
);

const connection = await mysql.createConnection({ uri: url });
const tables = async () => {
  const [rows] = await connection.query("SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE ? ORDER BY 1", [`${prefix.replace("_", "\\_")}%`]);
  return rows.map((row) => row.name.slice(prefix.length));
};
const reset = async () => {
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const name of await tables()) await connection.query(`DROP TABLE \`${prefix}${name}\``);
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
};
const run = async (extra = {}) => {
  const lines = [];
  const result = await runMigrations({ url, prefix, migrationDir: dir, log: (line) => lines.push(line), ...extra });
  return { ...result, lines };
};

after(async () => {
  await reset();
  await connection.end();
  fs.rmSync(dir, { recursive: true, force: true });
});

test("migrations: applied once, under the prefix, beside whatever else the database holds", async () => {
  const first = await run();
  assert.deepEqual(first.ran, ["0000_first.sql"]);
  assert.deepEqual(await tables(), ["_applied_sql", "_migration_progress", "authors", "books"]);
  const [fks] = await connection.query("SELECT constraint_name AS name, referenced_table_name AS target FROM information_schema.referential_constraints WHERE constraint_schema = DATABASE() AND table_name = ?", [`${prefix}books`]);
  assert.deepEqual(fks.map((row) => [row.name, row.target]), [[`${prefix}books_author_id_authors_id_fk`, `${prefix}authors`]]);
  const [progress] = await connection.query(`SELECT * FROM \`${prefix}_migration_progress\``);
  assert.equal(progress.length, 0, "nothing is left in progress");

  const second = await run();
  assert.deepEqual(second.ran, []);
  assert.deepEqual(second.applied, ["0000_first.sql"]);
  assert.ok(second.lines.includes("The database is up to date."));
  const status = await run({ statusOnly: true });
  assert.ok(status.lines.some((line) => line.startsWith("Applied: 0000_first.sql")));
});

test("migrations: a run stopped halfway continues from where it stopped", async () => {
  await reset();
  // What an interrupted run leaves behind: the first two statements ran, only the first was recorded.
  await connection.query(`CREATE TABLE \`${prefix}_applied_sql\` (name VARCHAR(255) NOT NULL PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB`);
  await connection.query(`CREATE TABLE \`${prefix}_migration_progress\` (name VARCHAR(255) NOT NULL PRIMARY KEY, statements INT NOT NULL DEFAULT 0) ENGINE=InnoDB`);
  await connection.query(`CREATE TABLE \`${prefix}authors\` (\`id\` int NOT NULL, \`name\` varchar(40) NOT NULL, PRIMARY KEY(\`id\`))`);
  await connection.query(`CREATE TABLE \`${prefix}books\` (\`id\` int NOT NULL, \`author_id\` int NOT NULL, PRIMARY KEY(\`id\`))`);
  await connection.query(`INSERT INTO \`${prefix}_migration_progress\` (name, statements) VALUES ('0000_first.sql', 1)`);

  const resumed = await run();
  assert.ok(resumed.lines.includes("continuing 0000_first.sql from statement 2 of 4"), resumed.lines.join(" | "));
  assert.deepEqual(resumed.ran, ["0000_first.sql"]);
  const [indexes] = await connection.query(`SHOW INDEX FROM \`${prefix}books\` WHERE Key_name = 'books_author_idx'`);
  assert.equal(indexes.length, 1, "the remaining statements were applied");
  const [progress] = await connection.query(`SELECT * FROM \`${prefix}_migration_progress\``);
  assert.equal(progress.length, 0);
});

test("migrations: tables that carry the prefix but have no history are never adopted", async () => {
  await reset();
  await connection.query(`CREATE TABLE \`${prefix}authors\` (\`id\` int NOT NULL, PRIMARY KEY(\`id\`))`);
  await assert.rejects(() => run(), /already exist but there is no migration history/);
  assert.deepEqual(await tables(), ["authors"], "nothing was created or changed");
});

test("migrations: a real failure stops the file and is reported, and the next run resumes after a fix", async () => {
  await reset();
  fs.writeFileSync(path.join(dir, "0001_second.sql"), ["ALTER TABLE `books` ADD `title` varchar(80);", "ALTER TABLE `books` ADD CONSTRAINT `books_missing_fk` FOREIGN KEY (`id`) REFERENCES `missing`(`id`);"].join(BREAK));
  await assert.rejects(() => run(), (error) => /missing|open|reference/i.test(error.message));
  const [progress] = await connection.query(`SELECT name, statements FROM \`${prefix}_migration_progress\``);
  assert.deepEqual(progress.map((row) => [row.name, row.statements]), [["0001_second.sql", 1]], "the first file is complete; the second stopped after its first statement");

  fs.writeFileSync(path.join(dir, "0001_second.sql"), ["ALTER TABLE `books` ADD `title` varchar(80);", "CREATE INDEX `books_title_idx` ON `books` (`title`);"].join(BREAK));
  const fixed = await run();
  assert.deepEqual(fixed.ran, ["0001_second.sql"]);
  assert.ok(fixed.lines.includes("continuing 0001_second.sql from statement 2 of 2"));
});
