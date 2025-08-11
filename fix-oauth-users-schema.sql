-- Fix OAuth users schema issue
-- Make password_hash nullable for OAuth users who don't have passwords

-- Update the users table to allow null password_hash
ALTER TABLE public.users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Add a comment to clarify the nullable password_hash
COMMENT ON COLUMN public.users.password_hash IS 'Password hash for email/password users. Null for OAuth users (Google, etc.)';