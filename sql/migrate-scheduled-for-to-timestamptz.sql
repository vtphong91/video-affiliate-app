-- Migration: Convert scheduled_for column to TIMESTAMPTZ for proper UTC storage
-- Run this in Supabase SQL Editor
-- Date: 2025-10-15

-- ============================================
-- STEP 1: Backup existing data
-- ============================================
CREATE TABLE IF NOT EXISTS schedules_backup_20251015 AS
SELECT * FROM schedules;

SELECT 'Backup created: schedules_backup_20251015' AS status;

-- ============================================
-- STEP 2: Check current column type and data
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'schedules'
    AND column_name IN ('scheduled_for', 'posted_at');

-- Show sample data
SELECT
    id,
    scheduled_for,
    posted_at,
    status,
    created_at
FROM schedules
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- STEP 3: Convert scheduled_for to TIMESTAMPTZ
-- ============================================

-- Option A: Keep existing schedules (if data is valuable)
-- This assumes scheduled_for is currently TEXT or TIMESTAMP without timezone
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TIMESTAMPTZ
USING CASE
    WHEN scheduled_for IS NULL THEN NULL
    WHEN scheduled_for ~ '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$' THEN
        -- PostgreSQL format without timezone: "2025-10-14 16:25:00"
        -- Treat as UTC
        (scheduled_for || '+00')::TIMESTAMPTZ
    WHEN scheduled_for ~ 'Z$' OR scheduled_for ~ '[+-]\d{2}:\d{2}$' THEN
        -- ISO format with timezone: "2025-10-14T16:25:00Z" or "2025-10-14T16:25:00+07:00"
        scheduled_for::TIMESTAMPTZ
    ELSE
        -- Default: try to parse as timestamp
        scheduled_for::TIMESTAMPTZ
END;

-- Convert posted_at to TIMESTAMPTZ as well
ALTER TABLE schedules
ALTER COLUMN posted_at TYPE TIMESTAMPTZ
USING CASE
    WHEN posted_at IS NULL THEN NULL
    WHEN posted_at ~ '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$' THEN
        (posted_at || '+00')::TIMESTAMPTZ
    WHEN posted_at ~ 'Z$' OR posted_at ~ '[+-]\d{2}:\d{2}$' THEN
        posted_at::TIMESTAMPTZ
    ELSE
        posted_at::TIMESTAMPTZ
END;

SELECT 'Column types converted to TIMESTAMPTZ' AS status;

-- ============================================
-- STEP 4: Verify the migration
-- ============================================

-- Check column types
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'schedules'
    AND column_name IN ('scheduled_for', 'posted_at');

-- Show converted data
SELECT
    id,
    scheduled_for,
    scheduled_for AT TIME ZONE 'UTC' AS scheduled_for_utc,
    scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' AS scheduled_for_gmt7,
    status,
    created_at
FROM schedules
WHERE scheduled_for IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- STEP 5: Test the query that getPendingSchedules uses
-- ============================================

-- This should return schedules that are due now
SELECT
    id,
    scheduled_for,
    scheduled_for AT TIME ZONE 'UTC' AS scheduled_utc,
    scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' AS scheduled_gmt7,
    NOW() AT TIME ZONE 'UTC' AS current_utc,
    NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' AS current_gmt7,
    status
FROM schedules
WHERE status = 'pending'
    AND scheduled_for <= NOW()
ORDER BY scheduled_for ASC;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- Uncomment and run this if you need to rollback:

-- DROP TABLE IF EXISTS schedules;
-- CREATE TABLE schedules AS SELECT * FROM schedules_backup_20251015;
-- SELECT 'Rolled back to backup' AS status;

-- ============================================
-- NOTES
-- ============================================
-- After this migration:
-- 1. scheduled_for and posted_at are now TIMESTAMPTZ (timestamp with timezone)
-- 2. PostgreSQL will store all timestamps in UTC internally
-- 3. App should send ISO strings like "2025-10-14T16:25:00.000Z" (UTC)
-- 4. PostgreSQL will handle timezone conversions automatically
-- 5. Queries with <= NOW() will work correctly
-- 6. Display in GMT+7 by using: scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh'
