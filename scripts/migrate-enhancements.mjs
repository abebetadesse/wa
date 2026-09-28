import postgres from "postgres";
import { config } from "dotenv";
config();

const sql = postgres(
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ethio_wellness",
  { max: 1 }
);

async function run() {
  console.log("Applying enhancement schema additions...");
  await sql.unsafe(`
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_location_context jsonb;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_location_context_source varchar(20);
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location_context jsonb;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location_context_resolved_at timestamp;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location_context_source varchar(20);
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS consent_spiritual boolean NOT NULL DEFAULT false;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS consent_location boolean NOT NULL DEFAULT false;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_time varchar(10);

    CREATE TABLE IF NOT EXISTS bio_narrative_reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status varchar(30) NOT NULL DEFAULT 'draft',
      sections jsonb,
      calculations jsonb,
      disclaimer text,
      generated_at timestamp NOT NULL DEFAULT now(),
      endorsed_by jsonb,
      endorsed_at timestamp,
      published_at timestamp,
      returned_with_comments text,
      audit_events jsonb DEFAULT '[]'::jsonb,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS case_summary_cards (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid,
      user_id uuid NOT NULL REFERENCES users(id),
      raw_narrative text NOT NULL,
      ai_translation text,
      headline varchar(255),
      domain varchar(50),
      sub_domain varchar(100),
      user_intention text,
      key_symptoms jsonb DEFAULT '[]'::jsonb,
      urgency_flag varchar(20) DEFAULT 'none',
      ai_confidence integer,
      suggested_strands jsonb DEFAULT '[]'::jsonb,
      endorsed_by_user boolean NOT NULL DEFAULT false,
      endorsed_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS publishing_criteria (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      allow_auto_publish_bio_narrative boolean NOT NULL DEFAULT false,
      allow_auto_publish_cases boolean NOT NULL DEFAULT false,
      auto_publish_if_domain_in jsonb DEFAULT '[]'::jsonb,
      require_pro_review jsonb DEFAULT '[]'::jsonb,
      require_admin_approval jsonb DEFAULT '[]'::jsonb,
      max_auto_publish_ai_confidence integer DEFAULT 90,
      updated_by uuid REFERENCES users(id),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);

  console.log("Migration executed successfully!");
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('bio_narrative_reports', 'case_summary_cards', 'publishing_criteria')
  `;
  console.log("Verified enhancement tables:", tables.map((t) => t.tablename));
  await sql.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
