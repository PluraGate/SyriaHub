-- Add vote_count to posts for performance
ALTER TABLE posts ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- Function to update vote_count
CREATE OR REPLACE FUNCTION update_post_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE posts
    SET vote_count = (
      SELECT COALESCE(SUM(value), 0)
      FROM post_votes
      WHERE post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
    RETURN OLD;
  ELSE
    UPDATE posts
    SET vote_count = (
      SELECT COALESCE(SUM(value), 0)
      FROM post_votes
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to maintain vote_count
DROP TRIGGER IF EXISTS on_post_vote_change ON post_votes;
CREATE TRIGGER on_post_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_count();
