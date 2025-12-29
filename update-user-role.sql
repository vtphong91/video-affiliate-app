-- CRITICAL: Check status của review mới
SELECT
  id,
  video_title,
  status,
  created_at,
  user_id
FROM reviews
WHERE id = 'cd68cc46-92e5-4617-9c42-37c7c4ff2799';

-- Expected: 
-- status phải là 'published' 
-- Nếu status = 'draft' → Đây là nguyên nhân!
