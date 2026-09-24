/**
 * apply-indexes.mjs — Pillar 1: Composite Indexing (P2)
 *
 * Reads ./migrations/001_composite_indexes.sql and executes it against the
 * configured PostgreSQL instance. Safe to re-run; uses IF NOT EXISTS guards.
 *
 * Usage:  node src/lib/db/apply-indexes.mjs
 */
import postgres from "postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { config } from "dotenv";

config(); // load .env

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql_text = readFileSync(resolve(__dirname, "migrations/001_composite_indexes.sql"), "utf8");

const conn = postgres(
  process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/ethio_wellness",
  { max: 1 }
);

try {
  console.log("[apply-indexes] Applying composite indexes…");
  await conn.unsafe(sql_text);
  console.log("[apply-indexes] ✅  All indexes created / verified.");
} catch (err) {
  console.error("[apply-indexes] ❌  Error:", err.message);
  process.exit(1);
} finally {
  await conn.end();
}
