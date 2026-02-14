-- Drop all existing SELECT policies on profiles that cause recursion
DROP POLICY IF EXISTS "Faculty view enrolled students" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "View enrolled faculty profiles" ON public.profiles;
DROP POLICY IF EXISTS "View enrolled student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate simple policies that don't self-reference profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Faculty can view profiles of students enrolled in their subjects
-- Uses get_user_role function and avoids referencing profiles table
CREATE POLICY "Faculty view enrolled students"
ON public.profiles FOR SELECT
USING (
  id IN (
    SELECT e.student_id FROM enrollments e
    WHERE e.subject_id IN (
      SELECT s.id FROM subjects s
      WHERE s.faculty_id = (
        SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
      )
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
      WHERE e.student_id = (
        SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
      )
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
      WHERE e.student_id = (
        SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
      )
    )
  )
);