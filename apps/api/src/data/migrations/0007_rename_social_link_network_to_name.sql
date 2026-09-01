ALTER TABLE "social_links" RENAME COLUMN "network" TO "name";--> statement-breakpoint
ALTER INDEX "unique_social_link_network" RENAME TO "unique_social_link_name";
