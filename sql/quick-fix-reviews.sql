-- Quick fix for reviews table

-- 1. Add user_id column if it doesn't exist
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Get admin user ID
SELECT id as admin_user_id, email, role 
FROM user_profiles 
WHERE role = 'admin' 
LIMIT 1;

-- 3. Update existing reviews to belong to admin user
-- Replace 'YOUR_ADMIN_USER_ID' with the admin_user_id from step 2
UPDATE reviews 
SET user_id = 'YOUR_ADMIN_USER_ID'
WHERE user_id IS NULL;

-- 4. Add foreign key constraint
ALTER TABLE reviews 
ADD CONSTRAINT IF NOT EXISTS fk_reviews_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- 5. Verify the fix
SELECT 
    r.id,
    r.title,
    r.status,
    r.user_id,
    up.email as user_email,
    up.role as user_role
FROM reviews r
LEFT JOIN user_profiles up ON r.user_id = up.id
LIMIT 5;
