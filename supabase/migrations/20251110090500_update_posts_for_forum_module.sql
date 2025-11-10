-- Extends posts for forum/Q&A workflows and introduces vote tracking.
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS content_type TEXT;

UPDATE posts
SET content_type = COALESCE(content_type, 'article');

ALTER TABLE posts
  ALTER COLUMN content_type SET DEFAULT 'article';

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_content_type_check;

ALTER TABLE posts
  ADD CONSTRAINT posts_content_type_check CHECK (content_type IN ('article', 'question', 'answer'));

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS status TEXT;

UPDATE posts
SET status = COALESCE(status, 'published');

ALTER TABLE posts
  ALTER COLUMN status SET DEFAULT 'published';

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE posts
  ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'queued', 'published', 'archived'));

CREATE INDEX IF NOT EXISTS posts_content_type_idx ON posts(content_type);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);

CREATE TABLE IF NOT EXISTS post_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (post_id, voter_id)
);

CREATE INDEX IF NOT EXISTS post_votes_post_id_idx ON post_votes(post_id);
CREATE INDEX IF NOT EXISTS post_votes_voter_id_idx ON post_votes(voter_id);

ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Votes readable by default" ON post_votes;
CREATE POLICY "Votes readable by default" ON post_votes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users upsert their votes" ON post_votes;
CREATE POLICY "Users upsert their votes" ON post_votes
  FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

DROP POLICY IF EXISTS "Users update their own votes" ON post_votes;
CREATE POLICY "Users update their own votes" ON post_votes
  FOR UPDATE
  USING (auth.uid() = voter_id);

DROP POLICY IF EXISTS "Users delete their own votes" ON post_votes;
CREATE POLICY "Users delete their own votes" ON post_votes
  FOR DELETE
  USING (auth.uid() = voter_id);

COMMENT ON COLUMN posts.content_type IS 'Defines whether the post is an article, question, or answer.';
COMMENT ON COLUMN posts.status IS 'Workflow status for forum/Q&A moderation.';
COMMENT ON TABLE post_votes IS 'Tracks up/down votes for posts to power forum reputation signals.';
