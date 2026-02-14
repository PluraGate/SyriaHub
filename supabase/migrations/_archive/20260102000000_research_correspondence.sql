-- ============================================================================
-- RESEARCH CORRESPONDENCE SYSTEM
-- ============================================================================
-- Formal, contextual messaging for clarification requests and moderation.
-- Anti-chat by construction: max 2 messages per thread, delayed delivery, immutable.
--
-- Core invariants:
--   - A thread = root + at most one reply (enforced by UNIQUE index)
--   - Content is immutable (enforced by RLS + trigger)
--   - Delivery is delayed (5 min minimum, service_role only)
--   - Always contextual (post XOR moderation_case)
-- ============================================================================

-- 1. CORRESPONDENCE TABLE
CREATE TABLE IF NOT EXISTS research_correspondence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context linkage (exactly one must be set)
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  moderation_case_id UUID REFERENCES coordination_threads(id) ON DELETE CASCADE,
  
  -- Context type (derived from which FK is set)
  context_type TEXT NOT NULL CHECK (context_type IN ('post', 'moderation_case')),
  
  -- Message kind (what role this message plays)
  kind TEXT NOT NULL CHECK (kind IN (
    'clarification_request',   -- Reader asking author about a post
    'moderation_notice',       -- Moderator -> Author
    'response'                 -- Reply to any of the above
  )),
  
  -- Sender & Recipient
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Thread structure: parent_id points to root only (never to another reply)
  parent_id UUID REFERENCES research_correspondence(id) ON DELETE SET NULL,
  
  -- Content (immutable after creation)
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 10 AND 200),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 50 AND 2000),
  
  -- Delivery scheduling (batch processing)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_delivery_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  delivered_at TIMESTAMPTZ,
  
  -- Read tracking (no real-time exposure)
  read_at TIMESTAMPTZ,
  
  -- State
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Created, awaiting delivery
    'delivered',  -- Delivered to recipient
    'read',       -- Marked as read
    'archived'    -- Archived by recipient
  )),
  
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_users CHECK (sender_id != recipient_id),
  CONSTRAINT exactly_one_context CHECK (
    (post_id IS NOT NULL AND moderation_case_id IS NULL AND context_type = 'post') OR
    (post_id IS NULL AND moderation_case_id IS NOT NULL AND context_type = 'moderation_case')
  ),
  CONSTRAINT response_needs_parent CHECK (
    (kind = 'response' AND parent_id IS NOT NULL) OR
    (kind != 'response' AND parent_id IS NULL)
  ),
  CONSTRAINT valid_kind_for_context CHECK (
    -- moderation_notice only valid for moderation_case context
    (kind = 'moderation_notice' AND context_type = 'moderation_case') OR
    (kind = 'clarification_request' AND context_type = 'post') OR
    (kind = 'response')
  )
);

-- ============================================================================
-- CRITICAL: Only one reply allowed per root message
-- This single index enforces the 2-message max invariant
-- ============================================================================
CREATE UNIQUE INDEX uniq_single_reply_per_thread
  ON research_correspondence(parent_id)
  WHERE parent_id IS NOT NULL;

-- Other indexes
CREATE INDEX idx_correspondence_sender ON research_correspondence(sender_id);
CREATE INDEX idx_correspondence_recipient ON research_correspondence(recipient_id);
CREATE INDEX idx_correspondence_post ON research_correspondence(post_id) 
  WHERE post_id IS NOT NULL;
CREATE INDEX idx_correspondence_moderation ON research_correspondence(moderation_case_id) 
  WHERE moderation_case_id IS NOT NULL;
CREATE INDEX idx_correspondence_delivery ON research_correspondence(scheduled_delivery_at) 
  WHERE delivered_at IS NULL;
CREATE INDEX idx_correspondence_status ON research_correspondence(status);
CREATE INDEX idx_correspondence_parent ON research_correspondence(parent_id)
  WHERE parent_id IS NOT NULL;

-- 2. RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS correspondence_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, date)
);

-- 3. ENABLE RLS
ALTER TABLE research_correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE correspondence_rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RLS POLICIES FOR CORRESPONDENCE
-- ============================================================================

-- Senders can view correspondence they sent
DROP POLICY IF EXISTS "Senders can view own sent correspondence" ON research_correspondence;
CREATE POLICY "Senders can view own sent correspondence" ON research_correspondence
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid());

-- Recipients can view correspondence ONLY after delivery
DROP POLICY IF EXISTS "Recipients can view delivered correspondence" ON research_correspondence;
CREATE POLICY "Recipients can view delivered correspondence" ON research_correspondence
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid() AND delivered_at IS NOT NULL);

-- Users can create correspondence (validation in function)
DROP POLICY IF EXISTS "Users can create correspondence" ON research_correspondence;
CREATE POLICY "Users can create correspondence" ON research_correspondence
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- ============================================================================
-- IMMUTABILITY: No content mutation allowed (anti-chat hard stop)
-- This policy blocks ALL updates by regular users
-- ============================================================================
DROP POLICY IF EXISTS "No content mutation" ON research_correspondence;
CREATE POLICY "No content mutation" ON research_correspondence
  FOR UPDATE TO authenticated
  USING (false);

-- ============================================================================
-- Exception: Recipients can update ONLY status and read_at
-- This is handled via function + service role, not direct update
-- ============================================================================

-- Admin full access (for debugging/support)
DROP POLICY IF EXISTS "Admins full access to correspondence" ON research_correspondence;
CREATE POLICY "Admins full access to correspondence" ON research_correspondence
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Rate limit policies
DROP POLICY IF EXISTS "Users can view own rate limits" ON correspondence_rate_limits;
CREATE POLICY "Users can view own rate limits" ON correspondence_rate_limits
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can manage rate limits" ON correspondence_rate_limits;
CREATE POLICY "System can manage rate limits" ON correspondence_rate_limits
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 5. REPLY VALIDATION TRIGGER
-- Enforces: no reply-to-reply, only recipient can reply
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_correspondence_reply_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_parent RECORD;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT * INTO v_parent FROM research_correspondence WHERE id = NEW.parent_id;
    
    IF v_parent.id IS NULL THEN
      RAISE EXCEPTION 'Parent correspondence not found';
    END IF;
    
    -- Parent must be a root (not itself a reply)
    IF v_parent.parent_id IS NOT NULL THEN
      RAISE EXCEPTION 'Replies to replies are not allowed';
    END IF;
    
    -- Only recipient of parent can reply
    IF v_parent.recipient_id != NEW.sender_id THEN
      RAISE EXCEPTION 'Only the original recipient may reply';
    END IF;
    
    -- Reply must inherit context from parent
    IF NEW.post_id IS DISTINCT FROM v_parent.post_id OR 
       NEW.moderation_case_id IS DISTINCT FROM v_parent.moderation_case_id THEN
      RAISE EXCEPTION 'Reply must be in same context as parent';
    END IF;
    
    -- Reply recipient must be original sender
    IF NEW.recipient_id != v_parent.sender_id THEN
      RAISE EXCEPTION 'Reply must be sent to original sender';
    END IF;
    
    -- Force context_type to match parent
    IF NEW.context_type != v_parent.context_type THEN
      NEW.context_type := v_parent.context_type;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_reply_rules ON research_correspondence;
CREATE TRIGGER trg_enforce_reply_rules
  BEFORE INSERT ON research_correspondence
  FOR EACH ROW
  EXECUTE FUNCTION enforce_correspondence_reply_rules();

-- ============================================================================
-- 6. SEND CORRESPONDENCE FUNCTION (with rate limiting)
-- ============================================================================

CREATE OR REPLACE FUNCTION send_correspondence(
  p_kind TEXT,
  p_recipient_id UUID,
  p_subject TEXT,
  p_body TEXT,
  p_post_id UUID DEFAULT NULL,
  p_moderation_case_id UUID DEFAULT NULL,
  p_parent_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id UUID;
  v_sender_role TEXT;
  v_daily_count INTEGER;
  v_recipient_allows_messages BOOLEAN;
  v_correspondence_id UUID;
  v_pending_count INTEGER;
  v_context_type TEXT;
BEGIN
  v_sender_id := auth.uid();
  
  IF v_sender_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get sender role
  SELECT role INTO v_sender_role FROM users WHERE id = v_sender_id;
  
  -- Validate kind
  IF p_kind NOT IN ('clarification_request', 'moderation_notice', 'response') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid correspondence kind');
  END IF;
  
  -- Determine context_type
  IF p_post_id IS NOT NULL THEN
    v_context_type := 'post';
  ELSIF p_moderation_case_id IS NOT NULL THEN
    v_context_type := 'moderation_case';
  ELSIF p_parent_id IS NOT NULL THEN
    -- For replies, inherit context from parent
    SELECT context_type, post_id, moderation_case_id 
    INTO v_context_type, p_post_id, p_moderation_case_id
    FROM research_correspondence WHERE id = p_parent_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Context (post or moderation case) required');
  END IF;
  
  -- Validate context exists
  IF p_post_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM posts WHERE id = p_post_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Post not found');
    END IF;
  END IF;
  
  IF p_moderation_case_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM coordination_threads WHERE id = p_moderation_case_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Moderation case not found');
    END IF;
    -- Must be moderator/admin for moderation notices
    IF v_sender_role NOT IN ('admin', 'moderator') AND p_kind = 'moderation_notice' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Only moderators can send moderation notices');
    END IF;
  END IF;
  
  -- Validate kind matches context
  IF p_kind = 'clarification_request' AND v_context_type != 'post' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Clarification requests must be linked to a post');
  END IF;
  IF p_kind = 'moderation_notice' AND v_context_type != 'moderation_case' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Moderation notices must be linked to a moderation case');
  END IF;
  
  -- Check recipient allows messages (unless sender is moderator/admin)
  IF v_sender_role = 'researcher' AND p_kind != 'response' THEN
    SELECT (preferences->'privacy'->>'allow_messages')::boolean 
    INTO v_recipient_allows_messages
    FROM users WHERE id = p_recipient_id;
    
    IF NOT COALESCE(v_recipient_allows_messages, true) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Recipient has disabled correspondence');
    END IF;
  END IF;
  
  -- Check rate limit (3 per day for researchers, 10 for moderators, no limit for admins)
  IF v_sender_role = 'researcher' THEN
    SELECT COALESCE(count, 0) INTO v_daily_count
    FROM correspondence_rate_limits
    WHERE user_id = v_sender_id AND date = CURRENT_DATE;
    
    IF v_daily_count >= 3 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Daily correspondence limit reached (max 3)');
    END IF;
    
    -- One-open-at-a-time: block if too many pending awaiting reply
    SELECT COUNT(*) INTO v_pending_count
    FROM research_correspondence c
    WHERE c.sender_id = v_sender_id
      AND c.parent_id IS NULL
      AND c.kind != 'response'
      AND NOT EXISTS (
        SELECT 1 FROM research_correspondence r 
        WHERE r.parent_id = c.id
      );
    
    IF v_pending_count >= 3 THEN
      RETURN jsonb_build_object('success', false, 'error', 'You have too many correspondence awaiting reply. Please wait for responses.');
    END IF;
    
  ELSIF v_sender_role = 'moderator' THEN
    SELECT COALESCE(count, 0) INTO v_daily_count
    FROM correspondence_rate_limits
    WHERE user_id = v_sender_id AND date = CURRENT_DATE;
    
    IF v_daily_count >= 10 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Daily correspondence limit reached (max 10)');
    END IF;
  END IF;
  
  -- Check no duplicate root correspondence for same context by same sender
  IF p_parent_id IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM research_correspondence 
      WHERE sender_id = v_sender_id
        AND parent_id IS NULL
        AND (
          (p_post_id IS NOT NULL AND post_id = p_post_id) OR
          (p_moderation_case_id IS NOT NULL AND moderation_case_id = p_moderation_case_id)
        )
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'You have already sent correspondence for this context');
    END IF;
  END IF;
  
  -- Create correspondence (triggers will validate reply rules)
  BEGIN
    INSERT INTO research_correspondence (
      kind, context_type, post_id, moderation_case_id, 
      sender_id, recipient_id, parent_id, subject, body
    ) VALUES (
      p_kind, v_context_type, p_post_id, p_moderation_case_id,
      v_sender_id, p_recipient_id, p_parent_id, p_subject, p_body
    ) RETURNING id INTO v_correspondence_id;
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object('success', false, 'error', 'This correspondence has already been replied to');
    WHEN raise_exception THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM);
    WHEN check_violation THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM);
  END;
  
  -- Update rate limit
  INSERT INTO correspondence_rate_limits (user_id, date, count)
  VALUES (v_sender_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET count = correspondence_rate_limits.count + 1;
  
  RETURN jsonb_build_object(
    'success', true,
    'correspondence_id', v_correspondence_id,
    'scheduled_delivery_at', NOW() + INTERVAL '5 minutes'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION send_correspondence TO authenticated;

-- ============================================================================
-- 7. DELIVER CORRESPONDENCE FUNCTION (service role only)
-- ============================================================================

CREATE OR REPLACE FUNCTION deliver_pending_correspondence()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delivered_count INTEGER;
BEGIN
  -- This function runs as SECURITY DEFINER, bypassing RLS
  -- Should only be called by cron/service
  UPDATE research_correspondence
  SET delivered_at = NOW(), 
      status = 'delivered',
      updated_at = NOW()
  WHERE delivered_at IS NULL
    AND scheduled_delivery_at <= NOW();
    
  GET DIAGNOSTICS v_delivered_count = ROW_COUNT;
  RETURN v_delivered_count;
END;
$$;

-- Only grant to service_role (not authenticated)
REVOKE EXECUTE ON FUNCTION deliver_pending_correspondence FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION deliver_pending_correspondence FROM authenticated;

-- ============================================================================
-- 8. MARK AS READ FUNCTION (for recipients)
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_correspondence_read(p_correspondence_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  UPDATE research_correspondence
  SET status = 'read',
      read_at = NOW(),
      updated_at = NOW()
  WHERE id = p_correspondence_id
    AND recipient_id = v_user_id
    AND delivered_at IS NOT NULL
    AND status = 'delivered';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Correspondence not found or already read');
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION mark_correspondence_read TO authenticated;

-- ============================================================================
-- 9. ARCHIVE CORRESPONDENCE FUNCTION (for recipients)
-- ============================================================================

CREATE OR REPLACE FUNCTION archive_correspondence(p_correspondence_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  UPDATE research_correspondence
  SET status = 'archived',
      updated_at = NOW()
  WHERE id = p_correspondence_id
    AND recipient_id = v_user_id
    AND delivered_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Correspondence not found');
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION archive_correspondence TO authenticated;

-- ============================================================================
-- 10. GET CORRESPONDENCE INBOX
-- ============================================================================

CREATE OR REPLACE FUNCTION get_correspondence_inbox(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20,
  p_status TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_offset INTEGER;
  v_total INTEGER;
  v_items JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  v_offset := (p_page - 1) * p_page_size;
  
  SELECT COUNT(*) INTO v_total
  FROM research_correspondence c
  WHERE c.recipient_id = v_user_id
    AND c.delivered_at IS NOT NULL
    AND (p_status IS NULL OR c.status = p_status);
  
  SELECT jsonb_agg(row_to_json(subq))
  INTO v_items
  FROM (
    SELECT 
      c.id,
      c.context_type,
      c.kind,
      c.post_id,
      c.moderation_case_id,
      c.subject,
      c.body,
      c.status,
      c.created_at,
      c.delivered_at,
      c.read_at,
      c.parent_id,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar_url', u.avatar_url,
        'affiliation', u.affiliation
      ) AS sender,
      CASE 
        WHEN c.post_id IS NOT NULL THEN (
          SELECT jsonb_build_object('id', p.id, 'title', p.title)
          FROM posts p WHERE p.id = c.post_id
        )
        ELSE NULL
      END AS post_detail,
      -- Check if reply exists (for root messages)
      CASE 
        WHEN c.parent_id IS NULL THEN EXISTS (
          SELECT 1 FROM research_correspondence r 
          WHERE r.parent_id = c.id
        )
        ELSE NULL
      END AS has_reply
    FROM research_correspondence c
    JOIN users u ON c.sender_id = u.id
    WHERE c.recipient_id = v_user_id
      AND c.delivered_at IS NOT NULL
      AND (p_status IS NULL OR c.status = p_status)
    ORDER BY c.created_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) subq;
  
  RETURN jsonb_build_object(
    'success', true,
    'items', COALESCE(v_items, '[]'::jsonb),
    'total', v_total,
    'page', p_page,
    'page_size', p_page_size,
    'total_pages', CEIL(v_total::FLOAT / p_page_size)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_correspondence_inbox TO authenticated;

-- ============================================================================
-- 11. GET SENT CORRESPONDENCE
-- ============================================================================

CREATE OR REPLACE FUNCTION get_correspondence_sent(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_offset INTEGER;
  v_total INTEGER;
  v_items JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  v_offset := (p_page - 1) * p_page_size;
  
  SELECT COUNT(*) INTO v_total
  FROM research_correspondence c
  WHERE c.sender_id = v_user_id;
  
  SELECT jsonb_agg(row_to_json(subq))
  INTO v_items
  FROM (
    SELECT 
      c.id,
      c.context_type,
      c.kind,
      c.post_id,
      c.moderation_case_id,
      c.subject,
      c.body,
      c.status,
      c.created_at,
      c.delivered_at,
      c.parent_id,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar_url', u.avatar_url
      ) AS recipient,
      CASE 
        WHEN c.post_id IS NOT NULL THEN (
          SELECT jsonb_build_object('id', p.id, 'title', p.title)
          FROM posts p WHERE p.id = c.post_id
        )
        ELSE NULL
      END AS post_detail,
      CASE 
        WHEN c.parent_id IS NULL THEN EXISTS (
          SELECT 1 FROM research_correspondence r 
          WHERE r.parent_id = c.id
        )
        ELSE NULL
      END AS has_reply
    FROM research_correspondence c
    JOIN users u ON c.recipient_id = u.id
    WHERE c.sender_id = v_user_id
    ORDER BY c.created_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) subq;
  
  RETURN jsonb_build_object(
    'success', true,
    'items', COALESCE(v_items, '[]'::jsonb),
    'total', v_total,
    'page', p_page,
    'page_size', p_page_size,
    'total_pages', CEIL(v_total::FLOAT / p_page_size)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_correspondence_sent TO authenticated;

-- ============================================================================
-- 12. GET SINGLE CORRESPONDENCE WITH THREAD
-- ============================================================================

CREATE OR REPLACE FUNCTION get_correspondence_thread(p_correspondence_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_root_id UUID;
  v_items JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find root of thread
  SELECT COALESCE(parent_id, id) INTO v_root_id
  FROM research_correspondence 
  WHERE id = p_correspondence_id
    AND (sender_id = v_user_id OR (recipient_id = v_user_id AND delivered_at IS NOT NULL));
  
  IF v_root_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Correspondence not found');
  END IF;
  
  -- Get root + reply (max 2 messages)
  SELECT jsonb_agg(row_to_json(subq) ORDER BY subq.created_at ASC)
  INTO v_items
  FROM (
    SELECT 
      c.id,
      c.context_type,
      c.kind,
      c.post_id,
      c.moderation_case_id,
      c.subject,
      c.body,
      c.status,
      c.created_at,
      c.delivered_at,
      c.read_at,
      c.parent_id,
      c.sender_id,
      c.recipient_id,
      jsonb_build_object(
        'id', sender.id,
        'name', sender.name,
        'avatar_url', sender.avatar_url,
        'affiliation', sender.affiliation
      ) AS sender,
      jsonb_build_object(
        'id', recipient.id,
        'name', recipient.name,
        'avatar_url', recipient.avatar_url
      ) AS recipient,
      CASE 
        WHEN c.post_id IS NOT NULL THEN (
          SELECT jsonb_build_object('id', p.id, 'title', p.title)
          FROM posts p WHERE p.id = c.post_id
        )
        ELSE NULL
      END AS post_detail,
      -- Can user reply to this?
      (c.parent_id IS NULL 
       AND c.recipient_id = v_user_id 
       AND NOT EXISTS (SELECT 1 FROM research_correspondence r WHERE r.parent_id = c.id)
      ) AS can_reply
    FROM research_correspondence c
    JOIN users sender ON c.sender_id = sender.id
    JOIN users recipient ON c.recipient_id = recipient.id
    WHERE (c.id = v_root_id OR c.parent_id = v_root_id)
      AND (c.sender_id = v_user_id OR (c.recipient_id = v_user_id AND c.delivered_at IS NOT NULL))
    ORDER BY c.created_at ASC
  ) subq;
  
  RETURN jsonb_build_object(
    'success', true,
    'thread', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_correspondence_thread TO authenticated;
