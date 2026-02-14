-- Run this SQL directly in your Supabase SQL Editor to fix the error:
-- "record \"new\" has no field \"author_id\""

-- The comments table uses user_id, not author_id.
-- This fixes the notify_on_comment_reply() function.

CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_author_id UUID;
  v_post_title TEXT;
  v_actor_name TEXT;
BEGIN
  -- Only for replies (comments with parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Do not notify if user is replying to their own comment
    IF NEW.user_id = (SELECT user_id FROM comments WHERE id = NEW.parent_id) THEN
        RETURN NEW;
    END IF;

    -- Get parent comment author
    SELECT user_id INTO v_parent_author_id
    FROM comments WHERE id = NEW.parent_id;
    
    -- Check if recipient wants notifications
    IF EXISTS (
        SELECT 1 FROM user_preferences
        WHERE user_id = v_parent_author_id
        AND (
            (preferences->'notifications'->>'push_replies')::boolean = true OR
            (preferences->'notifications'->>'email_replies')::boolean = true
        )
    ) THEN
        -- Get post title
        SELECT title INTO v_post_title FROM posts WHERE id = NEW.post_id;
        
        -- Get actor name
        SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.user_id;
        
        -- Create notification
        INSERT INTO notifications (user_id, type, actor_id, resource_id, resource_type, metadata)
        VALUES (
            v_parent_author_id,
            'reply',
            NEW.user_id,
            NEW.post_id,
            'post',
            jsonb_build_object('comment_id', NEW.id, 'actor_name', v_actor_name, 'post_title', v_post_title)
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS trigger_notify_comment_reply ON comments;
CREATE TRIGGER trigger_notify_comment_reply
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment_reply();
