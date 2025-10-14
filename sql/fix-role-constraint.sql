-- Check and fix user_profiles role constraint
-- This script will check the current constraint and fix it

-- 1. Check current constraints on user_profiles table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND contype = 'c';

-- 2. Drop the existing role constraint if it exists
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- 3. Create a new constraint that allows all valid roles
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('admin', 'editor', 'viewer'));

-- 4. Check if the constraint was created successfully
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND contype = 'c'
AND conname = 'user_profiles_role_check';

-- 5. Test the constraint by trying to insert a test record
-- This should work now
INSERT INTO user_profiles (
    id, 
    email, 
    full_name, 
    role, 
    permissions, 
    status, 
    is_active,
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'test-constraint@example.com',
    'Test User',
    'viewer',
    '[]'::jsonb,
    'pending',
    false,
    NOW(),
    NOW()
);

-- 6. Clean up the test record
DELETE FROM user_profiles WHERE email = 'test-constraint@example.com';

-- 7. Show success message
SELECT 'Constraint fixed successfully!' as status;


