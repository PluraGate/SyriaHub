-- ============================================
-- ENDORSEMENT SYSTEM
-- ============================================
-- LinkedIn-style skill endorsements for users

-- ============================================
-- 1. SKILLS TABLE
-- ============================================
-- Skills that users can claim and be endorsed for

CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Research Methods',
    'Technical',
    'Domain Knowledge', 
    'Work Field',
    'Practical Expertise'
  )),
  is_recognized BOOLEAN DEFAULT false, -- Pre-defined skills are "recognized"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Index for searching skills
CREATE INDEX IF NOT EXISTS skills_name_idx ON skills(name);
CREATE INDEX IF NOT EXISTS skills_category_idx ON skills(category);

-- ============================================
-- 2. USER SKILLS TABLE
-- ============================================
-- Skills that a user claims to have

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS user_skills_user_id_idx ON user_skills(user_id);

-- ============================================
-- 3. ENDORSEMENTS TABLE
-- ============================================
-- Who endorsed whom for which skill

CREATE TABLE IF NOT EXISTS endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endorsed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- One endorsement per skill per user pair
  UNIQUE(endorser_id, endorsed_user_id, skill_id),
  -- Cannot endorse yourself
  CHECK (endorser_id != endorsed_user_id)
);

CREATE INDEX IF NOT EXISTS endorsements_endorsed_user_id_idx ON endorsements(endorsed_user_id);
CREATE INDEX IF NOT EXISTS endorsements_skill_id_idx ON endorsements(skill_id);

-- ============================================
-- 4. RLS POLICIES
-- ============================================

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

-- Skills: Anyone can view, authenticated users can create custom skills
CREATE POLICY "Anyone can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create skills" ON skills 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Skills: Anyone can view, users can manage their own
CREATE POLICY "Anyone can view user skills" ON user_skills FOR SELECT USING (true);
CREATE POLICY "Users can add their own skills" ON user_skills 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own skills" ON user_skills 
  FOR DELETE USING (auth.uid() = user_id);

-- Endorsements: Anyone can view, authenticated users can manage their own endorsements
CREATE POLICY "Anyone can view endorsements" ON endorsements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can endorse others" ON endorsements 
  FOR INSERT WITH CHECK (auth.uid() = endorser_id);
CREATE POLICY "Users can remove their own endorsements" ON endorsements 
  FOR DELETE USING (auth.uid() = endorser_id);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Get user's skills with endorsement counts
CREATE OR REPLACE FUNCTION get_user_endorsements(p_user_id UUID)
RETURNS TABLE (
  skill_id UUID,
  skill_name TEXT,
  skill_category TEXT,
  is_recognized BOOLEAN,
  endorsement_count BIGINT,
  endorsers JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS skill_id,
    s.name AS skill_name,
    s.category AS skill_category,
    s.is_recognized,
    COUNT(e.id) AS endorsement_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', u.id,
          'name', u.name,
          'avatar_url', u.avatar_url
        ) ORDER BY e.created_at DESC
      ) FILTER (WHERE u.id IS NOT NULL),
      '[]'::jsonb
    ) AS endorsers
  FROM user_skills us
  JOIN skills s ON us.skill_id = s.id
  LEFT JOIN endorsements e ON e.skill_id = s.id AND e.endorsed_user_id = p_user_id
  LEFT JOIN users u ON e.endorser_id = u.id
  WHERE us.user_id = p_user_id
  GROUP BY s.id, s.name, s.category, s.is_recognized
  ORDER BY endorsement_count DESC, s.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user has endorsed a skill
CREATE OR REPLACE FUNCTION has_endorsed_skill(
  p_endorser_id UUID,
  p_endorsed_user_id UUID,
  p_skill_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM endorsements 
    WHERE endorser_id = p_endorser_id 
    AND endorsed_user_id = p_endorsed_user_id 
    AND skill_id = p_skill_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Find or create a skill (for custom skills)
CREATE OR REPLACE FUNCTION find_or_create_skill(
  p_name TEXT,
  p_category TEXT,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_skill_id UUID;
BEGIN
  -- Check if skill exists (case-insensitive)
  SELECT id INTO v_skill_id FROM skills WHERE LOWER(name) = LOWER(p_name);
  
  -- If not found, create it
  IF v_skill_id IS NULL THEN
    INSERT INTO skills (name, category, is_recognized, created_by)
    VALUES (p_name, p_category, false, p_created_by)
    RETURNING id INTO v_skill_id;
  END IF;
  
  RETURN v_skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. SEED RECOGNIZED SKILLS
-- ============================================

INSERT INTO skills (name, category, is_recognized) VALUES
  -- Research Methods
  ('Data Analysis', 'Research Methods', true),
  ('Qualitative Research', 'Research Methods', true),
  ('Quantitative Research', 'Research Methods', true),
  ('Survey Design', 'Research Methods', true),
  ('Statistical Analysis', 'Research Methods', true),
  ('Literature Review', 'Research Methods', true),
  ('Peer Review', 'Research Methods', true),
  
  -- Technical
  ('Machine Learning', 'Technical', true),
  ('GIS Mapping', 'Technical', true),
  ('Data Visualization', 'Technical', true),
  ('Python', 'Technical', true),
  ('R Programming', 'Technical', true),
  ('SPSS', 'Technical', true),
  ('Database Management', 'Technical', true),
  
  -- Domain Knowledge
  ('Humanitarian Response', 'Domain Knowledge', true),
  ('Public Health', 'Domain Knowledge', true),
  ('Economics', 'Domain Knowledge', true),
  ('Political Science', 'Domain Knowledge', true),
  ('Sociology', 'Domain Knowledge', true),
  ('Environmental Science', 'Domain Knowledge', true),
  ('Education', 'Domain Knowledge', true),
  
  -- Work Field
  ('Project Management', 'Work Field', true),
  ('Grant Writing', 'Work Field', true),
  ('Policy Analysis', 'Work Field', true),
  ('Monitoring & Evaluation', 'Work Field', true),
  ('Field Research', 'Work Field', true),
  ('Report Writing', 'Work Field', true),
  
  -- Practical Expertise
  ('Community Engagement', 'Practical Expertise', true),
  ('Stakeholder Management', 'Practical Expertise', true),
  ('Training & Facilitation', 'Practical Expertise', true),
  ('Crisis Management', 'Practical Expertise', true),
  ('Cross-cultural Communication', 'Practical Expertise', true),
  ('Team Leadership', 'Practical Expertise', true)
ON CONFLICT (name) DO NOTHING;
