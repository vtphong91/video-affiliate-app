-- ============================================
-- SQL Queries để kiểm tra reviews trên Supabase
-- Copy từng query vào Supabase SQL Editor và chạy
-- ============================================

-- QUERY 1: Kiểm tra user_id hiện tại trong user_profiles
-- Mục đích: Verify email và user_id đúng
SELECT
  id as user_id,
  email,
  role,
  created_at,
  updated_at
FROM user_profiles
WHERE email = 'lammmodotcom@gmail.com';

-- Expected result:
-- user_id phải bắt đầu bằng 'f788ee95-...'
-- role = 'admin'

-- ============================================

-- QUERY 2: Count TỔNG SỐ reviews của user
-- Mục đích: Xem thực tế có bao nhiêu reviews trong DB
SELECT COUNT(*) as total_reviews
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

-- Expected result:
-- Nếu đã tạo review mới thì total_reviews phải > 62

-- ============================================

-- QUERY 3: List 10 reviews MỚI NHẤT của user
-- Mục đích: Xem review mới có trong database không
SELECT
  id,
  video_title,
  status,
  created_at,
  user_id,
  video_url
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
ORDER BY created_at DESC
LIMIT 10;

-- Expected result:
-- Review đầu tiên phải là review VỪA TẠO
-- created_at phải là thời gian gần đây nhất
-- status phải là 'published' (nếu đã publish)

-- ============================================

-- QUERY 4: Tìm review "Máy xay thịt Philips HR1503/00"
-- Mục đích: Check review cụ thể có tồn tại không
SELECT
  id,
  video_title,
  status,
  created_at,
  user_id,
  slug
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
  AND video_title LIKE '%Máy xay thịt Philips HR1503%'
ORDER BY created_at DESC;

-- Expected result:
-- Phải có ÍT NHẤT 1 row
-- Nếu không có row → Review CHƯA được lưu vào DB

-- ============================================

-- QUERY 5: Count reviews theo status
-- Mục đích: Xem có bao nhiêu draft vs published
SELECT
  status,
  COUNT(*) as count
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
GROUP BY status
ORDER BY status;

-- Expected result:
-- draft: X reviews
-- published: Y reviews
-- Total = X + Y

-- ============================================

-- QUERY 6: Check có reviews nào BỊ DUPLICATE không
-- Mục đích: Xem có reviews trùng lặp do bug tạo nhiều lần
SELECT
  video_title,
  COUNT(*) as duplicate_count,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
GROUP BY video_title
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Expected result:
-- Nếu có rows → Có reviews bị duplicate
-- Nếu empty → Không có duplicate (tốt)

-- ============================================

-- QUERY 7: Check reviews của CẢ HAI user IDs
-- Mục đích: Xem có confusion giữa 2 user IDs không
SELECT
  user_id,
  COUNT(*) as review_count
FROM reviews
WHERE user_id IN (
  'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1',  -- User ID đúng (starts with f)
  '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1'   -- User ID sai (starts with 1)
)
GROUP BY user_id
ORDER BY user_id;

-- Expected result:
-- Chỉ có 1 row với user_id bắt đầu bằng 'f'
-- Nếu có 2 rows → Có 2 users khác nhau (BUG!)

-- ============================================

-- QUERY 8: Check AUTHENTICATION users table
-- Mục đích: Xem có 2 auth users với email giống nhau không
SELECT
  id as auth_user_id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'lammmodotcom@gmail.com'
ORDER BY created_at DESC;

-- Expected result:
-- Chỉ có 1 row
-- auth_user_id phải = 'f788ee95-...'
-- Nếu có > 1 row → Có duplicate accounts (BUG NGHIÊM TRỌNG!)

-- ============================================

-- QUERY 9: List reviews MỚI NHẤT của TẤT CẢ USERS (để so sánh)
-- Mục đích: Xem có user nào khác có review "Máy xay thịt Philips" không
SELECT
  r.id,
  r.video_title,
  r.user_id,
  r.created_at,
  up.email
FROM reviews r
LEFT JOIN user_profiles up ON r.user_id = up.id
WHERE r.video_title LIKE '%Máy xay thịt Philips HR1503%'
ORDER BY r.created_at DESC;

-- Expected result:
-- Nếu có nhiều rows với user_id KHÁC NHAU → Reviews bị tạo cho nhiều users
-- Check xem email nào là của bạn

-- ============================================

-- QUERY 10: Check review CREATION timestamp
-- Mục đích: Xem review được tạo LÚC NÀO
SELECT
  id,
  video_title,
  status,
  created_at,
  updated_at,
  user_id,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
ORDER BY created_at DESC
LIMIT 5;

-- Expected result:
-- Review mới nhất có minutes_ago nhỏ (vài phút)
-- Nếu minutes_ago LỚN (> 60) → Review KHÔNG phải vừa tạo

-- ============================================

-- QUERY 11: DIAGNOSTIC - Simulate API query
-- Mục đích: Xem chính xác data mà API trả về
SELECT
  id,
  slug,
  video_title,
  status,
  created_at
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
ORDER BY created_at DESC
LIMIT 6
OFFSET 0;

-- Expected result:
-- Đây là data mà API /api/reviews?page=1&limit=6 trả về
-- Nếu review mới KHÔNG có trong 6 rows này → Không hiển thị ở page 1

-- ============================================

-- QUERY 12: Check schedules của review mới
-- Mục đích: Xem review mới có trong schedules không
SELECT
  s.id as schedule_id,
  s.review_id,
  r.video_title,
  s.status as schedule_status,
  r.status as review_status,
  s.created_at
FROM schedules s
JOIN reviews r ON s.review_id = r.id
WHERE r.video_title LIKE '%Máy xay thịt Philips HR1503%'
  AND s.user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
ORDER BY s.created_at DESC;

-- Expected result:
-- Nếu có rows → Review đã được lên lịch
-- Nếu empty → Review chưa có schedule (OK)

-- ============================================
-- QUERY 13: Update user_id nếu bị SAI (CHẠY SAU CÙNG)
-- CHỈ CHẠY NẾU XÁC NHẬN có bug user_id sai
-- ============================================

-- KHÔNG CHẠY query này trước khi có kết quả từ QUERY 1-12!

/*
-- Nếu phát hiện review bị tạo với user_id SAI ('1788ee95...')
-- Uncomment và chạy query này để FIX:

UPDATE reviews
SET user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
WHERE user_id = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
  AND video_title LIKE '%Máy xay thịt Philips HR1503%';

-- Sau khi chạy, verify lại bằng QUERY 4
*/

-- ============================================
