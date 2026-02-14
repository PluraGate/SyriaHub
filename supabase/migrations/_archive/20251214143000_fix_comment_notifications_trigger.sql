-- Fix triggers that were referencing non-existent author_id column on comments table
-- The comments table uses user_id, not author_id

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
    -- FIXED: Changed author_id to user_id
    SELECT user_id INTO v_parent_author_id
    FROM comments WHERE id = NEW.parent_id;
    
    -- Get post title
    SELECT title INTO v_post_title FROM posts WHERE id = NEW.post_id;
    
    -- Get actor name
    -- FIXED: Changed NEW.author_id to NEW.user_id
    SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
      v_parent_author_id,
      'reply',
      v_actor_name || ' replied to your comment',
      LEFT(NEW.content, 100),
      '/post/' || NEW.post_id || '#comment-' || NEW.id,
      NEW.user_id, -- FIXED: Changed NEW.author_id to NEW.user_id
      NEW.post_id,
      NEW.id,
      jsonb_build_object('actor_name', v_actor_name, 'post_title', v_post_title)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    -- Note: posts table correctly has author_id so this is fine
    SELECT author_id, title INTO v_post_author_id, v_post_title
    FROM posts WHERE id = NEW.post_id;
    
    -- Get actor name
    -- FIXED: Changed NEW.author_id to NEW.user_id
    SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.user_id;
    
    -- Create notification (skip if commenting on own post)
    -- FIXED: Changed NEW.author_id to NEW.user_id
    IF v_post_author_id != NEW.user_id THEN
      PERFORM create_notification(
        v_post_author_id,
        'reply',
        v_actor_name || ' commented on your post',
        LEFT(NEW.content, 100),
        '/post/' || NEW.post_id || '#comment-' || NEW.id,
        NEW.user_id, -- FIXED: Changed NEW.author_id to NEW.user_id
        NEW.post_id,
        NEW.id,
        jsonb_build_object('actor_name', v_actor_name, 'post_title', v_post_title)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
