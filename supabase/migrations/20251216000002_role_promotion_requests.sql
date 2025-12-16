-- ============================================
-- ROLE PROMOTION REQUEST SYSTEM
-- ============================================

-- Create role_promotion_requests table
CREATE TABLE IF NOT EXISTS role_promotion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  from_role TEXT NOT NULL,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('researcher', 'moderator', 'admin')),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent duplicate pending requests for the same user and role
  UNIQUE (user_id, requested_role, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS role_promotion_requests_user_id_idx ON role_promotion_requests(user_id);
CREATE INDEX IF NOT EXISTS role_promotion_requests_status_idx ON role_promotion_requests(status);
CREATE INDEX IF NOT EXISTS role_promotion_requests_created_at_idx ON role_promotion_requests(created_at DESC);

-- Enable RLS
ALTER TABLE role_promotion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own requests
DROP POLICY IF EXISTS "Users can view own promotion requests" ON role_promotion_requests;
CREATE POLICY "Users can view own promotion requests" ON role_promotion_requests
  FOR SELECT USING (user_id = auth.uid());

-- Users can create requests for themselves
DROP POLICY IF EXISTS "Users can create own promotion requests" ON role_promotion_requests;
CREATE POLICY "Users can create own promotion requests" ON role_promotion_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins and moderators can view all requests
DROP POLICY IF EXISTS "Admins can view all promotion requests" ON role_promotion_requests;
CREATE POLICY "Admins can view all promotion requests" ON role_promotion_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Only admins can update requests (approve/reject)
DROP POLICY IF EXISTS "Admins can update promotion requests" ON role_promotion_requests;
CREATE POLICY "Admins can update promotion requests" ON role_promotion_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Request role promotion
CREATE OR REPLACE FUNCTION request_role_promotion(
  p_requested_role TEXT,
  p_reason TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_role TEXT;
  v_existing_request RECORD;
  v_new_request_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current role
  SELECT role INTO v_current_role FROM users WHERE id = v_user_id;
  
  -- Validate requested role
  IF p_requested_role NOT IN ('researcher', 'moderator', 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid requested role');
  END IF;
  
  -- Can't request same or lower role
  IF v_current_role = p_requested_role THEN
    RETURN json_build_object('success', false, 'error', 'You already have this role');
  END IF;
  
  -- Only members can request researcher, researchers can request moderator
  IF v_current_role = 'member' AND p_requested_role NOT IN ('researcher') THEN
    RETURN json_build_object('success', false, 'error', 'Members can only request researcher role');
  END IF;
  
  -- Check for existing pending request
  SELECT * INTO v_existing_request
  FROM role_promotion_requests
  WHERE user_id = v_user_id
    AND requested_role = p_requested_role
    AND status = 'pending';
  
  IF v_existing_request IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You already have a pending request for this role');
  END IF;
  
  -- Create the request
  INSERT INTO role_promotion_requests (user_id, from_role, requested_role, reason)
  VALUES (v_user_id, v_current_role, p_requested_role, p_reason)
  RETURNING id INTO v_new_request_id;
  
  RETURN json_build_object(
    'success', true, 
    'request_id', v_new_request_id,
    'message', 'Your request has been submitted and will be reviewed by an admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Review (approve/reject) a promotion request
CREATE OR REPLACE FUNCTION review_promotion_request(
  p_request_id UUID,
  p_decision TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
  v_request RECORD;
BEGIN
  v_admin_id := auth.uid();
  
  IF v_admin_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check admin role
  SELECT role INTO v_admin_role FROM users WHERE id = v_admin_id;
  IF v_admin_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Only admins can review promotion requests');
  END IF;
  
  -- Validate decision
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RETURN json_build_object('success', false, 'error', 'Decision must be approved or rejected');
  END IF;
  
  -- Get the request
  SELECT * INTO v_request
  FROM role_promotion_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF v_request IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already reviewed');
  END IF;
  
  -- Update the request
  UPDATE role_promotion_requests
  SET status = p_decision,
      admin_notes = p_admin_notes,
      reviewed_by = v_admin_id,
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_request_id;
  
  -- If approved, update the user's role
  IF p_decision = 'approved' THEN
    UPDATE users
    SET role = v_request.requested_role
    WHERE id = v_request.user_id;
    
    -- Send notification to user
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      v_request.user_id,
      'system',
      'Role Promotion Approved',
      'Congratulations! You have been promoted to ' || v_request.requested_role || '.',
      '/settings'
    );
  ELSE
    -- Send rejection notification
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      v_request.user_id,
      'system',
      'Role Request Update',
      'Your request for ' || v_request.requested_role || ' role has been reviewed. Check your profile for details.',
      '/settings'
    );
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Request ' || p_decision);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's promotion request status
CREATE OR REPLACE FUNCTION get_my_promotion_requests()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  RETURN (
    SELECT json_agg(row_to_json(r))
    FROM (
      SELECT id, requested_role, reason, status, admin_notes, created_at, reviewed_at
      FROM role_promotion_requests
      WHERE user_id = v_user_id
      ORDER BY created_at DESC
    ) r
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION request_role_promotion(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION review_promotion_request(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_promotion_requests() TO authenticated;
