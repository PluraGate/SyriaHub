-- Fix versioning trigger to only fire on UPDATE to avoid duplicate initial versions
-- The initial version is the post itself. The versions table stores *past* versions (snapshots).

CREATE OR REPLACE FUNCTION snapshot_post_version()
RETURNS TRIGGER AS $$
DECLARE
  snapshot RECORD;
  next_version INTEGER;
  acting_user UUID;
BEGIN
  -- Only handle UPDATE (store OLD record)
  IF TG_OP = 'UPDATE' THEN
    snapshot := OLD;
  ELSE
    -- Should not happen if trigger is configured correctly, but safe fallback
    RETURN NEW;
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

-- Drop and recreate trigger to only fire on UPDATE
DROP TRIGGER IF EXISTS post_version_snapshots ON posts;
CREATE TRIGGER post_version_snapshots
  AFTER UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION snapshot_post_version();
