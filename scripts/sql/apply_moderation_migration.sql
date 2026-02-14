-- ================================================================
-- AI MODERATION MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

-- Add new columns to support AI moderation and comment reporting
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS content_type TEXT CHECK (content_type IN ('post', 'comment')),
  ADD COLUMN IF NOT EXISTS content_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS moderation_data JSONB,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Make post_id nullable (since we can now report comments too)
ALTER TABLE reports
  ALTER COLUMN post_id DROP NOT NULL;

-- Add index for comment_id
CREATE INDEX IF NOT EXISTS reports_comment_id_idx ON reports(comment_id);

-- Add index for content_type
CREATE INDEX IF NOT EXISTS reports_content_type_idx ON reports(content_type);

-- Add constraint: must have either post_id or comment_id
ALTER TABLE reports
  ADD CONSTRAINT reports_content_check 
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL AND content_type = 'post') 
    OR 
    (comment_id IS NOT NULL AND post_id IS NULL AND content_type = 'comment')
  );

-- Update existing records to set content_type
UPDATE reports SET content_type = 'post' WHERE post_id IS NOT NULL AND content_type IS NULL;

-- Update RLS policies to handle comment reports
DROP POLICY IF EXISTS "Moderators and admins can view all reports" ON reports;

CREATE POLICY "Moderators and admins can view all reports" ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ================================================================
-- DONE! Migration applied successfully.
-- 
-- Next steps:
-- 1. Add OPENAI_API_KEY to your .env.local file
-- 2. Restart your Next.js dev server
-- 3. Test by creating a post with offensive content
-- ================================================================
