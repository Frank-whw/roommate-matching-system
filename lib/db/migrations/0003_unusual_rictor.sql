ALTER TABLE "user_profiles" ALTER COLUMN "cleanliness" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."cleanliness";--> statement-breakpoint
CREATE TYPE "public"."cleanliness" AS ENUM('extremely_clean', 'regularly_tidy', 'acceptable');--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "cleanliness" SET DATA TYPE "public"."cleanliness" USING "cleanliness"::"public"."cleanliness";--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "study_habit" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."study_habit";--> statement-breakpoint
CREATE TYPE "public"."study_habit" AS ENUM('library', 'dormitory', 'flexible');--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "study_habit" SET DATA TYPE "public"."study_habit" USING "study_habit"::"public"."study_habit";--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "nickname" varchar(50);