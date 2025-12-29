-- Check RLS policies on reviews table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'reviews';

-- Check if review exists
SELECT id, user_id, video_title, created_at, status
FROM reviews
WHERE id = '0c1c13db-4b78-415d-aadd-6dc70090acc8';

-- Count all reviews for this user (bypassing RLS)
SELECT COUNT(*) as total_count
FROM reviews
WHERE user_id = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
