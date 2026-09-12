CREATE TABLE "knowledge_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strand_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"schema" jsonb DEFAULT '{"fields":[]}'::jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"reviewed_by" uuid,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_strands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"version" varchar(30) DEFAULT '1.0.0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_strands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "knowledge_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"data" jsonb NOT NULL,
	"version_number" integer NOT NULL,
	"change_comment" text DEFAULT '' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_categories" ADD CONSTRAINT "knowledge_categories_strand_id_knowledge_strands_id_fk" FOREIGN KEY ("strand_id") REFERENCES "public"."knowledge_strands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_category_id_knowledge_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."knowledge_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_strands" ADD CONSTRAINT "knowledge_strands_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_strands" ADD CONSTRAINT "knowledge_strands_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_item_id_knowledge_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;