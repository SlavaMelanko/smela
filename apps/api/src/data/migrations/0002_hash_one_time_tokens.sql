ALTER TABLE "tokens" DROP CONSTRAINT "tokens_token_unique";--> statement-breakpoint
ALTER TABLE "tokens" RENAME COLUMN "token" TO "token_hash";--> statement-breakpoint
UPDATE "tokens" SET "token_hash" = encode(sha256(convert_to("token_hash", 'UTF8')), 'hex');--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "token_hash" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_token_hash_unique" UNIQUE("token_hash");
