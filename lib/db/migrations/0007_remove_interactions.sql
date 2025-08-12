-- Remove user interaction features from the database
-- This migration removes matches table and interaction-related columns

-- Drop matches table completely
ALTER TABLE "matches" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "matches" CASCADE;--> statement-breakpoint

-- Remove interaction-related indexes from activity_logs
DROP INDEX "activity_log_target_idx";--> statement-breakpoint
DROP INDEX "activity_log_action_target_idx";--> statement-breakpoint
DROP INDEX "activity_log_user_action_idx";--> statement-breakpoint

-- Remove action_target_id column from activity_logs
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_action_target_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN "action_target_id";--> statement-breakpoint

-- Remove match_status enum type (no longer needed)
DROP TYPE "public"."match_status";--> statement-breakpoint