import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ethio_wellness";

// Global pool to prevent connection leaks during Next.js hot-reloads
const globalForDb = globalThis as unknown as {
  pool?: Pool;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX || 10),
    min: Number(process.env.DB_POOL_MIN || 0),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
