-- Fix: Update queue_comment_notification to use user_id instead of author_id
-- and ensure legacy triggers are removed.

-- 1. Fix the function from 20251219000100_email_logs.sql
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

    -- Get actor name
    -- FIXED: Changed NEW.author_id to NEW.user_id
    SELECT name INTO actor_name
    FROM public.users
    WHERE id = NEW.user_id;

    -- Don't notify self
    -- FIXED: Changed NEW.author_id to NEW.user_id
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

-- 2. Drop the faulty legacy trigger from 20251201000002_notifications.sql if it still exists
DROP TRIGGER IF EXISTS notify_on_comment_trigger ON public.comments;
