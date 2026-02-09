-- Add unique constraint to prevent duplicate colleges
ALTER TABLE public.colleges ADD CONSTRAINT colleges_name_location_state_unique UNIQUE (name, location, state);

-- Check and fix storage policies - the Document upload uses profile.id as folder name 
-- but storage RLS expects auth.uid(). We need to allow both patterns.
-- Drop and recreate storage policies for student-documents
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Recreate with auth.uid() based folder structure
CREATE POLICY "Authenticated users can upload to student-documents" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read from student-documents" ON storage.objects FOR SELECT
USING (bucket_id = 'student-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from student-documents" ON storage.objects FOR DELETE
USING (bucket_id = 'student-documents' AND auth.role() = 'authenticated');