-- Marketplace for traditional healers and cultural businesses.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS "workflow_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" varchar(30) NOT NULL,
	"stage" varchar(40) NOT NULL,
	"reviewer_id" uuid,
	"business_id" uuid,
	"booking_id" uuid,
	"safety_answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"safety" jsonb NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"draft" jsonb,
	"review" jsonb,
	"payment" jsonb,
	"consultation" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_cases_booking_id_unique" UNIQUE("booking_id")
);

CREATE TABLE IF NOT EXISTS "business_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"title" varchar(120),
	"is_bookable" boolean DEFAULT false NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"invited_by" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by" uuid,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_invitations_token_hash_unique" UNIQUE("token_hash")
);

DO $$ BEGIN
  ALTER TABLE "workflow_cases" ADD CONSTRAINT "workflow_cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "workflow_cases" ADD CONSTRAINT "workflow_cases_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_accepted_by_users_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "business_invitations_business_idx" ON "business_invitations" USING btree ("business_id");

-- ── Upgrade path for databases where workflow_cases already existed ────────
ALTER TABLE "workflow_cases" ADD COLUMN IF NOT EXISTS "business_id" uuid;
ALTER TABLE "workflow_cases" ADD COLUMN IF NOT EXISTS "booking_id" uuid;
CREATE UNIQUE INDEX IF NOT EXISTS "workflow_cases_booking_id_unique" ON "workflow_cases" ("booking_id");
CREATE INDEX IF NOT EXISTS "workflow_cases_business_stage_idx" ON "workflow_cases" ("business_id", "stage");
CREATE INDEX IF NOT EXISTS "workflow_cases_user_idx" ON "workflow_cases" ("user_id", "updated_at");

-- Cross-module references (declared here to avoid an import cycle in the Drizzle schema).
DO $$ BEGIN
  ALTER TABLE "workflow_cases" ADD CONSTRAINT "workflow_cases_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "workflow_cases" ADD CONSTRAINT "workflow_cases_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_case_id_fk" FOREIGN KEY ("case_id") REFERENCES "workflow_cases"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- At most one open invitation per email per business.
CREATE UNIQUE INDEX IF NOT EXISTS "business_invitations_open_unique" ON "business_invitations" ("business_id", "email")
  WHERE "accepted_at" IS NULL AND "revoked_at" IS NULL;
