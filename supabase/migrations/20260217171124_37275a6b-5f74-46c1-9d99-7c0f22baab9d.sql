
-- Allow students to update their own documents (for renaming)
CREATE POLICY "Students can update own documents"
ON public.student_documents
FOR UPDATE
USING (student_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
))
WITH CHECK (student_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));
