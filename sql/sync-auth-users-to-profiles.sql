-- =====================================================
-- SYNC AUTH USERS TO USER PROFILES
-- =====================================================
-- Script này đồng bộ users từ auth.users sang user_profiles
-- Chạy script này trong Supabase SQL Editor

-- Bước 1: Kiểm tra users hiện tại trong auth.users
SELECT
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at;

-- Bước 2: Kiểm tra user_profiles hiện có
SELECT * FROM user_profiles ORDER BY created_at;

-- Bước 3: Insert users từ auth.users vào user_profiles (chỉ những users chưa có profile)
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  permissions,
  is_active,
  status,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  -- Set role dựa vào email hoặc default
  CASE
    WHEN au.email LIKE '%admin%' THEN 'admin'
    WHEN au.email = 'iammmodotcom@gmail.com' THEN 'admin' -- Email của bạn
    ELSE 'viewer'
  END as role,
  '{}' as permissions, -- Empty array
  true as is_active,
  'approved' as status,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
  -- Chỉ insert users chưa có trong user_profiles
  SELECT 1 FROM user_profiles up WHERE up.id = au.id
);

-- Bước 4: Verify kết quả
SELECT
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.is_active,
  up.status,
  up.created_at
FROM user_profiles up
ORDER BY up.created_at;

-- Bước 5: Đếm số lượng
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM user_profiles) as total_user_profiles,
  (SELECT COUNT(*) FROM user_profiles WHERE is_active = true) as active_profiles;
