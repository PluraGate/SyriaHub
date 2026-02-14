-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mention', 'reply', 'follow', 'fork', 'citation', 'like', 'system', 'moderation')),
  title TEXT NOT NULL,
  message TEXT,
  url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Reference to actor who triggered the notification
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Reference to related content
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User preferences: Users can only access their own preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Notifications: Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Notifications: Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Notifications: Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- System/moderators can create notifications for any user
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't notify user of their own actions
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (
    user_id, type, title, message, url, actor_id, post_id, comment_id, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_url, p_actor_id, p_post_id, p_comment_id, p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Notify on new comment reply
CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_author_id UUID;
  v_post_title TEXT;
  v_actor_name TEXT;
BEGIN
  -- Only for replies (comments with parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get parent comment author
    SELECT author_id INTO v_parent_author_id
    FROM comments WHERE id = NEW.parent_id;
    
    -- Get post title
    SELECT title INTO v_post_title FROM posts WHERE id = NEW.post_id;
    
    -- Get actor name
    SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.author_id;
    
    -- Create notification
    PERFORM create_notification(
      v_parent_author_id,
      'reply',
      v_actor_name || ' replied to your comment',
      LEFT(NEW.content, 100),
      '/post/' || NEW.post_id || '#comment-' || NEW.id,
      NEW.author_id,
      NEW.post_id,
      NEW.id,
      jsonb_build_object('actor_name', v_actor_name, 'post_title', v_post_title)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_comment_reply ON comments;
CREATE TRIGGER trigger_notify_comment_reply
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment_reply();

-- Trigger: Notify post author on new comment
CREATE OR REPLACE FUNCTION notify_on_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_post_title TEXT;
  v_actor_name TEXT;
BEGIN
  -- Only for top-level comments (no parent)
  IF NEW.parent_id IS NULL THEN
    -- Get post info
    SELECT author_id, title INTO v_post_author_id, v_post_title
    FROM posts WHERE id = NEW.post_id;
    
    -- Get actor name
    SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.author_id;
    
    -- Create notification (skip if commenting on own post)
    IF v_post_author_id != NEW.author_id THEN
      PERFORM create_notification(
        v_post_author_id,
        'reply',
        v_actor_name || ' commented on your post',
        LEFT(NEW.content, 100),
        '/post/' || NEW.post_id || '#comment-' || NEW.id,
        NEW.author_id,
        NEW.post_id,
        NEW.id,
        jsonb_build_object('actor_name', v_actor_name, 'post_title', v_post_title)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_post_comment ON comments;
CREATE TRIGGER trigger_notify_post_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_post_comment();

-- Trigger: Notify on new follower
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_name TEXT;
BEGIN
  SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.follower_id;
  
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    v_actor_name || ' started following you',
    NULL,
    '/profile/' || NEW.follower_id,
    NEW.follower_id,
    NULL,
    NULL,
    jsonb_build_object('actor_name', v_actor_name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_follow ON follows;
CREATE TRIGGER trigger_notify_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_preferences_timestamp ON user_preferences;
CREATE TRIGGER trigger_update_preferences_timestamp
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_timestamp();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Comments
COMMENT ON TABLE user_preferences IS 'User preferences for theme, notifications, display settings';
COMMENT ON TABLE notifications IS 'User notifications with support for various types';
COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications with actor/content references';
