/**
 * Fixed-window in-memory rate limiter. Per server process: adequate for a single Node instance;
 * put a shared store (e.g. Redis) behind the same interface before running multiple instances.
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

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
