ALTER TABLE "teams" ADD COLUMN "gender" "gender";--> statement-breakpoint
CREATE INDEX "team_gender_idx" ON "teams" USING btree ("gender");