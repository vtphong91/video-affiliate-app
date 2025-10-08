-- SQL Script để kiểm tra schema thực tế của schedules table
-- Copy và paste vào Supabase SQL Editor

-- Step 1: Kiểm tra tất cả columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'schedules' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Kiểm tra dữ liệu hiện tại
SELECT * FROM schedules LIMIT 1;

-- Step 3: Kiểm tra constraints
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'schedules' 
  AND tc.table_schema = 'public';

-- Step 4: Test insert với các column names khác nhau
-- Uncomment một trong các dòng dưới để test:

-- Test với target_type:
-- INSERT INTO schedules (user_id, review_id, scheduled_for, timezone, target_type, target_id, target_name, post_message, landing_page_url, status, retry_count, max_retries) 
-- VALUES ('test-user', '45e448df-d4ef-4d5d-9303-33109f9d6c30', '2025-01-08T11:20:00.000Z', 'Asia/Ho_Chi_Minh', 'page', 'test-target', 'Test Target', 'Test message', 'https://test.com', 'pending', 0, 3);

-- Test với target_typ:
-- INSERT INTO schedules (user_id, review_id, scheduled_for, timezone, target_typ, target_id, target_name, post_message, landing_page_url, status, retry_count, max_retries) 
-- VALUES ('test-user', '45e448df-d4ef-4d5d-9303-33109f9d6c30', '2025-01-08T11:20:00.000Z', 'Asia/Ho_Chi_Minh', 'page', 'test-target', 'Test Target', 'Test message', 'https://test.com', 'pending', 0, 3);

-- Test với target:
-- INSERT INTO schedules (user_id, review_id, scheduled_for, timezone, target, target_id, target_name, post_message, landing_page_url, status, retry_count, max_retries) 
-- VALUES ('test-user', '45e448df-d4ef-4d5d-9303-33109f9d6c30', '2025-01-08T11:20:00.000Z', 'Asia/Ho_Chi_Minh', 'page', 'test-target', 'Test Target', 'Test message', 'https://test.com', 'pending', 0, 3);
