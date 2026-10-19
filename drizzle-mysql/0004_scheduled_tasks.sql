CREATE TABLE IF NOT EXISTS `scheduled_tasks` (
  `name` varchar(80) NOT NULL,
  `every_seconds` int NOT NULL,
  `next_run_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lease_owner` varchar(120) DEFAULT NULL,
  `lease_until` datetime(3) DEFAULT NULL,
  `last_started_at` datetime(3) DEFAULT NULL,
  `last_success_at` datetime(3) DEFAULT NULL,
  `last_error_at` datetime(3) DEFAULT NULL,
  `last_error` varchar(1000) DEFAULT NULL,
  `consecutive_failures` int NOT NULL DEFAULT 0,
  `run_count` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`),
  KEY `scheduled_tasks_due_idx` (`next_run_at`)
);
