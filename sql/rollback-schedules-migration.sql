-- Rollback Migration: Remove review fields from schedules table
-- Use this script ONLY if you need to rollback the migration
-- WARNING: This will delete data in the review columns

-- Drop the index first
DROP INDEX IF EXISTS idx_schedules_video_title;

-- Remove all review-related columns
ALTER TABLE schedules
DROP COLUMN IF EXISTS video_title,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS video_thumbnail,
DROP COLUMN IF EXISTS channel_name,
DROP COLUMN IF EXISTS review_summary,
DROP COLUMN IF EXISTS review_pros,
DROP COLUMN IF EXISTS review_cons,
DROP COLUMN IF EXISTS review_key_points,
DROP COLUMN IF EXISTS review_target_audience,
DROP COLUMN IF EXISTS review_cta,
DROP COLUMN IF EXISTS review_seo_keywords;

-- Confirm rollback
SELECT 'Rollback completed: Removed review fields from schedules table' AS status;
