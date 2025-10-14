-- Check if reviews exist in database
SELECT 
    id,
    title,
    status,
    user_id,
    created_at
FROM reviews 
ORDER BY created_at DESC 
LIMIT 10;

-- Check total count
SELECT COUNT(*) as total_reviews FROM reviews;

-- Check reviews by status
SELECT 
    status,
    COUNT(*) as count
FROM reviews 
GROUP BY status;


