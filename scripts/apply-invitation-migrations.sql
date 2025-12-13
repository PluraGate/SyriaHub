-- ============================================================================
-- SYREALIZE INVITATION SYSTEM MIGRATIONS
-- Run this in your Supabase SQL Editor to enable invite-only signups
-- ============================================================================

-- ============================================
-- 1. INVITE CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(12) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  note TEXT
);

CREATE INDEX IF NOT EXISTS invite_codes_code_idx ON invite_codes(code);
CREATE INDEX IF NOT EXISTS invite_codes_created_by_idx ON invite_codes(created_by);

-- ============================================
-- 2. WAITLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  reason TEXT,
  affiliation VARCHAR(255),
  referral_source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'invited')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invite_code_id UUID REFERENCES invite_codes(id) ON DELETE SET NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);
CREATE INDEX IF NOT EXISTS waitlist_status_idx ON waitlist(status);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist(created_at DESC);

-- ============================================
-- 3. UPDATE USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code_used UUID REFERENCES invite_codes(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Invite codes policies
DROP POLICY IF EXISTS "Users can view their own invites" ON invite_codes;
CREATE POLICY "Users can view their own invites" ON invite_codes
  FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create invites" ON invite_codes;
CREATE POLICY "Users can create invites" ON invite_codes
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Anyone can check invite validity" ON invite_codes;
CREATE POLICY "Anyone can check invite validity" ON invite_codes
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Waitlist policies
DROP POLICY IF EXISTS "Admins can view waitlist" ON waitlist;
CREATE POLICY "Admins can view waitlist" ON waitlist
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update waitlist" ON waitlist;
CREATE POLICY "Admins can update waitlist" ON waitlist
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR(12) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN substr(result, 1, 4) || '-' || substr(result, 5, 4);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_invite_code(p_user_id UUID, p_note TEXT DEFAULT NULL)
RETURNS TABLE (code VARCHAR(12), id UUID) AS $$
DECLARE
  new_code VARCHAR(12);
  new_id UUID;
  user_invite_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_invite_count
  FROM invite_codes WHERE created_by = p_user_id AND is_active = true;

  IF user_invite_count >= 5 THEN
    RAISE EXCEPTION 'Maximum invite limit reached';
  END IF;

  LOOP
    new_code := generate_invite_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM invite_codes WHERE invite_codes.code = new_code);
  END LOOP;

  INSERT INTO invite_codes (code, created_by, note)
  VALUES (new_code, p_user_id, p_note)
  RETURNING invite_codes.id INTO new_id;

  RETURN QUERY SELECT new_code, new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validate_invite_code(p_code VARCHAR(12))
RETURNS JSON AS $$
DECLARE invite_record RECORD;
BEGIN
  SELECT * INTO invite_record FROM invite_codes
  WHERE code = UPPER(TRIM(p_code)) AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW()) AND current_uses < max_uses;

  IF invite_record IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid or expired invite code');
  END IF;

  RETURN json_build_object('valid', true, 'invite_id', invite_record.id, 'inviter_id', invite_record.created_by, 'note', invite_record.note);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION use_invite_code(p_code VARCHAR(12), p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE invite_record RECORD;
BEGIN
  SELECT * INTO invite_record FROM invite_codes
  WHERE code = UPPER(TRIM(p_code)) AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW()) AND current_uses < max_uses;

  IF invite_record IS NULL THEN RETURN false; END IF;

  UPDATE invite_codes SET
    current_uses = current_uses + 1,
    used_by = p_user_id,
    used_at = NOW(),
    is_active = CASE WHEN current_uses + 1 >= max_uses THEN false ELSE true END
  WHERE id = invite_record.id;

  UPDATE users SET invite_code_used = invite_record.id, invited_by = invite_record.created_by
  WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_invite_stats(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_invites_created', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id),
    'active_invites', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true),
    'used_invites', (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND current_uses > 0),
    'people_invited', (SELECT COUNT(*) FROM users WHERE invited_by = p_user_id),
    'remaining_invites', 5 - (SELECT COUNT(*) FROM invite_codes WHERE created_by = p_user_id AND is_active = true)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION generate_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION create_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION validate_invite_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION use_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_invite_stats TO authenticated;

SELECT 'Invitation system migrations applied successfully!' as status;
