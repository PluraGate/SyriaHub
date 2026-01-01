-- Apply missing admin functions to database
-- Run this script via Supabase SQL Editor to add the missing RPC functions

-- ============================================================================
-- 1. GET_UNVERIFIED_TAGS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unverified_tags()
RETURNS TABLE (
  tag text,
  usage_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH all_post_tags AS (
    SELECT unnest(tags) AS tag_name
    FROM posts
    WHERE tags IS NOT NULL
  ),
  tag_counts AS (
    SELECT tag_name, COUNT(*) AS count
    FROM all_post_tags
    GROUP BY tag_name
  )
  SELECT 
    tc.tag_name AS tag,
    tc.count AS usage_count
  FROM tag_counts tc
  LEFT JOIN tags t ON t.label = tc.tag_name
  WHERE t.id IS NULL
  ORDER BY tc.count DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_unverified_tags() TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- 2. ADMIN STATISTICS FUNCTION
-- ============================================================================

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
  SELECT role INTO caller_role FROM users WHERE id = auth.uid();
  
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
      'total_votes', (SELECT COUNT(*) FROM votes),
      'votes_period', (SELECT COUNT(*) FROM votes WHERE created_at >= start_date),
      'citations', (SELECT COUNT(*) FROM citations),
      'citations_period', (SELECT COUNT(*) FROM citations WHERE created_at >= start_date)
    ),
    'moderation', jsonb_build_object(
      'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
      'resolved_reports', (SELECT COUNT(*) FROM reports WHERE status = 'resolved'),
      'pending_appeals', COALESCE((SELECT COUNT(*) FROM moderation_appeals WHERE status = 'pending'), 0),
      'waitlist_pending', COALESCE((SELECT COUNT(*) FROM waitlist WHERE status = 'pending'), 0)
    ),
    'period_days', days_back,
    'generated_at', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;

-- ============================================================================
-- 3. DAILY USER GROWTH FOR CHARTS
-- ============================================================================

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
  daily_counts AS (
    SELECT 
      created_at::DATE AS d,
      COUNT(*) AS new_users
    FROM users
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  )
  SELECT 
    dates.d AS date,
    COALESCE(dc.new_users, 0) AS new_users,
    SUM(COALESCE(dc.new_users, 0)) OVER (ORDER BY dates.d) + 
      (SELECT COUNT(*) FROM users WHERE created_at < (CURRENT_DATE - (days_back || ' days')::INTERVAL))
    AS cumulative_users
  FROM dates
  LEFT JOIN daily_counts dc ON dates.d = dc.d
  ORDER BY dates.d;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_growth TO authenticated;

-- ============================================================================
-- 4. DAILY CONTENT ACTIVITY FOR CHARTS
-- ============================================================================

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
    FROM votes
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

-- ============================================================================
-- 5. POST REJECTION WORKFLOW
-- ============================================================================

-- Add rejection fields to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- ============================================================================
-- 6. FIX NOTIFICATION TYPE CONSTRAINT
-- ============================================================================

-- Drop and recreate the type check constraint to include 'moderation'
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('mention', 'reply', 'follow', 'fork', 'citation', 'like', 'system', 'moderation', 'badge', 'solution', 'remix', 'suggestion', 'comment'));

-- ============================================================================
-- 7. UPDATE MODERATION APPEALS POLICY
-- ============================================================================

-- Update moderation_appeals policy to allow appeals for rejected posts
DROP POLICY IF EXISTS "Users can create appeals for own posts" ON moderation_appeals;
CREATE POLICY "Users can create appeals for own posts" ON moderation_appeals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_id 
      AND posts.author_id = auth.uid()
      AND posts.approval_status IN ('flagged', 'rejected')
    )
  );

-- ============================================================================
-- 8. MODERATION APPEALS SETUP
-- ============================================================================

-- Create moderation_appeals table if not exists
CREATE TABLE IF NOT EXISTS moderation_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    dispute_reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


-- Update status constraint to include revision_requested
ALTER TABLE moderation_appeals DROP CONSTRAINT IF EXISTS moderation_appeals_status_check;
ALTER TABLE moderation_appeals ADD CONSTRAINT moderation_appeals_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested'));

-- Allow multiple appeals per post (for re-rejection scenarios)
ALTER TABLE moderation_appeals DROP CONSTRAINT IF EXISTS moderation_appeals_post_id_user_id_key;

-- Add columns that might be missing if table already existed
ALTER TABLE moderation_appeals ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE moderation_appeals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Enable RLS
ALTER TABLE moderation_appeals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own appeals
DROP POLICY IF EXISTS "Users can view own appeals" ON moderation_appeals;
CREATE POLICY "Users can view own appeals" ON moderation_appeals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can create appeals for their own rejected posts
DROP POLICY IF EXISTS "Users can create appeals for own posts" ON moderation_appeals;
CREATE POLICY "Users can create appeals for own posts" ON moderation_appeals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_id 
      AND posts.author_id = auth.uid()
      AND posts.approval_status IN ('flagged', 'rejected')
    )
  );

-- Policy: Admins/Moderators can view all appeals
DROP POLICY IF EXISTS "Moderators can view all appeals" ON moderation_appeals;
CREATE POLICY "Moderators can view all appeals" ON moderation_appeals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- Policy: Admins can update appeals
DROP POLICY IF EXISTS "Admins can update appeals" ON moderation_appeals;
CREATE POLICY "Admins can update appeals" ON moderation_appeals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================================================
-- 9. VIEW COUNT FUNCTION (for post analytics)
-- ============================================================================

-- Add view_count column to posts if missing
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Function to safely increment view count
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count TO anon;

-- ============================================================================
-- 10. NOTIFY POSTGREST TO RELOAD SCHEMA
-- ============================================================================

NOTIFY pgrst, 'reload schema';
