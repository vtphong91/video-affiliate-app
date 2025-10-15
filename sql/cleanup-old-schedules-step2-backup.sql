-- ==========================================
-- STEP 2: BACKUP OLD SCHEDULES (SAFETY)
-- ==========================================
-- Run this to create backup before any modifications
-- Creates a backup table with schedules that will be affected

-- Create backup table if not exists
CREATE TABLE IF NOT EXISTS schedules_backup_20251015 (
  LIKE schedules INCLUDING ALL
);

-- Add metadata columns to track backup
ALTER TABLE schedules_backup_20251015
  ADD COLUMN IF NOT EXISTS backup_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS backup_reason TEXT;

-- Insert schedules that will be affected into backup
INSERT INTO schedules_backup_20251015
SELECT
  s.*,
  NOW() as backup_timestamp,
  'Old schedule cleanup - created before timezone fix' as backup_reason
FROM schedules s
WHERE status = 'pending'
  AND scheduled_for < NOW()
  AND created_at < '2025-10-15 00:00:00+00'
ON CONFLICT (id) DO NOTHING;

-- Verify backup
SELECT
  'Backup Created' as status,
  COUNT(*) as backed_up_count,
  MIN(scheduled_for) as earliest,
  MAX(scheduled_for) as latest
FROM schedules_backup_20251015;

-- Show backup details
SELECT
  id,
  video_title,
  scheduled_for,
  backup_timestamp,
  backup_reason
FROM schedules_backup_20251015
ORDER BY scheduled_for
LIMIT 10;

-- ==========================================
-- EXPECTED RESULTS:
-- - Backup table created successfully
-- - Number of backed up schedules matches Step 1
-- - You can restore from this backup if needed
-- ==========================================

-- TO RESTORE FROM BACKUP (if needed):
-- UPDATE schedules s
-- SET
--   status = b.status,
--   scheduled_for = b.scheduled_for,
--   error_message = NULL
-- FROM schedules_backup_20251015 b
-- WHERE s.id = b.id;
