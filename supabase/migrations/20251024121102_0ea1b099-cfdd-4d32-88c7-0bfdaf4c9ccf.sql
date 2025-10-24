-- Fix 1: Add file_url column to assignments table
ALTER TABLE assignments 
ADD COLUMN file_url text;

COMMENT ON COLUMN assignments.file_url IS 'URL to assignment description file (optional)';

-- Fix 2: Remove role column from profiles table (privilege escalation risk)
ALTER TABLE profiles DROP COLUMN role;

-- Fix 3: Fix RLS policies on profiles table - restrict to enrolled users only
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

-- Users can view profiles of students in their enrolled subjects
CREATE POLICY "View enrolled student profiles" ON profiles
FOR SELECT USING (
  id IN (
    SELECT DISTINCT student_id FROM enrollments
    WHERE subject_id IN (
      SELECT subject_id FROM enrollments
      WHERE student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  )
);

-- Users can view profiles of faculty teaching their enrolled subjects
CREATE POLICY "View enrolled faculty profiles" ON profiles
FOR SELECT USING (
  id IN (
    SELECT faculty_id FROM subjects
    WHERE id IN (
      SELECT subject_id FROM enrollments
      WHERE student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  )
);

-- Faculty can view students enrolled in their subjects
CREATE POLICY "Faculty view enrolled students" ON profiles
FOR SELECT USING (
  id IN (
    SELECT student_id FROM enrollments
    WHERE subject_id IN (
      SELECT id FROM subjects
      WHERE faculty_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  )
);

-- Fix 4: Make storage buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('student-documents', 'assignment-files', 'course-resources');