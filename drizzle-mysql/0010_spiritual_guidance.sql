CREATE TABLE IF NOT EXISTS `guidance_letter_values` (
  `id` varchar(36) NOT NULL,
  `system` varchar(40) NOT NULL,
  `letter` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `value` int NOT NULL,
  `validated` tinyint(1) NOT NULL DEFAULT 0,
  `notes` varchar(500) NOT NULL DEFAULT '',
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `guidance_letter_values_system_letter_uq` (`system`, `letter`),
  CONSTRAINT `guidance_letter_values_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `guidance_entries` (
  `id` varchar(36) NOT NULL,
  `kind` varchar(40) NOT NULL,
  `entry_key` varchar(120) NOT NULL,
  `language` varchar(5) NOT NULL DEFAULT '',
  `data` json NOT NULL,
  `validated` tinyint(1) NOT NULL DEFAULT 0,
  `notes` varchar(500) NOT NULL DEFAULT '',
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `guidance_entries_kind_key_lang_uq` (`kind`, `entry_key`, `language`),
  CONSTRAINT `guidance_entries_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `guidance_services` (
  `slug` varchar(60) NOT NULL,
  `names` json NOT NULL,
  `descriptions` json NOT NULL,
  `mode` varchar(12) NOT NULL,
  `weights` json NOT NULL,
  `options` json NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int NOT NULL DEFAULT 0,
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`slug`),
  CONSTRAINT `guidance_services_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `guidance_calendar_days` (
  `id` varchar(36) NOT NULL,
  `tradition` varchar(20) NOT NULL,
  `entry_key` varchar(80) NOT NULL,
  `kind` varchar(20) NOT NULL,
  `anchor` varchar(20) NOT NULL,
  `calendar` varchar(10) NOT NULL DEFAULT 'ethiopian',
  `month` int DEFAULT NULL,
  `day` int DEFAULT NULL,
  `offset_days` int NOT NULL DEFAULT 0,
  `length_days` int NOT NULL DEFAULT 1,
  `until_month` int DEFAULT NULL,
  `until_day` int DEFAULT NULL,
  `names` json NOT NULL,
  `effects` json NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `validated` tinyint(1) NOT NULL DEFAULT 0,
  `notes` varchar(500) NOT NULL DEFAULT '',
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `guidance_calendar_days_key_uq` (`tradition`, `entry_key`),
  CONSTRAINT `guidance_calendar_days_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `guidance_hijri_month_starts` (
  `year` int NOT NULL,
  `month` int NOT NULL,
  `start_date` date NOT NULL,
  `note` varchar(300) NOT NULL DEFAULT '',
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`year`, `month`),
  CONSTRAINT `guidance_hijri_month_starts_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `guidance_names` (
  `id` varchar(36) NOT NULL,
  `name_geez` varchar(80) NOT NULL DEFAULT '',
  `name_latin` varchar(80) NOT NULL DEFAULT '',
  `gender` varchar(10) NOT NULL,
  `languages` json NOT NULL,
  `religions` json NOT NULL,
  `origin` varchar(80) NOT NULL DEFAULT '',
  `meanings` json NOT NULL,
  `feast_days` json NOT NULL,
  `tags` json NOT NULL,
  `source` varchar(200) NOT NULL DEFAULT '',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `guidance_names_name_uq` (`name_geez`, `name_latin`),
  KEY `guidance_names_gender_idx` (`gender`, `active`),
  CONSTRAINT `guidance_names_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
