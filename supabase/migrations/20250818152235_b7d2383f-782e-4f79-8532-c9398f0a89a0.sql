-- Fix the confirmation_token field issue in auth.users table
-- This handles the NULL to string conversion error

-- Update any NULL confirmation_token to empty string to prevent scan errors
UPDATE auth.users 
SET confirmation_token = COALESCE(confirmation_token, '') 
WHERE confirmation_token IS NULL;

-- Ensure email_confirmed_at is set for our admin user
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'admin@ouvidoria.com' AND email_confirmed_at IS NULL;