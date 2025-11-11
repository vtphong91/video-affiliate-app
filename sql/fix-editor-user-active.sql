-- Check current user profiles status
-- Run this first to see what's wrong

SELECT
  id,
  email,
  role,
  status,
  is_active,
  created_at
FROM user_profiles
WHERE role = 'editor'
ORDER BY created_at DESC;

-- If you find users with is_active = false or status != 'active', run:

-- Fix 1: Update is_active to true for all editor users
UPDATE user_profiles
SET is_active = true
WHERE role = 'editor' AND is_active = false;

-- Fix 2: Update status to 'active' for all editor users
UPDATE user_profiles
SET status = 'active'
WHERE role = 'editor' AND status != 'active';

-- Verify the fix
SELECT
  id,
  email,
  role,
  status,
  is_active,
  created_at
FROM user_profiles
WHERE role = 'editor'
ORDER BY created_at DESC;
