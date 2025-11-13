-- Ensure faculty can only see assignments from their college
DROP POLICY IF EXISTS "Enrolled users can view assignments" ON public.assignments;
CREATE POLICY "Enrolled users can view assignments" 
ON public.assignments 
FOR SELECT 
USING (
  -- Students can see assignments from subjects they're enrolled in (same college)
  (subject_id IN (
    SELECT e.subject_id
    FROM enrollments e
    JOIN profiles p ON p.id = e.student_id
    WHERE p.user_id = auth.uid()
  ))
  OR
  -- Faculty can see assignments from their own subjects (same college)
  (subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.college_id = p.college_id
  ))
);

-- Ensure faculty can only create assignments for their college subjects
DROP POLICY IF EXISTS "Faculty can create assignments" ON public.assignments;
CREATE POLICY "Faculty can create assignments" 
ON public.assignments 
FOR INSERT 
WITH CHECK (
  subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.faculty_id = p.id
      AND s.college_id = p.college_id
  )
);

-- Ensure faculty can only see submissions from their college students
DROP POLICY IF EXISTS "Students can view own submissions" ON public.submissions;
CREATE POLICY "Students can view own submissions" 
ON public.submissions 
FOR SELECT 
USING (
  -- Students can see their own submissions
  (student_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ))
  OR
  -- Faculty can see submissions for their college's assignments only
  (assignment_id IN (
    SELECT a.id
    FROM assignments a
    JOIN subjects s ON s.id = a.subject_id
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.college_id = p.college_id
  ))
);

-- Update quiz policies for college isolation
DROP POLICY IF EXISTS "Enrolled users can view quizzes" ON public.quizzes;
CREATE POLICY "Enrolled users can view quizzes" 
ON public.quizzes 
FOR SELECT 
USING (
  -- Students enrolled in same-college subjects
  (subject_id IN (
    SELECT e.subject_id
    FROM enrollments e
    JOIN profiles p ON p.id = e.student_id
    WHERE p.user_id = auth.uid()
  ))
  OR
  -- Faculty from same college
  (subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.college_id = p.college_id
  ))
);

DROP POLICY IF EXISTS "Faculty can create quizzes" ON public.quizzes;
CREATE POLICY "Faculty can create quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (
  subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.faculty_id = p.id
      AND s.college_id = p.college_id
  )
);

-- Update video policies for college isolation
DROP POLICY IF EXISTS "Enrolled users can view videos" ON public.videos;
CREATE POLICY "Enrolled users can view videos" 
ON public.videos 
FOR SELECT 
USING (
  (subject_id IN (
    SELECT e.subject_id
    FROM enrollments e
    JOIN profiles p ON p.id = e.student_id
    WHERE p.user_id = auth.uid()
  ))
  OR
  (subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.college_id = p.college_id
  ))
);

DROP POLICY IF EXISTS "Faculty can create videos" ON public.videos;
CREATE POLICY "Faculty can create videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (
  subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.faculty_id = p.id
      AND s.college_id = p.college_id
  )
);

-- Update notes policies for college isolation
DROP POLICY IF EXISTS "Enrolled users can view notes" ON public.notes;
CREATE POLICY "Enrolled users can view notes" 
ON public.notes 
FOR SELECT 
USING (
  (subject_id IN (
    SELECT e.subject_id
    FROM enrollments e
    JOIN profiles p ON p.id = e.student_id
    WHERE p.user_id = auth.uid()
  ))
  OR
  (subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.college_id = p.college_id
  ))
);

DROP POLICY IF EXISTS "Faculty can create notes" ON public.notes;
CREATE POLICY "Faculty can create notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (
  subject_id IN (
    SELECT s.id
    FROM subjects s
    JOIN profiles p ON p.id = s.faculty_id
    WHERE p.user_id = auth.uid()
      AND s.faculty_id = p.id
      AND s.college_id = p.college_id
  )
);