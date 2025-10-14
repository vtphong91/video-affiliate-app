-- Fix reviews table structure to work with user_profiles

-- Step 1: Check if user_id column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'user_id';

-- Step 2: If user_id doesn't exist, add it
-- Uncomment the line below if user_id column doesn't exist:
-- ALTER TABLE reviews ADD COLUMN user_id UUID;

-- Step 3: Check current reviews data to see if user_id is populated
SELECT 
    id,
    title,
    status,
    user_id,
    created_at
FROM reviews 
LIMIT 5;

-- Step 4: If user_id is NULL for existing reviews, update them to admin user
-- First, get the admin user ID:
SELECT id, email, role 
FROM user_profiles 
WHERE role = 'admin' 
LIMIT 1;

-- Step 5: Update existing reviews to belong to admin user
-- Replace 'YOUR_ADMIN_USER_ID' with the actual admin user ID from step 4:
-- UPDATE reviews 
-- SET user_id = 'YOUR_ADMIN_USER_ID'
-- WHERE user_id IS NULL;

-- Step 6: Add foreign key constraint
-- Uncomment the line below to add foreign key constraint:
-- ALTER TABLE reviews 
-- ADD CONSTRAINT fk_reviews_user_id 
-- FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Step 7: Verify the fix
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'reviews';


