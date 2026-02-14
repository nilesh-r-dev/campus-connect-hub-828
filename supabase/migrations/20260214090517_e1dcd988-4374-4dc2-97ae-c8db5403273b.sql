-- Fix enrollments policies to use security definer function instead of querying profiles
DROP POLICY IF EXISTS "Students can enroll in subjects" ON public.enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;

CREATE POLICY "Students can enroll in subjects"
ON public.enrollments FOR INSERT
WITH CHECK (student_id = public.get_my_profile_id());

CREATE POLICY "Students can view own enrollments"
ON public.enrollments FOR SELECT
USING (
  student_id = public.get_my_profile_id()
  OR public.get_user_role(auth.uid()) = 'faculty'
);

-- Fix subjects policies to use security definer function instead of querying profiles
DROP POLICY IF EXISTS "Faculty can create college subjects" ON public.subjects;
DROP POLICY IF EXISTS "Faculty can delete own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Faculty can update own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can view college subjects" ON public.subjects;

-- Create a security definer function for college_id too
CREATE OR REPLACE FUNCTION public.get_my_college_id()
RETURNS uuid AS $$
  SELECT college_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE POLICY "Faculty can create college subjects"
ON public.subjects FOR INSERT
WITH CHECK (
  (public.get_user_role(auth.uid()) = 'faculty' OR public.get_user_role(auth.uid()) = 'admin')
  AND college_id = public.get_my_college_id()
);

CREATE POLICY "Faculty can delete own subjects"
ON public.subjects FOR DELETE
USING (faculty_id = public.get_my_profile_id());

CREATE POLICY "Faculty can update own subjects"
ON public.subjects FOR UPDATE
USING (faculty_id = public.get_my_profile_id());

CREATE POLICY "Users can view college subjects"
ON public.subjects FOR SELECT
USING (college_id = public.get_my_college_id());