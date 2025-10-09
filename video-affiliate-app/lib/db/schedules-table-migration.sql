-- Migration script để tạo và fix schedules table
-- Chạy script này trong Supabase SQL Editor

-- Step 1: Drop table nếu tồn tại (cẩn thận!)
-- DROP TABLE IF EXISTS schedules CASCADE;

-- Step 2: Tạo schedules table với schema đúng
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  review_id UUID NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  target_type TEXT NOT NULL DEFAULT 'page' CHECK (target_type IN ('page', 'group')),
  target_id TEXT NOT NULL DEFAULT 'make-com-handled',
  target_name TEXT DEFAULT 'Make.com Auto',
  post_message TEXT NOT NULL DEFAULT 'Auto-generated from review',
  landing_page_url TEXT NOT NULL DEFAULT 'https://example.com/review/auto',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed', 'cancelled')),
  posted_at TIMESTAMP WITH TIME ZONE,
  facebook_post_id TEXT,
  facebook_post_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Tạo indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_review_id ON schedules(review_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_scheduled_for ON schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_schedules_created_at ON schedules(created_at);

-- Step 4: Tạo foreign key constraint (nếu reviews table tồn tại)
-- ALTER TABLE schedules 
-- ADD CONSTRAINT fk_schedules_review_id 
-- FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

-- Step 5: Tạo RLS policies (nếu cần)
-- ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Policy cho user có thể xem schedules của mình
-- CREATE POLICY "Users can view their own schedules" ON schedules
--   FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Policy cho user có thể tạo schedules
-- CREATE POLICY "Users can create schedules" ON schedules
--   FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Policy cho user có thể update schedules của mình
-- CREATE POLICY "Users can update their own schedules" ON schedules
--   FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Policy cho user có thể delete schedules của mình
-- CREATE POLICY "Users can delete their own schedules" ON schedules
--   FOR DELETE USING (user_id = current_setting('app.current_user_id', true));

-- Step 6: Tạo function để update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Tạo trigger để auto-update updated_at
DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Test insert
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
  'test-user',
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

-- Step 9: Verify insert
SELECT * FROM schedules WHERE user_id = 'test-user';

-- Step 10: Clean up test data
DELETE FROM schedules WHERE user_id = 'test-user';

-- Step 11: Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'schedules' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
