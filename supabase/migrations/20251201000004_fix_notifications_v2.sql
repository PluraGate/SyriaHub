-- Function to notify on badge award (Fixing FOUND issue using GET DIAGNOSTICS)
CREATE OR REPLACE FUNCTION check_badges()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_post_count INTEGER;
  v_solution_count INTEGER;
  v_reputation INTEGER;
  v_badge RECORD;
  v_criteria JSONB;
  v_rows_affected INTEGER;
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
       
       GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

       -- Notify user if badge was just awarded
       IF v_rows_affected > 0 THEN
         INSERT INTO notifications (user_id, type, title, message, link)
         VALUES (
           v_user_id, 
           'badge', 
           'Badge Earned: ' || v_badge.name, 
           'You have earned the ' || v_badge.name || ' badge!', 
           '/profile/' || v_user_id
         );
       END IF;
       
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
