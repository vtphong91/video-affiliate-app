-- Check admin user profile
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

-- Check if admin user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'lammmodotcom@gmail.com';

-- Update admin user profile to ensure it's correct
UPDATE user_profiles 
SET 
    role = 'admin',
    status = 'active',
    is_active = true,
    updated_at = NOW()
WHERE email = 'lammmodotcom@gmail.com';

-- Verify the update
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    is_active
FROM user_profiles 
WHERE email = 'lammmodotcom@gmail.com';


