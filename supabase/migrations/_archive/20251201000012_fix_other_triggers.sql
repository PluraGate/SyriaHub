-- Update notify_on_solution with exception handling and search_path
CREATE OR REPLACE FUNCTION notify_on_solution()
RETURNS TRIGGER AS $$
DECLARE
  v_question_title TEXT;
  v_question_id UUID;
BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Log error and continue
    RAISE WARNING 'Error in notify_on_solution trigger: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update notify_on_reply with exception handling and search_path
CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_author_id UUID;
  v_post_title TEXT;
  v_post_id UUID;
BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Log error and continue
    RAISE WARNING 'Error in notify_on_reply trigger: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
