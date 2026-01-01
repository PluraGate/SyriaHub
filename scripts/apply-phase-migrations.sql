-- ============================================
-- CONSOLIDATED NEW MIGRATIONS (Phases 1-3)
-- FULLY DEFENSIVE VERSION
-- Run this in Supabase Studio SQL Editor
-- ============================================

-- ============================================
-- PHASE 1: Post Approval Status
-- ============================================

-- Add approval status columns to posts (safe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='approval_status') THEN
    ALTER TABLE posts ADD COLUMN approval_status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='approved_by') THEN
    ALTER TABLE posts ADD COLUMN approved_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='approved_at') THEN
    ALTER TABLE posts ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified_author') THEN
    ALTER TABLE users ADD COLUMN is_verified_author BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes (safe)
CREATE INDEX IF NOT EXISTS idx_posts_approval_status ON posts(approval_status);

-- ============================================
-- PHASE 1: Moderation Appeals
-- ============================================

CREATE TABLE IF NOT EXISTS moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  dispute_reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  resolution_note TEXT,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='moderation_appeals_post_id_user_id_key') THEN
    ALTER TABLE moderation_appeals ADD CONSTRAINT moderation_appeals_post_id_user_id_key UNIQUE(post_id, user_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_appeals_post ON moderation_appeals(post_id);
CREATE INDEX IF NOT EXISTS idx_appeals_user ON moderation_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON moderation_appeals(status);

ALTER TABLE moderation_appeals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own appeals" ON moderation_appeals;
CREATE POLICY "Users can view own appeals" ON moderation_appeals
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own appeals" ON moderation_appeals;
CREATE POLICY "Users can create own appeals" ON moderation_appeals
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Moderators can view all appeals" ON moderation_appeals;
CREATE POLICY "Moderators can view all appeals" ON moderation_appeals
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')));

DROP POLICY IF EXISTS "Moderators can update appeals" ON moderation_appeals;
CREATE POLICY "Moderators can update appeals" ON moderation_appeals
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')));

-- ============================================
-- PHASE 2: Projects (fully defensive)
-- ============================================

-- Create table only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='projects') THEN
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      cover_image_url TEXT,
      status TEXT DEFAULT 'active',
      visibility TEXT DEFAULT 'public',
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      post_count INTEGER DEFAULT 0,
      member_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      tags TEXT[] DEFAULT '{}',
      metadata JSONB DEFAULT '{}'
    );
  END IF;
END $$;

-- Add all missing columns to projects
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='title') THEN
    ALTER TABLE projects ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='description') THEN
    ALTER TABLE projects ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='cover_image_url') THEN
    ALTER TABLE projects ADD COLUMN cover_image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
    ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='visibility') THEN
    ALTER TABLE projects ADD COLUMN visibility TEXT DEFAULT 'public';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='created_by') THEN
    ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='created_at') THEN
    ALTER TABLE projects ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='updated_at') THEN
    ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='post_count') THEN
    ALTER TABLE projects ADD COLUMN post_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='member_count') THEN
    ALTER TABLE projects ADD COLUMN member_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='view_count') THEN
    ALTER TABLE projects ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='tags') THEN
    ALTER TABLE projects ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='metadata') THEN
    ALTER TABLE projects ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  display_order INTEGER DEFAULT 0,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(project_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public projects viewable by all" ON projects;
CREATE POLICY "Public projects viewable by all" ON projects
  FOR SELECT USING (visibility = 'public' OR visibility = 'members_only');

DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- ============================================
-- PHASE 3: User Preferences
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- Done!
-- ============================================
SELECT 'All Phase 1-3 migrations applied successfully!' AS result;
