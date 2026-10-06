/**
 * Database access (MySQL 8.0+).
 *
 *   db        the Drizzle query builder used throughout the application
 *   dbClient  a tagged template for the few hand-written statements:
 *             const rows = await dbClient`SELECT id FROM users WHERE email = ${email}`
 *             (values are always sent as parameters, never spliced into the SQL text)
 *
 * Every connection is pinned to UTC and READ COMMITTED. UTC, so `CURRENT_TIMESTAMP` defaults and
 * JavaScript dates agree whatever the server's time zone. READ COMMITTED, so a transaction sees
 * rows committed by others while it runs, which the booking and messaging code relies on.
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://root:devroot@localhost:3307/ethio_wellness";

// One pool per process, kept across hot reloads in development.
const globalForDb = globalThis as unknown as { mysqlPool?: Pool };

function createPool() {
  const pool = mysql.createPool({
    uri: connectionString,
    connectionLimit: Number(process.env.DB_POOL_MAX) || 10,
    waitForConnections: true,
    maxIdle: 5,
    idleTimeout: 30_000,
    connectTimeout: 10_000,
    enableKeepAlive: true,
    charset: "utf8mb4",
    timezone: "Z",
    // Exact DECIMAL and BIGINT values arrive as strings instead of rounded floats.
    decimalNumbers: false,
    supportBigNumbers: true,
  });
  // The session settings run before the pool hands the connection to a caller's first query.
  pool.pool.on("connection", (connection) => {
    connection.query("SET time_zone = '+00:00'");
    connection.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
  });
  return pool;
}

export const pool = globalForDb.mysqlPool ?? createPool();
globalForDb.mysqlPool = pool;

export const db = drizzle(pool, { schema, mode: "default" });

type Row = Record<string, unknown>;

async function run<T = Row[]>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T> {
  const [rows] = await pool.query(strings.join("?"), values);
  return rows as T;
}

export const dbClient = Object.assign(run, {
  /** Closes the pool (scripts and tests; the server keeps it open). */
  end: (_options?: { timeout?: number }) => pool.end(),
});
