-- Remove the problematic admin user
DELETE FROM auth.users WHERE email = 'admin@ouvidoria.com';
DELETE FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Create a new user using proper Supabase auth functions
-- First, let's check if we have the proper extension for creating auth users
SELECT auth.email();