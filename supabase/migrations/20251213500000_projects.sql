-- Create projects table for grouping related content
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'members_only')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Metrics
  post_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Create project members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'contributor', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_id, user_id)
);

-- Create project items table (polymorphic join for posts, resources, events)
CREATE TABLE IF NOT EXISTS project_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('post', 'resource', 'event')),
  item_id UUID NOT NULL,
  display_order INTEGER DEFAULT 0,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_id, item_type, item_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_items_item ON project_items(item_type, item_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;

-- Projects: Anyone can view public projects
DROP POLICY IF EXISTS "Public projects viewable by all" ON projects;
CREATE POLICY "Public projects viewable by all" ON projects
  FOR SELECT
  USING (visibility = 'public' OR visibility = 'members_only');

-- Projects: Members can view private projects
DROP POLICY IF EXISTS "Members can view private projects" ON projects;
CREATE POLICY "Members can view private projects" ON projects
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'public' OR
    visibility = 'members_only' OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
    )
  );

-- Projects: Authenticated users can create projects
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Projects: Owners and admins can update projects
DROP POLICY IF EXISTS "Project admins can update" ON projects;
CREATE POLICY "Project admins can update" ON projects
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin')
    )
  );

-- Project members: Members can view member list
DROP POLICY IF EXISTS "Members can view member list" ON project_members;
CREATE POLICY "Members can view member list" ON project_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_members.project_id 
      AND (
        projects.visibility != 'private' OR
        projects.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm2
          WHERE pm2.project_id = projects.id 
          AND pm2.user_id = auth.uid()
        )
      )
    )
  );

-- Project members: Admins can manage members
DROP POLICY IF EXISTS "Admins can manage members" ON project_members;
CREATE POLICY "Admins can manage members" ON project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_members.project_id 
      AND (
        projects.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm2
          WHERE pm2.project_id = projects.id 
          AND pm2.user_id = auth.uid()
          AND pm2.role IN ('owner', 'admin')
        )
      )
    )
  );

-- Project items: Viewable if project is viewable
DROP POLICY IF EXISTS "Project items viewable with project" ON project_items;
CREATE POLICY "Project items viewable with project" ON project_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_items.project_id
    )
  );

-- Project items: Contributors can add items
DROP POLICY IF EXISTS "Contributors can manage items" ON project_items;
CREATE POLICY "Contributors can manage items" ON project_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_items.project_id 
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin', 'contributor')
    )
  );

-- Function to update project metrics
CREATE OR REPLACE FUNCTION update_project_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET 
      post_count = (SELECT COUNT(*) FROM project_items WHERE project_id = NEW.project_id AND item_type = 'post')
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET 
      post_count = (SELECT COUNT(*) FROM project_items WHERE project_id = OLD.project_id AND item_type = 'post')
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_metrics ON project_items;
CREATE TRIGGER trigger_update_project_metrics
  AFTER INSERT OR DELETE ON project_items
  FOR EACH ROW
  EXECUTE FUNCTION update_project_metrics();

-- Function to update member count
CREATE OR REPLACE FUNCTION update_project_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET member_count = member_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET member_count = member_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_member_count ON project_members;
CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION update_project_member_count();

-- Auto add creator as owner
CREATE OR REPLACE FUNCTION add_project_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_add_project_owner ON projects;
CREATE TRIGGER trigger_add_project_owner
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_project_owner();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_timestamp ON projects;
CREATE TRIGGER trigger_update_project_timestamp
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_timestamp();

-- Add comments
COMMENT ON TABLE projects IS 'Projects for grouping related posts, resources, and events';
COMMENT ON TABLE project_members IS 'Members of projects with roles';
COMMENT ON TABLE project_items IS 'Polymorphic items belonging to projects';
