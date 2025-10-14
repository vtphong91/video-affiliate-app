-- Fix scheduled_for column type from TEXT to TIMESTAMP
-- Run this in Supabase SQL Editor

-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS schedules_backup_20251014 AS
SELECT * FROM schedules;

-- Step 2: Check current data
SELECT id, scheduled_for, status
FROM schedules
WHERE status = 'pending'
LIMIT 10;

-- Step 3: Convert column type to TIMESTAMP (without timezone)
-- This will fail if there's invalid data, so we need to clean first

-- Option A: If you want to keep existing schedules
-- Clean and convert data first
UPDATE schedules
SET scheduled_for = (scheduled_for::timestamptz AT TIME ZONE 'UTC')::text
WHERE scheduled_for IS NOT NULL;

-- Then change column type
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TIMESTAMP USING scheduled_for::timestamptz::timestamp;

-- Option B: If you want to start fresh (RECOMMENDED)
-- Delete all existing schedules and start with clean UTC data
DELETE FROM schedules WHERE status IN ('pending', 'posted', 'failed');

-- Then change column type
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TIMESTAMP USING
  CASE
    WHEN scheduled_for IS NULL THEN NULL
    ELSE scheduled_for::timestamp
  END;

-- Step 4: Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'schedules' AND column_name = 'scheduled_for';

-- Step 5: Test query
SELECT id, scheduled_for, status
FROM schedules
WHERE status = 'pending'
  AND scheduled_for <= NOW()
ORDER BY scheduled_for ASC;

-- Notes:
-- - Option B is RECOMMENDED because existing data has wrong timezone format
-- - After changing column type, app will automatically store UTC
-- - UI will still display GMT+7 (converted from UTC)
