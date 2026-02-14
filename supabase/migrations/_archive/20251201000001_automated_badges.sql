-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_badges()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_post_count INTEGER;
  v_solution_count INTEGER;
  v_reputation INTEGER;
  v_badge RECORD;
  v_criteria JSONB;
BEGIN
  -- Determine user_id based on the table and operation
  IF TG_TABLE_NAME = 'posts' THEN
    IF TG_OP = 'INSERT' THEN
      v_user_id := NEW.author_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE THEN
      v_user_id := NEW.author_id; -- The answer author gets the badge
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_TABLE_NAME = 'users' THEN
    v_user_id := NEW.id;
  ELSE
    RETURN NEW;
  END IF;

  -- Get user stats
  SELECT 
    (SELECT COUNT(*) FROM posts WHERE author_id = v_user_id AND status = 'published' AND content_type != 'answer') as post_count,
    (SELECT COUNT(*) FROM posts WHERE author_id = v_user_id AND is_accepted = TRUE) as solution_count,
    reputation
  INTO v_post_count, v_solution_count, v_reputation
  FROM users
  WHERE id = v_user_id;

  -- Loop through all badges with criteria
  FOR v_badge IN SELECT * FROM badges WHERE criteria IS NOT NULL LOOP
    v_criteria := v_badge.criteria;
    
    -- Check criteria
    IF (v_criteria->>'type' = 'post_count' AND v_post_count >= (v_criteria->>'threshold')::INTEGER) OR
       (v_criteria->>'type' = 'solution_count' AND v_solution_count >= (v_criteria->>'threshold')::INTEGER) OR
       (v_criteria->>'type' = 'reputation_score' AND v_reputation >= (v_criteria->>'threshold')::INTEGER) THEN
       
       -- Award badge if not already owned
       INSERT INTO user_badges (user_id, badge_id)
       VALUES (v_user_id, v_badge.id)
       ON CONFLICT (user_id, badge_id) DO NOTHING;
       
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Post Creation (Post Count Badges)
CREATE TRIGGER check_badges_on_post_create
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION check_badges();

-- Trigger for Answer Acceptance (Solution Count Badges)
CREATE TRIGGER check_badges_on_solution
  AFTER UPDATE OF is_accepted ON posts
  FOR EACH ROW
  WHEN (NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE)
  EXECUTE FUNCTION check_badges();

-- Trigger for Reputation Change (Reputation Badges)
CREATE TRIGGER check_badges_on_reputation
  AFTER UPDATE OF reputation ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_badges();

-- Seed Standard Badges
INSERT INTO badges (name, description, icon_url, criteria) VALUES
  ('First Step', 'Created your first post', 'footprints', '{"type": "post_count", "threshold": 1}'),
  ('Regular Contributor', 'Created 10 posts', 'pen_tool', '{"type": "post_count", "threshold": 10}'),
  ('Problem Solver', 'Had 5 answers accepted', 'check_circle', '{"type": "solution_count", "threshold": 5}'),
  ('Expert', 'Reached 100 reputation points', 'star', '{"type": "reputation_score", "threshold": 100}')
ON CONFLICT (name) DO UPDATE 
SET criteria = EXCLUDED.criteria;
