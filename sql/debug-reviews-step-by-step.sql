-- Debug reviews table step by step

-- Step 1: Check total count
SELECT COUNT(*) as total_reviews FROM reviews;

-- Step 2: Check columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('id', 'video_title', 'slug', 'user_id', 'created_at')
ORDER BY ordinal_position;

-- Step 3: Check sample data with video_title
SELECT 
    id,
    video_title,
    slug,
    user_id,
    created_at
FROM reviews 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 4: Check if all reviews have video_title
SELECT 
    COUNT(*) as total,
    COUNT(video_title) as has_video_title,
    COUNT(*) - COUNT(video_title) as missing_video_title
FROM reviews;

-- Step 5: Check user_id distribution
SELECT 
    user_id,
    COUNT(*) as review_count
FROM reviews 
GROUP BY user_id;
