/**
 * Fixed-window in-memory rate limiter, per server process. Used in development and tests, and as
 * the fallback when the database is unreachable. Production counts in MySQL so limits hold
 * across processes and restarts: see ./sharedRateLimit.ts.
 */
const windows = new Map<string, { count: number; resetAt: number }>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of windows) if (entry.resetAt <= now) windows.delete(key);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function consumeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  sweep(now);
  let entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    windows.set(key, entry);
  }
  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function resetRateLimits() {
  windows.clear();
}

/**
 * The caller's address. X-Real-IP is set by the reverse proxy in front of the app (nginx on Plesk)
 * and replaces anything the client sent; X-Forwarded-For is only a fallback because its first
 * entry can be supplied by the client.
 */
export function clientIp(headers: Headers): string {
  return headers.get("x-real-ip")?.trim() || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
