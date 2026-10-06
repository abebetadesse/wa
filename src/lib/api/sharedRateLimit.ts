/**
 * Rate limiting that holds across server processes and restarts.
 *
 * The in-memory limiter (./rateLimit.ts) counts per process: a host that runs several application
 * processes (Passenger on Plesk, any multi-instance setup) would multiply every limit, and a restart
 * would forget them. In production the counters therefore live in MySQL ("rate_limits", one
 * atomic upsert per limited request). If the database cannot be reached the request falls back to
 * the in-memory counter rather than failing.
 *
 * RATE_LIMIT_STORE=database | memory overrides the default (database in production, memory otherwise).
 */
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";
import { consumeRateLimit, type RateLimitResult } from "./rateLimit";

const SWEEP_EVERY_MS = 10 * 60 * 1000;
let lastSweep = 0;
let warned = false;

export function rateLimitStore(): "database" | "memory" {
  const configured = process.env.RATE_LIMIT_STORE;
  if (configured === "database" || configured === "memory") return configured;
  return process.env.NODE_ENV === "production" ? "database" : "memory";
}

export async function consumeSharedRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (rateLimitStore() === "memory") return consumeRateLimit(key, limit, windowMs);
  try {
    const row = await db.transaction(async (tx) => {
      const keyValue = key.slice(0, 400);
      await tx.insert(rateLimits).values({
        key: keyValue,
        count: 1,
        resetAt: sql`TIMESTAMPADD(MICROSECOND, ${windowMs * 1000}, UTC_TIMESTAMP(3))`,
      }).onDuplicateKeyUpdate({
        set: {
          count: sql`IF(${rateLimits.resetAt} <= UTC_TIMESTAMP(3), 1, ${rateLimits.count} + 1)`,
          resetAt: sql`IF(${rateLimits.resetAt} <= UTC_TIMESTAMP(3), TIMESTAMPADD(MICROSECOND, ${windowMs * 1000}, UTC_TIMESTAMP(3)), ${rateLimits.resetAt})`,
        },
      });
      const [current] = await tx.select().from(rateLimits).where(eq(rateLimits.key, keyValue)).for("update");
      return current;
    });
    const now = Date.now();
    if (now - lastSweep > SWEEP_EVERY_MS) {
      lastSweep = now;
      void db.delete(rateLimits).where(sql`${rateLimits.resetAt} < UTC_TIMESTAMP(3) - INTERVAL 1 HOUR`).catch((error) => {
        console.error("[rate-limit] expired-counter cleanup failed.", error instanceof Error ? error.message : error);
      });
    }
    if (!row) throw new Error("Rate-limit upsert did not return its row.");
    return {
      allowed: row.count <= limit,
      remaining: Math.max(0, limit - row.count),
      retryAfterSeconds: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)),
    };
  } catch (error) {
    if (!warned) {
      warned = true;
      console.error("[rate-limit] database store unavailable; counting in memory for now.", error instanceof Error ? error.message : error);
    }
    return consumeRateLimit(key, limit, windowMs);
  }
}
