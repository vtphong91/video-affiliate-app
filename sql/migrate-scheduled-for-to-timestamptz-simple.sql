-- Migration: Convert scheduled_for column to TIMESTAMPTZ for proper UTC storage
-- SIMPLIFIED VERSION - No regex required
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
    AND column_name IN ('scheduled_for', 'posted_at', 'next_retry_at');

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
-- STEP 3: Convert columns to TIMESTAMPTZ
-- ============================================

-- Convert scheduled_for to TIMESTAMPTZ
-- PostgreSQL is smart enough to parse most timestamp formats
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TIMESTAMPTZ
USING scheduled_for::TIMESTAMPTZ;

-- Convert posted_at to TIMESTAMPTZ
ALTER TABLE schedules
ALTER COLUMN posted_at TYPE TIMESTAMPTZ
USING posted_at::TIMESTAMPTZ;

-- Convert next_retry_at to TIMESTAMPTZ
ALTER TABLE schedules
ALTER COLUMN next_retry_at TYPE TIMESTAMPTZ
USING next_retry_at::TIMESTAMPTZ;

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
    AND column_name IN ('scheduled_for', 'posted_at', 'next_retry_at');

-- Show converted data with timezone display
SELECT
    id,
    scheduled_for,
    scheduled_for AT TIME ZONE 'UTC' AS scheduled_for_utc,
    scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' AS scheduled_for_gmt7,
    posted_at,
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
    (scheduled_for <= NOW()) AS is_due,
    status
FROM schedules
WHERE status = 'pending'
ORDER BY scheduled_for ASC
LIMIT 10;

-- Show only due schedules
SELECT
    id,
    scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' AS scheduled_gmt7,
    status
FROM schedules
WHERE status = 'pending'
    AND scheduled_for <= NOW()
ORDER BY scheduled_for ASC;

-- ============================================
-- STEP 6: Test INSERT with new UTC format
-- ============================================

-- Test inserting a schedule with UTC timestamp
-- This simulates what the app will do after the fix
DO $$
DECLARE
    test_schedule_id UUID;
BEGIN
    -- Insert test schedule (5 minutes from now in UTC)
    INSERT INTO schedules (
        id,
        user_id,
        review_id,
        scheduled_for,
        timezone,
        target_type,
        target_id,
        post_message,
        landing_page_url,
        status,
        retry_count,
        max_retries,
        created_at,
        updated_at
    )
    VALUES (
        gen_random_uuid(),
        (SELECT id FROM auth.users LIMIT 1), -- Use first user
        (SELECT id FROM reviews LIMIT 1), -- Use first review
        (NOW() + INTERVAL '5 minutes')::TIMESTAMPTZ, -- 5 minutes from now
        'Asia/Ho_Chi_Minh',
        'page',
        'test_page_id',
        'Test message from migration',
        'https://example.com',
        'pending',
        0,
        3,
        NOW(),
        NOW()
    )
    RETURNING id INTO test_schedule_id;

    RAISE NOTICE 'Test schedule created with ID: %', test_schedule_id;

    -- Show the test schedule
    RAISE NOTICE 'Scheduled for (UTC): %', (
        SELECT scheduled_for FROM schedules WHERE id = test_schedule_id
    );
    RAISE NOTICE 'Scheduled for (GMT+7): %', (
        SELECT scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh'
        FROM schedules WHERE id = test_schedule_id
    );

    -- Clean up test schedule
    DELETE FROM schedules WHERE id = test_schedule_id;
    RAISE NOTICE 'Test schedule cleaned up';
END $$;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- Uncomment and run this if you need to rollback:

/*
BEGIN;

DROP TABLE IF EXISTS schedules;
CREATE TABLE schedules AS SELECT * FROM schedules_backup_20251015;

SELECT 'Rolled back to backup' AS status;

COMMIT;
*/

-- ============================================
-- NOTES
-- ============================================
-- After this migration:
-- 1. scheduled_for, posted_at, next_retry_at are now TIMESTAMPTZ
-- 2. PostgreSQL stores all timestamps in UTC internally
-- 3. App should send ISO strings like "2025-10-14T16:25:00.000Z" (UTC)
-- 4. PostgreSQL handles timezone conversions automatically
-- 5. Queries with <= NOW() work correctly
-- 6. Display in GMT+7: column_name AT TIME ZONE 'Asia/Ho_Chi_Minh'
-- 7. No regex matching needed - PostgreSQL parses timestamp formats automatically
