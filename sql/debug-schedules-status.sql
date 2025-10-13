-- Check all schedules in database with their status and timing
SELECT 
    id,
    video_title,
    status,
    scheduled_for,
    created_at,
    user_id,
    CASE 
        WHEN scheduled_for < NOW() THEN 'OVERDUE'
        WHEN scheduled_for > NOW() THEN 'FUTURE'
        ELSE 'CURRENT'
    END as timing_status
FROM schedules 
ORDER BY created_at DESC 
LIMIT 10;

-- Check schedules by status
SELECT 
    status,
    COUNT(*) as count,
    MIN(scheduled_for) as earliest,
    MAX(scheduled_for) as latest
FROM schedules 
GROUP BY status;

-- Check if there are any pending schedules that should be processed
SELECT 
    id,
    video_title,
    status,
    scheduled_for,
    NOW() as current_time,
    scheduled_for < NOW() as is_overdue
FROM schedules 
WHERE status = 'pending'
ORDER BY scheduled_for ASC;
