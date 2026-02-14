-- Ensure bookmarks table exists with correct schema and permissions
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookmarks_user_id_fkey'
    ) THEN
        ALTER TABLE public.bookmarks 
        ADD CONSTRAINT bookmarks_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookmarks_post_id_fkey'
    ) THEN
        ALTER TABLE public.bookmarks 
        ADD CONSTRAINT bookmarks_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they are correct
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Ensure indexes
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_post_id_idx ON public.bookmarks(post_id);

-- Grant permissions
GRANT ALL ON public.bookmarks TO authenticated;
GRANT SELECT ON public.bookmarks TO anon;
GRANT ALL ON public.bookmarks TO service_role;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
