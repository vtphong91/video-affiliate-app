-- Check data type of scheduled_for column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'schedules' AND column_name = 'scheduled_for';

-- Check sample data to see actual format
SELECT 
    id,
    video_title,
    scheduled_for,
    status,
    created_at
FROM schedules 
ORDER BY created_at DESC 
LIMIT 5;
