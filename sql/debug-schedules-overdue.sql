-- =====================================================
-- DEBUG SCHEDULES OVERDUE ISSUE
-- =====================================================
-- Kiểm tra dữ liệu thực tế trong database

-- 1. Xem tất cả schedules pending với thông tin timezone
SELECT
  id,
  video_title,
  scheduled_for,
  timezone,
  status,
  created_at,
  -- So sánh với current time
  scheduled_for < NOW() as is_past_due,
  -- Hiển thị scheduled_for trong GMT+7
  scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' as scheduled_for_gmt7,
  -- Current time trong GMT+7
  NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' as current_time_gmt7,
  -- Difference
  EXTRACT(EPOCH FROM (scheduled_for - NOW()))/60 as minutes_until_scheduled
FROM schedules
WHERE status = 'pending'
ORDER BY scheduled_for ASC
LIMIT 20;

-- 2. Thống kê schedules theo năm
SELECT
  EXTRACT(YEAR FROM scheduled_for) as year,
  COUNT(*) as count,
  MIN(scheduled_for) as earliest,
  MAX(scheduled_for) as latest
FROM schedules
WHERE status = 'pending'
GROUP BY EXTRACT(YEAR FROM scheduled_for)
ORDER BY year;

-- 3. Kiểm tra timezone column
SELECT DISTINCT timezone, COUNT(*)
FROM schedules
GROUP BY timezone;

-- 4. Kiểm tra schedules được tạo gần đây nhất
SELECT
  id,
  video_title,
  scheduled_for,
  created_at,
  scheduled_for < NOW() as is_past_due,
  scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' as scheduled_for_gmt7
FROM schedules
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
