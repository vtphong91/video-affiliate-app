-- ==========================================
-- STEP 4: VERIFY FIX (POST-UPDATE CHECK)
-- ==========================================
-- Run this after Step 3 to verify everything is working correctly

SET timezone = 'UTC';

-- 1. Check remaining pending schedules
SELECT
  'Remaining Pending Schedules' as metric,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE scheduled_for < NOW()) as overdue_count,
  COUNT(*) FILTER (WHERE scheduled_for >= NOW()) as future_count
FROM schedules
WHERE status = 'pending';

-- Expected: overdue_count = 0 or very small

-- 2. Check failed schedules from cleanup
SELECT
  'Schedules Failed by Cleanup' as metric,
  COUNT(*) as count
FROM schedules
WHERE status = 'failed'
  AND error_message LIKE '%timezone fix%';

-- 3. Check recent pending schedules (created after fix)
SELECT
  id,
  video_title,
  scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' as scheduled_for_gmt7,
  created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as created_at_gmt7,
  CASE
    WHEN scheduled_for < NOW() THEN '🔴 OVERDUE'
    WHEN scheduled_for < NOW() + INTERVAL '1 hour' THEN '🟡 DUE SOON'
    ELSE '🟢 FUTURE'
  END as status_check
FROM schedules
WHERE status = 'pending'
  AND created_at >= '2025-10-15 00:00:00+00'
ORDER BY scheduled_for ASC
LIMIT 20;

-- Expected: No 🔴 OVERDUE schedules, or only very recent ones

-- 4. Timeline view of schedules
SELECT
  DATE(created_at) as creation_date,
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE scheduled_for < NOW()) as overdue_in_status
FROM schedules
WHERE created_at >= '2025-10-01'
GROUP BY DATE(created_at), status
ORDER BY creation_date DESC, status;

-- 5. Check if cron is working (recent posted schedules)
SELECT
  'Recent Posted Schedules (Last 24h)' as metric,
  COUNT(*) as count
FROM schedules
WHERE status = 'posted'
  AND posted_at >= NOW() - INTERVAL '24 hours';

-- Expected: Should have some if cron is running

-- 6. Check upcoming schedules
SELECT
  'Schedules in Next 24h' as metric,
  COUNT(*) as count
FROM schedules
WHERE status = 'pending'
  AND scheduled_for BETWEEN NOW() AND NOW() + INTERVAL '24 hours';

-- 7. Overall health check
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM schedules
      WHERE status = 'pending'
        AND scheduled_for < NOW()
        AND created_at >= '2025-10-15 00:00:00+00'
    ) THEN '🔴 WARNING: New schedules are overdue'
    WHEN EXISTS (
      SELECT 1 FROM schedules
      WHERE status = 'pending'
        AND created_at < '2025-10-15 00:00:00+00'
    ) THEN '🟡 WARNING: Old pending schedules still exist'
    ELSE '🟢 HEALTHY: No overdue schedules'
  END as health_status;

-- ==========================================
-- EXPECTED RESULTS:
-- ✅ No overdue schedules created after 2025-10-15
-- ✅ Old schedules marked as failed with clear error message
-- ✅ Backup table contains all affected schedules
-- ✅ Cron appears to be working (recent posted schedules)
-- ✅ Health status = 🟢 HEALTHY
-- ==========================================
