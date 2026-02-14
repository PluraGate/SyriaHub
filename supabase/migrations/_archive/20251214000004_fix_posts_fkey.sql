-- Ensure the foreign key has the expected name 'posts_author_id_fkey'
-- This is required because the application explicitly references this constraint name.

DO $$
BEGIN
    -- We cannot easily know if there is a 'wrongly named' constraint, 
    -- but we can ensure the 'correctly named' one exists.
    
    -- 1. Drop the specific constraint if it exists (to ensure we recreate it with correct properties)
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

    -- 2. Add the constraint with the explicit name
    ALTER TABLE posts 
      ADD CONSTRAINT posts_author_id_fkey 
      FOREIGN KEY (author_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE;

END $$;
