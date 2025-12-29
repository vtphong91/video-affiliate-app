-- Migration: Create affiliate_links table
-- Description: Store generated affiliate links for reviews
-- Dependencies: Requires affiliate_settings and merchants tables from 001 migration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create affiliate_links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User who created this link
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Optional association with a review
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,

  -- Merchant this link belongs to
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,

  -- Original product/homepage URL
  original_url TEXT NOT NULL,

  -- Generated affiliate URL (long version)
  affiliate_url TEXT NOT NULL,

  -- Shortened URL (optional, from URL shortener)
  short_url VARCHAR(255),

  -- Link type: 'homepage' or 'product'
  link_type VARCHAR(20) DEFAULT 'product',

  -- How this link was generated: 'api', 'deeplink', 'tiktok-api'
  generation_method VARCHAR(20) DEFAULT 'deeplink',

  -- Unique tracking ID for analytics (format: userId_merchantId_timestamp)
  aff_sid VARCHAR(100) NOT NULL,

  -- Optional label for UI display
  label VARCHAR(255),

  -- Display order in UI (for sorting within a review)
  display_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT affiliate_links_link_type_check CHECK (link_type IN ('homepage', 'product')),
  CONSTRAINT affiliate_links_generation_method_check CHECK (generation_method IN ('api', 'deeplink', 'tiktok-api'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user_id ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_review_id ON affiliate_links(review_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_merchant_id ON affiliate_links(merchant_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_aff_sid ON affiliate_links(aff_sid);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_created_at ON affiliate_links(created_at DESC);

-- Create index for sorting within reviews
CREATE INDEX IF NOT EXISTS idx_affiliate_links_review_display_order
  ON affiliate_links(review_id, display_order);

-- Add comments for documentation
COMMENT ON TABLE affiliate_links IS 'Stores generated affiliate tracking links';
COMMENT ON COLUMN affiliate_links.user_id IS 'User who created this link';
COMMENT ON COLUMN affiliate_links.review_id IS 'Optional review this link belongs to';
COMMENT ON COLUMN affiliate_links.merchant_id IS 'Merchant (e.g., Shopee, Lazada)';
COMMENT ON COLUMN affiliate_links.original_url IS 'Original product/merchant URL';
COMMENT ON COLUMN affiliate_links.affiliate_url IS 'Generated affiliate tracking URL';
COMMENT ON COLUMN affiliate_links.short_url IS 'Shortened URL for sharing (optional)';
COMMENT ON COLUMN affiliate_links.link_type IS 'Type: homepage or product';
COMMENT ON COLUMN affiliate_links.generation_method IS 'How generated: api, deeplink, or tiktok-api';
COMMENT ON COLUMN affiliate_links.aff_sid IS 'Unique tracking ID for analytics';
COMMENT ON COLUMN affiliate_links.label IS 'Optional display label in UI';
COMMENT ON COLUMN affiliate_links.display_order IS 'Sort order within review';

-- Grant permissions
-- Note: Adjust these based on your RLS policies
-- For now, allowing authenticated users to manage their own links

-- Enable Row Level Security
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own links
CREATE POLICY "Users can view own affiliate links"
  ON affiliate_links
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own links
CREATE POLICY "Users can create own affiliate links"
  ON affiliate_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own links
CREATE POLICY "Users can update own affiliate links"
  ON affiliate_links
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own links
CREATE POLICY "Users can delete own affiliate links"
  ON affiliate_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all links
CREATE POLICY "Admins can view all affiliate links"
  ON affiliate_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can manage all links
CREATE POLICY "Admins can manage all affiliate links"
  ON affiliate_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_affiliate_links_updated_at
  BEFORE UPDATE ON affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_links_updated_at();

-- Migration complete
-- To apply: psql -d your_database < sql/migrations/002-create-affiliate-links.sql
