-- Simple test for pending users
-- Run this in Supabase SQL Editor

-- 1. Test if status column exists
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'status';

-- 2. Check all users with their status
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 3. Count users by status
SELECT 
    status,
    COUNT(*) as count
FROM user_profiles 
GROUP BY status
ORDER BY count DESC;
