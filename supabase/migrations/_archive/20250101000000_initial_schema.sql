-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'researcher' CHECK (role IN ('researcher', 'moderator', 'admin')),
  bio TEXT,
  affiliation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Anyone can view user profiles" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage roles" ON roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT UNIQUE NOT NULL,
  discipline TEXT,
  color TEXT DEFAULT '#3B82F6'
);

-- Index for tags
CREATE INDEX IF NOT EXISTS tags_label_idx ON tags(label);
CREATE INDEX IF NOT EXISTS tags_discipline_idx ON tags(discipline);

-- Enable RLS on tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Anyone can view tags" ON tags
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags" ON tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Moderators and admins can manage tags" ON tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN(tags);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Anyone can read posts" ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts or moderators/admins can delete any" ON posts
  FOR DELETE
  USING (
    auth.uid() = author_id 
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments or moderators/admins can delete any" ON comments
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS reports_post_id_idx ON reports(post_id);
CREATE INDEX IF NOT EXISTS reports_reporter_id_idx ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);

-- Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators and admins can view all reports" ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Authenticated users can create reports" ON reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators and admins can update reports" ON reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================
-- CITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  target_post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT different_posts CHECK (source_post_id != target_post_id)
);

-- Indexes for citations
CREATE INDEX IF NOT EXISTS citations_source_post_id_idx ON citations(source_post_id);
CREATE INDEX IF NOT EXISTS citations_target_post_id_idx ON citations(target_post_id);

-- Enable RLS on citations
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for citations
CREATE POLICY "Anyone can view citations" ON citations
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create citations" ON citations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete citations from their own posts" ON citations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = citations.source_post_id 
      AND posts.author_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous User'),
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES
  ('researcher', '{"can_post": true, "can_comment": true, "can_report": true}'::jsonb),
  ('moderator', '{"can_post": true, "can_comment": true, "can_report": true, "can_moderate": true, "can_delete_posts": true, "can_delete_comments": true}'::jsonb),
  ('admin', '{"can_post": true, "can_comment": true, "can_report": true, "can_moderate": true, "can_delete_posts": true, "can_delete_comments": true, "can_manage_users": true, "can_manage_roles": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert sample tags
INSERT INTO tags (label, discipline, color) VALUES
  ('Humanitarian Aid', 'Social Sciences', '#EF4444'),
  ('Conflict Resolution', 'Political Science', '#F59E0B'),
  ('Public Health', 'Medicine', '#10B981'),
  ('Education', 'Education', '#3B82F6'),
  ('Infrastructure', 'Engineering', '#6366F1'),
  ('Migration', 'Social Sciences', '#8B5CF6'),
  ('Economic Development', 'Economics', '#EC4899'),
  ('Cultural Heritage', 'Anthropology', '#F97316'),
  ('Environmental Studies', 'Environmental Science', '#14B8A6'),
  ('Security Studies', 'Political Science', '#DC2626'),
  ('Psychology', 'Psychology', '#A855F7'),
  ('Legal Framework', 'Law', '#0EA5E9'),
  ('Agriculture', 'Agriculture', '#84CC16'),
  ('Technology', 'Computer Science', '#06B6D4'),
  ('Data Analysis', 'Statistics', '#8B5CF6')
ON CONFLICT (label) DO NOTHING;

-- Note: Sample users and posts should be created through the application
-- after Auth is enabled, as they require proper auth.users entries.
-- The trigger will automatically create user profiles when users sign up.

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View to get post statistics
CREATE OR REPLACE VIEW post_stats AS
SELECT 
  p.id,
  p.title,
  p.author_id,
  u.name as author_name,
  p.created_at,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT cit.id) as citation_count
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN citations cit ON p.id = cit.target_post_id
GROUP BY p.id, p.title, p.author_id, u.name, p.created_at;
