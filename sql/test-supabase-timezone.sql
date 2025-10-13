-- Test Supabase timezone handling
-- Check data type of scheduled_for column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'schedules' AND column_name = 'scheduled_for';

-- Check sample data with timezone info
SELECT 
    id,
    video_title,
    scheduled_for,
    status,
    created_at,
    -- Check if scheduled_for has timezone info
    CASE 
        WHEN scheduled_for ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{2}$' THEN 'HAS_TIMEZONE'
        WHEN scheduled_for ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$' THEN 'UTC_FORMAT'
        WHEN scheduled_for ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}$' THEN 'NO_TIMEZONE'
        ELSE 'UNKNOWN_FORMAT'
    END as timezone_format
FROM schedules 
ORDER BY created_at DESC 
LIMIT 5;

-- Test timezone conversion
SELECT 
    NOW() as current_time,
    NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' as gmt7_time,
    NOW() AT TIME ZONE 'UTC' as utc_time;
