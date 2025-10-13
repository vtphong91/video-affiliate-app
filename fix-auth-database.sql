-- Fix Authentication Database Issues
-- Run this script to fix user_profiles table structure

-- 1. Check current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Check if user_id column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'user_id';

-- 3. If user_id doesn't exist, add it
-- ALTER TABLE user_profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 4. If user_id exists but we're using 'id' column, rename it
-- ALTER TABLE user_profiles RENAME COLUMN id TO user_id;

-- 5. Create user profile for existing users if needed
INSERT INTO user_profiles (
    user_id,
    full_name,
    role,
    created_at,
    updated_at
) 
SELECT 
    id as user_id,
    COALESCE(raw_user_meta_data->>'full_name', 'User') as full_name,
    COALESCE(raw_user_meta_data->>'role', 'user') as role,
    created_at,
    updated_at
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Verify the fix
SELECT 
    up.user_id,
    up.full_name,
    up.role,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
LIMIT 5;
