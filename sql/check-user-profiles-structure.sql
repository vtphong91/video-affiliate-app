-- Check current user_profiles table structure
-- Run this in Supabase SQL Editor

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Check if status column exists
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'status';

-- 3. Check all columns in user_profiles
SELECT * FROM user_profiles LIMIT 1;
