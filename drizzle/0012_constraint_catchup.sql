-- CHECK constraints that earlier migrations declared inside CREATE TABLE IF NOT EXISTS. On a
-- database built from drizzle/baseline the tables already exist when those migrations run, so the
-- constraints are added here by name. Safe to repeat.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'safety_interactions_ordered') THEN
    ALTER TABLE "safety_interactions" ADD CONSTRAINT "safety_interactions_ordered" CHECK ("substance_a" < "substance_b");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'intake_attachments_kind') THEN
    ALTER TABLE "intake_attachments" ADD CONSTRAINT "intake_attachments_kind" CHECK ("kind" IN ('image', 'audio', 'video'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auto_response_mode') THEN
    ALTER TABLE "auto_response_rules" ADD CONSTRAINT "auto_response_mode" CHECK ("response_mode" IN ('instant_auto_send', 'draft_for_review'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auto_response_remedies_reviewed') THEN
    ALTER TABLE "auto_response_rules" ADD CONSTRAINT "auto_response_remedies_reviewed" CHECK ("response_mode" = 'draft_for_review' OR (jsonb_array_length("attached_remedies") = 0 AND NOT "include_fewus_text"));
  END IF;
END $$;
