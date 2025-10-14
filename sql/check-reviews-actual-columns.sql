-- Check actual structure of reviews table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;

-- Check if video_title column exists
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'video_title';

-- Check sample data to see what columns actually contain title-like data
SELECT 
    id,
    slug,
    video_url,
    video_platform,
    created_at
FROM reviews 
LIMIT 3;


