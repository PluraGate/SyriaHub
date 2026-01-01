-- Migration: Respect user notification preferences
-- Updates trigger functions to check user_preferences before creating notifications

-- Function for comment replies
CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER AS $$
BEGIN
    -- Do not notify if user is replying to their own comment
    IF NEW.author_id = (SELECT author_id FROM comments WHERE id = NEW.parent_id) THEN
        RETURN NEW;
    END IF;

    -- Check if recipient wants notifications (push_replies or email_replies)
    IF EXISTS (
        SELECT 1 FROM user_preferences
        WHERE user_id = (SELECT author_id FROM comments WHERE id = NEW.parent_id)
        AND (
            (preferences->'notifications'->>'push_replies')::boolean = true OR
            (preferences->'notifications'->>'email_replies')::boolean = true
        )
    ) THEN
        INSERT INTO notifications (user_id, type, actor_id, resource_id, resource_type, metadata)
        VALUES (
            (SELECT author_id FROM comments WHERE id = NEW.parent_id),
            'reply',
            NEW.author_id,
            NEW.post_id,
            'post',
            jsonb_build_object('comment_id', NEW.id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function for new followers
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if recipient wants notifications (push_follows or email_follows)
    IF EXISTS (
        SELECT 1 FROM user_preferences
        WHERE user_id = NEW.following_id
        AND (
            (preferences->'notifications'->>'push_follows')::boolean = true OR
            (preferences->'notifications'->>'email_follows')::boolean = true
        )
    ) THEN
        INSERT INTO notifications (user_id, type, actor_id, resource_id, resource_type)
        VALUES (
            NEW.following_id,
            'follow',
            NEW.follower_id,
            NEW.follower_id,
            'user'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
