-- Reload Supabase PostgREST Schema Cache
-- Run this in the Supabase SQL Editor to fix "Could not find a relationship" errors

-- Method 1: Use the pg_notify function to trigger schema reload
NOTIFY pgrst, 'reload schema';

-- Method 2: Verify the foreign key exists
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'posts'
  AND kcu.column_name = 'author_id';

-- If the foreign key doesn't exist or has a different name, recreate it:
-- First, drop any existing constraint (if it exists with a different name)
-- ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Then, add the constraint with the explicit name
-- ALTER TABLE posts 
-- ADD CONSTRAINT posts_author_id_fkey 
-- FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Send another reload signal after any changes
-- NOTIFY pgrst, 'reload schema';
