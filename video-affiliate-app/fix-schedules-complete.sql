-- Script để drop tất cả policies còn lại
-- Chạy trong Supabase SQL Editor

-- Drop tất cả policies có thể có
DROP POLICY IF EXISTS "Users can create their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can view their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can create schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete schedules" ON schedules;
DROP POLICY IF EXISTS "Allow all operations" ON schedules;
DROP POLICY IF EXISTS "schedules_policy" ON schedules;

-- Kiểm tra policies còn lại
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'schedules';

-- Nếu vẫn còn policies, drop tất cả
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'schedules'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON schedules';
    END LOOP;
END $$;

-- Disable RLS
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

-- Bây giờ có thể alter column
ALTER TABLE schedules ALTER COLUMN user_id TYPE TEXT;

-- Test insert
INSERT INTO schedules (
  user_id,
  review_id,
  scheduled_for,
  timezone,
  target_type,
  target_id,
  target_name,
  post_message,
  landing_page_url,
  status,
  retry_count,
  max_retries
) VALUES (
  'default-user-id',
  '45e448df-d4ef-4d5d-9303-33109f9d6c30',
  '2025-01-08T11:20:00.000Z',
  'Asia/Ho_Chi_Minh',
  'page',
  'test-target',
  'Test Target',
  'Test message',
  'https://test.com',
  'pending',
  0,
  3
);

-- Verify
SELECT * FROM schedules WHERE user_id = 'default-user-id';

-- Clean up
DELETE FROM schedules WHERE user_id = 'default-user-id';
