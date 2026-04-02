-- Storage policies for user-skills bucket
-- Note: Bucket must be created manually via Supabase Dashboard first
-- Bucket name: 'user-skills', Public: false

-- Users can upload their own skill files
CREATE POLICY "Users can upload own skills"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-skills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own skill files
CREATE POLICY "Users can view own skills"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-skills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own skill files
CREATE POLICY "Users can update own skills"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-skills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own skill files
CREATE POLICY "Users can delete own skills"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-skills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
