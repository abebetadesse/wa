ALTER TABLE IF EXISTS "user_profiles"
  ADD COLUMN IF NOT EXISTS "consent" jsonb NOT NULL DEFAULT '{"location":false,"spiritual":false,"traditionalMedicine":false,"bioNarrative":false,"voiceIntake":false,"manuscriptKnowledge":false}'::jsonb,
  ADD COLUMN IF NOT EXISTS "consent_updated_at" timestamp,
  ADD COLUMN IF NOT EXISTS "consent_history" jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS "bio_narrative_reports"
  ADD COLUMN IF NOT EXISTS "regional_context_sections" jsonb,
  ADD COLUMN IF NOT EXISTS "screening_prompts" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "contains_health_content" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "requires_human_review" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "has_cultural_content" boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS "case_summary_cards"
  ADD COLUMN IF NOT EXISTS "emergency_detected" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emergency_signals" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "emergency_routed_at" timestamp,
  ADD COLUMN IF NOT EXISTS "suggested_strand_details" jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS "pipeline_cases"
  ADD COLUMN IF NOT EXISTS "emergency_detected" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emergency_signals" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "emergency_routed_at" timestamp;