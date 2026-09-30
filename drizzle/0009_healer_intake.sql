-- Healer intake modalities, intake media, auto-response rules, response drafts and Fewus texts.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS "service_intake_settings" (
	"service_id" uuid PRIMARY KEY NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"allow_text" boolean DEFAULT true NOT NULL,
	"allow_image" boolean DEFAULT true NOT NULL,
	"allow_audio" boolean DEFAULT true NOT NULL,
	"allow_video" boolean DEFAULT false NOT NULL,
	"dropdown_type" varchar(30) DEFAULT 'none' NOT NULL,
	"dropdown_label" varchar(160),
	"custom_dropdown_options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"text_prompt" varchar(300),
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "service_intake_dropdown_type" CHECK ("dropdown_type" IN ('none', 'custom', 'metsehafe_fewus', 'awde_negest'))
);

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "intake" jsonb;

CREATE TABLE IF NOT EXISTS "intake_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"booking_id" uuid REFERENCES "bookings"("id") ON DELETE CASCADE,
	"uploader_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"kind" varchar(10) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"storage_key" varchar(200) NOT NULL,
	"original_name" varchar(200),
	"sha256" varchar(64) NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "intake_attachments_kind" CHECK ("kind" IN ('image', 'audio', 'video'))
);
CREATE INDEX IF NOT EXISTS "intake_attachments_booking_idx" ON "intake_attachments" ("booking_id");
CREATE INDEX IF NOT EXISTS "intake_attachments_uploader_idx" ON "intake_attachments" ("uploader_id", "created_at");

CREATE TABLE IF NOT EXISTS "auto_response_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"service_id" uuid REFERENCES "services"("id") ON DELETE CASCADE,
	"name" varchar(160) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"trigger_criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"response_mode" varchar(30) NOT NULL,
	"template_title" varchar(200) NOT NULL,
	"template_body" text NOT NULL,
	"attached_remedies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"include_fewus_text" boolean DEFAULT false NOT NULL,
	"include_profile" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "auto_response_mode" CHECK ("response_mode" IN ('instant_auto_send', 'draft_for_review')),
	-- Anything that carries remedies must be reviewed by the healer before it reaches a client.
	CONSTRAINT "auto_response_remedies_reviewed" CHECK ("response_mode" = 'draft_for_review' OR (jsonb_array_length("attached_remedies") = 0 AND NOT "include_fewus_text"))
);
CREATE INDEX IF NOT EXISTS "auto_response_rules_business_idx" ON "auto_response_rules" ("business_id", "is_active");

CREATE TABLE IF NOT EXISTS "response_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
	"rule_id" uuid REFERENCES "auto_response_rules"("id") ON DELETE SET NULL,
	"source" varchar(20) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"remedies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"held_reason" text,
	"message_id" uuid REFERENCES "messages"("id") ON DELETE SET NULL,
	"created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"sent_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"sent_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "response_drafts_booking_idx" ON "response_drafts" ("booking_id", "status");

CREATE TABLE IF NOT EXISTS "fewus_texts" (
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"heading_key" varchar(60) NOT NULL,
	"geez_text" text,
	"amharic_text" text,
	"guidance" text,
	"updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	PRIMARY KEY ("business_id", "heading_key")
);
