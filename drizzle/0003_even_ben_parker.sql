ALTER TABLE `products` ADD `size` varchar(60);--> statement-breakpoint
ALTER TABLE `products` ADD `flavorOptions` json;--> statement-breakpoint
ALTER TABLE `products` ADD `maxFlavorSelections` int;--> statement-breakpoint
ALTER TABLE `products` ADD `quantityOptions` json;--> statement-breakpoint
ALTER TABLE `products` ADD `leadTime` varchar(200);--> statement-breakpoint
ALTER TABLE `products` ADD `pickupEligible` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deliveryEligible` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `ingredients` text;--> statement-breakpoint
ALTER TABLE `products` ADD `allergens` text;--> statement-breakpoint
ALTER TABLE `products` ADD `storageInstructions` text;--> statement-breakpoint
ALTER TABLE `products` ADD `relatedSlugs` json;--> statement-breakpoint
ALTER TABLE `products` ADD `isSeasonal` boolean DEFAULT false NOT NULL;