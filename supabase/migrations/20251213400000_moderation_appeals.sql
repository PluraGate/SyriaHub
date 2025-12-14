-- Create moderation appeals table
CREATE TABLE IF NOT EXISTS moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  dispute_reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_response TEXT,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_post_id ON moderation_appeals(post_id);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_user_id ON moderation_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_status ON moderation_appeals(status);

-- Enable RLS
ALTER TABLE moderation_appeals ENABLE ROW LEVEL SECURITY;

-- Users can view their own appeals
DROP POLICY IF EXISTS "Users can view own appeals" ON moderation_appeals;
CREATE POLICY "Users can view own appeals" ON moderation_appeals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create appeals for their own flagged posts
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
      AND posts.approval_status = 'flagged'
    )
  );

-- Moderators and admins can view all appeals
DROP POLICY IF EXISTS "Moderators can view all appeals" ON moderation_appeals;
CREATE POLICY "Moderators can view all appeals" ON moderation_appeals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- Only admins can update appeals (resolve them)
DROP POLICY IF EXISTS "Admins can update appeals" ON moderation_appeals;
CREATE POLICY "Admins can update appeals" ON moderation_appeals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_moderation_appeal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_appeal_timestamp ON moderation_appeals;
CREATE TRIGGER trigger_update_appeal_timestamp
  BEFORE UPDATE ON moderation_appeals
  FOR EACH ROW
  EXECUTE FUNCTION update_moderation_appeal_timestamp();

-- Function to auto-set resolved_at when status changes
CREATE OR REPLACE FUNCTION set_appeal_resolution_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
    NEW.resolved_at = NOW();
    NEW.resolved_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_appeal_resolution ON moderation_appeals;
CREATE TRIGGER trigger_appeal_resolution
  BEFORE UPDATE ON moderation_appeals
  FOR EACH ROW
  EXECUTE FUNCTION set_appeal_resolution_timestamp();


-- End

