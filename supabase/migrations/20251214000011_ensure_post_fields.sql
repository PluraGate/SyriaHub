DO $$
BEGIN
    -- Ensure license column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'license'
    ) THEN
        ALTER TABLE posts ADD COLUMN license TEXT;
    END IF;

    -- Ensure cover_image_url column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'cover_image_url'
    ) THEN
        ALTER TABLE posts ADD COLUMN cover_image_url TEXT;
    END IF;

    -- Reload schema
    NOTIFY pgrst, 'reload schema';
END $$;
