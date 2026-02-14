-- Introduces private group scaffolding with membership and invitation flows.
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'restricted', 'public')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS groups_visibility_idx ON groups(visibility);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'owner')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_members_user_idx ON group_members(user_id);
CREATE INDEX IF NOT EXISTS group_members_group_idx ON group_members(group_id);

CREATE TABLE IF NOT EXISTS group_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  token UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS group_invitations_group_idx ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS group_invitations_invitee_email_idx ON group_invitations(invitee_email);

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_members_updated_at ON group_members;
CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for groups
DROP POLICY IF EXISTS "Groups viewable by members or public" ON groups;
CREATE POLICY "Groups viewable by members or public" ON groups
  FOR SELECT
  USING (
    visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Group creators manage metadata" ON groups;
CREATE POLICY "Group creators manage metadata" ON groups
  FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policies for group_members
DROP POLICY IF EXISTS "Membership visible to members" ON group_members;
CREATE POLICY "Membership visible to members" ON group_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can manage their entry" ON group_members;
CREATE POLICY "Members can manage their entry" ON group_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members update their entry" ON group_members;
CREATE POLICY "Members update their entry" ON group_members
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members delete their entry" ON group_members;
CREATE POLICY "Members delete their entry" ON group_members
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
  );

-- Policies for group_invitations
DROP POLICY IF EXISTS "Group admins manage invitations" ON group_invitations;
CREATE POLICY "Group admins manage invitations" ON group_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_invitations.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('moderator', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_invitations.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('moderator', 'owner')
    )
  );

COMMENT ON TABLE groups IS 'Private or public community spaces that gate content access.';
COMMENT ON TABLE group_members IS 'Membership assignments for groups, including roles and invitations.';
COMMENT ON TABLE group_invitations IS 'Pending invitations for users to join groups via email tokens.';
