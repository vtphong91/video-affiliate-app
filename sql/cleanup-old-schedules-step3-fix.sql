-- ==========================================
-- STEP 3: FIX OLD SCHEDULES (SAFE UPDATE)
-- ==========================================
-- Run this ONLY after Step 1 and Step 2 completed successfully
-- This will mark old overdue schedules as failed

-- IMPORTANT: Review Step 1 results before running this!

-- Start transaction for safety
BEGIN;

-- Show what will be updated (DRY RUN)
SELECT
  'SCHEDULES TO BE UPDATED' as action,
  COUNT(*) as count
FROM schedules
WHERE status = 'pending'
  AND scheduled_for < NOW()
  AND created_at < '2025-10-15 00:00:00+00';

-- Update old overdue schedules to failed status
UPDATE schedules
SET
  status = 'failed',
  error_message = 'Cancelled - Created before timezone fix (2025-10-15). Please recreate schedule if needed.',
  updated_at = NOW()
WHERE status = 'pending'
  AND scheduled_for < NOW()
  AND created_at < '2025-10-15 00:00:00+00'
RETURNING
  id,
  video_title,
  scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' as scheduled_for_gmt7,
  error_message;

-- Verify the update
SELECT
  'UPDATE COMPLETED' as status,
  COUNT(*) as updated_count
FROM schedules
WHERE status = 'failed'
  AND error_message LIKE '%timezone fix%';

-- Show new status distribution
SELECT
  status,
  COUNT(*) as count
FROM schedules
GROUP BY status
ORDER BY status;

-- COMMIT or ROLLBACK?
-- If everything looks good, run: COMMIT;
-- If something wrong, run: ROLLBACK;

-- Uncomment ONE of the following:
-- COMMIT;  -- Apply changes
-- ROLLBACK;  -- Undo changes

-- ==========================================
-- MANUAL VERIFICATION REQUIRED:
-- 1. Review the RETURNING output
-- 2. Check if numbers match Step 1
-- 3. If looks good: Run COMMIT;
-- 4. If anything wrong: Run ROLLBACK;
-- ==========================================

-- After successful commit, verify:
SELECT
  'Final Verification' as check_name,
  COUNT(*) as pending_schedules,
  COUNT(*) FILTER (WHERE scheduled_for < NOW()) as overdue_count
FROM schedules
WHERE status = 'pending';

-- Expected: overdue_count should be 0 or very small (only new schedules)
