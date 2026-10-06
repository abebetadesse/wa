ALTER TABLE `users` ADD `whatsapp_phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `whatsapp_verified_at` datetime(3);--> statement-breakpoint
ALTER TABLE `users` ADD `whatsapp_notify` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `whatsapp_last_inbound_at` datetime(3);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_whatsapp_phone_unique` UNIQUE(`whatsapp_phone`);