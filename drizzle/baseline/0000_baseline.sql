CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(128) NOT NULL,
	"access_token" varchar(1000),
	"ip_address" varchar(45),
	"user_agent" text,
	"device_info" jsonb DEFAULT '{}'::jsonb,
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_refresh_token_hash_unique" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "bio_narrative_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"sections" jsonb,
	"regional_context_sections" jsonb,
	"screening_prompts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"contains_health_content" boolean DEFAULT true NOT NULL,
	"requires_human_review" boolean DEFAULT true NOT NULL,
	"has_cultural_content" boolean DEFAULT false NOT NULL,
	"calculations" jsonb,
	"disclaimer" text,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"endorsed_by" jsonb,
	"endorsed_at" timestamp,
	"published_at" timestamp,
	"returned_with_comments" text,
	"audit_events" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_summary_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"user_id" uuid NOT NULL,
	"raw_narrative" text NOT NULL,
	"ai_translation" text,
	"headline" varchar(255),
	"domain" varchar(50),
	"sub_domain" varchar(100),
	"user_intention" text,
	"key_symptoms" jsonb DEFAULT '[]'::jsonb,
	"emergency_detected" boolean DEFAULT false NOT NULL,
	"emergency_signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"emergency_routed_at" timestamp,
	"urgency_flag" varchar(20) DEFAULT 'none',
	"ai_confidence" integer,
	"suggested_strands" jsonb DEFAULT '[]'::jsonb,
	"suggested_strand_details" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"endorsed_by_user" boolean DEFAULT false NOT NULL,
	"endorsed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"otp_code" varchar(10),
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"device_info" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) NOT NULL,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_field_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"field_type" varchar(30) NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"placeholder" text,
	"help_text" text,
	"default_value" jsonb,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"validation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"conditional" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_user_visible" boolean DEFAULT true NOT NULL,
	"is_admin_only" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publishing_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"allow_auto_publish_bio_narrative" boolean DEFAULT false NOT NULL,
	"allow_auto_publish_cases" boolean DEFAULT false NOT NULL,
	"auto_publish_if_domain_in" jsonb DEFAULT '[]'::jsonb,
	"require_pro_review" jsonb DEFAULT '[]'::jsonb,
	"require_admin_approval" jsonb DEFAULT '[]'::jsonb,
	"max_auto_publish_ai_confidence" integer DEFAULT 90,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"primary_name" varchar(255),
	"birth_date" date,
	"birth_time" varchar(10),
	"birth_location" varchar(255),
	"current_location" varchar(255),
	"mother_name" varchar(255),
	"birth_location_context" jsonb,
	"birth_location_context_source" varchar(20),
	"location_context" jsonb,
	"location_context_resolved_at" timestamp,
	"location_context_source" varchar(20),
	"consent_spiritual" boolean DEFAULT false NOT NULL,
	"consent_location" boolean DEFAULT false NOT NULL,
	"consent" jsonb DEFAULT '{"location":false,"spiritual":false,"traditionalMedicine":false,"bioNarrative":false,"voiceIntake":false,"manuscriptKnowledge":false}'::jsonb NOT NULL,
	"consent_updated_at" timestamp,
	"consent_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30),
	"name" varchar(255),
	"password_hash" varchar(255),
	"role" varchar(30) DEFAULT 'user' NOT NULL,
	"role_id" uuid,
	"date_of_birth" date,
	"gender" varchar(20),
	"region" varchar(100),
	"city" varchar(100),
	"practitioner_credentials" jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"preferred_language" varchar(10) DEFAULT 'en' NOT NULL,
	"profile_image_url" varchar(500),
	"is_verified" boolean DEFAULT false NOT NULL,
	"telegram_id" varchar(32),
	"telegram_username" varchar(64),
	"telegram_verified_at" timestamp,
	"telegram_notify" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_suspended" boolean DEFAULT false NOT NULL,
	"suspension_reason" text,
	"login_count" integer DEFAULT 0 NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"lockout_until" timestamp,
	"last_login_at" timestamp,
	"password_changed_at" timestamp,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "wellbeing_profiles" (
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
	"physiological_effect" text NOT NULL,
	"contraindicated" boolean DEFAULT true NOT NULL,
	"evidence_level" varchar(50) NOT NULL,
	"source_ref" varchar(100) NOT NULL,
	"ethiopian_context" text,
	"recommendation" text
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
	"safety_level" varchar(20) DEFAULT 'caution' NOT NULL,
	"ld50" numeric(10, 2),
	"toxic_effects" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"organ_targets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"regions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"altitude_range" jsonb,
	"preparation_methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_level" varchar(50),
	"source_ref" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_type" varchar(80) NOT NULL,
	"action" varchar(100),
	"resource_type" varchar(50),
	"resource_id" varchar(100),
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" uuid,
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
CREATE TABLE "wellbeing_gap_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"model_version" varchar(50) NOT NULL,
	"summary_narrative" text,
	"safety_gate_verified" boolean DEFAULT true NOT NULL
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
CREATE TABLE "workflow_cases" (
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
--> statement-breakpoint
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
CREATE TABLE "literature_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pmid" text,
	"doi" text,
	"title" text NOT NULL,
	"abstract" text,
	"authors" jsonb,
	"journal" text,
	"pub_date" text,
	"source" text NOT NULL,
	"strand" text NOT NULL,
	"strand_topic_match" text,
	"relevance_score" real,
	"extracted_data" jsonb,
	"fetched_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"is_active" integer DEFAULT 1,
	"mesh_terms" jsonb,
	"keywords" jsonb,
	"citation_count" integer
);
--> statement-breakpoint
CREATE TABLE "literature_sync_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"articles_found" integer DEFAULT 0,
	"new_articles" integer DEFAULT 0,
	"updated_articles" integer DEFAULT 0,
	"errors" jsonb,
	"by_strand" jsonb,
	"by_source" jsonb,
	"triggered_by" text DEFAULT 'cron'
);
--> statement-breakpoint
CREATE TABLE "attunement_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"next_prompt_at" timestamp NOT NULL,
	"prompt_type" varchar(20) NOT NULL,
	"opted_in" boolean DEFAULT false NOT NULL,
	"dismissed_count" integer DEFAULT 0 NOT NULL,
	"completed_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biometric_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"case_id" uuid,
	"image_url" varchar(1000) NOT NULL,
	"scan_type" varchar(20) NOT NULL,
	"raw_ai_scientific_findings" jsonb,
	"translated_cultural_findings" jsonb,
	"red_flags" jsonb,
	"image_hash" varchar(64),
	"review_status" varchar(40) DEFAULT 'pending_expert_review' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cultural_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"traditional_translation" text,
	"hexacore_first_order" jsonb,
	"geographical_landmark_symbology" jsonb,
	"herbal_solutions" jsonb,
	"ritual_solutions" jsonb,
	"safety_notice" text,
	"generated_by" varchar(80) DEFAULT 'system' NOT NULL,
	"endorsed_by" uuid,
	"endorsed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cultural_reports_case_id_unique" UNIQUE("case_id")
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(40) DEFAULT 'intake' NOT NULL,
	"case_type" varchar(80) NOT NULL,
	"practitioner_id" uuid,
	"client_concern" text,
	"intake_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"referral_reason" varchar(80),
	"referral_urgency" varchar(20),
	"practitioner_notes" text,
	"practitioner_edits" jsonb,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scientific_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"caloric_baseline" jsonb,
	"amino_acid_model" jsonb,
	"fatty_acid_model" jsonb,
	"climate_stress" jsonb,
	"epidemiology" jsonb,
	"disease_incidence" jsonb,
	"raw_analysis" jsonb,
	"model_metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scientific_analyses_case_id_unique" UNIQUE("case_id")
);
--> statement-breakpoint
CREATE TABLE "hexacore_aspects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"core_code" varchar(1) NOT NULL,
	"name" varchar(80) NOT NULL,
	"name_am" varchar(80),
	"expression" text,
	"body_zone" varchar(80),
	"frequency_hz" integer,
	"shadow" varchar(100),
	"gift" varchar(100),
	"display_order" integer NOT NULL,
	CONSTRAINT "hexacore_aspects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hexacore_circle_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"invited_email" varchar(255),
	"invited_user_id" uuid,
	"token" varchar(80) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hexacore_circle_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "hexacore_circle_members" (
	"circle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hexacore_circle_members_circle_id_user_id_pk" PRIMARY KEY("circle_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "hexacore_circle_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"body" text NOT NULL,
	"core_code" varchar(1),
	"aspect_code" varchar(3),
	"frequencies_at_post" jsonb,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hexacore_circle_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hexacore_circles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"core_code" varchar(1) NOT NULL,
	"description" text,
	"is_private" boolean DEFAULT false NOT NULL,
	"max_members" integer DEFAULT 12 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hexacore_circles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hexacore_frequency_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"frequencies" jsonb NOT NULL,
	"dominant_core" varchar(1) NOT NULL,
	"source" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hexacore_journal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_date" timestamp NOT NULL,
	"selected_core" varchar(1),
	"selected_aspect" varchar(3),
	"prompt" text,
	"response" text,
	"mood" integer,
	"practice_completed" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"frequencies_snapshot" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hexacore_practice_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"practice_id" uuid NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"duration_sec" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "hexacore_practices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"core_code" varchar(1) NOT NULL,
	"aspect_code" varchar(3),
	"type" varchar(30) NOT NULL,
	"name" varchar(120) NOT NULL,
	"name_am" varchar(120),
	"instruction" text NOT NULL,
	"duration_min" integer,
	"time_of_day" varchar(30),
	"sound_hz" integer,
	"herb_id" uuid,
	"references" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hexacore_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(140) NOT NULL,
	"name_am" varchar(140),
	"tagline" varchar(240),
	"tagline_am" varchar(240),
	"description" text,
	"description_am" text,
	"price_etb" numeric(12, 2) NOT NULL,
	"price_usd" numeric(8, 2) NOT NULL,
	"tier" varchar(30) NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"badge_en" varchar(60),
	"badge_am" varchar(60),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hexacore_products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hexacore_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(30) NOT NULL,
	"user_id" uuid,
	"client_email" varchar(255),
	"client_name" varchar(160),
	"client_phone" varchar(40),
	"product_id" uuid NOT NULL,
	"booking_id" uuid,
	"amount_paid_etb" numeric(12, 2) NOT NULL,
	"amount_paid_usd" numeric(8, 2),
	"payment_method" varchar(40) NOT NULL,
	"payment_reference" varchar(140),
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"client_intake" jsonb,
	"unlocked_payload" jsonb,
	"proof_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hexacore_purchases_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "hexacore_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" varchar(40) NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"amount_etb" numeric(12, 2) NOT NULL,
	"payment_method" varchar(40) NOT NULL,
	"renews_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_assignments" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"case_id" varchar(120) NOT NULL,
	"professional_id" varchar(120) NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_case_events" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"case_id" varchar(120) NOT NULL,
	"actor_id" varchar(120) NOT NULL,
	"actor_role" varchar(30) NOT NULL,
	"type" varchar(60) NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"note" text,
	"at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_cases" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"profile_id" varchar(120) NOT NULL,
	"narrative" text NOT NULL,
	"symptoms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"duration" varchar(100) NOT NULL,
	"self_treatments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"emergency_detected" boolean DEFAULT false NOT NULL,
	"emergency_signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"emergency_routed_at" timestamp,
	"status" varchar(50) DEFAULT 'SUBMITTED' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_preliminary_analyses" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"profile_id" varchar(120) NOT NULL,
	"location_ctx" jsonb NOT NULL,
	"sections" jsonb NOT NULL,
	"confidence" varchar(20) NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_profiles" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"user_id_string" varchar(120) NOT NULL,
	"age_band" varchar(40) NOT NULL,
	"sex" varchar(20) NOT NULL,
	"pregnancy_status" varchar(40),
	"chronic_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_meds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allergies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"traditional_use" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"diet" jsonb NOT NULL,
	"substance_use" jsonb NOT NULL,
	"location" jsonb NOT NULL,
	"spiritual_context" text,
	"cultural_context" text,
	"consent" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_reports" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"case_id" varchar(120) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"payload" jsonb NOT NULL,
	"safety_gate" jsonb,
	"confidence" varchar(20) NOT NULL,
	"provenance" jsonb NOT NULL,
	"authored_by" varchar(120),
	"approved_by" varchar(120),
	"approved_at" timestamp,
	"published_at" timestamp,
	"superseded_by" varchar(120),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"member_id" uuid,
	"weekday" smallint NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(20) NOT NULL,
	"business_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"booked_by_user_id" uuid,
	"member_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"delivery_mode" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"price_etb" numeric(12, 2) NOT NULL,
	"payment_status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"client_note" text,
	"business_note" text,
	"safety" jsonb,
	"intake" jsonb,
	"case_id" uuid,
	"cancelled_by" varchar(20),
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "business_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"name_am" varchar(120),
	"description" text,
	"sector" varchar(20) NOT NULL,
	"icon" varchar(40),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"name" varchar(160) NOT NULL,
	"phone" varchar(30),
	"email" varchar(255),
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"consent" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_invitations" (
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
--> statement-breakpoint
CREATE TABLE "business_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"title" varchar(120),
	"is_bookable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"owner_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_am" varchar(160),
	"tagline" varchar(240),
	"description" text,
	"region" varchar(100),
	"city" varchar(100),
	"address" text,
	"phone" varchar(30),
	"email" varchar(255),
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"delivery_modes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"logo_url" text,
	"cover_url" text,
	"timezone" varchar(60) DEFAULT 'Africa/Addis_Ababa' NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"verification" jsonb,
	"payment_accounts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rating_average" numeric(3, 2),
	"rating_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"client_user_id" uuid NOT NULL,
	"booking_id" uuid,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid,
	"sender_side" varchar(10) NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(60) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text,
	"href" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"booking_id" uuid,
	"client_id" uuid,
	"amount_etb" numeric(12, 2) NOT NULL,
	"method" varchar(30) NOT NULL,
	"reference" varchar(120),
	"note" text,
	"status" varchar(20) DEFAULT 'recorded' NOT NULL,
	"submitted_by" uuid,
	"received_on" date NOT NULL,
	"recorded_by" uuid,
	"voided_by" uuid,
	"void_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "realtime_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"channel" varchar(80) NOT NULL,
	"type" varchar(60) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remedies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_am" varchar(160),
	"form" varchar(40) NOT NULL,
	"description" text,
	"unit" varchar(20) NOT NULL,
	"stock_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"reorder_level" numeric(12, 2) DEFAULT '0' NOT NULL,
	"price_etb" numeric(12, 2),
	"safety_notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remedy_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"herb_id" uuid,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"author_id" uuid,
	"rating" smallint NOT NULL,
	"comment" text,
	"response" text,
	"responded_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
CREATE TABLE "service_kinds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"name_am" varchar(120),
	"description" text,
	"requires_safety_screen" boolean DEFAULT false NOT NULL,
	"case_domain" varchar(30),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_kinds_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"kind_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_am" varchar(160),
	"description" text,
	"duration_minutes" integer NOT NULL,
	"price_etb" numeric(12, 2) NOT NULL,
	"delivery_modes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"buffer_minutes" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"reason" varchar(30) NOT NULL,
	"booking_id" uuid,
	"note" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_off" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"member_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"reason" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tx_ref" varchar(64) NOT NULL,
	"user_id" uuid,
	"purpose" varchar(30) NOT NULL,
	"subject_id" uuid NOT NULL,
	"description" varchar(200),
	"amount_etb" numeric(12, 2) NOT NULL,
	"method" varchar(30) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"checkout_url" text,
	"provider_reference" varchar(120),
	"payer_name" varchar(160),
	"payer_note" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"paid_at" timestamp with time zone,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_payments_tx_ref_unique" UNIQUE("tx_ref")
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_knowledge_sets" (
	"business_id" uuid NOT NULL,
	"set_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"origin" varchar(20) NOT NULL,
	"seen_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_knowledge_sets_business_id_set_id_pk" PRIMARY KEY("business_id","set_id")
);
--> statement-breakpoint
CREATE TABLE "business_tools" (
	"business_id" uuid NOT NULL,
	"tool_key" varchar(80) NOT NULL,
	"state" varchar(20) DEFAULT 'added' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_tools_business_id_tool_key_pk" PRIMARY KEY("business_id","tool_key")
);
--> statement-breakpoint
CREATE TABLE "knowledge_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"tool_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strands" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guidance" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_sets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "toolkit_tools" (
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolkit_usage" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"tool_key" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"substance_a" varchar(100) NOT NULL,
	"substance_b" varchar(100) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"mechanism" text NOT NULL,
	"effect" text NOT NULL,
	"management" text NOT NULL,
	"evidence" varchar(120) NOT NULL,
	"source" varchar(300) NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"origin" varchar(20) NOT NULL,
	"customized" boolean DEFAULT false NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_substances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
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
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "safety_substances_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "auto_response_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"service_id" uuid,
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
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fewus_texts" (
	"business_id" uuid NOT NULL,
	"heading_key" varchar(60) NOT NULL,
	"geez_text" text,
	"amharic_text" text,
	"guidance" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fewus_texts_business_id_heading_key_pk" PRIMARY KEY("business_id","heading_key")
);
--> statement-breakpoint
CREATE TABLE "intake_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"booking_id" uuid,
	"uploader_id" uuid,
	"kind" varchar(10) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"storage_key" varchar(200) NOT NULL,
	"original_name" varchar(200),
	"sha256" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "response_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"rule_id" uuid,
	"source" varchar(20) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"remedies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"held_reason" text,
	"message_id" uuid,
	"created_by" uuid,
	"sent_by" uuid,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_intake_settings" (
	"service_id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"allow_text" boolean DEFAULT true NOT NULL,
	"allow_image" boolean DEFAULT true NOT NULL,
	"allow_audio" boolean DEFAULT true NOT NULL,
	"allow_video" boolean DEFAULT false NOT NULL,
	"dropdown_type" varchar(30) DEFAULT 'none' NOT NULL,
	"dropdown_label" varchar(160),
	"custom_dropdown_options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"text_prompt" varchar(300),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bio_narrative_reports" ADD CONSTRAINT "bio_narrative_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_summary_cards" ADD CONSTRAINT "case_summary_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_profiles" ADD CONSTRAINT "cultural_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_field_definitions" ADD CONSTRAINT "profile_field_definitions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_field_definitions" ADD CONSTRAINT "profile_field_definitions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publishing_criteria" ADD CONSTRAINT "publishing_criteria_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellbeing_profiles" ADD CONSTRAINT "wellbeing_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrients" ADD CONSTRAINT "food_nutrients_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrients" ADD CONSTRAINT "food_nutrients_nutrient_id_nutrients_id_fk" FOREIGN KEY ("nutrient_id") REFERENCES "public"."nutrients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compounds" ADD CONSTRAINT "compounds_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "herb_drug_interactions" ADD CONSTRAINT "herb_drug_interactions_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gap_causes" ADD CONSTRAINT "gap_causes_gap_id_identified_gaps_id_fk" FOREIGN KEY ("gap_id") REFERENCES "public"."identified_gaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gap_solutions" ADD CONSTRAINT "gap_solutions_gap_id_identified_gaps_id_fk" FOREIGN KEY ("gap_id") REFERENCES "public"."identified_gaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gap_solutions" ADD CONSTRAINT "gap_solutions_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identified_gaps" ADD CONSTRAINT "identified_gaps_report_id_wellbeing_gap_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."wellbeing_gap_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identified_gaps" ADD CONSTRAINT "identified_gaps_nutrient_id_nutrients_id_fk" FOREIGN KEY ("nutrient_id") REFERENCES "public"."nutrients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_submissions" ADD CONSTRAINT "intake_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellbeing_gap_reports" ADD CONSTRAINT "wellbeing_gap_reports_submission_id_intake_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."intake_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellbeing_gap_reports" ADD CONSTRAINT "wellbeing_gap_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_profiles" ADD CONSTRAINT "emergency_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_sessions" ADD CONSTRAINT "diagnostic_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_causes" ADD CONSTRAINT "case_causes_session_id_case_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."case_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_sessions" ADD CONSTRAINT "case_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_solutions" ADD CONSTRAINT "case_solutions_session_id_case_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."case_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_cases" ADD CONSTRAINT "workflow_cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_cases" ADD CONSTRAINT "workflow_cases_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_categories" ADD CONSTRAINT "knowledge_categories_strand_id_knowledge_strands_id_fk" FOREIGN KEY ("strand_id") REFERENCES "public"."knowledge_strands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_category_id_knowledge_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."knowledge_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_strands" ADD CONSTRAINT "knowledge_strands_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_strands" ADD CONSTRAINT "knowledge_strands_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_item_id_knowledge_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attunement_reminders" ADD CONSTRAINT "attunement_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_scans" ADD CONSTRAINT "biometric_scans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_scans" ADD CONSTRAINT "biometric_scans_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_reports" ADD CONSTRAINT "cultural_reports_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_reports" ADD CONSTRAINT "cultural_reports_endorsed_by_users_id_fk" FOREIGN KEY ("endorsed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scientific_analyses" ADD CONSTRAINT "scientific_analyses_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_invites" ADD CONSTRAINT "hexacore_circle_invites_circle_id_hexacore_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."hexacore_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_invites" ADD CONSTRAINT "hexacore_circle_invites_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_invites" ADD CONSTRAINT "hexacore_circle_invites_invited_user_id_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_members" ADD CONSTRAINT "hexacore_circle_members_circle_id_hexacore_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."hexacore_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_members" ADD CONSTRAINT "hexacore_circle_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_posts" ADD CONSTRAINT "hexacore_circle_posts_circle_id_hexacore_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."hexacore_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_posts" ADD CONSTRAINT "hexacore_circle_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_reactions" ADD CONSTRAINT "hexacore_circle_reactions_post_id_hexacore_circle_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."hexacore_circle_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circle_reactions" ADD CONSTRAINT "hexacore_circle_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_circles" ADD CONSTRAINT "hexacore_circles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_frequency_history" ADD CONSTRAINT "hexacore_frequency_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_journal" ADD CONSTRAINT "hexacore_journal_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_practice_log" ADD CONSTRAINT "hexacore_practice_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_practice_log" ADD CONSTRAINT "hexacore_practice_log_practice_id_hexacore_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."hexacore_practices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_purchases" ADD CONSTRAINT "hexacore_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_purchases" ADD CONSTRAINT "hexacore_purchases_product_id_hexacore_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."hexacore_products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_purchases" ADD CONSTRAINT "hexacore_purchases_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hexacore_subscriptions" ADD CONSTRAINT "hexacore_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_profiles" ADD CONSTRAINT "pipeline_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_member_id_business_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."business_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_business_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."business_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booked_by_user_id_users_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_member_id_business_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."business_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_clients" ADD CONSTRAINT "business_clients_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_clients" ADD CONSTRAINT "business_clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_accepted_by_users_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_category_id_business_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."business_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_business_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."business_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedies" ADD CONSTRAINT "remedies_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_ingredients" ADD CONSTRAINT "remedy_ingredients_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_ingredients" ADD CONSTRAINT "remedy_ingredients_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_kind_id_service_kinds_id_fk" FOREIGN KEY ("kind_id") REFERENCES "public"."service_kinds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_member_id_business_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."business_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_payments" ADD CONSTRAINT "platform_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_payments" ADD CONSTRAINT "platform_payments_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_knowledge_sets" ADD CONSTRAINT "business_knowledge_sets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_knowledge_sets" ADD CONSTRAINT "business_knowledge_sets_set_id_knowledge_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."knowledge_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_tools" ADD CONSTRAINT "business_tools_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_tools" ADD CONSTRAINT "business_tools_tool_key_toolkit_tools_key_fk" FOREIGN KEY ("tool_key") REFERENCES "public"."toolkit_tools"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sets" ADD CONSTRAINT "knowledge_sets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sets" ADD CONSTRAINT "knowledge_sets_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolkit_usage" ADD CONSTRAINT "toolkit_usage_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolkit_usage" ADD CONSTRAINT "toolkit_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_interactions" ADD CONSTRAINT "safety_interactions_substance_a_safety_substances_slug_fk" FOREIGN KEY ("substance_a") REFERENCES "public"."safety_substances"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "safety_interactions" ADD CONSTRAINT "safety_interactions_substance_b_safety_substances_slug_fk" FOREIGN KEY ("substance_b") REFERENCES "public"."safety_substances"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "safety_interactions" ADD CONSTRAINT "safety_interactions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_substances" ADD CONSTRAINT "safety_substances_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_response_rules" ADD CONSTRAINT "auto_response_rules_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_response_rules" ADD CONSTRAINT "auto_response_rules_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_response_rules" ADD CONSTRAINT "auto_response_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fewus_texts" ADD CONSTRAINT "fewus_texts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fewus_texts" ADD CONSTRAINT "fewus_texts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_attachments" ADD CONSTRAINT "intake_attachments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_attachments" ADD CONSTRAINT "intake_attachments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_attachments" ADD CONSTRAINT "intake_attachments_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_drafts" ADD CONSTRAINT "response_drafts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_drafts" ADD CONSTRAINT "response_drafts_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_drafts" ADD CONSTRAINT "response_drafts_rule_id_auto_response_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."auto_response_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_drafts" ADD CONSTRAINT "response_drafts_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_drafts" ADD CONSTRAINT "response_drafts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_drafts" ADD CONSTRAINT "response_drafts_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_intake_settings" ADD CONSTRAINT "service_intake_settings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_intake_settings" ADD CONSTRAINT "service_intake_settings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "availability_business_idx" ON "availability_rules" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "bookings_business_time_idx" ON "bookings" USING btree ("business_id","starts_at");--> statement-breakpoint
CREATE INDEX "bookings_client_idx" ON "bookings" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "bookings_user_idx" ON "bookings" USING btree ("booked_by_user_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "business_clients_business_idx" ON "business_clients" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_clients_user_unique" ON "business_clients" USING btree ("business_id","user_id");--> statement-breakpoint
CREATE INDEX "business_invitations_business_idx" ON "business_invitations" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_members_unique" ON "business_members" USING btree ("business_id","user_id");--> statement-breakpoint
CREATE INDEX "businesses_status_idx" ON "businesses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "businesses_category_idx" ON "businesses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "businesses_region_idx" ON "businesses" USING btree ("region");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_unique" ON "conversations" USING btree ("business_id","client_user_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "payments_business_idx" ON "payments" USING btree ("business_id","received_on");--> statement-breakpoint
CREATE INDEX "realtime_events_channel_idx" ON "realtime_events" USING btree ("channel","id");--> statement-breakpoint
CREATE INDEX "remedies_business_idx" ON "remedies" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "remedy_ingredients_remedy_idx" ON "remedy_ingredients" USING btree ("remedy_id");--> statement-breakpoint
CREATE INDEX "reviews_business_idx" ON "reviews" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "services_business_idx" ON "services" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "platform_payments_subject_idx" ON "platform_payments" USING btree ("purpose","subject_id");--> statement-breakpoint
CREATE INDEX "platform_payments_status_idx" ON "platform_payments" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "platform_payments_user_idx" ON "platform_payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "toolkit_usage_business_idx" ON "toolkit_usage" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "toolkit_usage_tool_idx" ON "toolkit_usage" USING btree ("tool_key","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "safety_interactions_pair_unique" ON "safety_interactions" USING btree ("substance_a","substance_b");--> statement-breakpoint
CREATE INDEX "safety_substances_kind_idx" ON "safety_substances" USING btree ("kind","category");--> statement-breakpoint
CREATE INDEX "auto_response_rules_business_idx" ON "auto_response_rules" USING btree ("business_id","is_active");--> statement-breakpoint
CREATE INDEX "intake_attachments_booking_idx" ON "intake_attachments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "intake_attachments_uploader_idx" ON "intake_attachments" USING btree ("uploader_id","created_at");--> statement-breakpoint
CREATE INDEX "response_drafts_booking_idx" ON "response_drafts" USING btree ("booking_id","status");