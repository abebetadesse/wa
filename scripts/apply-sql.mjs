/**
 * Applies hand-reviewed SQL migrations once, in order, recording them in "_applied_sql".
 *   node scripts/apply-sql.mjs drizzle/0004_marketplace.sql [--force]
 */
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadEnv();
const files = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const force = process.argv.includes("--force");
const sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ethio_wellness", { onnotice: () => {} });

try {
  await sql`CREATE TABLE IF NOT EXISTS "_applied_sql" (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  for (const file of files) {
    const name = path.basename(file);
    const [done] = await sql`SELECT 1 FROM "_applied_sql" WHERE name = ${name}`;
    if (done && !force) {
      console.log(`skip ${name} (already applied)`);
      continue;
    }
    await sql.begin(async (tx) => {
      await tx.unsafe(fs.readFileSync(file, "utf8"));
      await tx`INSERT INTO "_applied_sql" (name) VALUES (${name}) ON CONFLICT (name) DO UPDATE SET applied_at = now()`;
    });
    console.log(`applied ${name}`);
  }
} finally {
  await sql.end();
}
