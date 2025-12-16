-- ============================================================================
-- INTERNAL COORDINATION SYSTEM
-- ============================================================================
-- A decision-oriented coordination layer for admins and moderators.
-- Complements Audit Logs by providing context, discussion, and structured
-- decision-making for governance, moderation, and accountability.
--
-- Core Tables:
--   - coordination_threads: Threads linked to platform objects
--   - coordination_messages: Structured entries within threads
--
-- Key Features:
--   - Object attachment requirement (no free-floating conversations)
--   - Structured message types (NOTE, FLAG, DECISION, RATIONALE, REQUEST_REVIEW)
--   - State machine for object transitions
--   - Immutable messages with version history
--   - Integration with existing audit logs
-- ============================================================================

-- ============================================================================
-- 1. COORDINATION THREADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS coordination_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Object linkage (required - no free-floating threads)
  object_type TEXT NOT NULL CHECK (object_type IN (
    'post', 'user', 'comment', 'report', 'appeal', 'event', 'resource'
  )),
  object_id UUID NOT NULL,
  
  -- Thread metadata
  title TEXT NOT NULL,
  description TEXT,
  
  -- Current state of the linked object
  object_state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (object_state IN (
    'ACTIVE', 'UNDER_REVIEW', 'CONTESTED', 'REVOKED', 'ARCHIVED'
  )),
  
  -- Priority for triage
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN (
    'low', 'normal', 'high', 'urgent'
  )),
  
  -- How this thread was created
  trigger_event TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_event IN (
    'manual',           -- Admin/moderator manually created
    'auto_report',      -- Auto-created when report filed
    'auto_appeal',      -- Auto-created when appeal submitted
    'auto_flag',        -- Auto-created when content flagged
    'auto_moderation'   -- Auto-created on moderation action
  )),
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Archival (threads are never deleted, only archived)
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES users(id) ON DELETE SET NULL,
  archive_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure uniqueness per object (one active thread per object)
  -- Archived threads don't count toward this constraint
  CONSTRAINT unique_active_thread_per_object UNIQUE NULLS NOT DISTINCT (object_type, object_id, archived_at)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_coord_threads_object ON coordination_threads(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_coord_threads_state ON coordination_threads(object_state);
CREATE INDEX IF NOT EXISTS idx_coord_threads_priority ON coordination_threads(priority);
CREATE INDEX IF NOT EXISTS idx_coord_threads_created ON coordination_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coord_threads_updated ON coordination_threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_coord_threads_archived ON coordination_threads(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coord_threads_trigger ON coordination_threads(trigger_event);

-- ============================================================================
-- 2. COORDINATION MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS coordination_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Thread linkage
  thread_id UUID NOT NULL REFERENCES coordination_threads(id) ON DELETE CASCADE,
  
  -- Author
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Message type (structured, not free-form)
  message_type TEXT NOT NULL CHECK (message_type IN (
    'NOTE',           -- Internal commentary
    'FLAG',           -- Raises concern or violation
    'DECISION',       -- Action taken
    'RATIONALE',      -- Justification for a decision
    'REQUEST_REVIEW'  -- Escalation or handover
  )),
  
  -- Content
  content TEXT NOT NULL,
  
  -- Action (for DECISION messages)
  action_type TEXT CHECK (action_type IN (
    'revoke_content',     -- Hide/remove content
    'reinstate_content',  -- Restore content
    'suspend_user',       -- Suspend user account
    'reinstate_user',     -- Reinstate user account
    'lock_object',        -- Lock for editing
    'unlock_object',      -- Unlock for editing
    'change_state',       -- Generic state change
    'escalate',           -- Escalate to higher authority
    'close_thread'        -- Close the coordination thread
  )),
  action_data JSONB,           -- Additional action parameters
  action_executed BOOLEAN DEFAULT FALSE,
  action_executed_at TIMESTAMPTZ,
  action_result JSONB,         -- Result of action execution
  
  -- Decision confidence (for DECISION messages, internal analysis)
  decision_confidence TEXT CHECK (decision_confidence IS NULL OR decision_confidence IN (
    'confident',    -- Clear-cut decision
    'provisional',  -- Tentative, may be revisited
    'contested'     -- Disagreement exists, decision controversial
  )),
  
  -- Cooling-off / review pending marker (for high-impact decisions)
  review_pending BOOLEAN DEFAULT FALSE,
  review_pending_until TIMESTAMPTZ,
  review_completed_at TIMESTAMPTZ,
  review_completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Audit log linkage (for actions that generate audit entries)
  audit_log_id UUID,
  
  -- Immutability with versioning
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES coordination_messages(id) ON DELETE SET NULL,
  is_current_version BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- State change tracking
  old_state TEXT,
  new_state TEXT,
  
  -- Timestamp (immutable once created)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_coord_messages_thread ON coordination_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_coord_messages_author ON coordination_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_coord_messages_type ON coordination_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_coord_messages_created ON coordination_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_coord_messages_action ON coordination_messages(action_type) WHERE action_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coord_messages_current ON coordination_messages(is_current_version) WHERE is_current_version = TRUE;
CREATE INDEX IF NOT EXISTS idx_coord_messages_review_pending ON coordination_messages(review_pending) WHERE review_pending = TRUE;

-- ============================================================================
-- 3. STATE TRANSITION VALIDATION FUNCTION
-- ============================================================================
-- Enforces valid state transitions

CREATE OR REPLACE FUNCTION validate_state_transition(
  current_state TEXT,
  new_state TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Same state is always valid (no change)
  IF current_state = new_state THEN
    RETURN TRUE;
  END IF;
  
  -- Valid transitions from each state
  CASE current_state
    WHEN 'ACTIVE' THEN
      -- ACTIVE can only go to UNDER_REVIEW
      RETURN new_state = 'UNDER_REVIEW';
      
    WHEN 'UNDER_REVIEW' THEN
      -- UNDER_REVIEW can go to ACTIVE, REVOKED, CONTESTED, or ARCHIVED
      RETURN new_state IN ('ACTIVE', 'REVOKED', 'CONTESTED', 'ARCHIVED');
      
    WHEN 'REVOKED' THEN
      -- REVOKED can only go back to UNDER_REVIEW (for reinstatement review)
      RETURN new_state = 'UNDER_REVIEW';
      
    WHEN 'CONTESTED' THEN
      -- CONTESTED can go to UNDER_REVIEW or ARCHIVED
      RETURN new_state IN ('UNDER_REVIEW', 'ARCHIVED');
      
    WHEN 'ARCHIVED' THEN
      -- ARCHIVED is terminal (no transitions out)
      RETURN FALSE;
      
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- ============================================================================
-- 4. UPDATE THREAD UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_coordination_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coordination_threads
  SET updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_thread_timestamp ON coordination_messages;
CREATE TRIGGER trigger_update_thread_timestamp
  AFTER INSERT ON coordination_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_coordination_thread_timestamp();

-- ============================================================================
-- 5. ENABLE RLS
-- ============================================================================

ALTER TABLE coordination_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS POLICIES FOR COORDINATION_THREADS
-- ============================================================================

-- Admins can do everything
DROP POLICY IF EXISTS "Admins full access to coordination threads" ON coordination_threads;
CREATE POLICY "Admins full access to coordination threads" ON coordination_threads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Moderators can view all threads
DROP POLICY IF EXISTS "Moderators can view coordination threads" ON coordination_threads;
CREATE POLICY "Moderators can view coordination threads" ON coordination_threads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  );

-- Moderators can create threads
DROP POLICY IF EXISTS "Moderators can create coordination threads" ON coordination_threads;
CREATE POLICY "Moderators can create coordination threads" ON coordination_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
    AND created_by = auth.uid()
  );

-- Moderators can update threads they created (but not archive)
DROP POLICY IF EXISTS "Moderators can update own threads" ON coordination_threads;
CREATE POLICY "Moderators can update own threads" ON coordination_threads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
    AND created_by = auth.uid()
    AND archived_at IS NULL  -- Can't modify archived threads
  )
  WITH CHECK (
    archived_at IS NULL  -- Moderators cannot archive (admin only)
  );

-- ============================================================================
-- 7. RLS POLICIES FOR COORDINATION_MESSAGES
-- ============================================================================

-- Admins can do everything
DROP POLICY IF EXISTS "Admins full access to coordination messages" ON coordination_messages;
CREATE POLICY "Admins full access to coordination messages" ON coordination_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Moderators can view all messages
DROP POLICY IF EXISTS "Moderators can view coordination messages" ON coordination_messages;
CREATE POLICY "Moderators can view coordination messages" ON coordination_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  );

-- Moderators can create messages
DROP POLICY IF EXISTS "Moderators can create coordination messages" ON coordination_messages;
CREATE POLICY "Moderators can create coordination messages" ON coordination_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
    AND author_id = auth.uid()
    -- Moderators cannot make certain decisions
    AND (
      action_type IS NULL 
      OR action_type NOT IN ('suspend_user', 'reinstate_user')
    )
  );

-- ============================================================================
-- 8. CREATE COORDINATION THREAD FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_coordination_thread(
  p_object_type TEXT,
  p_object_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_trigger_event TEXT DEFAULT 'manual',
  p_initial_message TEXT DEFAULT NULL,
  p_initial_message_type TEXT DEFAULT 'NOTE'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
  v_thread_id UUID;
  v_message_id UUID;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins and moderators can create coordination threads');
  END IF;
  
  -- Validate object type
  IF p_object_type NOT IN ('post', 'user', 'comment', 'report', 'appeal', 'event', 'resource') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid object type');
  END IF;
  
  -- Check if active thread already exists for this object
  IF EXISTS (
    SELECT 1 FROM coordination_threads
    WHERE object_type = p_object_type
    AND object_id = p_object_id
    AND archived_at IS NULL
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'An active coordination thread already exists for this object');
  END IF;
  
  -- Create the thread
  INSERT INTO coordination_threads (
    object_type, object_id, title, description, priority, trigger_event, created_by
  ) VALUES (
    p_object_type, p_object_id, p_title, p_description, p_priority, p_trigger_event, v_caller_id
  ) RETURNING id INTO v_thread_id;
  
  -- Add initial message if provided
  IF p_initial_message IS NOT NULL THEN
    INSERT INTO coordination_messages (
      thread_id, author_id, message_type, content
    ) VALUES (
      v_thread_id, v_caller_id, p_initial_message_type, p_initial_message
    ) RETURNING id INTO v_message_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'thread_id', v_thread_id,
    'message_id', v_message_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_coordination_thread TO authenticated;

-- ============================================================================
-- 9. ADD COORDINATION MESSAGE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION add_coordination_message(
  p_thread_id UUID,
  p_message_type TEXT,
  p_content TEXT,
  p_action_type TEXT DEFAULT NULL,
  p_action_data JSONB DEFAULT NULL,
  p_new_state TEXT DEFAULT NULL,
  p_decision_confidence TEXT DEFAULT NULL,
  p_review_pending BOOLEAN DEFAULT FALSE,
  p_review_pending_hours INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
  v_thread RECORD;
  v_message_id UUID;
  v_state_valid BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins and moderators can add coordination messages');
  END IF;
  
  -- Get thread
  SELECT * INTO v_thread FROM coordination_threads WHERE id = p_thread_id;
  
  IF v_thread.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Thread not found');
  END IF;
  
  IF v_thread.archived_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot add messages to archived threads');
  END IF;
  
  -- Validate message type
  IF p_message_type NOT IN ('NOTE', 'FLAG', 'DECISION', 'RATIONALE', 'REQUEST_REVIEW') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid message type');
  END IF;
  
  -- Moderators cannot perform certain actions
  IF v_caller_role = 'moderator' AND p_action_type IN ('suspend_user', 'reinstate_user') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Moderators cannot perform user suspension actions');
  END IF;
  
  -- Validate state transition if changing state
  IF p_new_state IS NOT NULL AND p_new_state != v_thread.object_state THEN
    v_state_valid := validate_state_transition(v_thread.object_state, p_new_state);
    IF NOT v_state_valid THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Invalid state transition from ' || v_thread.object_state || ' to ' || p_new_state
      );
    END IF;
  END IF;
  
  -- Validate decision_confidence (only for DECISION messages)
  IF p_decision_confidence IS NOT NULL AND p_message_type != 'DECISION' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Decision confidence can only be set for DECISION messages');
  END IF;
  
  -- Create the message
  INSERT INTO coordination_messages (
    thread_id, author_id, message_type, content,
    action_type, action_data,
    old_state, new_state,
    decision_confidence, review_pending, review_pending_until
  ) VALUES (
    p_thread_id, v_caller_id, p_message_type, p_content,
    p_action_type, p_action_data,
    CASE WHEN p_new_state IS NOT NULL THEN v_thread.object_state ELSE NULL END,
    p_new_state,
    p_decision_confidence,
    p_review_pending,
    CASE WHEN p_review_pending AND p_review_pending_hours IS NOT NULL 
         THEN NOW() + (p_review_pending_hours || ' hours')::INTERVAL 
         ELSE NULL END
  ) RETURNING id INTO v_message_id;
  
  -- Update thread state if changing
  IF p_new_state IS NOT NULL AND p_new_state != v_thread.object_state THEN
    UPDATE coordination_threads
    SET object_state = p_new_state,
        updated_at = NOW()
    WHERE id = p_thread_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message_id', v_message_id,
    'old_state', v_thread.object_state,
    'new_state', COALESCE(p_new_state, v_thread.object_state)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION add_coordination_message TO authenticated;

-- ============================================================================
-- 10. GET THREAD TIMELINE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_coordination_thread(p_thread_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
  v_thread JSONB;
  v_messages JSONB;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins and moderators can view coordination threads');
  END IF;
  
  -- Get thread
  SELECT jsonb_build_object(
    'id', t.id,
    'object_type', t.object_type,
    'object_id', t.object_id,
    'title', t.title,
    'description', t.description,
    'object_state', t.object_state,
    'priority', t.priority,
    'trigger_event', t.trigger_event,
    'created_by', t.created_by,
    'created_by_name', u.name,
    'archived_at', t.archived_at,
    'archive_reason', t.archive_reason,
    'created_at', t.created_at,
    'updated_at', t.updated_at
  ) INTO v_thread
  FROM coordination_threads t
  LEFT JOIN users u ON t.created_by = u.id
  WHERE t.id = p_thread_id;
  
  IF v_thread IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Thread not found');
  END IF;
  
  -- Get messages
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'author_id', m.author_id,
      'author_name', u.name,
      'author_role', u.role,
      'message_type', m.message_type,
      'content', m.content,
      'action_type', m.action_type,
      'action_data', m.action_data,
      'action_executed', m.action_executed,
      'action_executed_at', m.action_executed_at,
      'action_result', m.action_result,
      'decision_confidence', m.decision_confidence,
      'review_pending', m.review_pending,
      'review_pending_until', m.review_pending_until,
      'review_completed_at', m.review_completed_at,
      'old_state', m.old_state,
      'new_state', m.new_state,
      'version', m.version,
      'is_current_version', m.is_current_version,
      'created_at', m.created_at
    ) ORDER BY m.created_at ASC
  ) INTO v_messages
  FROM coordination_messages m
  LEFT JOIN users u ON m.author_id = u.id
  WHERE m.thread_id = p_thread_id
  AND m.is_current_version = TRUE;
  
  RETURN jsonb_build_object(
    'success', true,
    'thread', v_thread,
    'messages', COALESCE(v_messages, '[]'::jsonb),
    'message_count', COALESCE(jsonb_array_length(v_messages), 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_coordination_thread TO authenticated;

-- ============================================================================
-- 11. LIST COORDINATION THREADS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION list_coordination_threads(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20,
  p_object_type TEXT DEFAULT NULL,
  p_object_state TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_include_archived BOOLEAN DEFAULT FALSE
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
  v_threads JSONB;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT role INTO v_caller_role FROM users WHERE id = v_caller_id;
  
  IF v_caller_role NOT IN ('admin', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins and moderators can list coordination threads');
  END IF;
  
  v_offset := (p_page - 1) * p_page_size;
  
  -- Count total
  SELECT COUNT(*) INTO v_total
  FROM coordination_threads t
  WHERE (p_object_type IS NULL OR t.object_type = p_object_type)
  AND (p_object_state IS NULL OR t.object_state = p_object_state)
  AND (p_priority IS NULL OR t.priority = p_priority)
  AND (p_include_archived OR t.archived_at IS NULL);
  
  -- Get threads
  SELECT jsonb_agg(thread_row ORDER BY updated_at DESC)
  INTO v_threads
  FROM (
    SELECT jsonb_build_object(
      'id', t.id,
      'object_type', t.object_type,
      'object_id', t.object_id,
      'title', t.title,
      'object_state', t.object_state,
      'priority', t.priority,
      'trigger_event', t.trigger_event,
      'created_by_name', u.name,
      'message_count', (SELECT COUNT(*) FROM coordination_messages WHERE thread_id = t.id AND is_current_version = TRUE),
      'last_message_at', (SELECT MAX(created_at) FROM coordination_messages WHERE thread_id = t.id),
      'archived_at', t.archived_at,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ) AS thread_row,
    t.updated_at
    FROM coordination_threads t
    LEFT JOIN users u ON t.created_by = u.id
    WHERE (p_object_type IS NULL OR t.object_type = p_object_type)
    AND (p_object_state IS NULL OR t.object_state = p_object_state)
    AND (p_priority IS NULL OR t.priority = p_priority)
    AND (p_include_archived OR t.archived_at IS NULL)
    ORDER BY t.updated_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) AS subq;
  
  RETURN jsonb_build_object(
    'success', true,
    'threads', COALESCE(v_threads, '[]'::jsonb),
    'total', v_total,
    'page', p_page,
    'page_size', p_page_size,
    'total_pages', CEIL(v_total::FLOAT / p_page_size)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION list_coordination_threads TO authenticated;

-- ============================================================================
-- 12. ARCHIVE THREAD FUNCTION (Admin only)
-- ============================================================================

CREATE OR REPLACE FUNCTION archive_coordination_thread(
  p_thread_id UUID,
  p_reason TEXT DEFAULT NULL
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
  
  -- Only admins can archive
  IF v_caller_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can archive coordination threads');
  END IF;
  
  -- Check thread exists and is not already archived
  IF NOT EXISTS (SELECT 1 FROM coordination_threads WHERE id = p_thread_id AND archived_at IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Thread not found or already archived');
  END IF;
  
  -- Archive the thread
  UPDATE coordination_threads
  SET archived_at = NOW(),
      archived_by = v_caller_id,
      archive_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_thread_id;
  
  -- Add archive message
  INSERT INTO coordination_messages (
    thread_id, author_id, message_type, content,
    old_state, new_state
  ) VALUES (
    p_thread_id, v_caller_id, 'DECISION', 
    'Thread archived' || COALESCE(': ' || p_reason, ''),
    (SELECT object_state FROM coordination_threads WHERE id = p_thread_id),
    'ARCHIVED'
  );
  
  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION archive_coordination_thread TO authenticated;

-- ============================================================================
-- 13. AUTO-CREATE THREAD TRIGGER FOR REPORTS
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_create_report_coordination_thread()
RETURNS TRIGGER AS $$
DECLARE
  v_thread_id UUID;
  v_reporter_name TEXT;
  v_post_title TEXT;
BEGIN
  -- Get reporter name
  SELECT name INTO v_reporter_name FROM users WHERE id = NEW.reporter_id;
  
  -- Get post title if applicable
  IF NEW.post_id IS NOT NULL THEN
    SELECT title INTO v_post_title FROM posts WHERE id = NEW.post_id;
  END IF;
  
  -- Create coordination thread
  INSERT INTO coordination_threads (
    object_type, object_id, title, description, 
    priority, trigger_event, created_by, object_state
  ) VALUES (
    'report', NEW.id, 
    'Report: ' || LEFT(NEW.reason, 50) || CASE WHEN LENGTH(NEW.reason) > 50 THEN '...' ELSE '' END,
    'Auto-created coordination thread for report on ' || COALESCE('post "' || v_post_title || '"', 'content'),
    'normal', 'auto_report', NEW.reporter_id, 'UNDER_REVIEW'
  ) RETURNING id INTO v_thread_id;
  
  -- Add initial message
  INSERT INTO coordination_messages (
    thread_id, author_id, message_type, content
  ) VALUES (
    v_thread_id, NEW.reporter_id, 'FLAG',
    'Report filed by ' || COALESCE(v_reporter_name, 'User') || ': ' || NEW.reason
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail report creation if thread creation fails
    RAISE WARNING 'Failed to create coordination thread for report: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_report_thread ON reports;
CREATE TRIGGER trigger_auto_create_report_thread
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_report_coordination_thread();

-- ============================================================================
-- 14. AUTO-CREATE THREAD TRIGGER FOR APPEALS
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_create_appeal_coordination_thread()
RETURNS TRIGGER AS $$
DECLARE
  v_thread_id UUID;
  v_user_name TEXT;
  v_post_title TEXT;
BEGIN
  -- Get user name
  SELECT name INTO v_user_name FROM users WHERE id = NEW.user_id;
  
  -- Get post title
  SELECT title INTO v_post_title FROM posts WHERE id = NEW.post_id;
  
  -- Create coordination thread
  INSERT INTO coordination_threads (
    object_type, object_id, title, description,
    priority, trigger_event, created_by, object_state
  ) VALUES (
    'appeal', NEW.id,
    'Appeal: ' || COALESCE(LEFT(v_post_title, 40), 'Content') || CASE WHEN LENGTH(v_post_title) > 40 THEN '...' ELSE '' END,
    'Auto-created coordination thread for moderation appeal',
    'high', 'auto_appeal', NEW.user_id, 'CONTESTED'
  ) RETURNING id INTO v_thread_id;
  
  -- Add initial message
  INSERT INTO coordination_messages (
    thread_id, author_id, message_type, content
  ) VALUES (
    v_thread_id, NEW.user_id, 'NOTE',
    'Appeal submitted by ' || COALESCE(v_user_name, 'User') || ': ' || NEW.dispute_reason
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail appeal creation if thread creation fails
    RAISE WARNING 'Failed to create coordination thread for appeal: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_appeal_thread ON moderation_appeals;
CREATE TRIGGER trigger_auto_create_appeal_thread
  AFTER INSERT ON moderation_appeals
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_appeal_coordination_thread();

-- ============================================================================
-- 15. COMMENTS
-- ============================================================================

COMMENT ON TABLE coordination_threads IS 'Coordination threads linked to platform objects for structured decision-making';
COMMENT ON TABLE coordination_messages IS 'Structured messages within coordination threads';
COMMENT ON COLUMN coordination_threads.trigger_event IS 'How the thread was created: manual, auto_report, auto_appeal, auto_flag, auto_moderation';
COMMENT ON COLUMN coordination_messages.message_type IS 'NOTE (commentary), FLAG (concern), DECISION (action), RATIONALE (justification), REQUEST_REVIEW (escalation)';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
