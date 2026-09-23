CREATE TABLE `auth_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`refresh_token_hash` varchar(128) NOT NULL,
	`access_token` varchar(1000),
	`ip_address` varchar(45),
	`user_agent` text,
	`device_info` json DEFAULT ('{}'),
	`expires_at` timestamp NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`revoked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_sessions_refresh_token_hash_unique` UNIQUE(`refresh_token_hash`)
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cultural_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_verifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`otp_code` varchar(10),
	`expires_at` timestamp NOT NULL,
	`verified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_profiles` (
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
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_profiles_id` PRIMARY KEY(`id`)
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_field_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`permissions` json NOT NULL DEFAULT ('[]'),
	`is_system_role` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` varchar(36) NOT NULL,
	`data` json NOT NULL DEFAULT ('{}'),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
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
	`preferred_language` varchar(10) NOT NULL DEFAULT 'en',
	`profile_image_url` varchar(500),
	`is_verified` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_suspended` boolean NOT NULL DEFAULT false,
	`suspension_reason` text,
	`login_count` int NOT NULL DEFAULT 0,
	`failed_login_attempts` int NOT NULL DEFAULT 0,
	`lockout_until` timestamp,
	`last_login_at` timestamp,
	`password_changed_at` timestamp,
	`notes` text,
	`tags` json DEFAULT ('[]'),
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`)
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
	`clinical_effect` text NOT NULL,
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
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
CREATE TABLE `health_gap_reports` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`generated_at` timestamp NOT NULL DEFAULT (now()),
	`model_version` varchar(50) NOT NULL,
	`summary_narrative` text,
	`safety_gate_verified` boolean NOT NULL DEFAULT true,
	CONSTRAINT `health_gap_reports_id` PRIMARY KEY(`id`)
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
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`error_message` text,
	CONSTRAINT `intake_submissions_id` PRIMARY KEY(`id`)
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
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`last_updated` timestamp NOT NULL DEFAULT (now()),
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
CREATE TABLE `knowledge_categories` (
	`id` varchar(36) NOT NULL,
	`strand_id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`schema` json NOT NULL DEFAULT ('{"fields":[]}'),
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
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
	`published_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
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
	`fetched_at` timestamp DEFAULT (now()),
	`processed_at` timestamp,
	`is_active` int DEFAULT 1,
	`mesh_terms` json,
	`keywords` json,
	`citation_count` int,
	CONSTRAINT `literature_findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `literature_sync_log` (
	`id` varchar(36) NOT NULL,
	`started_at` timestamp NOT NULL,
	`completed_at` timestamp,
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
ALTER TABLE `auth_sessions` ADD CONSTRAINT `auth_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cultural_profiles` ADD CONSTRAINT `cultural_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_verifications` ADD CONSTRAINT `email_verifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `health_profiles` ADD CONSTRAINT `health_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_field_definitions` ADD CONSTRAINT `profile_field_definitions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_field_definitions` ADD CONSTRAINT `profile_field_definitions_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_activities` ADD CONSTRAINT `user_activities_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_nutrients` ADD CONSTRAINT `food_nutrients_food_id_foods_id_fk` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `food_nutrients` ADD CONSTRAINT `food_nutrients_nutrient_id_nutrients_id_fk` FOREIGN KEY (`nutrient_id`) REFERENCES `nutrients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compounds` ADD CONSTRAINT `compounds_herb_id_herbs_id_fk` FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `herb_drug_interactions` ADD CONSTRAINT `herb_drug_interactions_herb_id_herbs_id_fk` FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_causes` ADD CONSTRAINT `gap_causes_gap_id_identified_gaps_id_fk` FOREIGN KEY (`gap_id`) REFERENCES `identified_gaps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_solutions` ADD CONSTRAINT `gap_solutions_gap_id_identified_gaps_id_fk` FOREIGN KEY (`gap_id`) REFERENCES `identified_gaps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_solutions` ADD CONSTRAINT `gap_solutions_herb_id_herbs_id_fk` FOREIGN KEY (`herb_id`) REFERENCES `herbs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `health_gap_reports` ADD CONSTRAINT `health_gap_reports_submission_id_intake_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `intake_submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `health_gap_reports` ADD CONSTRAINT `health_gap_reports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `identified_gaps` ADD CONSTRAINT `identified_gaps_report_id_health_gap_reports_id_fk` FOREIGN KEY (`report_id`) REFERENCES `health_gap_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `identified_gaps` ADD CONSTRAINT `identified_gaps_nutrient_id_nutrients_id_fk` FOREIGN KEY (`nutrient_id`) REFERENCES `nutrients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `intake_submissions` ADD CONSTRAINT `intake_submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_alerts` ADD CONSTRAINT `emergency_alerts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_profiles` ADD CONSTRAINT `emergency_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diagnostic_sessions` ADD CONSTRAINT `diagnostic_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_causes` ADD CONSTRAINT `case_causes_session_id_case_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `case_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_sessions` ADD CONSTRAINT `case_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_solutions` ADD CONSTRAINT `case_solutions_session_id_case_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `case_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_categories` ADD CONSTRAINT `knowledge_categories_strand_id_knowledge_strands_id_fk` FOREIGN KEY (`strand_id`) REFERENCES `knowledge_strands`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_category_id_knowledge_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD CONSTRAINT `knowledge_items_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_strands` ADD CONSTRAINT `knowledge_strands_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_strands` ADD CONSTRAINT `knowledge_strands_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_versions` ADD CONSTRAINT `knowledge_versions_item_id_knowledge_items_id_fk` FOREIGN KEY (`item_id`) REFERENCES `knowledge_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_versions` ADD CONSTRAINT `knowledge_versions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;