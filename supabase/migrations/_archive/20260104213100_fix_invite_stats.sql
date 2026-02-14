-- Fix invite stats remaining calculation
-- Bug: remaining was calculated as 5 - active_count
-- Fix: remaining should be 5 - total_invites (active + used)

CREATE OR REPLACE FUNCTION get_user_invite_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  researcher_total INTEGER;
  member_total INTEGER;
  max_per_role INTEGER := 5;
BEGIN
  -- Count total invites per role (both active and used)
  SELECT COUNT(*) INTO researcher_total
  FROM invite_codes 
  WHERE created_by = p_user_id 
    AND target_role = 'researcher';
    
  SELECT COUNT(*) INTO member_total
  FROM invite_codes 
  WHERE created_by = p_user_id 
    AND target_role = 'member';

  SELECT json_build_object(
    'total_invites_created', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id),
    'researcher_invites', json_build_object(
      'active', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true AND current_uses = 0 AND target_role = 'researcher'),
      'used', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND current_uses > 0 AND target_role = 'researcher'),
      'remaining', GREATEST(0, max_per_role - researcher_total)
    ),
    'member_invites', json_build_object(
      'active', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true AND current_uses = 0 AND target_role = 'member'),
      'used', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND current_uses > 0 AND target_role = 'member'),
      'remaining', GREATEST(0, max_per_role - member_total)
    ),
    'people_invited', (SELECT COUNT(*) FROM users WHERE invited_by = p_user_id)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Also fix create_invite_code to check total invites, not just active ones
CREATE OR REPLACE FUNCTION create_invite_code(
  p_user_id UUID, 
  p_note TEXT DEFAULT NULL,
  p_target_role TEXT DEFAULT 'member'
)
RETURNS TABLE (code VARCHAR(12), id UUID) AS $$
DECLARE
  new_code VARCHAR(12);
  new_id UUID;
  user_invite_count INTEGER;
  max_invites_per_role INTEGER := 5;
BEGIN
  -- Validate target_role
  IF p_target_role NOT IN ('member', 'researcher') THEN
    RAISE EXCEPTION 'Invalid target role. Must be member or researcher.';
  END IF;

  -- Check user's TOTAL invite count for this role type (not just active)
  SELECT COUNT(*) INTO user_invite_count
  FROM invite_codes
  WHERE created_by = p_user_id 
    AND target_role = p_target_role;

  IF user_invite_count >= max_invites_per_role THEN
    RAISE EXCEPTION 'Maximum invite limit reached for % role', p_target_role;
  END IF;

  -- Generate unique code
  LOOP
    new_code := generate_invite_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM invite_codes WHERE invite_codes.code = new_code);
  END LOOP;

  -- Insert the invite with target_role
  INSERT INTO invite_codes (code, created_by, note, target_role)
  VALUES (new_code, p_user_id, p_note, p_target_role)
  RETURNING invite_codes.id INTO new_id;

  RETURN QUERY SELECT new_code, new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
