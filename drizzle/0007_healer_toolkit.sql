-- Healer toolkit: tools, administrator-curated knowledge sets, business selections and usage.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS "toolkit_tools" (
	"key" varchar(80) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"group" varchar(30) NOT NULL,
	"href" varchar(500) NOT NULL,
	"audience" varchar(20) NOT NULL,
	"strands" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"suggested_for" jsonb DEFAULT '{"categories":[],"serviceKinds":[]}'::jsonb NOT NULL,
	"source" varchar(20) NOT NULL,
	"customized" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "knowledge_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL UNIQUE,
	"name" varchar(160) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"tool_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strands" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guidance" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"published_at" timestamptz,
	"created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "business_knowledge_sets" (
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"set_id" uuid NOT NULL REFERENCES "knowledge_sets"("id") ON DELETE CASCADE,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"origin" varchar(20) NOT NULL,
	"seen_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	PRIMARY KEY ("business_id", "set_id")
);

CREATE TABLE IF NOT EXISTS "business_tools" (
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"tool_key" varchar(80) NOT NULL REFERENCES "toolkit_tools"("key") ON DELETE CASCADE,
	"state" varchar(20) DEFAULT 'added' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	PRIMARY KEY ("business_id", "tool_key")
);

CREATE TABLE IF NOT EXISTS "toolkit_usage" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
	"user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"tool_key" varchar(80) NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "toolkit_usage_business_idx" ON "toolkit_usage" ("business_id", "created_at");
CREATE INDEX IF NOT EXISTS "toolkit_usage_tool_idx" ON "toolkit_usage" ("tool_key", "created_at");
