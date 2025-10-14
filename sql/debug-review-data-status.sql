-- Check actual review data for debugging
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
    -- Check if fields are null or empty
    CASE 
        WHEN pros IS NULL THEN 'NULL'
        WHEN jsonb_array_length(pros) = 0 THEN 'EMPTY'
        ELSE 'HAS_DATA'
    END as pros_status,
    CASE 
        WHEN cons IS NULL THEN 'NULL'
        WHEN jsonb_array_length(cons) = 0 THEN 'EMPTY'
        ELSE 'HAS_DATA'
    END as cons_status,
    CASE 
        WHEN target_audience IS NULL THEN 'NULL'
        WHEN jsonb_array_length(target_audience) = 0 THEN 'EMPTY'
        ELSE 'HAS_DATA'
    END as target_status,
    CASE 
        WHEN affiliate_links IS NULL THEN 'NULL'
        WHEN jsonb_array_length(affiliate_links) = 0 THEN 'EMPTY'
        ELSE 'HAS_DATA'
    END as affiliate_status
FROM reviews 
WHERE video_title LIKE '%QUẠT TUẦN HOÀN%' 
   OR video_title LIKE '%ENF156IVY%'
ORDER BY created_at DESC
LIMIT 1;


