-- Medicine & remedy safety matrix. Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS "safety_substances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL UNIQUE,
	"name" varchar(200) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"category" varchar(80) NOT NULL,
	"scientific_name" varchar(200),
	"amharic_name" varchar(200),
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"properties" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cautions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text,
	"evidence" varchar(120),
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"origin" varchar(20) NOT NULL,
	"customized" boolean DEFAULT false NOT NULL,
	"updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "safety_substances_kind_idx" ON "safety_substances" ("kind", "category");

CREATE TABLE IF NOT EXISTS "safety_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"substance_a" varchar(100) NOT NULL REFERENCES "safety_substances"("slug") ON DELETE CASCADE ON UPDATE CASCADE,
	"substance_b" varchar(100) NOT NULL REFERENCES "safety_substances"("slug") ON DELETE CASCADE ON UPDATE CASCADE,
	"severity" varchar(20) NOT NULL,
	"mechanism" text NOT NULL,
	"effect" text NOT NULL,
	"management" text NOT NULL,
	"evidence" varchar(120) NOT NULL,
	"source" varchar(300) NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"origin" varchar(20) NOT NULL,
	"customized" boolean DEFAULT false NOT NULL,
	"updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "safety_interactions_ordered" CHECK ("substance_a" < "substance_b")
);
CREATE UNIQUE INDEX IF NOT EXISTS "safety_interactions_pair_unique" ON "safety_interactions" ("substance_a", "substance_b");
