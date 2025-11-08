-- Verification Script: Kiểm tra migration schedules
-- Chạy script này SAU KHI chạy migration add-review-fields-to-schedules.sql

-- ====================================
-- STEP 1: Kiểm tra cấu trúc bảng
-- ====================================

SELECT
  '🔍 STEP 1: Checking table structure' AS status;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'schedules'
  AND column_name IN (
    'video_title',
    'video_url',
    'video_thumbnail',
    'channel_name',
    'review_summary',
    'review_pros',
    'review_cons',
    'review_key_points',
    'review_target_audience',
    'review_cta',
    'review_seo_keywords',
    'affiliate_links'
  )
ORDER BY column_name;

-- ====================================
-- STEP 2: Đếm số cột mới
-- ====================================

SELECT
  '🔍 STEP 2: Counting new columns' AS status;

SELECT
  COUNT(*) as total_review_columns,
  CASE
    WHEN COUNT(*) >= 11 THEN '✅ All review columns exist'
    ELSE '❌ Missing columns: expected 11, found ' || COUNT(*)
  END as validation_status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'schedules'
  AND column_name IN (
    'video_title',
    'video_url',
    'video_thumbnail',
    'channel_name',
    'review_summary',
    'review_pros',
    'review_cons',
    'review_key_points',
    'review_target_audience',
    'review_cta',
    'review_seo_keywords'
  );

-- ====================================
-- STEP 3: Kiểm tra index
-- ====================================

SELECT
  '🔍 STEP 3: Checking indexes' AS status;

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'schedules'
  AND indexname = 'idx_schedules_video_title';

-- ====================================
-- STEP 4: Kiểm tra dữ liệu mẫu
-- ====================================

SELECT
  '🔍 STEP 4: Checking sample data' AS status;

SELECT
  id,
  video_title,
  video_url IS NOT NULL as has_video_url,
  video_thumbnail IS NOT NULL as has_thumbnail,
  channel_name,
  review_summary IS NOT NULL as has_summary,
  jsonb_array_length(COALESCE(review_pros, '[]'::jsonb)) as pros_count,
  jsonb_array_length(COALESCE(review_cons, '[]'::jsonb)) as cons_count,
  jsonb_array_length(COALESCE(review_target_audience, '[]'::jsonb)) as audience_count,
  created_at
FROM schedules
ORDER BY created_at DESC
LIMIT 5;

-- ====================================
-- STEP 5: Tổng kết
-- ====================================

SELECT
  '📊 SUMMARY' AS status;

SELECT
  COUNT(*) as total_schedules,
  COUNT(video_title) as schedules_with_video_title,
  COUNT(video_thumbnail) as schedules_with_thumbnail,
  COUNT(channel_name) as schedules_with_channel,
  COUNT(review_summary) as schedules_with_summary,
  ROUND(
    (COUNT(video_title)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as percentage_with_data
FROM schedules;

-- ====================================
-- STEP 6: Recommendations
-- ====================================

SELECT
  '💡 RECOMMENDATIONS' AS status;

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN
      '✅ Migration successful! Create a new schedule to test.'
    WHEN COUNT(video_title) = 0 THEN
      '⚠️ Migration successful but no schedules have video_title. Old schedules need to be recreated.'
    WHEN COUNT(video_title) < COUNT(*) THEN
      '⚠️ Some schedules missing data. Only new schedules (created after migration) will have full data.'
    ELSE
      '✅ All schedules have review data!'
  END as recommendation
FROM schedules;

-- ====================================
-- FINAL CHECK
-- ====================================

SELECT
  '✅ Migration verification complete!' AS status,
  NOW() as verified_at;
