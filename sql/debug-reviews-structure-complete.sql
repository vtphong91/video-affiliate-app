-- Debug complete reviews table structure
-- Check all columns and their data types

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;

-- Check sample data to see actual content
SELECT 
    id,
    slug,
    video_title,
    video_url,
    video_thumbnail,
    channel_name,
    summary,
    pros,
    cons,
    key_points,
    target_audience,
    cta,
    seo_keywords,
    status,
    created_at,
    user_id
FROM reviews 
ORDER BY created_at DESC 
LIMIT 3;

-- Check if all required fields for Facebook post exist
SELECT 
    COUNT(*) as total_reviews,
    COUNT(video_title) as has_video_title,
    COUNT(summary) as has_summary,
    COUNT(pros) as has_pros,
    COUNT(cons) as has_cons,
    COUNT(target_audience) as has_target_audience,
    COUNT(seo_keywords) as has_seo_keywords,
    COUNT(video_url) as has_video_url,
    COUNT(channel_name) as has_channel_name
FROM reviews;


