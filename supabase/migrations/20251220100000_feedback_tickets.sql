-- ============================================================================
-- FEEDBACK TICKETING SYSTEM
-- ============================================================================
-- A system for admins, moderators, and researchers to submit feedback,
-- bug reports, UX enhancements, and suggestions.
-- ============================================================================

-- ============================================================================
-- 1. FEEDBACK TICKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Submitter
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ticket details
  category TEXT NOT NULL CHECK (category IN (
    'bug',        -- Bug/Error reports
    'ux',         -- UX Enhancement suggestions
    'section',    -- Problematic sections
    'alternative', -- Alternative approaches
    'other'       -- General feedback
  )),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Context
  page_url TEXT,           -- URL where the issue was encountered
  screenshot_url TEXT,     -- Optional screenshot URL
  browser_info TEXT,       -- Browser/device info for debugging
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',        -- New ticket, awaiting review
    'in_progress', -- Being worked on
    'resolved',    -- Issue fixed/addressed
    'closed',      -- Closed without resolution (e.g., duplicate, won't fix)
    'deferred'     -- Acknowledged but postponed
  )),
  
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'critical'
  )),
  
  -- Admin response
  admin_notes TEXT,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_feedback_tickets_user ON feedback_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_category ON feedback_tickets(category);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_status ON feedback_tickets(status);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_priority ON feedback_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_created ON feedback_tickets(created_at DESC);

-- ============================================================================
-- 3. UPDATE TIMESTAMP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_feedback_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_feedback_ticket_timestamp ON feedback_tickets;
CREATE TRIGGER trigger_update_feedback_ticket_timestamp
  BEFORE UPDATE ON feedback_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_ticket_timestamp();

-- ============================================================================
-- 4. ENABLE RLS
-- ============================================================================

ALTER TABLE feedback_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- Admins have full access
DROP POLICY IF EXISTS "Admins full access to feedback tickets" ON feedback_tickets;
CREATE POLICY "Admins full access to feedback tickets" ON feedback_tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Moderators can view all and update status
DROP POLICY IF EXISTS "Moderators can view all feedback tickets" ON feedback_tickets;
CREATE POLICY "Moderators can view all feedback tickets" ON feedback_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  );

DROP POLICY IF EXISTS "Moderators can update feedback tickets" ON feedback_tickets;
CREATE POLICY "Moderators can update feedback tickets" ON feedback_tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  );

-- Researchers can create tickets
DROP POLICY IF EXISTS "Researchers can create feedback tickets" ON feedback_tickets;
CREATE POLICY "Researchers can create feedback tickets" ON feedback_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('researcher', 'moderator', 'admin')
    )
    AND user_id = auth.uid()
  );

-- Researchers can view their own tickets
DROP POLICY IF EXISTS "Users can view own feedback tickets" ON feedback_tickets;
CREATE POLICY "Users can view own feedback tickets" ON feedback_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 6. CREATE TICKET FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_feedback_ticket(
  p_category TEXT,
  p_title TEXT,
  p_description TEXT,
  p_page_url TEXT DEFAULT NULL,
  p_screenshot_url TEXT DEFAULT NULL,
  p_browser_info TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
  v_ticket_id UUID;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator', 'researcher') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins, moderators, and researchers can submit feedback');
  END IF;
  
  -- Validate category
  IF p_category NOT IN ('bug', 'ux', 'section', 'alternative', 'other') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid category');
  END IF;
  
  -- Validate required fields
  IF p_title IS NULL OR trim(p_title) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Title is required');
  END IF;
  
  IF p_description IS NULL OR trim(p_description) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Description is required');
  END IF;
  
  -- Create the ticket
  INSERT INTO feedback_tickets (
    user_id, category, title, description, page_url, screenshot_url, browser_info
  ) VALUES (
    v_caller_id, p_category, trim(p_title), trim(p_description), p_page_url, p_screenshot_url, p_browser_info
  ) RETURNING id INTO v_ticket_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'ticket_id', v_ticket_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_feedback_ticket TO authenticated;

-- ============================================================================
-- 7. UPDATE TICKET STATUS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_feedback_ticket_status(
  p_ticket_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins and moderators can update ticket status');
  END IF;
  
  -- Validate status
  IF p_status NOT IN ('open', 'in_progress', 'resolved', 'closed', 'deferred') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status');
  END IF;
  
  -- Validate priority if provided
  IF p_priority IS NOT NULL AND p_priority NOT IN ('low', 'medium', 'high', 'critical') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid priority');
  END IF;
  
  -- Check ticket exists
  IF NOT EXISTS (SELECT 1 FROM feedback_tickets WHERE id = p_ticket_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ticket not found');
  END IF;
  
  -- Update the ticket
  UPDATE feedback_tickets
  SET 
    status = p_status,
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    priority = COALESCE(p_priority, priority),
    resolved_by = CASE WHEN p_status = 'resolved' THEN v_caller_id ELSE resolved_by END,
    resolved_at = CASE WHEN p_status = 'resolved' THEN NOW() ELSE resolved_at END
  WHERE id = p_ticket_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION update_feedback_ticket_status TO authenticated;

-- ============================================================================
-- 8. LIST TICKETS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION list_feedback_tickets(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20,
  p_category TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_my_tickets_only BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
  v_offset INTEGER;
  v_total INTEGER;
  v_tickets JSONB;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator', 'researcher') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  v_offset := (p_page - 1) * p_page_size;
  
  -- Count total
  SELECT COUNT(*) INTO v_total
  FROM feedback_tickets t
  WHERE (p_category IS NULL OR t.category = p_category)
  AND (p_status IS NULL OR t.status = p_status)
  AND (p_priority IS NULL OR t.priority = p_priority)
  AND (
    -- Admins/moderators can see all, researchers only their own
    v_caller_role IN ('admin', 'moderator') 
    OR t.user_id = v_caller_id
  )
  AND (NOT p_my_tickets_only OR t.user_id = v_caller_id);
  
  -- Get tickets
  SELECT jsonb_agg(ticket_row ORDER BY created_at DESC)
  INTO v_tickets
  FROM (
    SELECT jsonb_build_object(
      'id', t.id,
      'user_id', t.user_id,
      'user_name', u.name,
      'user_email', u.email,
      'category', t.category,
      'title', t.title,
      'description', t.description,
      'page_url', t.page_url,
      'status', t.status,
      'priority', t.priority,
      'admin_notes', t.admin_notes,
      'resolved_by', t.resolved_by,
      'resolved_by_name', ru.name,
      'resolved_at', t.resolved_at,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ) AS ticket_row,
    t.created_at
    FROM feedback_tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN users ru ON t.resolved_by = ru.id
    WHERE (p_category IS NULL OR t.category = p_category)
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_priority IS NULL OR t.priority = p_priority)
    AND (
      v_caller_role IN ('admin', 'moderator') 
      OR t.user_id = v_caller_id
    )
    AND (NOT p_my_tickets_only OR t.user_id = v_caller_id)
    ORDER BY t.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) AS subq;
  
  RETURN jsonb_build_object(
    'success', true,
    'tickets', COALESCE(v_tickets, '[]'::jsonb),
    'total', v_total,
    'page', p_page,
    'page_size', p_page_size,
    'total_pages', CEIL(v_total::FLOAT / p_page_size)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION list_feedback_tickets TO authenticated;

-- ============================================================================
-- 9. GET TICKET STATS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_feedback_ticket_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
  v_stats JSONB;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins and moderators can view stats');
  END IF;
  
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'open', COUNT(*) FILTER (WHERE status = 'open'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
    'closed', COUNT(*) FILTER (WHERE status = 'closed'),
    'deferred', COUNT(*) FILTER (WHERE status = 'deferred'),
    'by_category', jsonb_build_object(
      'bug', COUNT(*) FILTER (WHERE category = 'bug'),
      'ux', COUNT(*) FILTER (WHERE category = 'ux'),
      'section', COUNT(*) FILTER (WHERE category = 'section'),
      'alternative', COUNT(*) FILTER (WHERE category = 'alternative'),
      'other', COUNT(*) FILTER (WHERE category = 'other')
    ),
    'by_priority', jsonb_build_object(
      'critical', COUNT(*) FILTER (WHERE priority = 'critical'),
      'high', COUNT(*) FILTER (WHERE priority = 'high'),
      'medium', COUNT(*) FILTER (WHERE priority = 'medium'),
      'low', COUNT(*) FILTER (WHERE priority = 'low')
    )
  ) INTO v_stats
  FROM feedback_tickets;
  
  RETURN jsonb_build_object('success', true, 'stats', v_stats);
END;
$$;

GRANT EXECUTE ON FUNCTION get_feedback_ticket_stats TO authenticated;
