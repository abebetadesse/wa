ALTER TABLE `pipeline_cases` ADD `assigned_professional_id` varchar(120);--> statement-breakpoint
ALTER TABLE `pipeline_cases` ADD `override_justification` text;--> statement-breakpoint
ALTER TABLE `pipeline_cases` ADD `override_actor_id` varchar(120);--> statement-breakpoint
CREATE INDEX `pipeline_cases_user_status_idx` ON `pipeline_cases` (`user_id`, `status`);--> statement-breakpoint
CREATE INDEX `pipeline_cases_status_idx` ON `pipeline_cases` (`status`, `submitted_at`);--> statement-breakpoint
CREATE INDEX `pipeline_cases_professional_idx` ON `pipeline_cases` (`assigned_professional_id`);--> statement-breakpoint
CREATE INDEX `pipeline_profiles_user_idx` ON `pipeline_profiles` (`user_id_string`, `updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `pipeline_preliminary_analyses_profile_idx` ON `pipeline_preliminary_analyses` (`profile_id`);--> statement-breakpoint
CREATE INDEX `pipeline_reports_case_idx` ON `pipeline_reports` (`case_id`, `kind`, `version`);--> statement-breakpoint
ALTER TABLE `pipeline_case_events` ADD `seq` bigint unsigned NOT NULL AUTO_INCREMENT UNIQUE;--> statement-breakpoint
CREATE INDEX `pipeline_case_events_case_idx` ON `pipeline_case_events` (`case_id`, `seq`);
