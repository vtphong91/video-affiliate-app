-- SQL để kiểm tra dữ liệu thật trong database
-- Chạy trong Supabase SQL Editor

-- Xem schedule mới nhất với dữ liệu thật
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
ORDER BY created_at DESC 
LIMIT 1;

-- Xem tất cả schedules để so sánh
SELECT 
  id,
  target_name,
  post_message,
  landing_page_url,
  created_at
FROM schedules 
ORDER BY created_at DESC;
