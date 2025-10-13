-- Check review data structure for affiliate links and other fields
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
    channel_name
FROM reviews 
WHERE video_title LIKE '%QUẠT TUẦN HOÀN%'
LIMIT 1;
