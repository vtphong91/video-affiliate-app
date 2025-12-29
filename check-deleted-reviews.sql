-- Check total reviews for user
SELECT COUNT(*) as total_reviews
FROM reviews
WHERE user_id = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

-- Check by status
SELECT status, COUNT(*) as count
FROM reviews
WHERE user_id = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
GROUP BY status;

-- Check if any reviews have NULL user_id
SELECT COUNT(*) as null_user_id_count
FROM reviews
WHERE user_id IS NULL;
