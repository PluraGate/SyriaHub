-- Ensure metadata column exists on posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ensure content_type check constraint includes 'event'
DO $$
BEGIN
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_type_check;
    ALTER TABLE posts ADD CONSTRAINT posts_content_type_check 
        CHECK (content_type IN ('article', 'question', 'answer', 'resource', 'event'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
