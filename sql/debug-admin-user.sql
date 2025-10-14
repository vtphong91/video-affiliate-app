-- Debug Admin User Profile
-- Check if admin user exists and has correct profile

-- 1. Check auth.users table
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'lammmodotcom@gmail.com';

-- 2. Check user_profiles table
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    is_active,
    created_at,
    updated_at
FROM user_profiles 
WHERE email = 'lammmodotcom@gmail.com';

-- 3. Check if there's a mismatch between auth.users and user_profiles
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    up.id as profile_id,
    up.email as profile_email,
    up.role,
    up.status,
    up.is_active
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'lammmodotcom@gmail.com';

-- 4. If profile doesn't exist, create it
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    status,
    is_active,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.user_metadata->>'full_name', 'Admin User'),
    'admin',
    'active',
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'lammmodotcom@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
);

-- 5. Verify the fix
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    is_active
FROM user_profiles 
WHERE email = 'lammmodotcom@gmail.com';


