DO $$
BEGIN
    -- 1. Create groups table if it doesn't exist (Simplified check)
    CREATE TABLE IF NOT EXISTS groups (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'restricted', 'public')),
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- 2. Create posts.group_id column (Requires groups table first)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'group_id'
    ) THEN
        ALTER TABLE posts 
        ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_posts_group_id ON posts(group_id);
    END IF;

    -- 3. Reload schema
    NOTIFY pgrst, 'reload schema';
END $$;
