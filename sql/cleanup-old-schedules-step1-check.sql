-- ==========================================
-- STEP 1: CHECK OLD SCHEDULES (READ-ONLY)
-- ==========================================
-- Run this first to see what will be affected
-- NO DATA MODIFICATION - SAFE TO RUN

-- Get timezone fix date (adjust if needed)
-- Based on git commits: timezone fix was around 2025-10-15
SET timezone = 'UTC';

-- 1. Count total pending schedules
SELECT
  'Total Pending Schedules' as metric,
  COUNT(*) as count
FROM schedules
WHERE status = 'pending';

-- 2. Count overdue schedules (scheduled_for < now)
SELECT
  'Overdue Schedules' as metric,
  COUNT(*) as count
FROM schedules
WHERE status = 'pending'
  AND scheduled_for < NOW();

-- 3. Count old schedules (created before timezone fix)
SELECT
  'Old Schedules (before 2025-10-15)' as metric,
  COUNT(*) as count
FROM schedules
WHERE status = 'pending'
  AND created_at < '2025-10-15 00:00:00+00';

-- 4. Count schedules that will be affected (old AND overdue)
SELECT
  'Schedules to Clean Up' as metric,
  COUNT(*) as count
FROM schedules
WHERE status = 'pending'
  AND scheduled_for < NOW()
  AND created_at < '2025-10-15 00:00:00+00';

-- 5. Show details of schedules that will be affected
SELECT
  id,
  video_title,
  scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' as scheduled_for_gmt7,
  created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as created_at_gmt7,
  EXTRACT(EPOCH FROM (NOW() - scheduled_for))/3600 as hours_overdue,
  retry_count,
  user_id
FROM schedules
WHERE status = 'pending'
  AND scheduled_for < NOW()
  AND created_at < '2025-10-15 00:00:00+00'
ORDER BY scheduled_for ASC
LIMIT 50;

-- 6. Show schedule status distribution
SELECT
  status,
  COUNT(*) as count,
  MIN(scheduled_for) as earliest_scheduled,
  MAX(scheduled_for) as latest_scheduled
FROM schedules
GROUP BY status
ORDER BY status;

-- 7. Show schedules by creation date
SELECT
  DATE(created_at) as creation_date,
  status,
  COUNT(*) as count
FROM schedules
WHERE created_at >= '2025-10-01'
GROUP BY DATE(created_at), status
ORDER BY creation_date DESC, status;

-- ==========================================
-- EXPECTED RESULTS:
-- - You should see how many schedules will be affected
-- - Review the list carefully before proceeding to Step 2
-- - If numbers look wrong, DO NOT proceed to Step 2
-- ==========================================
