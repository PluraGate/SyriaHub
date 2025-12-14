-- ============================================
-- DATA-DRIVEN DESIGN CONTENT IMPORT
-- Tags and Author Setup
-- ============================================

-- 1. Create new tags for Data-Driven Design content
INSERT INTO tags (label, discipline, color) VALUES
  ('data-driven-design', 'Architecture', '#3B82F6'),
  ('biomimicry', 'Architecture', '#10B981'),
  ('hbim', 'Architecture', '#8B5CF6'),
  ('islamic-architecture', 'Architecture', '#F59E0B'),
  ('urban-planning', 'Urban Studies', '#EC4899'),
  ('gis', 'Technology', '#6366F1'),
  ('computational-design', 'Technology', '#14B8A6'),
  ('sustainability', 'Environment', '#22C55E'),
  ('heritage-conservation', 'Architecture', '#EF4444'),
  ('digital-twin', 'Technology', '#0EA5E9'),
  ('parametric-design', 'Architecture', '#A855F7'),
  ('data-visualization', 'Technology', '#F97316')
ON CONFLICT (label) DO NOTHING;

-- 2. Check if author exists, if not create profile
-- Note: The auth.users record needs to be created via Supabase Auth
-- This just ensures the public users profile exists
DO $$
DECLARE
  author_id UUID;
BEGIN
  -- Check if user exists
  SELECT id INTO author_id FROM users WHERE email = 'latif@lavartstudio.com';
  
  IF author_id IS NULL THEN
    RAISE NOTICE 'User latif@lavartstudio.com does not exist. Please create the account first via Supabase Auth.';
  ELSE
    RAISE NOTICE 'User latif@lavartstudio.com exists with ID: %', author_id;
    
    -- Update profile with relevant info
    UPDATE users 
    SET 
      name = COALESCE(name, 'Mohammad Latif'),
      bio = COALESCE(bio, 'Architect and researcher specializing in data-driven design approaches. Founder of LaVart Studio.'),
      affiliation = COALESCE(affiliation, 'LaVart Studio')
    WHERE id = author_id;
  END IF;
END $$;

-- 3. Verify tags were created
SELECT label, discipline, color FROM tags 
WHERE label IN (
  'data-driven-design', 'biomimicry', 'hbim', 'islamic-architecture',
  'urban-planning', 'gis', 'computational-design', 'sustainability',
  'heritage-conservation', 'digital-twin', 'parametric-design', 'data-visualization'
)
ORDER BY discipline, label;
