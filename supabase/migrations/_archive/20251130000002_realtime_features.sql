-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL, -- Recipient
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Sender (optional, e.g. system msg)
  type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'invite', 'system')),
  resource_id UUID, -- ID of the related post, group, etc.
  resource_type TEXT CHECK (resource_type IN ('post', 'group', 'comment')),
  content TEXT, -- Short preview or message
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to create notification on new comment
CREATE OR REPLACE FUNCTION notify_post_author_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_title TEXT;
BEGIN
  -- Get post author and title
  SELECT author_id, title INTO post_author_id, post_title
  FROM posts
  WHERE id = NEW.post_id;

  -- Don't notify if commenting on own post
  IF post_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, resource_id, resource_type, content)
    VALUES (
      post_author_id,
      NEW.user_id,
      'comment',
      NEW.post_id,
      'post',
      'commented on your post: ' || substring(post_title from 1 for 20) || '...'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_author_on_comment();

-- ============================================
-- GROUP CHAT
-- ============================================

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS group_messages_group_id_idx ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS group_messages_created_at_idx ON group_messages(created_at ASC);

-- RLS
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view messages" ON group_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can insert messages" ON group_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
