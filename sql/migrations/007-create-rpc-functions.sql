-- =====================================================
-- RPC Functions to Bypass Supabase JS SDK Bugs
-- =====================================================
-- This migration creates PostgreSQL functions to reliably query reviews
-- without the bugs found in Supabase JS SDK's select('*') implementation
--
-- Bugs Fixed:
-- 1. select('*') + order() randomly skips rows (returns 70 instead of 73)
-- 2. select('*') without order() still misses rows (returns 72 instead of 73)
-- 3. Selective field queries skip rows with omitted fields
--
-- Solution: Direct PostgreSQL functions bypass the SDK entirely
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_reviews(UUID);
DROP FUNCTION IF EXISTS get_user_reviews_by_status(UUID, TEXT);
DROP FUNCTION IF EXISTS get_published_reviews();
DROP FUNCTION IF EXISTS get_user_reviews_count(UUID);

-- =====================================================
-- Function 1: Get All Reviews for a User
-- =====================================================
-- Returns all reviews for a specific user, ordered by creation date (newest first)
-- This is the main function used by the reviews list page
--
CREATE OR REPLACE FUNCTION get_user_reviews(p_user_id UUID)
RETURNS SETOF reviews
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM reviews
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION get_user_reviews(UUID) IS 'Get all reviews for a user, bypassing Supabase JS SDK bugs';

-- =====================================================
-- Function 2: Get Reviews by Status
-- =====================================================
-- Returns reviews filtered by status (draft, published, scheduled, etc.)
--
CREATE OR REPLACE FUNCTION get_user_reviews_by_status(
  p_user_id UUID,
  p_status TEXT
)
RETURNS SETOF reviews
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM reviews
  WHERE user_id = p_user_id
    AND status = p_status
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION get_user_reviews_by_status(UUID, TEXT) IS 'Get user reviews filtered by status';

-- =====================================================
-- Function 3: Get All Published Reviews
-- =====================================================
-- Returns all published reviews (for public display)
--
CREATE OR REPLACE FUNCTION get_published_reviews()
RETURNS SETOF reviews
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM reviews
  WHERE status = 'published'
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION get_published_reviews() IS 'Get all published reviews for public display';

-- =====================================================
-- Function 4: Get Review Count
-- =====================================================
-- Returns count of reviews for a user (for pagination)
--
CREATE OR REPLACE FUNCTION get_user_reviews_count(p_user_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::BIGINT
  FROM reviews
  WHERE user_id = p_user_id;
$$;

COMMENT ON FUNCTION get_user_reviews_count(UUID) IS 'Get total count of reviews for a user';

-- =====================================================
-- Grant Permissions
-- =====================================================
-- Allow authenticated users, anonymous users, and service role to execute these functions
--
GRANT EXECUTE ON FUNCTION get_user_reviews(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_user_reviews_by_status(UUID, TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_published_reviews() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_user_reviews_count(UUID) TO authenticated, anon, service_role;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the functions work correctly:
--
-- SELECT COUNT(*) FROM get_user_reviews('1788ee95-7d22-4b0b-8e45-07ae2d03c7e1');
-- Should return: 73 (the actual database count)
--
-- Compare with buggy SDK query which returns: 70-72
-- =====================================================
