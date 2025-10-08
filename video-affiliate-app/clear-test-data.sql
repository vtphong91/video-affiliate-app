-- SQL để clear test data và test với dữ liệu thật
-- Chạy trong Supabase SQL Editor

-- Clear all test schedules
DELETE FROM schedules WHERE 
  target_name = 'Make.com Auto' OR 
  target_name = 'Test Target' OR
  target_name = 'Test Page' OR
  post_message = 'Auto-generated from review' OR
  post_message = 'Test message' OR
  landing_page_url LIKE '%example.com%' OR
  landing_page_url LIKE '%test.com%';

-- Verify cleanup
SELECT COUNT(*) as remaining_schedules FROM schedules;

-- Show remaining schedules (should be empty or only real data)
SELECT 
  id,
  user_id,
  review_id,
  target_name,
  post_message,
  landing_page_url,
  status,
  created_at
FROM schedules 
ORDER BY created_at DESC;
