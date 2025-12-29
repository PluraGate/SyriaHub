-- Fix poll vote count calculation
-- The existing trigger only fires on INSERT/DELETE, not UPDATE
-- This adds UPDATE to properly recalculate when users change their votes via upsert

-- Drop and recreate the trigger to include UPDATE
DROP TRIGGER IF EXISTS trigger_update_poll_votes ON poll_votes;

-- The function already exists and handles the logic correctly
-- We just need to recreate the trigger to also fire on UPDATE
CREATE TRIGGER trigger_update_poll_votes
    AFTER INSERT OR UPDATE OR DELETE ON poll_votes
    FOR EACH ROW EXECUTE FUNCTION update_poll_votes();

-- Also ensure the OLD record's poll gets updated on DELETE/UPDATE
CREATE OR REPLACE FUNCTION update_poll_votes()
RETURNS TRIGGER AS $$
DECLARE
    target_poll_id UUID;
BEGIN
    -- Determine which poll to update
    IF TG_OP = 'DELETE' THEN
        target_poll_id := OLD.poll_id;
    ELSE
        target_poll_id := NEW.poll_id;
    END IF;

    -- Update total_votes count
    UPDATE polls 
    SET total_votes = (
        SELECT COUNT(*) FROM poll_votes WHERE poll_id = target_poll_id
    )
    WHERE id = target_poll_id;
    
    -- Update individual option counts in JSONB
    UPDATE polls
    SET options = (
        SELECT jsonb_agg(
            jsonb_set(
                opt,
                '{vote_count}',
                to_jsonb(COALESCE((
                    SELECT COUNT(*) FROM poll_votes 
                    WHERE poll_id = target_poll_id 
                    AND opt->>'id' = ANY(option_ids)
                ), 0))
            )
        )
        FROM jsonb_array_elements(options) AS opt
    )
    WHERE id = target_poll_id;

    -- If UPDATE changed poll_id (shouldn't happen but handle it), update old poll too
    IF TG_OP = 'UPDATE' AND OLD.poll_id IS DISTINCT FROM NEW.poll_id THEN
        UPDATE polls 
        SET total_votes = (
            SELECT COUNT(*) FROM poll_votes WHERE poll_id = OLD.poll_id
        )
        WHERE id = OLD.poll_id;
        
        UPDATE polls
        SET options = (
            SELECT jsonb_agg(
                jsonb_set(
                    opt,
                    '{vote_count}',
                    to_jsonb(COALESCE((
                        SELECT COUNT(*) FROM poll_votes 
                        WHERE poll_id = OLD.poll_id 
                        AND opt->>'id' = ANY(option_ids)
                    ), 0))
                )
            )
            FROM jsonb_array_elements(options) AS opt
        )
        WHERE id = OLD.poll_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- One-time fix: Recalculate all poll vote counts to fix any existing incorrect data
DO $$
DECLARE
    poll_record RECORD;
BEGIN
    FOR poll_record IN SELECT id FROM polls LOOP
        -- Update total_votes
        UPDATE polls 
        SET total_votes = (
            SELECT COUNT(*) FROM poll_votes WHERE poll_id = poll_record.id
        )
        WHERE id = poll_record.id;
        
        -- Update option vote counts
        UPDATE polls
        SET options = (
            SELECT jsonb_agg(
                jsonb_set(
                    opt,
                    '{vote_count}',
                    to_jsonb(COALESCE((
                        SELECT COUNT(*) FROM poll_votes 
                        WHERE poll_id = poll_record.id 
                        AND opt->>'id' = ANY(option_ids)
                    ), 0))
                )
            )
            FROM jsonb_array_elements(polls.options) AS opt
        )
        WHERE id = poll_record.id;
    END LOOP;
END $$;
