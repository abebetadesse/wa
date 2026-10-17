CREATE TABLE `auth_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`refresh_token_hash` varchar(128) NOT NULL,
	`access_token` varchar(1000),
	`ip_address` varchar(45),
	`user_agent` text,
	`device_info` json DEFAULT ('{}'),
	`expires_at` datetime(3) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`revoked_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `auth_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_sessions_refresh_token_hash_unique` UNIQUE(`refresh_token_hash`)
);
--> statement-breakpoint
CREATE TABLE `bio_narrative_reports` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'draft',
	`sections` json,
	`regional_context_sections` json,
	`screening_prompts` json NOT NULL DEFAULT ('[]'),
	`contains_health_content` boolean NOT NULL DEFAULT true,
	`requires_human_review` boolean NOT NULL DEFAULT true,
	`has_cultural_content` boolean NOT NULL DEFAULT false,
	`calculations` json,
	`disclaimer` text,
	`generated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`endorsed_by` json,
	`endorsed_at` datetime(3),
	`published_at` datetime(3),
	`returned_with_comments` text,
	`audit_events` json DEFAULT ('[]'),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `bio_narrative_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_summary_cards` (
	`id` varchar(36) NOT NULL,
	`session_id` varchar(36),
	`user_id` varchar(36) NOT NULL,
	`raw_narrative` text NOT NULL,
	`ai_translation` text,
	`headline` varchar(255),
	`domain` varchar(50),
	`sub_domain` varchar(100),
	`user_intention` text,
	`key_symptoms` json DEFAULT ('[]'),
	`emergency_detected` boolean NOT NULL DEFAULT false,
	`emergency_signals` json NOT NULL DEFAULT ('[]'),
	`emergency_routed_at` datetime(3),
	`urgency_flag` varchar(20) DEFAULT 'none',
	`ai_confidence` int,
	`suggested_strands` json DEFAULT ('[]'),
	`suggested_strand_details` json NOT NULL DEFAULT ('[]'),
	`endorsed_by_user` boolean NOT NULL DEFAULT false,
	`endorsed_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `case_summary_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cultural_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`full_name` varchar(255),
	`birth_date` date,
	`birth_time` varchar(10),
	`birth_location` varchar(255),
	`geez_zodiac_sign` varchar(100),
	`traditional_name_meaning` varchar(500),
	`cultural_calendar_preference` varchar(50) DEFAULT 'geez',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cultural_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_verifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`otp_code` varchar(10),
	`expires_at` datetime(3) NOT NULL,
	`verified_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `email_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_history` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`email` varchar(255) NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`device_info` json DEFAULT ('{}'),
	`status` varchar(20) NOT NULL,
	`failure_reason` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `login_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`used_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `password_resets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_field_definitions` (
	`id` varchar(36) NOT NULL,
	`section` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	`field_type` varchar(30) NOT NULL,
	`required` boolean NOT NULL DEFAULT false,
	`placeholder` text,
	`help_text` text,
	`default_value` json,
	`options` json NOT NULL DEFAULT ('[]'),
	`validation` json NOT NULL DEFAULT ('{}'),
	`conditional` json,
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_user_visible` boolean NOT NULL DEFAULT true,
	`is_admin_only` boolean NOT NULL DEFAULT false,
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `profile_field_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publishing_criteria` (
	`id` varchar(36) NOT NULL,
	`allow_auto_publish_bio_narrative` boolean NOT NULL DEFAULT false,
	`allow_auto_publish_cases` boolean NOT NULL DEFAULT false,
	`auto_publish_if_domain_in` json DEFAULT ('[]'),
	`require_pro_review` json DEFAULT ('[]'),
	`require_admin_approval` json DEFAULT ('[]'),
	`max_auto_publish_ai_confidence` int DEFAULT 90,
	`updated_by` varchar(36),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `publishing_criteria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`permissions` json NOT NULL DEFAULT ('[]'),
	`is_system_role` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_activities` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`activity_type` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`metadata` json DEFAULT ('{}'),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `user_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` varchar(36) NOT NULL,
	`primary_name` varchar(255),
	`birth_date` date,
	`birth_time` varchar(10),
	`birth_location` varchar(255),
	`current_location` varchar(255),
	`mother_name` varchar(255),
	`birth_location_context` json,
	`birth_location_context_source` varchar(20),
	`location_context` json,
	`location_context_resolved_at` datetime(3),
	`location_context_source` varchar(20),
	`consent_spiritual` boolean NOT NULL DEFAULT false,
	`consent_location` boolean NOT NULL DEFAULT false,
	`consent` json NOT NULL DEFAULT ('{"location":false,"spiritual":false,"traditionalMedicine":false,"bioNarrative":false,"voiceIntake":false,"manuscriptKnowledge":false}'),
	`consent_updated_at` datetime(3),
	`consent_history` json NOT NULL DEFAULT ('[]'),
	`onboarding_completed` boolean NOT NULL DEFAULT false,
	`data` json NOT NULL DEFAULT ('{}'),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `user_profiles_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(30),
	`name` varchar(255),
	`password_hash` varchar(255),
	`role` varchar(30) NOT NULL DEFAULT 'user',
	`role_id` varchar(36),
	`date_of_birth` date,
	`gender` varchar(20),
	`region` varchar(100),
	`city` varchar(100),
	`practitioner_credentials` json,
	`preferences` json DEFAULT ('{}'),
	`preferred_language` varchar(10) NOT NULL DEFAULT 'en',
	`profile_image_url` varchar(500),
	`is_verified` boolean NOT NULL DEFAULT false,
	`telegram_id` varchar(32),
	`telegram_username` varchar(64),
	`telegram_verified_at` datetime(3),
	`telegram_notify` boolean NOT NULL DEFAULT true,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_suspended` boolean NOT NULL DEFAULT false,
	`suspension_reason` text,
	`login_count` int NOT NULL DEFAULT 0,
	`failed_login_attempts` int NOT NULL DEFAULT 0,
	`lockout_until` datetime(3),
	`last_login_at` datetime(3),
	`password_changed_at` datetime(3),
	`notes` text,
	`tags` json DEFAULT ('[]'),
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`),
	CONSTRAINT `users_telegram_id_unique` UNIQUE(`telegram_id`)
);
--> statement-breakpoint
CREATE TABLE `wellbeing_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`age` int,
	`gender` varchar(20),
	`region` varchar(100),
	`altitude_meters` int,
	`activity_level` varchar(30),
	`pregnancy_or_lactation` varchar(30),
	`medical_history` json DEFAULT ('[]'),
	`medications` json DEFAULT ('[]'),
	`allergies` json DEFAULT ('[]'),
	`lifestyle_habits` json DEFAULT ('{}'),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `wellbeing_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `food_nutrients` (
	`food_id` varchar(36) NOT NULL,
	`nutrient_id` varchar(36) NOT NULL,
	`amount_per_100g` decimal(10,3) NOT NULL,
	`bioavailability_factor` decimal(4,2) DEFAULT '1.00',
	`fermentation_impact_note` varchar(255),
	CONSTRAINT `food_nutrients_food_id_nutrient_id_pk` PRIMARY KEY(`food_id`,`nutrient_id`)
);
--> statement-breakpoint
CREATE TABLE `foods` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_amharic` varchar(255),
	`category` varchar(100) NOT NULL,
	`traditional_preparation` text,
	`source_ref` varchar(100) NOT NULL,
	`fasting_suitability` varchar(50) DEFAULT 'dual',
	`glycemic_index` int,
	`phytic_acid_mg` decimal(8,2),
	`tannins_mg` decimal(8,2),
	`oxalates_mg` decimal(8,2),
	`fermentation_reduction_pct` int,
	CONSTRAINT `foods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrients` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`symbol` varchar(20),
	`unit` varchar(20) NOT NULL,
	`category` varchar(50) NOT NULL,
	`rda_base` decimal(10,2) NOT NULL,
	`tolerable_upper_limit` decimal(10,2),
	CONSTRAINT `nutrients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compounds` (
	`id` varchar(36) NOT NULL,
	`herb_id` varchar(36) NOT NULL,
	`compound_name` varchar(255) NOT NULL,
	`chemical_class` varchar(100),
	`mechanism_of_action` text,
	CONSTRAINT `compounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `herb_drug_interactions` (
	`id` varchar(36) NOT NULL,
	`herb_id` varchar(36) NOT NULL,
	`drug_class` varchar(150) NOT NULL,
	`drug_name_example` varchar(255),
	`interaction_severity` varchar(20) NOT NULL,
	`mechanism` text NOT NULL,
	`physiological_effect` text NOT NULL,
	`contraindicated` boolean NOT NULL DEFAULT true,
	`evidence_level` varchar(50) NOT NULL,
	`source_ref` varchar(100) NOT NULL,
	`ethiopian_context` text,
	`recommendation` text,
	CONSTRAINT `herb_drug_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `herbs` (
	`id` varchar(36) NOT NULL,
	`name_vernacular` varchar(255) NOT NULL,
	`name_scientific` varchar(255) NOT NULL,
	`name_amharic` varchar(255),
	`traditional_uses` text NOT NULL,
	`primary_parts_used` varchar(150),
	`contraindications_general` text,
	`safety_level` varchar(20) NOT NULL DEFAULT 'caution',
	`ld50` decimal(10,2),
	`toxic_effects` json NOT NULL DEFAULT ('[]'),
	`organ_targets` json NOT NULL DEFAULT ('[]'),
	`regions` json NOT NULL DEFAULT ('[]'),
	`altitude_range` json,
	`preparation_methods` json NOT NULL DEFAULT ('[]'),
	`evidence_level` varchar(50),
	`source_ref` varchar(100) NOT NULL,
	CONSTRAINT `herbs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`event_type` varchar(80) NOT NULL,
	`action` varchar(100),
	`resource_type` varchar(50),
	`resource_id` varchar(100),
	`payload` json NOT NULL DEFAULT ('{}'),
	`details` json DEFAULT ('{}'),
	`ip_address` varchar(45),
	`user_agent` text,
	`session_id` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gap_causes` (
	`id` varchar(36) NOT NULL,
	`gap_id` varchar(36) NOT NULL,
	`cause_type` varchar(40) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`evidence_strength` varchar(20) NOT NULL,
	`source_ref` varchar(100) NOT NULL,
	CONSTRAINT `gap_causes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gap_solutions` (
	`id` varchar(36) NOT NULL,
	`gap_id` varchar(36) NOT NULL,
	`solution_type` varchar(40) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`herb_id` varchar(36),
	`interaction_checked` varchar(20) NOT NULL DEFAULT 'pending',
	`rank_score` decimal(4,2) NOT NULL DEFAULT '1.00',
	`source_ref` varchar(100) NOT NULL,
	CONSTRAINT `gap_solutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `identified_gaps` (
	`id` varchar(36) NOT NULL,
	`report_id` varchar(36) NOT NULL,
	`nutrient_id` varchar(36) NOT NULL,
	`gap_type` varchar(20) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`estimated_intake_pct` decimal(6,2) NOT NULL,
	`target_rda` decimal(10,2) NOT NULL,
	`calculated_daily_intake` decimal(10,2) NOT NULL,
	`source_ref` varchar(100) NOT NULL,
	CONSTRAINT `identified_gaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intake_submissions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`payload` json NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`error_message` text,
	CONSTRAINT `intake_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wellbeing_gap_reports` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`generated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`model_version` varchar(50) NOT NULL,
	`summary_narrative` text,
	`safety_gate_verified` boolean NOT NULL DEFAULT true,
	CONSTRAINT `wellbeing_gap_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_alerts` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`alert_type` varchar(50) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`message` text NOT NULL,
	`contacts_notified` json NOT NULL DEFAULT ('[]'),
	`resolved` boolean NOT NULL DEFAULT false,
	`resolved_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `emergency_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`contacts` json NOT NULL DEFAULT ('[]'),
	`active_conditions` json NOT NULL DEFAULT ('[]'),
	`active_medications` json NOT NULL DEFAULT ('[]'),
	`known_allergies` json NOT NULL DEFAULT ('[]'),
	`blood_type` varchar(10),
	`preferred_hospital` varchar(255),
	`preferred_hospital_phone` varchar(50),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `emergency_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `emergency_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `diagnostic_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`query` text NOT NULL,
	`mode` varchar(20) NOT NULL DEFAULT 'text',
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`urgency_level` varchar(20) NOT NULL,
	`urgency_score` int NOT NULL,
	`intent` varchar(50) NOT NULL,
	`summary` json NOT NULL,
	`causes` json NOT NULL DEFAULT ('[]'),
	`solutions` json NOT NULL DEFAULT ('[]'),
	`action_plan` json NOT NULL,
	`safety_warnings` json NOT NULL DEFAULT ('[]'),
	`cultural_context` json,
	`astrological_context` json,
	`raw_payload` json,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `diagnostic_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(20) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`common_question_set_id` varchar(120) NOT NULL,
	`specialized_question_sets` json NOT NULL DEFAULT ('[]'),
	`knowledge_strand_filters` json NOT NULL DEFAULT ('[]'),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `case_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_causes` (
	`id` varchar(36) NOT NULL,
	`session_id` varchar(36) NOT NULL,
	`description` text NOT NULL,
	`confidence` int NOT NULL,
	`evidence` json NOT NULL DEFAULT ('[]'),
	`category` varchar(40) NOT NULL,
	`is_selected` boolean NOT NULL DEFAULT true,
	CONSTRAINT `case_causes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_questions` (
	`id` varchar(36) NOT NULL,
	`question_set_id` varchar(120) NOT NULL,
	`field_id` varchar(120) NOT NULL,
	`text` text NOT NULL,
	`type` varchar(20) NOT NULL,
	`required` boolean NOT NULL DEFAULT false,
	`options` json NOT NULL DEFAULT ('[]'),
	`display_order` int NOT NULL DEFAULT 0,
	`section` varchar(20) NOT NULL,
	`depends_on` json,
	`knowledge_mappings` json NOT NULL DEFAULT ('[]'),
	CONSTRAINT `case_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`case_id` varchar(120) NOT NULL,
	`answers` json NOT NULL DEFAULT ('{}'),
	`active_specialized_path` varchar(120),
	`current_step` varchar(30) NOT NULL DEFAULT 'common',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`last_updated` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `case_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_solutions` (
	`id` varchar(36) NOT NULL,
	`session_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`section` varchar(30) NOT NULL,
	`description` text NOT NULL,
	`steps` json NOT NULL DEFAULT ('[]'),
	`confidence` int NOT NULL,
	`based_on_causes` json NOT NULL DEFAULT ('[]'),
	`knowledge_references` json NOT NULL DEFAULT ('[]'),
	CONSTRAINT `case_solutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_cases` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`domain` varchar(30) NOT NULL,
	`stage` varchar(40) NOT NULL,
	`reviewer_id` varchar(36),
	`business_id` varchar(36),
	`booking_id` varchar(36),
	`safety_answers` json NOT NULL DEFAULT ('{}'),
	`safety` json NOT NULL,
	`answers` json NOT NULL DEFAULT ('{}'),
	`context` json NOT NULL DEFAULT ('{}'),
	`draft` json,
	`review` json,
	`payment` json,
	`consultation` json,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `workflow_cases_id` PRIMARY KEY(`id`),
	CONSTRAINT `workflow_cases_booking_id_unique` UNIQUE(`booking_id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_categories` (
	`id` varchar(36) NOT NULL,
	`strand_id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`schema` json NOT NULL DEFAULT ('{"fields":[]}'),
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `knowledge_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_items` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	`data` json NOT NULL DEFAULT ('{}'),
	`version` int NOT NULL DEFAULT 1,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`reviewed_by` varchar(36),
	`published_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `knowledge_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_strands` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`version` varchar(30) NOT NULL DEFAULT '1.0.0',
	`is_active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `knowledge_strands_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_strands_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_versions` (
	`id` varchar(36) NOT NULL,
	`item_id` varchar(36) NOT NULL,
	`data` json NOT NULL,
	`version_number` int NOT NULL,
	`change_comment` text NOT NULL DEFAULT (''),
	`created_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `knowledge_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `literature_findings` (
	`id` varchar(36) NOT NULL,
	`pmid` text,
	`doi` text,
	`title` text NOT NULL,
	`abstract` text,
	`authors` json,
	`journal` text,
	`pub_date` text,
	`source` text NOT NULL,
	`strand` text NOT NULL,
	`strand_topic_match` text,
	`relevance_score` float,
	`extracted_data` json,
	`fetched_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
	`processed_at` datetime(3),
	`is_active` int DEFAULT 1,
	`mesh_terms` json,
	`keywords` json,
	`citation_count` int,
	CONSTRAINT `literature_findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `literature_sync_log` (
	`id` varchar(36) NOT NULL,
	`started_at` datetime(3) NOT NULL,
	`completed_at` datetime(3),
	`articles_found` int DEFAULT 0,
	`new_articles` int DEFAULT 0,
	`updated_articles` int DEFAULT 0,
	`errors` json,
	`by_strand` json,
	`by_source` json,
	`triggered_by` text DEFAULT ('cron'),
	CONSTRAINT `literature_sync_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attunement_reminders` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`next_prompt_at` datetime(3) NOT NULL,
	`prompt_type` varchar(20) NOT NULL,
	`opted_in` boolean NOT NULL DEFAULT false,
	`dismissed_count` int NOT NULL DEFAULT 0,
	`completed_count` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `attunement_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biometric_scans` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`case_id` varchar(36),
	`image_url` varchar(1000) NOT NULL,
	`scan_type` varchar(20) NOT NULL,
	`raw_ai_scientific_findings` json,
	`translated_cultural_findings` json,
	`red_flags` json,
	`image_hash` varchar(64),
	`review_status` varchar(40) NOT NULL DEFAULT 'pending_expert_review',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `biometric_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cultural_reports` (
	`id` varchar(36) NOT NULL,
	`case_id` varchar(36) NOT NULL,
	`traditional_translation` text,
	`hexacore_first_order` json,
	`geographical_landmark_symbology` json,
	`herbal_solutions` json,
	`ritual_solutions` json,
	`safety_notice` text,
	`generated_by` varchar(80) NOT NULL DEFAULT 'system',
	`endorsed_by` varchar(36),
	`endorsed_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cultural_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `cultural_reports_case_id_unique` UNIQUE(`case_id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`status` varchar(40) NOT NULL DEFAULT 'intake',
	`case_type` varchar(80) NOT NULL,
	`practitioner_id` varchar(36),
	`client_concern` text,
	`intake_data` json NOT NULL DEFAULT ('{}'),
	`referral_reason` varchar(80),
	`referral_urgency` varchar(20),
	`practitioner_notes` text,
	`practitioner_edits` json,
	`submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`completed_at` datetime(3),
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scientific_analyses` (
	`id` varchar(36) NOT NULL,
	`case_id` varchar(36) NOT NULL,
	`caloric_baseline` json,
	`amino_acid_model` json,
	`fatty_acid_model` json,
	`climate_stress` json,
	`epidemiology` json,
	`disease_incidence` json,
	`raw_analysis` json,
	`model_metadata` json,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `scientific_analyses_id` PRIMARY KEY(`id`),
	CONSTRAINT `scientific_analyses_case_id_unique` UNIQUE(`case_id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_aspects` (
	`id` varchar(36) NOT NULL,
	`code` varchar(3) NOT NULL,
	`core_code` varchar(1) NOT NULL,
	`name` varchar(80) NOT NULL,
	`name_am` varchar(80),
	`expression` text,
	`body_zone` varchar(80),
	`frequency_hz` int,
	`shadow` varchar(100),
	`gift` varchar(100),
	`display_order` int NOT NULL,
	CONSTRAINT `hexacore_aspects_id` PRIMARY KEY(`id`),
	CONSTRAINT `hexacore_aspects_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_circle_invites` (
	`id` varchar(36) NOT NULL,
	`circle_id` varchar(36) NOT NULL,
	`invited_by` varchar(36) NOT NULL,
	`invited_email` varchar(255),
	`invited_user_id` varchar(36),
	`token` varchar(80) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`accepted_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_circle_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `hexacore_circle_invites_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_circle_members` (
	`circle_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'member',
	`joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_circle_members_circle_id_user_id_pk` PRIMARY KEY(`circle_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_circle_posts` (
	`id` varchar(36) NOT NULL,
	`circle_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(30) NOT NULL,
	`body` text NOT NULL,
	`core_code` varchar(1),
	`aspect_code` varchar(3),
	`frequencies_at_post` json,
	`parent_id` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_circle_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_circle_reactions` (
	`id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`kind` varchar(30) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_circle_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_circles` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`core_code` varchar(1) NOT NULL,
	`description` text,
	`is_private` boolean NOT NULL DEFAULT false,
	`max_members` int NOT NULL DEFAULT 12,
	`created_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_circles_id` PRIMARY KEY(`id`),
	CONSTRAINT `hexacore_circles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_frequency_history` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`recorded_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`frequencies` json NOT NULL,
	`dominant_core` varchar(1) NOT NULL,
	`source` varchar(50) NOT NULL,
	CONSTRAINT `hexacore_frequency_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_journal` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`entry_date` datetime(3) NOT NULL,
	`selected_core` varchar(1),
	`selected_aspect` varchar(3),
	`prompt` text,
	`response` text,
	`mood` int,
	`practice_completed` json NOT NULL DEFAULT ('[]'),
	`frequencies_snapshot` json,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_journal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_practice_log` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`practice_id` varchar(36) NOT NULL,
	`completed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`duration_sec` int,
	`notes` text,
	CONSTRAINT `hexacore_practice_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_practices` (
	`id` varchar(36) NOT NULL,
	`core_code` varchar(1) NOT NULL,
	`aspect_code` varchar(3),
	`type` varchar(30) NOT NULL,
	`name` varchar(120) NOT NULL,
	`name_am` varchar(120),
	`instruction` text NOT NULL,
	`duration_min` int,
	`time_of_day` varchar(30),
	`sound_hz` int,
	`herb_id` varchar(36),
	`references` json NOT NULL DEFAULT ('[]'),
	CONSTRAINT `hexacore_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_products` (
	`id` varchar(36) NOT NULL,
	`code` varchar(60) NOT NULL,
	`name` varchar(140) NOT NULL,
	`name_am` varchar(140),
	`tagline` varchar(240),
	`tagline_am` varchar(240),
	`description` text,
	`description_am` text,
	`price_etb` decimal(12,2) NOT NULL,
	`price_usd` decimal(8,2) NOT NULL,
	`tier` varchar(30) NOT NULL,
	`features` json NOT NULL DEFAULT ('[]'),
	`badge_en` varchar(60),
	`badge_am` varchar(60),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `hexacore_products_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_purchases` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(30) NOT NULL,
	`user_id` varchar(36),
	`client_email` varchar(255),
	`client_name` varchar(160),
	`client_phone` varchar(40),
	`product_id` varchar(36) NOT NULL,
	`booking_id` varchar(36),
	`amount_paid_etb` decimal(12,2) NOT NULL,
	`amount_paid_usd` decimal(8,2),
	`payment_method` varchar(40) NOT NULL,
	`payment_reference` varchar(140),
	`status` varchar(30) NOT NULL DEFAULT 'pending',
	`client_intake` json,
	`unlocked_payload` json,
	`proof_url` text,
	`notes` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`completed_at` datetime(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `hexacore_purchases_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `hexacore_subscriptions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`plan` varchar(40) NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'active',
	`amount_etb` decimal(12,2) NOT NULL,
	`payment_method` varchar(40) NOT NULL,
	`renews_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `hexacore_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_assignments` (
	`id` varchar(120) NOT NULL,
	`case_id` varchar(120) NOT NULL,
	`professional_id` varchar(120) NOT NULL,
	`assigned_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `pipeline_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_case_events` (
	`id` varchar(120) NOT NULL,
	`case_id` varchar(120) NOT NULL,
	`actor_id` varchar(120) NOT NULL,
	`actor_role` varchar(30) NOT NULL,
	`type` varchar(60) NOT NULL,
	`before` json,
	`after` json,
	`note` text,
	`at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `pipeline_case_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_cases` (
	`id` varchar(120) NOT NULL,
	`user_id` varchar(120) NOT NULL,
	`profile_id` varchar(120) NOT NULL,
	`narrative` text NOT NULL,
	`symptoms` json NOT NULL DEFAULT ('[]'),
	`duration` varchar(100) NOT NULL,
	`self_treatments` json NOT NULL DEFAULT ('[]'),
	`attachments` json NOT NULL DEFAULT ('[]'),
	`emergency_detected` boolean NOT NULL DEFAULT false,
	`emergency_signals` json NOT NULL DEFAULT ('[]'),
	`emergency_routed_at` datetime(3),
	`status` varchar(50) NOT NULL DEFAULT 'SUBMITTED',
	`submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `pipeline_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_preliminary_analyses` (
	`id` varchar(120) NOT NULL,
	`profile_id` varchar(120) NOT NULL,
	`location_ctx` json NOT NULL,
	`sections` json NOT NULL,
	`confidence` varchar(20) NOT NULL,
	`generated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `pipeline_preliminary_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_profiles` (
	`id` varchar(120) NOT NULL,
	`user_id` varchar(36),
	`user_id_string` varchar(120) NOT NULL,
	`age_band` varchar(40) NOT NULL,
	`sex` varchar(20) NOT NULL,
	`pregnancy_status` varchar(40),
	`chronic_conditions` json NOT NULL DEFAULT ('[]'),
	`current_meds` json NOT NULL DEFAULT ('[]'),
	`allergies` json NOT NULL DEFAULT ('[]'),
	`traditional_use` json NOT NULL DEFAULT ('[]'),
	`diet` json NOT NULL,
	`substance_use` json NOT NULL,
	`location` json NOT NULL,
	`spiritual_context` text,
	`cultural_context` text,
	`consent` json NOT NULL DEFAULT ('{}'),
	`submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `pipeline_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_reports` (
	`id` varchar(120) NOT NULL,
	`case_id` varchar(120) NOT NULL,
	`kind` varchar(20) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`payload` json NOT NULL,
	`safety_gate` json,
	`confidence` varchar(20) NOT NULL,
	`provenance` json NOT NULL,
	`authored_by` varchar(120),
	`approved_by` varchar(120),
	`approved_at` datetime(3),
	`published_at` datetime(3),
	`superseded_by` varchar(120),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `pipeline_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `availability_rules` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`member_id` varchar(36),
	`weekday` smallint NOT NULL,
	`start_minute` int NOT NULL,
	`end_minute` int NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `availability_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(20) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`service_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`booked_by_user_id` varchar(36),
	`member_id` varchar(36),
	`starts_at` datetime(3) NOT NULL,
	`ends_at` datetime(3) NOT NULL,
	`delivery_mode` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'requested',
	`price_etb` decimal(12,2) NOT NULL,
	`payment_status` varchar(20) NOT NULL DEFAULT 'unpaid',
	`client_note` text,
	`business_note` text,
	`safety` json,
	`intake` json,
	`case_id` varchar(36),
	`cancelled_by` varchar(20),
	`cancel_reason` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `business_categories` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`name_am` varchar(120),
	`description` text,
	`sector` varchar(20) NOT NULL,
	`icon` varchar(40),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `business_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `business_clients` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`name` varchar(160) NOT NULL,
	`phone` varchar(30),
	`email` varchar(255),
	`notes` text,
	`tags` json NOT NULL DEFAULT ('[]'),
	`consent` json NOT NULL DEFAULT ('{}'),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `business_clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_clients_user_unique` UNIQUE(`business_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `business_invitations` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL,
	`title` varchar(120),
	`is_bookable` boolean NOT NULL DEFAULT false,
	`token_hash` varchar(64) NOT NULL,
	`invited_by` varchar(36),
	`expires_at` datetime(3) NOT NULL,
	`accepted_at` datetime(3),
	`accepted_by` varchar(36),
	`revoked_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `business_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_invitations_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `business_members` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(20) NOT NULL,
	`title` varchar(120),
	`is_bookable` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `business_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_members_unique` UNIQUE(`business_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`name_am` varchar(160),
	`tagline` varchar(240),
	`description` text,
	`region` varchar(100),
	`city` varchar(100),
	`address` text,
	`phone` varchar(30),
	`email` varchar(255),
	`languages` json NOT NULL DEFAULT ('[]'),
	`delivery_modes` json NOT NULL DEFAULT ('[]'),
	`logo_url` text,
	`cover_url` text,
	`timezone` varchar(60) NOT NULL DEFAULT 'Africa/Addis_Ababa',
	`status` varchar(30) NOT NULL DEFAULT 'draft',
	`verification` json,
	`payment_accounts` json NOT NULL DEFAULT ('{}'),
	`rating_average` decimal(3,2),
	`rating_count` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`client_user_id` varchar(36) NOT NULL,
	`booking_id` varchar(36),
	`last_message_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversations_unique` UNIQUE(`business_id`,`client_user_id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(36) NOT NULL,
	`conversation_id` varchar(36) NOT NULL,
	`sender_id` varchar(36),
	`sender_side` varchar(10) NOT NULL,
	`body` text NOT NULL,
	`read_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(60) NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text,
	`href` text,
	`read_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`booking_id` varchar(36),
	`client_id` varchar(36),
	`amount_etb` decimal(12,2) NOT NULL,
	`method` varchar(30) NOT NULL,
	`reference` varchar(120),
	`note` text,
	`status` varchar(20) NOT NULL DEFAULT 'recorded',
	`submitted_by` varchar(36),
	`received_on` date NOT NULL,
	`recorded_by` varchar(36),
	`voided_by` varchar(36),
	`void_reason` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `realtime_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`channel` varchar(80) NOT NULL,
	`type` varchar(60) NOT NULL,
	`payload` json NOT NULL DEFAULT ('{}'),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `realtime_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remedies` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`name_am` varchar(160),
	`form` varchar(40) NOT NULL,
	`description` text,
	`unit` varchar(20) NOT NULL,
	`stock_quantity` decimal(12,2) NOT NULL DEFAULT '0',
	`reorder_level` decimal(12,2) NOT NULL DEFAULT '0',
	`price_etb` decimal(12,2),
	`safety_notes` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `remedies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remedy_ingredients` (
	`id` varchar(36) NOT NULL,
	`remedy_id` varchar(36) NOT NULL,
	`herb_id` varchar(36),
	`name` varchar(160) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `remedy_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`booking_id` varchar(36) NOT NULL,
	`author_id` varchar(36),
	`rating` smallint NOT NULL,
	`comment` text,
	`response` text,
	`responded_at` datetime(3),
	`status` varchar(20) NOT NULL DEFAULT 'published',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_booking_id_unique` UNIQUE(`booking_id`)
);
--> statement-breakpoint
CREATE TABLE `service_kinds` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`name_am` varchar(120),
	`description` text,
	`requires_safety_screen` boolean NOT NULL DEFAULT false,
	`case_domain` varchar(30),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `service_kinds_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_kinds_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`kind_id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`name_am` varchar(160),
	`description` text,
	`duration_minutes` int NOT NULL,
	`price_etb` decimal(12,2) NOT NULL,
	`delivery_modes` json NOT NULL DEFAULT ('[]'),
	`buffer_minutes` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` varchar(36) NOT NULL,
	`remedy_id` varchar(36) NOT NULL,
	`quantity` decimal(12,2) NOT NULL,
	`reason` varchar(30) NOT NULL,
	`booking_id` varchar(36),
	`note` text,
	`recorded_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_off` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`member_id` varchar(36),
	`starts_at` datetime(3) NOT NULL,
	`ends_at` datetime(3) NOT NULL,
	`reason` varchar(200),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `time_off_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_payments` (
	`id` varchar(36) NOT NULL,
	`tx_ref` varchar(64) NOT NULL,
	`user_id` varchar(36),
	`purpose` varchar(30) NOT NULL,
	`subject_id` varchar(36) NOT NULL,
	`description` varchar(200),
	`amount_etb` decimal(12,2) NOT NULL,
	`method` varchar(30) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL,
	`checkout_url` text,
	`provider_reference` varchar(120),
	`payer_name` varchar(160),
	`payer_note` text,
	`reviewed_by` varchar(36),
	`reviewed_at` datetime(3),
	`review_note` text,
	`paid_at` datetime(3),
	`raw` json,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `platform_payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_payments_tx_ref_unique` UNIQUE(`tx_ref`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`key` varchar(60) NOT NULL,
	`value` json NOT NULL,
	`updated_by` varchar(36),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `platform_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` varchar(400) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`reset_at` datetime(3) NOT NULL,
	CONSTRAINT `rate_limits_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `business_knowledge_sets` (
	`business_id` varchar(36) NOT NULL,
	`set_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`origin` varchar(20) NOT NULL,
	`seen_version` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `business_knowledge_sets_business_id_set_id_pk` PRIMARY KEY(`business_id`,`set_id`)
);
--> statement-breakpoint
CREATE TABLE `business_tools` (
	`business_id` varchar(36) NOT NULL,
	`tool_key` varchar(80) NOT NULL,
	`state` varchar(20) NOT NULL DEFAULT 'added',
	`pinned` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `business_tools_business_id_tool_key_pk` PRIMARY KEY(`business_id`,`tool_key`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_sets` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`tool_keys` json NOT NULL DEFAULT ('[]'),
	`strands` json NOT NULL DEFAULT ('[]'),
	`category_slugs` json NOT NULL DEFAULT ('[]'),
	`guidance` text,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`version` int NOT NULL DEFAULT 0,
	`published_at` datetime(3),
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `knowledge_sets_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_sets_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `toolkit_tools` (
	`key` varchar(80) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`group` varchar(30) NOT NULL,
	`href` varchar(500) NOT NULL,
	`audience` varchar(20) NOT NULL,
	`strands` json NOT NULL DEFAULT ('[]'),
	`suggested_for` json NOT NULL DEFAULT ('{"categories":[],"serviceKinds":[]}'),
	`source` varchar(20) NOT NULL,
	`customized` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `toolkit_tools_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `toolkit_usage` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`tool_key` varchar(80) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `toolkit_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `safety_interactions` (
	`id` varchar(36) NOT NULL,
	`substance_a` varchar(100) NOT NULL,
	`substance_b` varchar(100) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`mechanism` text NOT NULL,
	`effect` text NOT NULL,
	`management` text NOT NULL,
	`evidence` varchar(120) NOT NULL,
	`source` varchar(300) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'published',
	`origin` varchar(20) NOT NULL,
	`customized` boolean NOT NULL DEFAULT false,
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `safety_interactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `safety_interactions_pair_unique` UNIQUE(`substance_a`,`substance_b`)
);
--> statement-breakpoint
CREATE TABLE `safety_substances` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`kind` varchar(20) NOT NULL,
	`category` varchar(80) NOT NULL,
	`scientific_name` varchar(200),
	`amharic_name` varchar(200),
	`aliases` json NOT NULL DEFAULT ('[]'),
	`properties` json NOT NULL DEFAULT ('[]'),
	`cautions` json NOT NULL DEFAULT ('{}'),
	`notes` text,
	`evidence` varchar(120),
	`status` varchar(20) NOT NULL DEFAULT 'published',
	`origin` varchar(20) NOT NULL,
	`customized` boolean NOT NULL DEFAULT false,
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `safety_substances_id` PRIMARY KEY(`id`),
	CONSTRAINT `safety_substances_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `auto_response_rules` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`service_id` varchar(36),
	`name` varchar(160) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`trigger_criteria` json NOT NULL DEFAULT ('{}'),
	`response_mode` varchar(30) NOT NULL,
	`template_title` varchar(200) NOT NULL,
	`template_body` text NOT NULL,
	`attached_remedies` json NOT NULL DEFAULT ('[]'),
	`include_fewus_text` boolean NOT NULL DEFAULT false,
	`include_profile` boolean NOT NULL DEFAULT false,
	`priority` int NOT NULL DEFAULT 100,
	`created_by` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `auto_response_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fewus_texts` (
	`business_id` varchar(36) NOT NULL,
	`heading_key` varchar(60) NOT NULL,
	`geez_text` text,
	`amharic_text` text,
	`guidance` text,
	`updated_by` varchar(36),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `fewus_texts_business_id_heading_key_pk` PRIMARY KEY(`business_id`,`heading_key`)
);
--> statement-breakpoint
CREATE TABLE `intake_attachments` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`booking_id` varchar(36),
	`uploader_id` varchar(36),
	`kind` varchar(10) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`size_bytes` int NOT NULL,
	`storage_key` varchar(200) NOT NULL,
	`original_name` varchar(200),
	`sha256` varchar(64) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `intake_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `response_drafts` (
	`id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`booking_id` varchar(36) NOT NULL,
	`rule_id` varchar(36),
	`source` varchar(20) NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`remedies` json NOT NULL DEFAULT ('[]'),
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`held_reason` text,
	`message_id` varchar(36),
	`created_by` varchar(36),
	`sent_by` varchar(36),
	`sent_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `response_drafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_intake_settings` (
	`service_id` varchar(36) NOT NULL,
	`business_id` varchar(36) NOT NULL,
	`allow_text` boolean NOT NULL DEFAULT true,
	`allow_image` boolean NOT NULL DEFAULT true,
	`allow_audio` boolean NOT NULL DEFAULT true,
	`allow_video` boolean NOT NULL DEFAULT false,
	`dropdown_type` varchar(30) NOT NULL DEFAULT 'none',
	`dropdown_label` varchar(160),
	`custom_dropdown_options` json NOT NULL DEFAULT ('[]'),
	`text_prompt` varchar(300),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `service_intake_settings_service_id` PRIMARY KEY(`service_id`)
);
--> statement-breakpoint
ALTER TABLE `auth_sessions` ADD CONSTRAINT `auth_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bio_narrative_reports` ADD CONSTRAINT `bio_narrative_reports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_summary_cards` ADD CONSTRAINT `case_summary_cards_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cultural_profiles` ADD CONSTRAINT `cultural_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_verifications` ADD CONSTRAINT `email_verifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_field_definitions` ADD CONSTRAINT `profile_field_definitions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_field_definitions` ADD CONSTRAINT `profile_field_definitions_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publishing_criteria` ADD CONSTRAINT `publishing_criteria_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_activities` ADD CONSTRAINT `user_activities_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wellbeing_profiles` ADD CONSTRAINT `wellbeing_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_nutrients` ADD CONSTRAINT `food_nutrients_food_id_foods_id_fk` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_nutrients` ADD CONSTRAINT `food_nutrients_nutrient_id_nutrients_id_fk` FOREIGN KEY (`nutrient_id`) REFERENCES `nutrients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compounds` ADD CONSTRAINT `compounds_herb_id_herbs_id_fk` FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `herb_drug_interactions` ADD CONSTRAINT `herb_drug_interactions_herb_id_herbs_id_fk` FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_causes` ADD CONSTRAINT `gap_causes_gap_id_identified_gaps_id_fk` FOREIGN KEY (`gap_id`) REFERENCES `identified_gaps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_solutions` ADD CONSTRAINT `gap_solutions_gap_id_identified_gaps_id_fk` FOREIGN KEY (`gap_id`) REFERENCES `identified_gaps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_solutions` ADD CONSTRAINT `gap_solutions_herb_id_herbs_id_fk` FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `identified_gaps` ADD CONSTRAINT `identified_gaps_report_id_wellbeing_gap_reports_id_fk` FOREIGN KEY (`report_id`) REFERENCES `wellbeing_gap_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `identified_gaps` ADD CONSTRAINT `identified_gaps_nutrient_id_nutrients_id_fk` FOREIGN KEY (`nutrient_id`) REFERENCES `nutrients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `intake_submissions` ADD CONSTRAINT `intake_submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wellbeing_gap_reports` ADD CONSTRAINT `wellbeing_gap_reports_submission_id_intake_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `intake_submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wellbeing_gap_reports` ADD CONSTRAINT `wellbeing_gap_reports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_alerts` ADD CONSTRAINT `emergency_alerts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_profiles` ADD CONSTRAINT `emergency_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diagnostic_sessions` ADD CONSTRAINT `diagnostic_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_causes` ADD CONSTRAINT `case_causes_session_id_case_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `case_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_sessions` ADD CONSTRAINT `case_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_solutions` ADD CONSTRAINT `case_solutions_session_id_case_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `case_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_cases` ADD CONSTRAINT `workflow_cases_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_cases` ADD CONSTRAINT `workflow_cases_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_categories` ADD CONSTRAINT `knowledge_categories_strand_id_knowledge_strands_id_fk` FOREIGN KEY (`strand_id`) REFERENCES `knowledge_strands`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_category_id_knowledge_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_strands` ADD CONSTRAINT `knowledge_strands_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_strands` ADD CONSTRAINT `knowledge_strands_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_versions` ADD CONSTRAINT `knowledge_versions_item_id_knowledge_items_id_fk` FOREIGN KEY (`item_id`) REFERENCES `knowledge_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_versions` ADD CONSTRAINT `knowledge_versions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attunement_reminders` ADD CONSTRAINT `attunement_reminders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `biometric_scans` ADD CONSTRAINT `biometric_scans_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `biometric_scans` ADD CONSTRAINT `biometric_scans_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cultural_reports` ADD CONSTRAINT `cultural_reports_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cultural_reports` ADD CONSTRAINT `cultural_reports_endorsed_by_users_id_fk` FOREIGN KEY (`endorsed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cases` ADD CONSTRAINT `cases_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cases` ADD CONSTRAINT `cases_practitioner_id_users_id_fk` FOREIGN KEY (`practitioner_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scientific_analyses` ADD CONSTRAINT `scientific_analyses_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_invites` ADD CONSTRAINT `hexacore_circle_invites_circle_id_hexacore_circles_id_fk` FOREIGN KEY (`circle_id`) REFERENCES `hexacore_circles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_invites` ADD CONSTRAINT `hexacore_circle_invites_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_invites` ADD CONSTRAINT `hexacore_circle_invites_invited_user_id_users_id_fk` FOREIGN KEY (`invited_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_members` ADD CONSTRAINT `hexacore_circle_members_circle_id_hexacore_circles_id_fk` FOREIGN KEY (`circle_id`) REFERENCES `hexacore_circles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_members` ADD CONSTRAINT `hexacore_circle_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_posts` ADD CONSTRAINT `hexacore_circle_posts_circle_id_hexacore_circles_id_fk` FOREIGN KEY (`circle_id`) REFERENCES `hexacore_circles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_posts` ADD CONSTRAINT `hexacore_circle_posts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_reactions` ADD CONSTRAINT `hexacore_circle_reactions_post_id_hexacore_circle_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `hexacore_circle_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circle_reactions` ADD CONSTRAINT `hexacore_circle_reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_circles` ADD CONSTRAINT `hexacore_circles_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_frequency_history` ADD CONSTRAINT `hexacore_frequency_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_journal` ADD CONSTRAINT `hexacore_journal_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_practice_log` ADD CONSTRAINT `hexacore_practice_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_practice_log` ADD CONSTRAINT `hexacore_practice_log_practice_id_hexacore_practices_id_fk` FOREIGN KEY (`practice_id`) REFERENCES `hexacore_practices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_purchases` ADD CONSTRAINT `hexacore_purchases_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_purchases` ADD CONSTRAINT `hexacore_purchases_product_id_hexacore_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `hexacore_products`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_purchases` ADD CONSTRAINT `hexacore_purchases_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hexacore_subscriptions` ADD CONSTRAINT `hexacore_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pipeline_profiles` ADD CONSTRAINT `pipeline_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `availability_rules` ADD CONSTRAINT `availability_rules_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `availability_rules` ADD CONSTRAINT `availability_rules_member_id_business_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `business_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_client_id_business_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `business_clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_booked_by_user_id_users_id_fk` FOREIGN KEY (`booked_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_member_id_business_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `business_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_clients` ADD CONSTRAINT `business_clients_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_clients` ADD CONSTRAINT `business_clients_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_invitations` ADD CONSTRAINT `business_invitations_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_invitations` ADD CONSTRAINT `business_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_invitations` ADD CONSTRAINT `business_invitations_accepted_by_users_id_fk` FOREIGN KEY (`accepted_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_members` ADD CONSTRAINT `business_members_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_members` ADD CONSTRAINT `business_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_category_id_business_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `business_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_client_user_id_users_id_fk` FOREIGN KEY (`client_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_client_id_business_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `business_clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_submitted_by_users_id_fk` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_recorded_by_users_id_fk` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_voided_by_users_id_fk` FOREIGN KEY (`voided_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remedies` ADD CONSTRAINT `remedies_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remedy_ingredients` ADD CONSTRAINT `remedy_ingredients_remedy_id_remedies_id_fk` FOREIGN KEY (`remedy_id`) REFERENCES `remedies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remedy_ingredients` ADD CONSTRAINT `remedy_ingredients_herb_id_herbs_id_fk` FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_kind_id_service_kinds_id_fk` FOREIGN KEY (`kind_id`) REFERENCES `service_kinds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_remedy_id_remedies_id_fk` FOREIGN KEY (`remedy_id`) REFERENCES `remedies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_recorded_by_users_id_fk` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_off` ADD CONSTRAINT `time_off_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_off` ADD CONSTRAINT `time_off_member_id_business_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `business_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_payments` ADD CONSTRAINT `platform_payments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_payments` ADD CONSTRAINT `platform_payments_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_settings` ADD CONSTRAINT `platform_settings_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_knowledge_sets` ADD CONSTRAINT `business_knowledge_sets_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_knowledge_sets` ADD CONSTRAINT `business_knowledge_sets_set_id_knowledge_sets_id_fk` FOREIGN KEY (`set_id`) REFERENCES `knowledge_sets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_tools` ADD CONSTRAINT `business_tools_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `business_tools` ADD CONSTRAINT `business_tools_tool_key_toolkit_tools_key_fk` FOREIGN KEY (`tool_key`) REFERENCES `toolkit_tools`(`key`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_sets` ADD CONSTRAINT `knowledge_sets_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_sets` ADD CONSTRAINT `knowledge_sets_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `toolkit_usage` ADD CONSTRAINT `toolkit_usage_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `toolkit_usage` ADD CONSTRAINT `toolkit_usage_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `safety_interactions` ADD CONSTRAINT `safety_interactions_substance_a_safety_substances_slug_fk` FOREIGN KEY (`substance_a`) REFERENCES `safety_substances`(`slug`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `safety_interactions` ADD CONSTRAINT `safety_interactions_substance_b_safety_substances_slug_fk` FOREIGN KEY (`substance_b`) REFERENCES `safety_substances`(`slug`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `safety_interactions` ADD CONSTRAINT `safety_interactions_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `safety_substances` ADD CONSTRAINT `safety_substances_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_response_rules` ADD CONSTRAINT `auto_response_rules_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_response_rules` ADD CONSTRAINT `auto_response_rules_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_response_rules` ADD CONSTRAINT `auto_response_rules_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fewus_texts` ADD CONSTRAINT `fewus_texts_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fewus_texts` ADD CONSTRAINT `fewus_texts_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `intake_attachments` ADD CONSTRAINT `intake_attachments_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `intake_attachments` ADD CONSTRAINT `intake_attachments_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `intake_attachments` ADD CONSTRAINT `intake_attachments_uploader_id_users_id_fk` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `response_drafts` ADD CONSTRAINT `response_drafts_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `response_drafts` ADD CONSTRAINT `response_drafts_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `response_drafts` ADD CONSTRAINT `response_drafts_rule_id_auto_response_rules_id_fk` FOREIGN KEY (`rule_id`) REFERENCES `auto_response_rules`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `response_drafts` ADD CONSTRAINT `response_drafts_message_id_messages_id_fk` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `response_drafts` ADD CONSTRAINT `response_drafts_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `response_drafts` ADD CONSTRAINT `response_drafts_sent_by_users_id_fk` FOREIGN KEY (`sent_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_intake_settings` ADD CONSTRAINT `service_intake_settings_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_intake_settings` ADD CONSTRAINT `service_intake_settings_business_id_businesses_id_fk` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `availability_business_idx` ON `availability_rules` (`business_id`);--> statement-breakpoint
CREATE INDEX `bookings_business_time_idx` ON `bookings` (`business_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `bookings_client_idx` ON `bookings` (`client_id`);--> statement-breakpoint
CREATE INDEX `bookings_user_idx` ON `bookings` (`booked_by_user_id`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `business_clients_business_idx` ON `business_clients` (`business_id`);--> statement-breakpoint
CREATE INDEX `business_invitations_business_idx` ON `business_invitations` (`business_id`);--> statement-breakpoint
CREATE INDEX `businesses_status_idx` ON `businesses` (`status`);--> statement-breakpoint
CREATE INDEX `businesses_category_idx` ON `businesses` (`category_id`);--> statement-breakpoint
CREATE INDEX `businesses_region_idx` ON `businesses` (`region`);--> statement-breakpoint
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `payments_business_idx` ON `payments` (`business_id`,`received_on`);--> statement-breakpoint
CREATE INDEX `realtime_events_channel_idx` ON `realtime_events` (`channel`,`id`);--> statement-breakpoint
CREATE INDEX `remedies_business_idx` ON `remedies` (`business_id`);--> statement-breakpoint
CREATE INDEX `remedy_ingredients_remedy_idx` ON `remedy_ingredients` (`remedy_id`);--> statement-breakpoint
CREATE INDEX `reviews_business_idx` ON `reviews` (`business_id`);--> statement-breakpoint
CREATE INDEX `services_business_idx` ON `services` (`business_id`);--> statement-breakpoint
CREATE INDEX `platform_payments_subject_idx` ON `platform_payments` (`purpose`,`subject_id`);--> statement-breakpoint
CREATE INDEX `platform_payments_status_idx` ON `platform_payments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `platform_payments_user_idx` ON `platform_payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `rate_limits_reset_idx` ON `rate_limits` (`reset_at`);--> statement-breakpoint
CREATE INDEX `toolkit_usage_business_idx` ON `toolkit_usage` (`business_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `toolkit_usage_tool_idx` ON `toolkit_usage` (`tool_key`,`created_at`);--> statement-breakpoint
CREATE INDEX `safety_substances_kind_idx` ON `safety_substances` (`kind`,`category`);--> statement-breakpoint
CREATE INDEX `auto_response_rules_business_idx` ON `auto_response_rules` (`business_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `intake_attachments_booking_idx` ON `intake_attachments` (`booking_id`);--> statement-breakpoint
CREATE INDEX `intake_attachments_uploader_idx` ON `intake_attachments` (`uploader_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `response_drafts_booking_idx` ON `response_drafts` (`booking_id`,`status`);