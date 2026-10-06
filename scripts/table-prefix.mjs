/**
 * Table prefix for sharing one MySQL database with another application.
 *
 *   DB_TABLE_PREFIX=wa_      every table of this application is created and read as wa_<name>
 *
 * The checked-in migrations in drizzle-mysql/ are written without a prefix. When a prefix is set,
 * the migration runner passes each statement through `prefixStatement`, which renames this
 * application's tables and its foreign-key and check constraints (those names are unique per
 * database in MySQL). A statement of a kind this file does not know is refused, so a prefixed
 * run can never create, change or drop a table without the prefix.
 *
 * The application applies the same prefix to its queries in src/lib/db/mysqlSchema.ts.
 */
import crypto from "node:crypto";

const MAX_IDENTIFIER = 64;
const NAME = "`([^`]+)`";

/** Lowercase letters and digits ending in one underscore, e.g. "wa_". Empty means no prefix. */
export function readTablePrefix(value = process.env.DB_TABLE_PREFIX) {
  const prefix = (value ?? "").trim();
  if (!prefix) return "";
  if (!/^[a-z][a-z0-9]{0,10}_$/.test(prefix)) {
    throw new Error(`DB_TABLE_PREFIX "${prefix}" is not valid. Use 1–11 lowercase letters or digits followed by one underscore, for example wa_.`);
  }
  return prefix;
}

/** The prefixed name, shortened with a stable digest when it would exceed MySQL's 64 characters. */
export function prefixedName(prefix, name) {
  const full = `${prefix}${name}`;
  if (full.length <= MAX_IDENTIFIER) return full;
  const digest = crypto.createHash("sha256").update(name).digest("hex").slice(0, 8);
  return `${full.slice(0, MAX_IDENTIFIER - 9)}_${digest}`;
}

/** Statement kinds the rewriter understands. Each rule renames one position. */
const KNOWN_STATEMENT = /^(CREATE TABLE|ALTER TABLE|DROP TABLE|RENAME TABLE|TRUNCATE TABLE|CREATE (UNIQUE |FULLTEXT )?INDEX|DROP INDEX|INSERT INTO|UPDATE|DELETE FROM)\b/i;

const TABLE_POSITIONS = [
  new RegExp(`\\b(CREATE TABLE(?: IF NOT EXISTS)?\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(ALTER TABLE\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(DROP TABLE(?: IF EXISTS)?\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(TRUNCATE TABLE\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(RENAME TABLE\\s+)${NAME}`, "gi"),
  new RegExp(`(\\bRENAME TABLE\\s+\`[^\`]+\`\\s+TO\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(RENAME TO\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(REFERENCES\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(INSERT INTO\\s+)${NAME}`, "gi"),
  // Covers DELETE FROM and the sources of INSERT … SELECT and multi-table UPDATE / DELETE.
  new RegExp(`\\b(FROM\\s+)${NAME}`, "gi"),
  new RegExp(`\\b(JOIN\\s+)${NAME}`, "gi"),
  new RegExp(`^(UPDATE\\s+)${NAME}`, "gi"),
  // CREATE INDEX `i` ON `t` and DROP INDEX `i` ON `t`: only the table is renamed (index names are per table).
  new RegExp(`(\\bINDEX\\s+\`[^\`]+\`\\s+ON\\s+)${NAME}`, "gi"),
];

const CONSTRAINT_POSITIONS = [
  new RegExp(`\\b(CONSTRAINT\\s+)${NAME}(\\s+(?:FOREIGN KEY|CHECK))`, "gi"),
  new RegExp(`\\b(DROP (?:FOREIGN KEY|CONSTRAINT|CHECK)\\s+)${NAME}()`, "gi"),
];

export function prefixStatement(statement, prefix) {
  if (!prefix) return statement;
  const text = statement.trim();
  if (!KNOWN_STATEMENT.test(text)) {
    throw new Error(`A table prefix is set, and this migration statement is of a kind that cannot be prefixed safely: "${text.slice(0, 80)}…"`);
  }
  let out = text;
  for (const pattern of TABLE_POSITIONS) out = out.replace(pattern, (_match, lead, name) => `${lead}\`${prefixedName(prefix, name)}\``);
  for (const pattern of CONSTRAINT_POSITIONS) out = out.replace(pattern, (_match, lead, name, tail) => `${lead}\`${prefixedName(prefix, name)}\`${tail}`);
  return out;
}

/** Splits a drizzle-kit migration file into statements, prefixed when a prefix is set. */
export function migrationStatements(sql, prefix) {
  return sql
    .split(/-->\s*statement-breakpoint/)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => prefixStatement(statement, prefix));
}

/** The table that records applied migrations. */
export const trackerTable = (prefix) => `${prefix}_applied_sql`;

/** A LIKE pattern matching every table that carries the prefix ("_" is a wildcard in LIKE). */
export const prefixLike = (prefix) => `${prefix.replace(/[\\_%]/g, "\\$&")}%`;
