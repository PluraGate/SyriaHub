DO $$
BEGIN
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_forked_from_id_fkey;
    ALTER TABLE posts 
      ADD CONSTRAINT posts_forked_from_id_fkey 
      FOREIGN KEY (forked_from_id) 
      REFERENCES posts(id) 
      ON DELETE SET NULL;
END $$;
