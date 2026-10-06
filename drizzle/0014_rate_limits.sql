-- Shared rate-limit counters (see src/lib/api/sharedRateLimit.ts). UNLOGGED: the rows are
-- short-lived counters, so they skip the write-ahead log and may be emptied by a crash.
CREATE UNLOGGED TABLE IF NOT EXISTS "rate_limits" (
	"key" text PRIMARY KEY,
	"count" integer NOT NULL DEFAULT 0,
	"reset_at" timestamp with time zone NOT NULL
);
CREATE INDEX IF NOT EXISTS "rate_limits_reset_idx" ON "rate_limits" ("reset_at");
