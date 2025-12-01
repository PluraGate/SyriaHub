-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Add reputation to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;

-- Add accepted_answer_id to posts table (for questions)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS accepted_answer_id UUID REFERENCES posts(id) ON DELETE SET NULL;

-- Enable RLS on badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage badges" ON badges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Enable RLS on user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
CREATE POLICY "Anyone can view user_badges" ON user_badges
  FOR SELECT
  USING (true);

CREATE POLICY "Only system/admins can insert user_badges" ON user_badges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Function to award reputation
CREATE OR REPLACE FUNCTION award_reputation(target_user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET reputation = reputation + points
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a post as the solution
CREATE OR REPLACE FUNCTION mark_solution(question_id UUID, answer_id UUID)
RETURNS VOID AS $$
DECLARE
  v_question_author_id UUID;
  v_answer_author_id UUID;
  v_old_accepted_answer_id UUID;
BEGIN
  -- Get question details
  SELECT author_id, accepted_answer_id INTO v_question_author_id, v_old_accepted_answer_id
  FROM posts
  WHERE id = question_id;

  -- Check if user is the author of the question
  IF v_question_author_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the question author can mark a solution';
  END IF;

  -- Get answer author
  SELECT author_id INTO v_answer_author_id
  FROM posts
  WHERE id = answer_id;

  -- If there was an old accepted answer, unmark it (optional: remove reputation?)
  -- For now, we just update the flags.
  IF v_old_accepted_answer_id IS NOT NULL THEN
    UPDATE posts SET is_accepted = FALSE WHERE id = v_old_accepted_answer_id;
  END IF;

  -- Update question
  UPDATE posts 
  SET accepted_answer_id = answer_id 
  WHERE id = question_id;

  -- Update answer
  UPDATE posts 
  SET is_accepted = TRUE 
  WHERE id = answer_id;

  -- Award reputation to answer author (e.g., 15 points)
  -- Only if not self-accepted
  IF v_question_author_id != v_answer_author_id THEN
    PERFORM award_reputation(v_answer_author_id, 15);
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION award_reputation TO authenticated;
GRANT EXECUTE ON FUNCTION mark_solution TO authenticated;

-- Seed some initial badges
INSERT INTO badges (name, description, icon_url, criteria) VALUES
  ('Verified Researcher', 'Verified academic or institutional researcher', 'verified', '{"type": "manual"}'),
  ('Top Contributor', 'High reputation score', 'star', '{"type": "reputation", "threshold": 1000}'),
  ('Problem Solver', 'Has 10+ accepted answers', 'check_circle', '{"type": "accepted_answers", "count": 10}')
ON CONFLICT (name) DO NOTHING;
