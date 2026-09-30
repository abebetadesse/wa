-- Platform settings, platform payments (Chapa / telebirr / bank transfer), client-submitted
-- booking payments, business payment accounts and Telegram account linking.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS "platform_settings" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "platform_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tx_ref" varchar(64) NOT NULL UNIQUE,
	"user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"purpose" varchar(30) NOT NULL,
	"subject_id" uuid NOT NULL,
	"description" varchar(200),
	"amount_etb" numeric(12, 2) NOT NULL,
	"method" varchar(30) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"checkout_url" text,
	"provider_reference" varchar(120),
	"payer_name" varchar(160),
	"payer_note" text,
	"reviewed_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"reviewed_at" timestamptz,
	"review_note" text,
	"paid_at" timestamptz,
	"raw" jsonb,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "platform_payments_subject_idx" ON "platform_payments" ("purpose", "subject_id");
CREATE INDEX IF NOT EXISTS "platform_payments_status_idx" ON "platform_payments" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "platform_payments_user_idx" ON "platform_payments" ("user_id");
-- At most one successful payment per purpose and subject, so a case can never be charged twice.
CREATE UNIQUE INDEX IF NOT EXISTS "platform_payments_one_paid" ON "platform_payments" ("purpose", "subject_id") WHERE "status" = 'paid';
-- The same manual transaction number cannot be submitted twice.
CREATE UNIQUE INDEX IF NOT EXISTS "platform_payments_manual_reference" ON "platform_payments" ("method", "provider_reference")
	WHERE "channel" = 'manual' AND "status" IN ('awaiting_review', 'paid');

ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "payment_accounts" jsonb DEFAULT '{}'::jsonb NOT NULL;

ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "submitted_by" uuid REFERENCES "users"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "payments_pending_idx" ON "payments" ("business_id") WHERE "status" = 'pending';

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegram_id" varchar(32);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegram_username" varchar(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegram_verified_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegram_notify" boolean DEFAULT true NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_telegram_id_unique" ON "users" ("telegram_id");
