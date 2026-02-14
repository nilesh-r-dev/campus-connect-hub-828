-- Create a SECURITY DEFINER function to get profile id from auth.uid()
-- This bypasses RLS and avoids recursion
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Drop and recreate policies using the helper function
DROP POLICY IF EXISTS "Faculty view enrolled students" ON public.profiles;
DROP POLICY IF EXISTS "View enrolled faculty profiles" ON public.profiles;
DROP POLICY IF EXISTS "View enrolled student profiles" ON public.profiles;

-- Faculty can view profiles of students enrolled in their subjects
CREATE POLICY "Faculty view enrolled students"
ON public.profiles FOR SELECT
USING (
  id IN (
    SELECT e.student_id FROM enrollments e
    WHERE e.subject_id IN (
      SELECT s.id FROM subjects s
      WHERE s.faculty_id = public.get_my_profile_id()
    )
  )
);

-- Students can view faculty profiles for their enrolled subjects
CREATE POLICY "View enrolled faculty profiles"
ON public.profiles FOR SELECT
USING (
  id IN (
    SELECT s.faculty_id FROM subjects s
    WHERE s.id IN (
      SELECT e.subject_id FROM enrollments e
      WHERE e.student_id = public.get_my_profile_id()
    )
  )
);

-- Students can view other student profiles in same subjects
CREATE POLICY "View enrolled student profiles"
ON public.profiles FOR SELECT
USING (
  id IN (
    SELECT DISTINCT e2.student_id FROM enrollments e2
    WHERE e2.subject_id IN (
      SELECT e.subject_id FROM enrollments e
      WHERE e.student_id = public.get_my_profile_id()
    )
  )
);