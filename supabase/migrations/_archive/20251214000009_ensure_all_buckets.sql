-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('post_images', 'post_images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies (safely created)
DO $$
BEGIN
    -- Resources Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'resources' );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'resources' AND auth.role() = 'authenticated' );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner Update' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'resources' AND auth.uid() = owner ) WITH CHECK ( bucket_id = 'resources' AND auth.uid() = owner );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner Delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'resources' AND auth.uid() = owner );
    END IF;

    -- Avatars Policies (using distinct names to avoid collisions if possible, or reusing if general)
    -- Note: 'Public Access' might collide if not scoped. 
    -- Actually, policies are per table. Multiple 'Public Access' policies on storage.objects is valid? 
    -- improved naming to be safe: 'Public Access Avatars'

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars Public Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Avatars Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars Authenticated Upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Avatars Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars Owner Update' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Avatars Owner Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' AND auth.uid() = owner ) WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars Owner Delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Avatars Owner Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'avatars' AND auth.uid() = owner );
    END IF;

    -- Post Images Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Post Images Public Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Post Images Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'post_images' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Post Images Authenticated Upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Post Images Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'post_images' AND auth.role() = 'authenticated' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Post Images Owner Delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Post Images Owner Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'post_images' AND auth.uid() = owner );
    END IF;

END $$;
