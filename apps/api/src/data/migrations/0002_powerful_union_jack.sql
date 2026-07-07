CREATE TYPE "public"."email_sender_profile" AS ENUM('system', 'support', 'security');--> statement-breakpoint
CREATE TABLE "email_sender_profiles" (
	"profile" "email_sender_profile" PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
