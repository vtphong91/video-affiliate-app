-- =====================================================
-- RPC Functions to Bypass Supabase JS SDK Bugs - V2
-- =====================================================
-- FORCE RECREATE with explicit DROP CASCADE
-- =====================================================

-- Force drop all existing functions with CASCADE
DROP FUNCTION IF EXISTS get_user_reviews(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_reviews_by_status(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_published_reviews() CASCADE;
DROP FUNCTION IF EXISTS get_user_reviews_count(UUID) CASCADE;

-- =====================================================
-- Function 1: Get All Reviews for a User
-- CRITICAL: SECURITY DEFINER bypasses RLS
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_reviews(p_user_id UUID)
RETURNS SETOF reviews
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM reviews
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_user_reviews(UUID) IS 'Get all reviews for a user, bypassing RLS and Supabase JS SDK bugs';

-- =====================================================
-- Function 2: Get Reviews by Status
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_reviews_by_status(
  p_user_id UUID,
  p_status TEXT
)
RETURNS SETOF reviews
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM reviews
  WHERE user_id = p_user_id
    AND status = p_status
  ORDER BY created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_user_reviews_by_status(UUID, TEXT) IS 'Get user reviews filtered by status, bypassing RLS';

-- =====================================================
-- Function 3: Get All Published Reviews
-- =====================================================
CREATE OR REPLACE FUNCTION get_published_reviews()
RETURNS SETOF reviews
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM reviews
  WHERE status = 'published'
  ORDER BY created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_published_reviews() IS 'Get all published reviews for public display, bypassing RLS';

-- =====================================================
-- Function 4: Get Review Count
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_reviews_count(p_user_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  review_count BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO review_count
  FROM reviews
  WHERE user_id = p_user_id;

  RETURN review_count;
END;
$$;

COMMENT ON FUNCTION get_user_reviews_count(UUID) IS 'Get total count of reviews for a user, bypassing RLS';

-- =====================================================
-- Grant Permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION get_user_reviews(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_user_reviews_by_status(UUID, TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_published_reviews() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_user_reviews_count(UUID) TO authenticated, anon, service_role;

-- =====================================================
-- IMMEDIATE VERIFICATION
-- =====================================================
-- Run this RIGHT AFTER creating functions to verify:
DO $$
DECLARE
  test_count BIGINT;
BEGIN
  -- Test the function immediately
  SELECT COUNT(*) INTO test_count
  FROM get_user_reviews('1788ee95-7d22-4b0b-8e45-07ae2d03c7e1');

  RAISE NOTICE 'RPC function test: % reviews returned', test_count;

  IF test_count < 74 THEN
    RAISE WARNING 'RPC function returning % reviews, expected 74! RLS may still be active.', test_count;
  ELSE
    RAISE NOTICE 'SUCCESS! RPC function returning correct count: %', test_count;
  END IF;
END $$;
