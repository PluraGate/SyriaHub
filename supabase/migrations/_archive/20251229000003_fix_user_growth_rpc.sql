-- ============================================
-- FIX USER GROWTH RPC AND OTHER ANALYTICS
-- Migration: 20251229000003_fix_user_growth_rpc.sql
-- ============================================

-- 1. Fix get_user_growth to be more robust
CREATE OR REPLACE FUNCTION get_user_growth(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(date DATE, new_users BIGINT, cumulative_users BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  start_count BIGINT;
BEGIN
  -- Get caller's role
  SELECT role INTO caller_role FROM users WHERE id = auth.uid();
  
  IF caller_role NOT IN ('admin', 'moderator') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Starting count of users before the period
  SELECT COUNT(*) INTO start_count 
  FROM users 
  WHERE created_at < (CURRENT_DATE - (days_back || ' days')::INTERVAL);
  
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(
      (CURRENT_DATE - (days_back || ' days')::INTERVAL)::DATE,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE AS d
  ),
  daily_counts AS (
    SELECT 
      created_at::DATE AS d,
      COUNT(*) AS count
    FROM users
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  )
  SELECT 
    dates.d AS date,
    COALESCE(dc.count, 0) AS new_users,
    (start_count + SUM(COALESCE(dc.count, 0)) OVER (ORDER BY dates.d)) AS cumulative_users
  FROM dates
  LEFT JOIN daily_counts dc ON dates.d = dc.d
  ORDER BY dates.d;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_growth TO authenticated;

-- 2. Ensure get_content_activity is fully correct (redundant check)
CREATE OR REPLACE FUNCTION get_content_activity(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(date DATE, posts BIGINT, comments BIGINT, votes BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM users WHERE id = auth.uid();
  
  IF caller_role NOT IN ('admin', 'moderator') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(
      (CURRENT_DATE - (days_back || ' days')::INTERVAL)::DATE,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE AS d
  ),
  daily_posts AS (
    SELECT created_at::DATE AS d, COUNT(*) AS count
    FROM posts
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  ),
  daily_comments AS (
    SELECT created_at::DATE AS d, COUNT(*) AS count
    FROM comments
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  ),
  daily_votes AS (
    SELECT created_at::DATE AS d, COUNT(*) AS count
    FROM post_votes
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  )
  SELECT 
    dates.d AS date,
    COALESCE(p.count, 0) AS posts,
    COALESCE(c.count, 0) AS comments,
    COALESCE(v.count, 0) AS votes
  FROM dates
  LEFT JOIN daily_posts p ON dates.d = p.d
  LEFT JOIN daily_comments c ON dates.d = c.d
  LEFT JOIN daily_votes v ON dates.d = v.d
  ORDER BY dates.d;
END;
$$;

GRANT EXECUTE ON FUNCTION get_content_activity TO authenticated;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
