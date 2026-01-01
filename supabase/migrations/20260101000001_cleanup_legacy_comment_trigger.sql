-- Fix: Remove broken legacy trigger that references author_id column which doesn't exist on comments table.
-- The functionality has been replaced by trigger_notify_comment_reply and trigger_notify_post_comment
-- introduced in 20251221020000_fix_comment_triggers.sql.

DROP TRIGGER IF EXISTS notify_on_comment_trigger ON public.comments;

-- Note: We don't drop the function notify_on_reply() because it is still used by 
-- notify_on_answer_trigger on the posts table, where author_id exists.
