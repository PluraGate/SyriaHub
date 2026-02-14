-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('remix', 'suggestion', 'citation', 'comment')),
  resource_id UUID NOT NULL, -- ID of the post, suggestion, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications (mark as read)" ON notifications;
CREATE POLICY "Users can update their own notifications (mark as read)" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);

-- Functions and Triggers

-- 1. Notify on Remix
CREATE OR REPLACE FUNCTION notify_on_remix()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.forked_from_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, actor_id, type, resource_id)
    SELECT author_id, NEW.author_id, 'remix', NEW.id
    FROM posts
    WHERE id = NEW.forked_from_id
    AND author_id != NEW.author_id; -- Don't notify self
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_remix
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_remix();

-- 2. Notify on Suggestion
CREATE OR REPLACE FUNCTION notify_on_suggestion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, resource_id)
  SELECT author_id, NEW.user_id, 'suggestion', NEW.post_id
  FROM posts
  WHERE id = NEW.post_id
  AND author_id != NEW.user_id; -- Don't notify self
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_suggestion_created
  AFTER INSERT ON suggestions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_suggestion();

-- 3. Notify on Citation
CREATE OR REPLACE FUNCTION notify_on_citation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, resource_id)
  SELECT author_id, (SELECT author_id FROM posts WHERE id = NEW.source_post_id), 'citation', NEW.source_post_id
  FROM posts
  WHERE id = NEW.target_post_id
  AND author_id != (SELECT author_id FROM posts WHERE id = NEW.source_post_id); -- Don't notify self
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_citation_created
  AFTER INSERT ON citations
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_citation();
