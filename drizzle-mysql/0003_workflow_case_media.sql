CREATE TABLE IF NOT EXISTS `workflow_case_media` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `case_id` varchar(36) DEFAULT NULL,
  `kind` varchar(10) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size_bytes` int NOT NULL,
  `storage_key` varchar(200) NOT NULL,
  `original_name` varchar(200) DEFAULT NULL,
  `sha256` varchar(64) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `workflow_case_media_user_idx` (`user_id`, `created_at`),
  KEY `workflow_case_media_case_idx` (`case_id`),
  CONSTRAINT `workflow_case_media_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workflow_case_media_case_fk` FOREIGN KEY (`case_id`) REFERENCES `workflow_cases` (`id`) ON DELETE CASCADE
);--> statement-breakpoint
