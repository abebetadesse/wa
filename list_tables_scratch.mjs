import postgres from "postgres";
import { config } from "dotenv";
config();
const sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ethio_wellness", { max: 1 });
const r = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
console.log(r.map(x => x.tablename).join("\n"));
await sql.end();
