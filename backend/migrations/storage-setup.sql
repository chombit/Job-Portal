-- Create a new storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects
-- (This is usually enabled by default on new buckets, but good to ensure)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload their own resume
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Policy: Allow users to read resumes (public or authenticated depending on requirement)
-- Since employers need to read resumes, and they are authenticated:
CREATE POLICY "Authenticated users can read resumes"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'resumes' );

-- Policy: Allow users to update their own resume
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] )
WITH CHECK ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Policy: Allow users to delete their own resume
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] );
