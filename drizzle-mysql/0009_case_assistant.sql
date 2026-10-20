CREATE TABLE IF NOT EXISTS `case_assistant_turns` (
  `id` varchar(36) NOT NULL,
  `case_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `asker` varchar(10) NOT NULL,
  `question` varchar(2000) NOT NULL,
  `answer` text NOT NULL,
  `mode` varchar(12) NOT NULL,
  `sources` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `case_assistant_turns_case_idx` (`case_id`, `created_at`),
  CONSTRAINT `case_assistant_turns_case_fk` FOREIGN KEY (`case_id`) REFERENCES `workflow_cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `case_assistant_turns_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
