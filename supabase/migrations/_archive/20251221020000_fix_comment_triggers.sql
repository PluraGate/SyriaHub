-- Fix comment notification triggers that incorrectly reference author_id instead of user_id
-- The comments table uses user_id, not author_id

-- Trigger: Notify on new comment reply (FIXED)
CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_author_id UUID;
  v_post_title TEXT;
  v_actor_name TEXT;
BEGIN
  -- Only for replies (comments with parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get parent comment author (use user_id, not author_id)
    SELECT user_id INTO v_parent_author_id
    FROM comments WHERE id = NEW.parent_id;
    
    -- Get post title
    SELECT title INTO v_post_title FROM posts WHERE id = NEW.post_id;
    
    -- Get actor name (use user_id, not author_id)
    SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
      v_parent_author_id,
      'reply',
      v_actor_name || ' replied to your comment',
      LEFT(NEW.content, 100),
      '/post/' || NEW.post_id || '#comment-' || NEW.id,
      NEW.user_id,
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

-- Trigger: Notify post author on new comment (FIXED)
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
    
    -- Get actor name (use user_id, not author_id)
    SELECT COALESCE(name, email) INTO v_actor_name FROM users WHERE id = NEW.user_id;
    
    -- Create notification (skip if commenting on own post)
    IF v_post_author_id != NEW.user_id THEN
      PERFORM create_notification(
        v_post_author_id,
        'reply',
        v_actor_name || ' commented on your post',
        LEFT(NEW.content, 100),
        '/post/' || NEW.post_id || '#comment-' || NEW.id,
        NEW.user_id,
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

-- Also fix the email queue trigger that references author_id
CREATE OR REPLACE FUNCTION public.queue_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
    actor_name TEXT;
BEGIN
    -- Get post details
    SELECT author_id, title INTO post_author_id, post_title
    FROM public.posts
    WHERE id = NEW.post_id;

    -- Get actor name (FIXED: use user_id instead of author_id)
    SELECT name INTO actor_name
    FROM public.users
    WHERE id = NEW.user_id;

    -- Don't notify self (FIXED: use user_id instead of author_id)
    IF post_author_id != NEW.user_id THEN
        INSERT INTO public.queued_emails (user_id, type, payload)
        VALUES (
            post_author_id,
            'new_comment',
            jsonb_build_object(
                'post_title', post_title,
                'comment_preview', LEFT(NEW.content, 100),
                'actor_name', actor_name,
                'post_id', NEW.post_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_created_email ON public.comments;
CREATE TRIGGER on_comment_created_email
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.queue_comment_notification();
