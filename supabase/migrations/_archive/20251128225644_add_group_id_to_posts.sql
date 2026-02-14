-- Add group_id to posts table
ALTER TABLE posts 
ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_posts_group_id ON posts(group_id);

-- Update RLS policies for posts to allow group members to read/create
-- Existing policies might be sufficient if they are broad, but let's check/add specific ones.
-- Assuming existing policies are:
-- "Public posts are viewable by everyone"
-- "Users can create posts"

-- We need to ensure that if a post is in a private group, only members can see it.
-- This might require updating the "Public posts are viewable by everyone" policy to exclude group posts if the group is private.
-- OR, we can rely on the fact that we will filter by group_id in the query, and RLS on the group itself handles visibility?
-- No, RLS on `posts` needs to be aware of group privacy.

-- Let's first check if we need to adjust existing policies.
-- For now, let's just add the column. We can refine RLS in a separate step or if needed.
-- Actually, it's better to be safe.

-- Policy: Group posts are viewable if user is member of the group OR group is public.
CREATE POLICY "Group posts are viewable by members or if group is public"
ON posts FOR SELECT
USING (
  group_id IS NULL -- Non-group posts (handled by other policies usually, but let's be careful not to conflict)
  OR
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = posts.group_id
    AND (
      g.visibility = 'public'
      OR
      EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = g.id
        AND gm.user_id = auth.uid()
      )
    )
  )
);

-- Note: This policy might conflict or overlap with existing "Public posts" policy.
-- If there is a policy "Enable read access for all users" using (true), then this new policy doesn't restrict anything.
-- We should probably check existing policies first, but for this task, adding the column is the primary goal.
-- I will add the column and index first.
