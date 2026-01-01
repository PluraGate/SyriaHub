-- Increment post_view_count when a view is recorded
CREATE OR REPLACE FUNCTION handle_post_view_increment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to safely increment views
DROP TRIGGER IF EXISTS trigger_increment_post_view ON post_views;
CREATE TRIGGER trigger_increment_post_view
  AFTER INSERT ON post_views
  FOR EACH ROW
  EXECUTE FUNCTION handle_post_view_increment();

-- Enhanced Researcher Stats Function
-- Aggregates ALL contributions (Posts, Surveys, Polls) and interactions
CREATE OR REPLACE FUNCTION get_comprehensive_researcher_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  v_post_ids UUID[];
BEGIN
  -- Get all user post IDs
  SELECT array_agg(id) INTO v_post_ids FROM posts WHERE author_id = p_user_id;

  SELECT jsonb_build_object(
    'publications', (
      SELECT COUNT(*) FROM posts WHERE author_id = p_user_id
    ) + (
      SELECT COUNT(*) FROM surveys WHERE author_id = p_user_id
    ) + (
      SELECT COUNT(*) FROM polls WHERE author_id = p_user_id
    ),
    'total_views', COALESCE((SELECT SUM(view_count) FROM posts WHERE author_id = p_user_id), 0),
    'total_votes_received', COALESCE((SELECT SUM(vote_count) FROM posts WHERE author_id = p_user_id), 0),
    'comments_received', (
      SELECT COUNT(*) FROM comments WHERE post_id = ANY(v_post_ids)
    ),
    'comments_made', (
      SELECT COUNT(*) FROM comments WHERE user_id = p_user_id
    ),
    'citations_received', (
      SELECT COUNT(*) FROM citations WHERE target_post_id = ANY(v_post_ids)
    ),
    'followers', (
      SELECT COUNT(*) FROM follows WHERE following_id = p_user_id
    ),
    'projects', (
      SELECT COUNT(*) FROM projects WHERE created_by = p_user_id
    ),
    'lab_contributions', (
      SELECT COUNT(*) FROM survey_responses WHERE respondent_id = p_user_id
    ) + (
      SELECT COUNT(*) FROM poll_votes WHERE user_id = p_user_id
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Backfill view_count from existing post_views so the counter isn't 0
UPDATE posts p
SET view_count = (SELECT COUNT(*) FROM post_views pv WHERE pv.post_id = p.id)
WHERE view_count = 0;
