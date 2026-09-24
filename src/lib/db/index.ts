import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ethio_wellness";

// Singleton pool — prevents connection leaks during Next.js hot-reloads
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

export const pgClient =
  globalForDb.pgClient ??
  postgres(connectionString, {
    // Pillar 1 P4: Tuned pool for high concurrency
    max: Number(process.env.DB_POOL_MAX) || 20,
    idle_timeout: 30,          // seconds before idle connection is released
    max_lifetime: 30 * 60,     // seconds before connection is forcefully recycled
    connect_timeout: 10,
    prepare: true,             // server-side prepared statement caching (~15% speed-up)
  });

globalForDb.pgClient = pgClient;

export const db = drizzle(pgClient, { schema });
