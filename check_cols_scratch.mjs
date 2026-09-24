import postgres from "postgres";
import { config } from "dotenv";
config();
const sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ethio_wellness", { max: 1 });

// Check columns for key tables
const tables = ['auth_sessions', 'email_verifications', 'users', 'audit_log'];
for (const t of tables) {
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=${t} ORDER BY ordinal_position`;
  console.log(`\n${t}:`, cols.map(c => c.column_name).join(', '));
}
await sql.end();
