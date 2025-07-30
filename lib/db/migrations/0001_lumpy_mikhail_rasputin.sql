CREATE TYPE "public"."cleanliness" AS ENUM('very_clean', 'clean', 'moderate');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."lifestyle" AS ENUM('quiet', 'social', 'balanced');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('pending', 'matched', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."mbti" AS ENUM('INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP');--> statement-breakpoint
CREATE TYPE "public"."study_habit" AS ENUM('early_bird', 'night_owl', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."team_status" AS ENUM('recruiting', 'full', 'disbanded');--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1_id" integer NOT NULL,
	"user2_id" integer NOT NULL,
	"match_score" integer,
	"status" "match_status" DEFAULT 'matched' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_join_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
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
	"max_members" integer DEFAULT 4 NOT NULL,
	"current_members" integer DEFAULT 1 NOT NULL,
	"status" "team_status" DEFAULT 'recruiting' NOT NULL,
	"dorm_area" varchar(100),
	"requirements" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" integer NOT NULL,
	"to_user_id" integer NOT NULL,
	"is_like" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wechat_id" varchar(100),
	"gender" "gender",
	"age" integer,
	"major" varchar(100),
	"grade" varchar(20),
	"dorm_area" varchar(100),
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
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "student_id" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_expires" timestamp;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_user1_id_idx" ON "matches" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "match_user2_id_idx" ON "matches" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "match_status_idx" ON "matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "join_request_team_id_idx" ON "team_join_requests" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "join_request_user_id_idx" ON "team_join_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "join_request_status_idx" ON "team_join_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "team_member_team_id_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_member_user_id_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "unique_user_team_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_leader_id_idx" ON "teams" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "team_status_idx" ON "teams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "like_from_user_id_idx" ON "user_likes" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "like_to_user_id_idx" ON "user_likes" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "unique_user_pair_like_idx" ON "user_likes" USING btree ("from_user_id","to_user_id");--> statement-breakpoint
CREATE INDEX "profile_user_id_idx" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_user_id_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_log_action_idx" ON "activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "student_id_idx" ON "users" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_student_id_unique" UNIQUE("student_id");