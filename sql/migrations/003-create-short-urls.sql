-- Migration 003: Create Short URLs Tables
-- Purpose: Custom URL shortener for affiliate links
-- Author: System
-- Date: 2024-01-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: short_urls
-- Stores shortened URLs with tracking integration
CREATE TABLE IF NOT EXISTS short_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,

  -- Affiliate tracking integration
  review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  aff_sid VARCHAR(100),
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,

  -- Metadata
  title VARCHAR(255),
  description TEXT,

  -- Click tracking
  clicks INT DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Link management
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- User tracking
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- A/B testing support
  variant VARCHAR(50),

  -- Constraints
  CONSTRAINT short_code_length CHECK (char_length(short_code) >= 4 AND char_length(short_code) <= 10),
  CONSTRAINT valid_original_url CHECK (original_url ~ '^https?://')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_short_urls_short_code
  ON short_urls(short_code) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_short_urls_review_id
  ON short_urls(review_id) WHERE review_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_short_urls_aff_sid
  ON short_urls(aff_sid) WHERE aff_sid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_short_urls_created_by
  ON short_urls(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at
  ON short_urls(expires_at) WHERE is_active = true AND expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_short_urls_created_at
  ON short_urls(created_at DESC);

-- Table: short_url_clicks (Optional - for detailed analytics)
-- Stores individual click events for detailed tracking
CREATE TABLE IF NOT EXISTS short_url_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_url_id UUID NOT NULL REFERENCES short_urls(id) ON DELETE CASCADE,

  -- Click metadata
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,

  -- Geo-location (optional - can populate later with external service)
  country VARCHAR(2),
  city VARCHAR(100),

  -- Device info
  device_type VARCHAR(20), -- mobile, desktop, tablet, unknown
  browser VARCHAR(50),
  os VARCHAR(50)
);

-- Indexes for short_url_clicks
CREATE INDEX IF NOT EXISTS idx_short_url_clicks_short_url_id
  ON short_url_clicks(short_url_id);

CREATE INDEX IF NOT EXISTS idx_short_url_clicks_clicked_at
  ON short_url_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_short_url_clicks_device_type
  ON short_url_clicks(device_type) WHERE device_type IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE short_urls IS 'Custom URL shortener for affiliate links to prevent Facebook spam detection';
COMMENT ON COLUMN short_urls.short_code IS 'Base62 encoded short code (e.g., abc123), 4-10 characters';
COMMENT ON COLUMN short_urls.aff_sid IS 'Reference to affiliate link tracking ID from affiliate system';
COMMENT ON COLUMN short_urls.clicks IS 'Simple click counter, incremented on each redirect';
COMMENT ON COLUMN short_urls.expires_at IS 'Optional expiration date, link becomes inactive after this date';
COMMENT ON COLUMN short_urls.variant IS 'Optional A/B testing variant identifier';

COMMENT ON TABLE short_url_clicks IS 'Detailed click event log for analytics (optional, enable via feature flag)';
COMMENT ON COLUMN short_url_clicks.ip_address IS 'Client IP address for unique visitor tracking';

-- Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_url_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own short URLs
CREATE POLICY short_urls_select_own ON short_urls
  FOR SELECT
  USING (created_by = auth.uid());

-- Policy: Users can insert their own short URLs
CREATE POLICY short_urls_insert_own ON short_urls
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own short URLs
CREATE POLICY short_urls_update_own ON short_urls
  FOR UPDATE
  USING (created_by = auth.uid());

-- Policy: Service role can do everything (for API endpoints)
CREATE POLICY short_urls_service_role_all ON short_urls
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Anyone can read active short URLs (for redirect)
-- This will be handled by service role in API, but keeping for reference
-- CREATE POLICY short_urls_public_read ON short_urls
--   FOR SELECT
--   USING (is_active = true);

-- Policy: Service role can insert click events
CREATE POLICY short_url_clicks_service_role_all ON short_url_clicks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON short_urls TO authenticated;
GRANT SELECT, INSERT ON short_url_clicks TO authenticated;

-- Grant full permissions to service role
GRANT ALL ON short_urls TO service_role;
GRANT ALL ON short_url_clicks TO service_role;

-- Sample data (optional - for testing)
-- UNCOMMENT to add test data
/*
INSERT INTO short_urls (short_code, original_url, title, created_by, expires_at)
VALUES (
  'abc123',
  'https://go.isclix.com/deep_link/1234567/89012?url=https://shopee.vn/product/test',
  'Test Shopee Product',
  (SELECT id FROM user_profiles WHERE email = 'admin@example.com' LIMIT 1),
  NOW() + INTERVAL '90 days'
);
*/

-- Migration complete
-- Verify tables created:
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('short_urls', 'short_url_clicks')
ORDER BY table_name;
