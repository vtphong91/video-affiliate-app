-- Check reviews status in database
SELECT 
    id,
    slug,
    video_title,
    status,
    created_at,
    user_id
FROM reviews 
ORDER BY created_at DESC 
LIMIT 10;


