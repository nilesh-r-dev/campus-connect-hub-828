
-- 1. student-documents: remove broad policies
DROP POLICY IF EXISTS "Authenticated users can read from student-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to student-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from student-documents" ON storage.objects;

-- 2. assignment-files: restrict reads
DROP POLICY IF EXISTS "Users can view assignment files" ON storage.objects;
CREATE POLICY "Owners and faculty can view assignment files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assignment-files'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_my_profile_id()::text
    OR public.has_role(auth.uid(), 'faculty')
  )
);

DROP POLICY IF EXISTS "Students can upload assignment files" ON storage.objects;
CREATE POLICY "Students can upload own assignment files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assignment-files'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_my_profile_id()::text
  )
);

-- 3. course-resources: only faculty may upload
DROP POLICY IF EXISTS "Faculty can upload course resources" ON storage.objects;
CREATE POLICY "Faculty can upload course resources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-resources'
  AND public.has_role(auth.uid(), 'faculty')
);

-- 4. enrollments: faculty limited to their own subjects
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
CREATE POLICY "Students and owning faculty can view enrollments"
ON public.enrollments FOR SELECT TO authenticated
USING (
  student_id = public.get_my_profile_id()
  OR EXISTS (
    SELECT 1 FROM public.subjects s
    WHERE s.id = enrollments.subject_id
      AND s.faculty_id = public.get_my_profile_id()
  )
);

-- 5. SECURITY DEFINER function exposure
DROP FUNCTION IF EXISTS public.get_user_role_new(uuid);

REVOKE ALL ON FUNCTION public.get_my_college_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_profile_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_my_college_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_profile_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
