-- Adds content versioning storage with automatic snapshots on post changes.
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  diff_from_previous JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (post_id, version_number)
);

CREATE INDEX IF NOT EXISTS post_versions_post_id_idx ON post_versions(post_id);
CREATE INDEX IF NOT EXISTS post_versions_created_at_idx ON post_versions(created_at DESC);

CREATE OR REPLACE FUNCTION snapshot_post_version()
RETURNS TRIGGER AS $$
DECLARE
  snapshot RECORD;
  next_version INTEGER;
  acting_user UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    snapshot := NEW;
  ELSE
    snapshot := OLD;
  END IF;

  SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
  FROM post_versions
  WHERE post_id = snapshot.id;

  acting_user := auth.uid();

  INSERT INTO post_versions (
    post_id,
    version_number,
    title,
    content,
    tags,
    author_id,
    editor_id,
    metadata
  ) VALUES (
    snapshot.id,
    next_version,
    snapshot.title,
    snapshot.content,
    snapshot.tags,
    snapshot.author_id,
    acting_user,
    jsonb_build_object(
      'status', snapshot.status,
      'content_type', snapshot.content_type,
      'updated_at', snapshot.updated_at
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS post_version_snapshots ON posts;
CREATE TRIGGER post_version_snapshots
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION snapshot_post_version();

COMMENT ON TABLE post_versions IS 'Immutable snapshots of post content for diffing and rollback.';
COMMENT ON FUNCTION snapshot_post_version() IS 'Captures snapshots of post content whenever posts are created or updated.';
