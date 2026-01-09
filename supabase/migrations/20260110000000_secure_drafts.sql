-- Migration: Secure Drafts via RLS
-- Description: Drop insecure "Anyone can read posts" policy and replace with specific policies for authors, public, and admins.

-- 1. Drop existing insecure policy
DROP POLICY IF EXISTS "Anyone can read posts" ON posts;

-- 2. Policy for Authors (can see their own posts regardless of status)
CREATE POLICY "Authors can view own posts" ON posts
  FOR SELECT
  USING (auth.uid() = author_id);

-- 3. Policy for Public (published and archived only)
-- Note: 'queued' posts are not visible to public. 'draft' posts are not visible to public.
CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT
  USING (status IN ('published', 'archived'));

-- 4. Policy for Admins/Moderators (everything except drafts)
-- Admins need to see 'queued', 'published', 'archived'.
-- They should NOT see 'draft' (unfinished work).
CREATE POLICY "Admins and moderators can view submitted posts" ON posts
  FOR SELECT
  USING (
    status != 'draft' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );
