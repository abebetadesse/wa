CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(128) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_refresh_token_hash_unique" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "cultural_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(255),
	"birth_date" date,
	"birth_time" varchar(10),
	"birth_location" varchar(255),
	"geez_zodiac_sign" varchar(100),
	"traditional_name_meaning" varchar(500),
	"cultural_calendar_preference" varchar(50) DEFAULT 'geez',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Welbeing_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"age" integer,
	"gender" varchar(20),
	"region" varchar(100),
	"altitude_meters" integer,
	"activity_level" varchar(30),
	"pregnancy_or_lactation" varchar(30),
	"medical_history" jsonb DEFAULT '[]'::jsonb,
	"medications" jsonb DEFAULT '[]'::jsonb,
	"allergies" jsonb DEFAULT '[]'::jsonb,
	"lifestyle_habits" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" varchar(255),
	"role" varchar(30) DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"lockout_until" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "food_nutrients" (
	"food_id" uuid NOT NULL,
	"nutrient_id" uuid NOT NULL,
	"amount_per_100g" numeric(10, 3) NOT NULL,
	"bioavailability_factor" numeric(4, 2) DEFAULT '1.00',
	"fermentation_impact_note" varchar(255),
	CONSTRAINT "food_nutrients_food_id_nutrient_id_pk" PRIMARY KEY("food_id","nutrient_id")
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_amharic" varchar(255),
	"category" varchar(100) NOT NULL,
	"traditional_preparation" text,
	"source_ref" varchar(100) NOT NULL,
	"fasting_suitability" varchar(50) DEFAULT 'dual',
	"glycemic_index" integer,
	"phytic_acid_mg" numeric(8, 2),
	"tannins_mg" numeric(8, 2),
	"oxalates_mg" numeric(8, 2),
	"fermentation_reduction_pct" integer
);
--> statement-breakpoint
CREATE TABLE "nutrients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(20),
	"unit" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"rda_base" numeric(10, 2) NOT NULL,
	"tolerable_upper_limit" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "compounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"herb_id" uuid NOT NULL,
	"compound_name" varchar(255) NOT NULL,
	"chemical_class" varchar(100),
	"mechanism_of_action" text
);
--> statement-breakpoint
CREATE TABLE "herb_drug_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"herb_id" uuid NOT NULL,
	"drug_class" varchar(150) NOT NULL,
	"drug_name_example" varchar(255),
	"interaction_severity" varchar(20) NOT NULL,
	"mechanism" text NOT NULL,
	"Debral_effect" text NOT NULL,
	"contraindicated" boolean DEFAULT true NOT NULL,
	"evidence_level" varchar(50) NOT NULL,
	"source_ref" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "herbs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_vernacular" varchar(255) NOT NULL,
	"name_scientific" varchar(255) NOT NULL,
	"name_amharic" varchar(255),
	"traditional_uses" text NOT NULL,
	"primary_parts_used" varchar(150),
	"contraindications_general" text,
	"source_ref" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_type" varchar(80) NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gap_causes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gap_id" uuid NOT NULL,
	"cause_type" varchar(40) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"evidence_strength" varchar(20) NOT NULL,
	"source_ref" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gap_solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gap_id" uuid NOT NULL,
	"solution_type" varchar(40) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"herb_id" uuid,
	"interaction_checked" varchar(20) DEFAULT 'pending' NOT NULL,
	"rank_score" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"source_ref" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Welbeing_gap_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"model_version" varchar(50) NOT NULL,
	"summary_narrative" text,
	"safety_gate_verified" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identified_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"nutrient_id" uuid NOT NULL,
	"gap_type" varchar(20) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"estimated_intake_pct" numeric(6, 2) NOT NULL,
	"target_rda" numeric(10, 2) NOT NULL,
	"calculated_daily_intake" numeric(10, 2) NOT NULL,
	"source_ref" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "emergency_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"contacts_notified" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emergency_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"contacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active_medications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"known_allergies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blood_type" varchar(10),
	"preferred_hospital" varchar(255),
	"preferred_hospital_phone" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "emergency_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "diagnostic_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"query" text NOT NULL,
	"mode" varchar(20) DEFAULT 'text' NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"urgency_level" varchar(20) NOT NULL,
	"urgency_score" integer NOT NULL,
	"intent" varchar(50) NOT NULL,
	"summary" jsonb NOT NULL,
	"causes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"solutions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"action_plan" jsonb NOT NULL,
	"safety_warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cultural_context" jsonb,
	"astrological_context" jsonb,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"common_question_set_id" varchar(120) NOT NULL,
	"specialized_question_sets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"knowledge_strand_filters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_causes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"description" text NOT NULL,
	"confidence" integer NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category" varchar(40) NOT NULL,
	"is_selected" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_set_id" varchar(120) NOT NULL,
	"field_id" varchar(120) NOT NULL,
	"text" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"section" varchar(20) NOT NULL,
	"depends_on" jsonb,
	"knowledge_mappings" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"case_id" varchar(120) NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active_specialized_path" varchar(120),
	"current_step" varchar(30) DEFAULT 'common' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"title" text NOT NULL,
	"section" varchar(30) NOT NULL,
	"description" text NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" integer NOT NULL,
	"based_on_causes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"knowledge_references" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_profiles" ADD CONSTRAINT "cultural_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Welbeing_profiles" ADD CONSTRAINT "Welbeing_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrients" ADD CONSTRAINT "food_nutrients_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrients" ADD CONSTRAINT "food_nutrients_nutrient_id_nutrients_id_fk" FOREIGN KEY ("nutrient_id") REFERENCES "public"."nutrients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compounds" ADD CONSTRAINT "compounds_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "herb_drug_interactions" ADD CONSTRAINT "herb_drug_interactions_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gap_causes" ADD CONSTRAINT "gap_causes_gap_id_identified_gaps_id_fk" FOREIGN KEY ("gap_id") REFERENCES "public"."identified_gaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gap_solutions" ADD CONSTRAINT "gap_solutions_gap_id_identified_gaps_id_fk" FOREIGN KEY ("gap_id") REFERENCES "public"."identified_gaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gap_solutions" ADD CONSTRAINT "gap_solutions_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Welbeing_gap_reports" ADD CONSTRAINT "Welbeing_gap_reports_submission_id_intake_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."intake_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Welbeing_gap_reports" ADD CONSTRAINT "Welbeing_gap_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identified_gaps" ADD CONSTRAINT "identified_gaps_report_id_Welbeing_gap_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."Welbeing_gap_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identified_gaps" ADD CONSTRAINT "identified_gaps_nutrient_id_nutrients_id_fk" FOREIGN KEY ("nutrient_id") REFERENCES "public"."nutrients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_submissions" ADD CONSTRAINT "intake_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_profiles" ADD CONSTRAINT "emergency_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_sessions" ADD CONSTRAINT "diagnostic_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_causes" ADD CONSTRAINT "case_causes_session_id_case_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."case_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_sessions" ADD CONSTRAINT "case_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_solutions" ADD CONSTRAINT "case_solutions_session_id_case_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."case_sessions"("id") ON DELETE cascade ON UPDATE no action;