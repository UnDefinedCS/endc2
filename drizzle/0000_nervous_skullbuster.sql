CREATE TABLE `devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sid` text NOT NULL,
	`username` text NOT NULL,
	`hostname` text NOT NULL,
	`model` text NOT NULL,
	`machine_id` text NOT NULL,
	`pwned_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devices_sid_unique` ON `devices` (`sid`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`uid` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`uid`) REFERENCES `workers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workers_username_unique` ON `workers` (`username`);