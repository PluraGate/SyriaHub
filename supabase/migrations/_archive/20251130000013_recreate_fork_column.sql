-- Recreate forked_from_id to ensure correct FK name
ALTER TABLE posts DROP COLUMN IF EXISTS forked_from_id;

ALTER TABLE posts 
ADD COLUMN forked_from_id UUID CONSTRAINT posts_forked_from_id_fkey REFERENCES posts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS posts_forked_from_id_idx ON posts(forked_from_id);

COMMENT ON COLUMN posts.forked_from_id IS 'References the original post if this is a fork.';
