-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('badge', 'solution', 'reply', 'mention', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to notify on badge award (Updates existing check_badges function)
CREATE OR REPLACE FUNCTION check_badges()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_post_count INTEGER;
  v_solution_count INTEGER;
  v_reputation INTEGER;
  v_badge RECORD;
  v_criteria JSONB;
BEGIN
  -- Determine user_id based on the table and operation
  IF TG_TABLE_NAME = 'posts' THEN
    IF TG_OP = 'INSERT' THEN
      v_user_id := NEW.author_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE THEN
      v_user_id := NEW.author_id; -- The answer author gets the badge
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_TABLE_NAME = 'users' THEN
    v_user_id := NEW.id;
  ELSE
    RETURN NEW;
  END IF;

  -- Get user stats
  SELECT 
    (SELECT COUNT(*) FROM posts WHERE author_id = v_user_id AND status = 'published' AND content_type != 'answer') as post_count,
    (SELECT COUNT(*) FROM posts WHERE author_id = v_user_id AND is_accepted = TRUE) as solution_count,
    reputation
  INTO v_post_count, v_solution_count, v_reputation
  FROM users
  WHERE id = v_user_id;

  -- Loop through all badges with criteria
  FOR v_badge IN SELECT * FROM badges WHERE criteria IS NOT NULL LOOP
    v_criteria := v_badge.criteria;
    
    -- Check criteria
    IF (v_criteria->>'type' = 'post_count' AND v_post_count >= (v_criteria->>'threshold')::INTEGER) OR
       (v_criteria->>'type' = 'solution_count' AND v_solution_count >= (v_criteria->>'threshold')::INTEGER) OR
       (v_criteria->>'type' = 'reputation_score' AND v_reputation >= (v_criteria->>'threshold')::INTEGER) THEN
       
       -- Award badge if not already owned
       INSERT INTO user_badges (user_id, badge_id)
       VALUES (v_user_id, v_badge.id)
       ON CONFLICT (user_id, badge_id) DO NOTHING;

       -- Notify user if badge was just awarded (FOUND is true if insert happened)
       IF FOUND THEN
         INSERT INTO notifications (user_id, type, title, message, link)
         VALUES (
           v_user_id, 
           'badge', 
           'Badge Earned: ' || v_badge.name, 
           'You have earned the ' || v_badge.name || ' badge!', 
           '/profile/' || v_user_id
         );
       END IF;
       
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify on accepted answer
CREATE OR REPLACE FUNCTION notify_on_solution()
RETURNS TRIGGER AS $$
DECLARE
  v_question_title TEXT;
  v_question_id UUID;
BEGIN
  -- Get question details
  SELECT title, id INTO v_question_title, v_question_id
  FROM posts
  WHERE id = NEW.parent_id;

  -- Notify answer author
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    NEW.author_id,
    'solution',
    'Solution Accepted!',
    'Your answer to "' || COALESCE(v_question_title, 'a question') || '" was marked as the solution.',
    '/post/' || v_question_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger to avoid errors
DROP TRIGGER IF EXISTS notify_on_solution_trigger ON posts;

-- Trigger for Solution Notification
CREATE TRIGGER notify_on_solution_trigger
  AFTER UPDATE OF is_accepted ON posts
  FOR EACH ROW
  WHEN (NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE)
  EXECUTE FUNCTION notify_on_solution();


-- Function to notify on reply/comment
CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_author_id UUID;
  v_post_title TEXT;
  v_post_id UUID;
BEGIN
  -- Determine parent post
  IF TG_TABLE_NAME = 'comments' THEN
    SELECT author_id, title, id INTO v_parent_author_id, v_post_title, v_post_id
    FROM posts
    WHERE id = NEW.post_id;
  ELSIF TG_TABLE_NAME = 'posts' AND NEW.content_type = 'answer' THEN
    SELECT author_id, title, id INTO v_parent_author_id, v_post_title, v_post_id
    FROM posts
    WHERE id = NEW.parent_id;
  ELSE
    RETURN NEW;
  END IF;

  -- Don't notify if replying to self
  IF v_parent_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;

  -- Notify parent author
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    v_parent_author_id,
    'reply',
    'New Reply',
    'Someone replied to your post "' || COALESCE(v_post_title, 'Untitled') || '".',
    '/post/' || v_post_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers to avoid errors
DROP TRIGGER IF EXISTS notify_on_comment_trigger ON comments;
DROP TRIGGER IF EXISTS notify_on_answer_trigger ON posts;

-- Trigger for Comment Notification
CREATE TRIGGER notify_on_comment_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_reply();

-- Trigger for Answer Notification (treated as reply)
CREATE TRIGGER notify_on_answer_trigger
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN (NEW.content_type = 'answer')
  EXECUTE FUNCTION notify_on_reply();
