-- Add is_accepted column to posts to track accepted answers
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS posts_is_accepted_idx ON posts(is_accepted);

COMMENT ON COLUMN posts.is_accepted IS 'For answers: indicates if this answer was accepted by the question author.';
