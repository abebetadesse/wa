CREATE TABLE IF NOT EXISTS `chat_intakes` (
  `user_id` varchar(36) NOT NULL,
  `state` json NOT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `chat_intakes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
