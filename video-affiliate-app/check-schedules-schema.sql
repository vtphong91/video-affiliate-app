-- SQL để kiểm tra schema thực tế của schedules table
-- Chạy trong Supabase SQL Editor

-- Kiểm tra tất cả columns của schedules table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'schedules' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Kiểm tra dữ liệu hiện tại
SELECT * FROM schedules LIMIT 1;
