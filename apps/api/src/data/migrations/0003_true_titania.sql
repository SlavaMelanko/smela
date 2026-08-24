CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"network" varchar(32) NOT NULL,
	"url" text NOT NULL,
	"svg" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);