-- Remove nickname field from user_profiles table
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "nickname";