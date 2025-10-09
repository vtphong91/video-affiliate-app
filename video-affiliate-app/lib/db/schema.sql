-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  video_url TEXT NOT NULL,
  video_platform TEXT NOT NULL CHECK (video_platform IN ('youtube', 'tiktok')),
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_thumbnail TEXT NOT NULL,
  video_description TEXT,
  channel_name TEXT,
  channel_url TEXT,

  -- AI generated content
  summary TEXT NOT NULL,
  pros JSONB NOT NULL DEFAULT '[]',
  cons JSONB NOT NULL DEFAULT '[]',
  key_points JSONB NOT NULL DEFAULT '[]',
  comparison_table JSONB,
  target_audience JSONB NOT NULL DEFAULT '[]',
  cta TEXT NOT NULL,
  seo_keywords JSONB NOT NULL DEFAULT '[]',

  -- Custom edits
  custom_title TEXT,
  custom_content TEXT,

  -- Affiliate
  affiliate_links JSONB NOT NULL DEFAULT '[]',

  -- Facebook
  fb_post_id TEXT,
  fb_post_url TEXT,
  posted_at TIMESTAMP,

  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Meta
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: user_settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY,
  youtube_api_key TEXT,
  facebook_page_id TEXT,
  facebook_access_token TEXT,
  default_affiliate_platform TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_slug ON reviews(slug);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Functions for analytics
CREATE OR REPLACE FUNCTION increment_views(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET views = views + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_clicks(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET clicks = clicks + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_conversions(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET conversions = conversions + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if using Supabase Auth)
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own reviews" ON reviews
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own reviews" ON reviews
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own reviews" ON reviews
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own reviews" ON reviews
--   FOR DELETE USING (auth.uid() = user_id);

-- CREATE POLICY "Anyone can view published reviews" ON reviews
--   FOR SELECT USING (status = 'published');
