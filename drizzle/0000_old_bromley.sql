CREATE TYPE "public"."cleanliness" AS ENUM('extremely_clean', 'regularly_tidy', 'acceptable');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."lifestyle" AS ENUM('quiet', 'social', 'balanced');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('pending', 'matched', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."mbti" AS ENUM('INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."request_type_enum" AS ENUM('application', 'invitation');--> statement-breakpoint
CREATE TYPE "public"."study_habit" AS ENUM('library', 'dormitory', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."team_status" AS ENUM('recruiting', 'full', 'disbanded');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "team_join_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"request_type" "request_type_enum" DEFAULT 'application' NOT NULL,
	"invited_by" integer,
	"message" text,
	"status" "match_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_leader" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"leader_id" integer NOT NULL,
	"gender" "gender",
	"max_members" integer DEFAULT 4 NOT NULL,
	"current_members" integer DEFAULT 1 NOT NULL,
	"status" "team_status" DEFAULT 'recruiting' NOT NULL,
	"requirements" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wechat_id" varchar(100),
	"gender" "gender",
	"age" integer,
	"sleep_time" varchar(10),
	"wake_time" varchar(10),
	"study_habit" "study_habit",
	"lifestyle" "lifestyle",
	"cleanliness" "cleanliness",
	"mbti" "mbti",
	"roommate_expectations" text,
	"hobbies" text,
	"deal_breakers" text,
	"bio" text,
	"is_profile_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" varchar(20) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" varchar(255),
	"email_verification_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_user_id_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_log_action_idx" ON "activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "join_request_team_id_idx" ON "team_join_requests" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "join_request_user_id_idx" ON "team_join_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "join_request_status_idx" ON "team_join_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "join_request_type_idx" ON "team_join_requests" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "join_request_invited_by_idx" ON "team_join_requests" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "team_member_team_id_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_member_user_id_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_team_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_leader_id_idx" ON "teams" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "team_status_idx" ON "teams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "team_gender_idx" ON "teams" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "profile_user_id_idx" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "student_id_idx" ON "users" USING btree ("student_id");