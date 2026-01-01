-- Add forking and licensing fields to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS forked_from_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS license TEXT;

CREATE INDEX IF NOT EXISTS posts_forked_from_id_idx ON posts(forked_from_id);

COMMENT ON COLUMN posts.forked_from_id IS 'References the original post if this is a fork.';
COMMENT ON COLUMN posts.license IS 'The license type for this post (e.g., CC-BY-4.0, MIT).';
