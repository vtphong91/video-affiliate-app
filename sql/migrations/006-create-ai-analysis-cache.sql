-- Migration: Create AI Analysis Cache Table
-- Purpose: Cache AI analysis results to avoid repeated expensive API calls
-- Date: 2024-12-28

-- Create ai_analysis_cache table
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT UNIQUE NOT NULL,
  video_platform TEXT NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_cache_video_id ON ai_analysis_cache(video_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_platform ON ai_analysis_cache(video_platform);
CREATE INDEX IF NOT EXISTS idx_ai_cache_created_at ON ai_analysis_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_cache_last_accessed ON ai_analysis_cache(last_accessed_at DESC);

-- Add comment
COMMENT ON TABLE ai_analysis_cache IS 'Caches AI video analysis results to reduce API calls and improve performance';
COMMENT ON COLUMN ai_analysis_cache.video_id IS 'Unique video identifier (YouTube ID, TikTok ID, etc)';
COMMENT ON COLUMN ai_analysis_cache.video_platform IS 'Platform: youtube, tiktok, etc';
COMMENT ON COLUMN ai_analysis_cache.analysis IS 'Full AI analysis result in JSON format';
COMMENT ON COLUMN ai_analysis_cache.hit_count IS 'Number of times this cache entry was used';
COMMENT ON COLUMN ai_analysis_cache.last_accessed_at IS 'Last time this cache was accessed';

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_ai_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_ai_cache_updated_at
  BEFORE UPDATE ON ai_analysis_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_cache_updated_at();

-- Create function to clean old cache (optional - can be called via cron)
CREATE OR REPLACE FUNCTION clean_old_ai_cache(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_analysis_cache
  WHERE created_at < NOW() - (days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clean_old_ai_cache IS 'Delete cache entries older than specified days (default 30)';

-- Grant permissions (adjust based on your RLS policies)
-- GRANT SELECT, INSERT, UPDATE ON ai_analysis_cache TO authenticated;
-- GRANT SELECT ON ai_analysis_cache TO anon;
