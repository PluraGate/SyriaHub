-- Create resources bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for viewing resources (public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'resources' );

-- Policy for uploading resources (authenticated users)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'resources' AND auth.role() = 'authenticated' );

-- Policy for updating own resources
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'resources' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'resources' AND auth.uid() = owner );

-- Policy for deleting own resources
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'resources' AND auth.uid() = owner );
