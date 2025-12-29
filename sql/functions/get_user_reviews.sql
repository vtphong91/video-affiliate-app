-- Create a PostgreSQL function to fetch all reviews for a user
-- This bypasses Supabase JS SDK bugs with select('*') and order()

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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_reviews(UUID) TO authenticated, anon, service_role;
