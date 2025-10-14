-- Check actual review data for the fan product
SELECT 
    id,
    video_title,
    summary,
    pros,
    cons,
    target_audience,
    seo_keywords,
    affiliate_links,
    video_url,
    channel_name,
    created_at
FROM reviews 
WHERE video_title LIKE '%QUẠT TUẦN HOÀN%' 
   OR video_title LIKE '%ENF156IVY%'
ORDER BY created_at DESC
LIMIT 3;


