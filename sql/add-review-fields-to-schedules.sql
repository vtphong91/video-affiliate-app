-- Migration: Add review fields to schedules table
-- This allows schedules to store denormalized review data for faster querying
-- Created: 2025-11-08

-- Add video information fields
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS video_title TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS channel_name TEXT;

-- Add review content fields (using JSONB for arrays)
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS review_summary TEXT,
ADD COLUMN IF NOT EXISTS review_pros JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS review_cons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS review_key_points JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS review_target_audience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS review_cta TEXT,
ADD COLUMN IF NOT EXISTS review_seo_keywords JSONB DEFAULT '[]'::jsonb;

-- Comment on columns for documentation
COMMENT ON COLUMN schedules.video_title IS 'Denormalized from reviews.video_title for faster access';
COMMENT ON COLUMN schedules.video_url IS 'Denormalized from reviews.video_url';
COMMENT ON COLUMN schedules.video_thumbnail IS 'Denormalized from reviews.video_thumbnail';
COMMENT ON COLUMN schedules.channel_name IS 'Denormalized from reviews.channel_name';
COMMENT ON COLUMN schedules.review_summary IS 'Denormalized from reviews.summary';
COMMENT ON COLUMN schedules.review_pros IS 'Denormalized from reviews.pros (JSONB array)';
COMMENT ON COLUMN schedules.review_cons IS 'Denormalized from reviews.cons (JSONB array)';
COMMENT ON COLUMN schedules.review_key_points IS 'Denormalized from reviews.key_points (JSONB array)';
COMMENT ON COLUMN schedules.review_target_audience IS 'Denormalized from reviews.target_audience (JSONB array)';
COMMENT ON COLUMN schedules.review_cta IS 'Denormalized from reviews.cta';
COMMENT ON COLUMN schedules.review_seo_keywords IS 'Denormalized from reviews.seo_keywords (JSONB array)';

-- Create index on video_title for faster filtering
CREATE INDEX IF NOT EXISTS idx_schedules_video_title ON schedules(video_title);

-- Display completion message
SELECT 'Migration completed: Added review fields to schedules table' AS status;
