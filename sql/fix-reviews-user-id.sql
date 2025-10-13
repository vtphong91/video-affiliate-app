-- Check if user_id column exists in reviews table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'user_id';

-- If user_id doesn't exist, add it
-- ALTER TABLE reviews ADD COLUMN user_id UUID;

-- If user_id exists but no foreign key, add it
-- ALTER TABLE reviews 
-- ADD CONSTRAINT fk_reviews_user_id 
-- FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Check current reviews data
SELECT 
    id,
    title,
    status,
    user_id,
    created_at
FROM reviews 
LIMIT 5;
