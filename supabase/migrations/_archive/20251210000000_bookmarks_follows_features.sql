-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_post_id_idx ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON bookmarks(created_at DESC);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- USER FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================
-- ADD PARENT_ID TO COMMENTS (for nesting)
-- ============================================
ALTER TABLE comments 
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);

-- ============================================
-- HOT SCORE FUNCTION (Reddit-style algorithm)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_hot_score(
  votes INTEGER,
  created_at TIMESTAMPTZ
) RETURNS FLOAT AS $$
DECLARE
  age_hours FLOAT;
  gravity FLOAT := 1.8;
BEGIN
  age_hours := EXTRACT(EPOCH FROM (now() - created_at)) / 3600;
  -- Prevent division issues with very new posts
  IF age_hours < 1 THEN
    age_hours := 1;
  END IF;
  RETURN COALESCE(votes, 0) / POWER(age_hours + 2, gravity);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get bookmark count for a post
CREATE OR REPLACE FUNCTION get_bookmark_count(p_post_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM bookmarks WHERE post_id = p_post_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user bookmarked a post
CREATE OR REPLACE FUNCTION is_bookmarked(p_user_id UUID, p_post_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bookmarks 
    WHERE user_id = p_user_id AND post_id = p_post_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE following_id = p_user_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE follower_id = p_user_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user is following another
CREATE OR REPLACE FUNCTION is_following(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = p_follower_id AND following_id = p_following_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_hot_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_bookmark_count TO authenticated;
GRANT EXECUTE ON FUNCTION is_bookmarked TO authenticated;
GRANT EXECUTE ON FUNCTION get_follower_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_following_count TO authenticated;
GRANT EXECUTE ON FUNCTION is_following TO authenticated;
