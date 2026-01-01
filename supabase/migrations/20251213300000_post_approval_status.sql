-- Add approval status fields to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
  CHECK (approval_status IN ('pending', 'approved', 'flagged', 'rejected'));

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add verified author field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified_author BOOLEAN DEFAULT false;

-- Create index for efficient filtering by approval status
CREATE INDEX IF NOT EXISTS idx_posts_approval_status ON posts(approval_status);
CREATE INDEX IF NOT EXISTS idx_posts_approved_by ON posts(approved_by);

-- Function to auto-set approved_at when status changes to approved
CREATE OR REPLACE FUNCTION set_post_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
    NEW.approved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set approved_at timestamp
DROP TRIGGER IF EXISTS trigger_post_approval_timestamp ON posts;
CREATE TRIGGER trigger_post_approval_timestamp
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION set_post_approval_timestamp();

-- Add RLS policy for moderators to update approval status
DROP POLICY IF EXISTS "Moderators can update post approval status" ON posts;
CREATE POLICY "Moderators can update post approval status" ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- Grant verified author status to admins
DROP POLICY IF EXISTS "Admins can update user verification" ON users;
CREATE POLICY "Admins can update user verification" ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

COMMENT ON COLUMN posts.approval_status IS 'Content moderation status: pending, approved, flagged, or rejected';
COMMENT ON COLUMN posts.approved_by IS 'UUID of the moderator/admin who approved this post';
COMMENT ON COLUMN posts.approved_at IS 'Timestamp when the post was approved';
COMMENT ON COLUMN users.is_verified_author IS 'Whether this user is a verified contributor';
