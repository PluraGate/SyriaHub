-- Add parent_id to posts to support threaded content (e.g. Answers to Questions)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES posts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS posts_parent_id_idx ON posts(parent_id);

COMMENT ON COLUMN posts.parent_id IS 'References the parent post. Used for Answers (parent=Question) or threaded discussions.';
