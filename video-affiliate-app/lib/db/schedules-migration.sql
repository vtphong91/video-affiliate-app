-- Migration: Create schedules table for automated posting
-- Description: Table to store scheduled posts for Facebook automation

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  
  -- Thời gian lên lịch
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  
  -- Target (nơi đăng)
  target_type TEXT NOT NULL CHECK (target_type IN ('page', 'group')),
  target_id TEXT NOT NULL,
  target_name TEXT,
  
  -- Nội dung đăng
  post_message TEXT NOT NULL,
  landing_page_url TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed', 'cancelled')),
  
  -- Kết quả đăng bài
  posted_at TIMESTAMP WITH TIME ZONE,
  facebook_post_id TEXT,
  facebook_post_url TEXT,
  error_message TEXT,
  
  -- Retry mechanism
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_scheduled_for ON schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_review_id ON schedules(review_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_retry ON schedules(next_retry_at) WHERE status = 'failed';

-- Create webhook_logs table for tracking webhook requests
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  
  -- Request data
  request_payload JSONB,
  request_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Response data
  response_payload JSONB,
  response_status INTEGER,
  response_received_at TIMESTAMP WITH TIME ZONE,
  
  -- Error tracking
  error_message TEXT,
  retry_attempt INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_schedule_id ON webhook_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_request_sent_at ON webhook_logs(request_sent_at);

-- Add comments for documentation
COMMENT ON TABLE schedules IS 'Stores scheduled posts for automated Facebook posting';
COMMENT ON COLUMN schedules.scheduled_for IS 'When the post should be published';
COMMENT ON COLUMN schedules.target_type IS 'Type of target: page or group';
COMMENT ON COLUMN schedules.target_id IS 'Facebook Page ID or Group ID';
COMMENT ON COLUMN schedules.status IS 'Current status of the scheduled post';
COMMENT ON COLUMN schedules.retry_count IS 'Number of retry attempts made';
COMMENT ON COLUMN schedules.next_retry_at IS 'When to retry if failed';

COMMENT ON TABLE webhook_logs IS 'Logs all webhook requests to Make.com';
COMMENT ON COLUMN webhook_logs.request_payload IS 'JSON payload sent to webhook';
COMMENT ON COLUMN webhook_logs.response_payload IS 'JSON response from webhook';

-- Enable Row Level Security (RLS)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Policy for webhook_logs (system access only)
CREATE POLICY "System can access webhook logs" ON webhook_logs
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for schedules table
CREATE TRIGGER update_schedules_updated_at 
  BEFORE UPDATE ON schedules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO schedules (
  user_id,
  review_id,
  scheduled_for,
  target_type,
  target_id,
  target_name,
  post_message,
  landing_page_url,
  status
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM reviews LIMIT 1),
  NOW() + INTERVAL '1 hour',
  'page',
  '123456789',
  'Test Page',
  '🔥 Test scheduled post\n\nThis is a test message for scheduled posting.',
  'https://example.com/review/test',
  'pending'
) ON CONFLICT DO NOTHING;
