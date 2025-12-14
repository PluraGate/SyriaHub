-- Add rejection fields to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Update moderation_appeals policy to allow appeals for rejected posts (not just flagged)
DROP POLICY IF EXISTS "Users can create appeals for own posts" ON moderation_appeals;
CREATE POLICY "Users can create appeals for own posts" ON moderation_appeals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_id 
      AND posts.author_id = auth.uid()
      AND posts.approval_status IN ('flagged', 'rejected')
    )
  );

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
