-- Fix RLS infinite recursion between groups and group_members

-- 1. Create a secure function to check membership without triggering RLS
CREATE OR REPLACE FUNCTION is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = _group_id AND user_id = _user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Groups Policy
DROP POLICY IF EXISTS "Groups viewable by members or public" ON groups;
CREATE POLICY "Groups viewable by members or public" ON groups
  FOR SELECT
  USING (
    visibility = 'public'
    OR created_by = auth.uid()
    OR is_group_member(id, auth.uid())
  );

-- 3. Update Group Members Policy
-- We want members to see other members of the same group
DROP POLICY IF EXISTS "Membership visible to members" ON group_members;
CREATE POLICY "Membership visible to members" ON group_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_members.group_id 
      AND (
        g.created_by = auth.uid() 
        OR is_group_member(g.id, auth.uid())
      )
    )
  );
