-- Migration: Adjust video_url and video_id fields
-- This migration ensures video_url stores the full URL and video_id stores only the ID

-- Add comment to clarify the purpose of each field
COMMENT ON COLUMN reviews.video_url IS 'Full URL of the video (e.g., https://www.youtube.com/watch?v=abc123)';
COMMENT ON COLUMN reviews.video_id IS 'Video ID only (e.g., abc123 for YouTube videos)';

-- Update existing data if needed (this is optional and depends on current data)
-- If video_url currently contains only video IDs, we need to reconstruct the full URLs
-- This is a one-time fix for existing data

-- For YouTube videos: reconstruct URL from video_id
UPDATE reviews 
SET video_url = CASE 
  WHEN video_platform = 'youtube' THEN 'https://www.youtube.com/watch?v=' || video_id
  WHEN video_platform = 'tiktok' THEN 'https://www.tiktok.com/@user/video/' || video_id
  ELSE video_url
END
WHERE video_url NOT LIKE 'http%' AND video_id IS NOT NULL;

-- For TikTok videos: reconstruct URL from video_id (if we have the pattern)
-- Note: TikTok URLs are more complex, this is a simplified approach
UPDATE reviews 
SET video_url = CASE 
  WHEN video_platform = 'tiktok' AND video_url NOT LIKE 'http%' THEN 'https://www.tiktok.com/@user/video/' || video_id
  ELSE video_url
END
WHERE video_platform = 'tiktok' AND video_url NOT LIKE 'http%';

-- Add constraint to ensure video_url starts with http/https
ALTER TABLE reviews 
ADD CONSTRAINT check_video_url_format 
CHECK (video_url ~ '^https?://');

-- Add constraint to ensure video_id is not empty and doesn't contain URL characters
ALTER TABLE reviews 
ADD CONSTRAINT check_video_id_format 
CHECK (video_id ~ '^[a-zA-Z0-9_-]+$' AND length(video_id) > 0);

-- Create index on video_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_video_id ON reviews(video_id);

-- Create index on video_platform for filtering
CREATE INDEX IF NOT EXISTS idx_reviews_video_platform ON reviews(video_platform);
