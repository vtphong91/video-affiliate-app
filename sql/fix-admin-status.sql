-- Check admin user status
-- Run this in Supabase SQL Editor

-- 1. Check all users and their status
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    is_active,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 2. Check specifically for admin users
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    is_active
FROM user_profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 3. Update admin users to active status
UPDATE user_profiles 
SET 
    status = 'active',
    is_active = true,
    approved_at = NOW(),
    approved_by = id  -- Self-approved for existing admin
WHERE role = 'admin' 
AND (status = 'pending' OR status IS NULL);
