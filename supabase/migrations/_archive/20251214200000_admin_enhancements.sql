-- Admin Panel Enhancements Migration
-- Adds role change audit trail, secure promotion function, and admin stats

-- ============================================================================
-- 1. ROLE CHANGE AUDIT TABLE
-- ============================================================================
-- Tracks all role promotions/demotions for accountability and compliance

CREATE TABLE IF NOT EXISTS role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_role_change_audit_user ON role_change_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_audit_changed_by ON role_change_audit(changed_by);
CREATE INDEX IF NOT EXISTS idx_role_change_audit_created ON role_change_audit(created_at DESC);

-- Enable RLS
ALTER TABLE role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DROP POLICY IF EXISTS "Admins can view role audit logs" ON role_change_audit;
CREATE POLICY "Admins can view role audit logs" ON role_change_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- System/functions can insert (via SECURITY DEFINER functions)
DROP POLICY IF EXISTS "System can insert audit logs" ON role_change_audit;
CREATE POLICY "System can insert audit logs" ON role_change_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 2. USER SUSPENSION FIELDS
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- ============================================================================
-- 3. SECURE ROLE PROMOTION FUNCTION
-- ============================================================================
-- Only admins can promote/demote users, with full audit trail

CREATE OR REPLACE FUNCTION promote_user_role(
  target_user_id UUID,
  new_role TEXT,
  change_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_role TEXT;
  target_user RECORD;
  audit_id UUID;
BEGIN
  -- Get the calling user's info
  caller_id := auth.uid();
  
  IF caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get caller's role
  SELECT role INTO caller_role FROM users WHERE id = caller_id;
  
  IF caller_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Caller not found');
  END IF;
  
  -- Only admins can change roles
  IF caller_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can change user roles');
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('researcher', 'moderator', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role. Must be researcher, moderator, or admin');
  END IF;
  
  -- Get target user's current info
  SELECT id, role, email, name INTO target_user 
  FROM users 
  WHERE id = target_user_id;
  
  IF target_user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target user not found');
  END IF;
  
  -- Don't allow changing own role (safety measure)
  IF target_user_id = caller_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot change your own role');
  END IF;
  
  -- Check if role is actually changing
  IF target_user.role = new_role THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already has this role');
  END IF;
  
  -- Create audit log entry
  INSERT INTO role_change_audit (user_id, changed_by, old_role, new_role, reason)
  VALUES (target_user_id, caller_id, target_user.role, new_role, change_reason)
  RETURNING id INTO audit_id;
  
  -- Update the user's role
  UPDATE users 
  SET role = new_role
  WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'audit_id', audit_id,
    'user_id', target_user_id,
    'old_role', target_user.role,
    'new_role', new_role
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION promote_user_role TO authenticated;

-- ============================================================================
-- 4. USER SUSPENSION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION suspend_user(
  target_user_id UUID,
  suspend BOOLEAN,
  reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_role TEXT;
  target_user RECORD;
BEGIN
  caller_id := auth.uid();
  
  IF caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO caller_role FROM users WHERE id = caller_id;
  
  -- Only admins can suspend users
  IF caller_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can suspend users');
  END IF;
  
  -- Get target user
  SELECT id, role INTO target_user FROM users WHERE id = target_user_id;
  
  IF target_user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Cannot suspend other admins
  IF target_user.role = 'admin' AND suspend THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot suspend admin users');
  END IF;
  
  -- Cannot suspend yourself
  IF target_user_id = caller_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot suspend yourself');
  END IF;
  
  IF suspend THEN
    UPDATE users SET
      suspended_at = NOW(),
      suspended_by = caller_id,
      suspension_reason = reason
    WHERE id = target_user_id;
  ELSE
    UPDATE users SET
      suspended_at = NULL,
      suspended_by = NULL,
      suspension_reason = NULL
    WHERE id = target_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'suspended', suspend
  );
END;
$$;

GRANT EXECUTE ON FUNCTION suspend_user TO authenticated;

-- ============================================================================
-- 5. ADMIN STATISTICS FUNCTION
-- ============================================================================
-- Returns aggregated platform statistics for analytics dashboard

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
      'pending_appeals', (SELECT COUNT(*) FROM moderation_appeals WHERE status = 'pending'),
      'waitlist_pending', (SELECT COUNT(*) FROM waitlist WHERE status = 'pending')
    ),
    'period_days', days_back,
    'generated_at', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;

-- ============================================================================
-- 6. DAILY USER GROWTH FOR CHARTS
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
    )::DATE AS date
  ),
  daily_counts AS (
    SELECT 
      created_at::DATE AS date,
      COUNT(*) AS new_users
    FROM users
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  )
  SELECT 
    d.date,
    COALESCE(dc.new_users, 0) AS new_users,
    SUM(COALESCE(dc.new_users, 0)) OVER (ORDER BY d.date) + 
      (SELECT COUNT(*) FROM users WHERE created_at < (CURRENT_DATE - (days_back || ' days')::INTERVAL))
    AS cumulative_users
  FROM dates d
  LEFT JOIN daily_counts dc ON d.date = dc.date
  ORDER BY d.date;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_growth TO authenticated;

-- ============================================================================
-- 7. DAILY CONTENT ACTIVITY FOR CHARTS
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
    )::DATE AS date
  ),
  daily_posts AS (
    SELECT created_at::DATE AS date, COUNT(*) AS count
    FROM posts
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  ),
  daily_comments AS (
    SELECT created_at::DATE AS date, COUNT(*) AS count
    FROM comments
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  ),
  daily_votes AS (
    SELECT created_at::DATE AS date, COUNT(*) AS count
    FROM votes
    WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY created_at::DATE
  )
  SELECT 
    d.date,
    COALESCE(p.count, 0) AS posts,
    COALESCE(c.count, 0) AS comments,
    COALESCE(v.count, 0) AS votes
  FROM dates d
  LEFT JOIN daily_posts p ON d.date = p.date
  LEFT JOIN daily_comments c ON d.date = c.date
  LEFT JOIN daily_votes v ON d.date = v.date
  ORDER BY d.date;
END;
$$;

GRANT EXECUTE ON FUNCTION get_content_activity TO authenticated;

-- ============================================================================
-- 8. ADMIN USER LIST FUNCTION
-- ============================================================================
-- Efficient paginated user list for admin panel

CREATE OR REPLACE FUNCTION get_admin_users(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20,
  role_filter TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  offset_val INTEGER;
  total_count INTEGER;
  users_data JSONB;
BEGIN
  SELECT role INTO caller_role FROM users WHERE id = auth.uid();
  
  IF caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  
  offset_val := (page_number - 1) * page_size;
  
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM users
  WHERE 
    (role_filter IS NULL OR role = role_filter)
    AND (
      search_query IS NULL 
      OR name ILIKE '%' || search_query || '%'
      OR email ILIKE '%' || search_query || '%'
    );
  
  -- Get paginated users
  SELECT jsonb_agg(user_row ORDER BY 
    CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC NULLS LAST,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC NULLS LAST,
    CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN name END DESC NULLS LAST,
    CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN name END ASC NULLS LAST
  )
  INTO users_data
  FROM (
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'name', u.name,
      'role', u.role,
      'avatar_url', u.avatar_url,
      'created_at', u.created_at,
      'is_verified_author', u.is_verified_author,
      'suspended_at', u.suspended_at,
      'suspension_reason', u.suspension_reason,
      'post_count', (SELECT COUNT(*) FROM posts WHERE author_id = u.id),
      'comment_count', (SELECT COUNT(*) FROM comments WHERE user_id = u.id)
    ) AS user_row,
    u.created_at,
    u.name
    FROM users u
    WHERE 
      (role_filter IS NULL OR u.role = role_filter)
      AND (
        search_query IS NULL 
        OR u.name ILIKE '%' || search_query || '%'
        OR u.email ILIKE '%' || search_query || '%'
      )
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN u.created_at END DESC NULLS LAST,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN u.created_at END ASC NULLS LAST,
      CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN u.name END DESC NULLS LAST,
      CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN u.name END ASC NULLS LAST
    LIMIT page_size
    OFFSET offset_val
  ) AS subq;
  
  RETURN jsonb_build_object(
    'users', COALESCE(users_data, '[]'::jsonb),
    'total', total_count,
    'page', page_number,
    'page_size', page_size,
    'total_pages', CEIL(total_count::FLOAT / page_size)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_users TO authenticated;

-- ============================================================================
-- 9. AUDIT LOG RETRIEVAL FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_audit_logs(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  action_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  offset_val INTEGER;
  total_count INTEGER;
  logs_data JSONB;
BEGIN
  SELECT role INTO caller_role FROM users WHERE id = auth.uid();
  
  IF caller_role != 'admin' THEN
    RETURN jsonb_build_object('error', 'Only admins can view audit logs');
  END IF;
  
  offset_val := (page_number - 1) * page_size;
  
  SELECT COUNT(*) INTO total_count FROM role_change_audit;
  
  SELECT jsonb_agg(log_row)
  INTO logs_data
  FROM (
    SELECT jsonb_build_object(
      'id', rca.id,
      'user_id', rca.user_id,
      'user_name', u.name,
      'user_email', u.email,
      'changed_by_id', rca.changed_by,
      'changed_by_name', cb.name,
      'old_role', rca.old_role,
      'new_role', rca.new_role,
      'reason', rca.reason,
      'created_at', rca.created_at
    ) AS log_row
    FROM role_change_audit rca
    LEFT JOIN users u ON rca.user_id = u.id
    LEFT JOIN users cb ON rca.changed_by = cb.id
    ORDER BY rca.created_at DESC
    LIMIT page_size
    OFFSET offset_val
  ) AS subq;
  
  RETURN jsonb_build_object(
    'logs', COALESCE(logs_data, '[]'::jsonb),
    'total', total_count,
    'page', page_number,
    'page_size', page_size
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_audit_logs TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
