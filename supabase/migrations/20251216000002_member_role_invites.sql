-- ============================================
-- MEMBER ROLE & ROLE-BASED INVITATIONS
-- ============================================

-- 1. Add 'member' to the role check constraint on users table
-- First, drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint with 'member' role
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('member', 'researcher', 'moderator', 'admin'));

-- 2. Add target_role column to invite_codes table
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'member' 
  CHECK (target_role IN ('member', 'researcher'));

-- 3. Update create_invite_code function for role-based quotas
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
  max_invites_per_role INTEGER := 5; -- Max invites per role type
BEGIN
  -- Validate target_role
  IF p_target_role NOT IN ('member', 'researcher') THEN
    RAISE EXCEPTION 'Invalid target role. Must be member or researcher.';
  END IF;

  -- Check user's existing active invite count for this role type
  SELECT COUNT(*) INTO user_invite_count
  FROM invite_codes
  WHERE created_by = p_user_id 
    AND is_active = true
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

-- 4. Update validate_invite_code to return target_role
CREATE OR REPLACE FUNCTION validate_invite_code(p_code VARCHAR(12))
RETURNS JSON AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM invite_codes
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses;

  IF invite_record IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid or expired invite code');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'invite_id', invite_record.id,
    'inviter_id', invite_record.created_by,
    'note', invite_record.note,
    'target_role', invite_record.target_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update get_user_invite_stats to return separate counts by role
CREATE OR REPLACE FUNCTION get_user_invite_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_invites_created', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id),
    'researcher_invites', json_build_object(
      'active', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true AND target_role = 'researcher'),
      'used', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND current_uses > 0 AND target_role = 'researcher'),
      'remaining', 5 - (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true AND target_role = 'researcher')
    ),
    'member_invites', json_build_object(
      'active', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true AND target_role = 'member'),
      'used', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND current_uses > 0 AND target_role = 'member'),
      'remaining', 5 - (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true AND target_role = 'member')
    ),
    'people_invited', (SELECT COUNT(*) FROM users WHERE invited_by = p_user_id)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Update use_invite_code to set the correct role on the user
CREATE OR REPLACE FUNCTION use_invite_code(p_code VARCHAR(12), p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM invite_codes
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses;

  IF invite_record IS NULL THEN
    RETURN false;
  END IF;

  -- Update invite code
  UPDATE invite_codes
  SET current_uses = current_uses + 1,
      used_by = p_user_id,
      used_at = NOW(),
      is_active = CASE WHEN current_uses + 1 >= max_uses THEN false ELSE true END
  WHERE id = invite_record.id;

  -- Update user with invite info AND set role based on invite target_role
  UPDATE users
  SET invite_code_used = invite_record.id,
      invited_by = invite_record.created_by,
      role = invite_record.target_role
  WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION create_invite_code(UUID, TEXT, TEXT) TO authenticated;
