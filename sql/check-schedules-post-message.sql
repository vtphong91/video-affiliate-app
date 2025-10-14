-- Check recent schedules to see post_message content
SELECT 
    id,
    video_title,
    post_message,
    status,
    created_at,
    scheduled_for
FROM schedules 
ORDER BY created_at DESC 
LIMIT 3;

-- Check if post_message contains proper content
SELECT 
    id,
    video_title,
    CASE 
        WHEN post_message LIKE '%🔥%' THEN 'Has emoji format'
        WHEN post_message LIKE '%ƯU ĐIỂM%' THEN 'Has pros section'
        WHEN post_message LIKE '%NHƯỢC ĐIỂM%' THEN 'Has cons section'
        WHEN post_message LIKE '%PHÙ HỢP VỚI%' THEN 'Has target audience'
        WHEN post_message LIKE '%Xem video gốc%' THEN 'Has video link'
        WHEN post_message LIKE '%Bản quyền%' THEN 'Has copyright'
        ELSE 'Missing expected content'
    END as content_check,
    LENGTH(post_message) as message_length,
    LEFT(post_message, 100) as message_preview
FROM schedules 
ORDER BY created_at DESC 
LIMIT 5;


