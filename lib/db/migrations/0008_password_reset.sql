-- 添加用户密码重置相关字段
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token" varchar(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires" timestamp;


