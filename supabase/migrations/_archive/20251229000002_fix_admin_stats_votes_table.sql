-- ============================================
-- FIX BROKEN ADMIN ANALYTICS RPC FUNCTIONS
-- Migration: 20251229000002_fix_admin_stats_votes_table.sql
-- Purpose: Correct table name mapping from 'votes' to 'post_votes'
-- ============================================

-- 1. Fix get_admin_stats
CREATE OR REPLACE FUNCTION get_admin_stats(
  days_back INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  stats JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  -- Get caller's role directly from users table
  SELECT role INTO caller_role FROM users WHERE id = auth.uid();
  
  -- Security check
  IF caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  
  start_date := NOW() - (days_back || ' days')::INTERVAL;
  
  SELECT jsonb_build_object(
    'users', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM users),
      'new_period', (SELECT COUNT(*) FROM users WHERE created_at >= start_date),
      'researchers', (SELECT COUNT(*) FROM users WHERE role = 'researcher'),
      'moderators', (SELECT COUNT(*) FROM users WHERE role = 'moderator'),
      'admins', (SELECT COUNT(*) FROM users WHERE role = 'admin'),
      'suspended', (SELECT COUNT(*) FROM users WHERE suspended_at IS NOT NULL),
      'verified_authors', (SELECT COUNT(*) FROM users WHERE is_verified_author = TRUE)
    ),
    'posts', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM posts),
      'new_period', (SELECT COUNT(*) FROM posts WHERE created_at >= start_date),
      'articles', (SELECT COUNT(*) FROM posts WHERE content_type = 'article'),
      'questions', (SELECT COUNT(*) FROM posts WHERE content_type = 'question'),
      'discussions', (SELECT COUNT(*) FROM posts WHERE content_type = 'discussion'),
      'pending_approval', (SELECT COUNT(*) FROM posts WHERE approval_status = 'pending'),
      'approved', (SELECT COUNT(*) FROM posts WHERE approval_status = 'approved'),
      'rejected', (SELECT COUNT(*) FROM posts WHERE approval_status = 'rejected')
    ),
    'comments', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM comments),
      'new_period', (SELECT COUNT(*) FROM comments WHERE created_at >= start_date)
    ),
    'engagement', jsonb_build_object(
      'total_votes', (SELECT COUNT(*) FROM post_votes),
      'votes_period', (SELECT COUNT(*) FROM post_votes WHERE created_at >= start_date),
      'citations', (SELECT COUNT(*) FROM citations),
      'citations_period', (SELECT COUNT(*) FROM citations WHERE created_at >= start_date)
    ),
    'moderation', jsonb_build_object(
      'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
      'resolved_reports', (SELECT COUNT(*) FROM reports WHERE status = 'resolved'),
      -- Use COALESCE in case these tables aren't fully populated/active in current session
      'pending_appeals', COALESCE((SELECT COUNT(*) FROM moderation_appeals WHERE status = 'pending'), 0),
      'waitlist_pending', COALESCE((SELECT COUNT(*) FROM waitlist WHERE status = 'pending'), 0)
    ),
    'period_days', days_back,
    'generated_at', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- 2. Fix get_content_activity
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
    -- FIX: Use post_votes instead of votes
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

-- 3. Grants
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_activity TO authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
