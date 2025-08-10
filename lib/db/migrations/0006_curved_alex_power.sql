CREATE TYPE "public"."request_type_enum" AS ENUM('application', 'invitation');--> statement-breakpoint
ALTER TABLE "user_likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_likes" CASCADE;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "action_target_id" integer;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD COLUMN "request_type" "request_type_enum" DEFAULT 'application' NOT NULL;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD COLUMN "invited_by" integer;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_action_target_id_users_id_fk" FOREIGN KEY ("action_target_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_target_idx" ON "activity_logs" USING btree ("action_target_id");--> statement-breakpoint
CREATE INDEX "activity_log_action_target_idx" ON "activity_logs" USING btree ("action","action_target_id");--> statement-breakpoint
CREATE INDEX "activity_log_user_action_idx" ON "activity_logs" USING btree ("user_id","action");--> statement-breakpoint
CREATE INDEX "join_request_type_idx" ON "team_join_requests" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "join_request_invited_by_idx" ON "team_join_requests" USING btree ("invited_by");--> statement-breakpoint
-- ALTER TABLE "user_profiles" DROP COLUMN "nickname"; -- Column does not exist