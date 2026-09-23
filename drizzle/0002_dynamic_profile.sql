CREATE TABLE IF NOT EXISTS "profile_field_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "section" varchar(100) NOT NULL,
  "label" varchar(255) NOT NULL,
  "field_type" varchar(30) NOT NULL,
  "required" boolean NOT NULL DEFAULT false,
  "placeholder" text,
  "help_text" text,
  "default_value" jsonb,
  "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "validation" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "conditional" jsonb,
  "display_order" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "is_user_visible" boolean NOT NULL DEFAULT true,
  "is_admin_only" boolean NOT NULL DEFAULT false,
  "created_by" uuid REFERENCES "users"("id"),
  "updated_by" uuid REFERENCES "users"("id"),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
INSERT INTO "profile_field_definitions" ("section", "label", "field_type", "display_order")
SELECT * FROM (VALUES
  ('Personal', 'Full name', 'text', 1),
  ('Personal', 'Date of birth', 'date', 2),
  ('Personal', 'Preferred language', 'select', 3),
  ('Geography', 'Current region', 'text', 10),
  ('Welbeing', 'Height (cm)', 'number', 20),
  ('Welbeing', 'Weight (kg)', 'number', 21),
  ('Welbeing', 'Known allergies', 'textarea', 22),
  ('Welbeing', 'Current medications', 'textarea', 23),
  ('Lifestyle', 'Physical activity level', 'select', 30),
  ('Lifestyle', 'Sleep duration (hours)', 'number', 31),
  ('Cultural', 'Religious affiliation', 'select', 40),
  ('Preferences', 'Preferred type of advice', 'select', 50)
) AS defaults(section, label, field_type, display_order)
WHERE NOT EXISTS (SELECT 1 FROM "profile_field_definitions");
