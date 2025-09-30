-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'faculty', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  total_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  grade INTEGER,
  feedback TEXT,
  status TEXT DEFAULT 'submitted',
  UNIQUE(assignment_id, student_id)
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  total_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student documents table (DigiLocker style)
CREATE TABLE public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for subjects
CREATE POLICY "Everyone can view subjects"
  ON public.subjects FOR SELECT
  USING (true);

CREATE POLICY "Faculty can create subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'faculty' OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Faculty can update own subjects"
  ON public.subjects FOR UPDATE
  USING (faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Faculty can delete own subjects"
  ON public.subjects FOR DELETE
  USING (faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for enrollments
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR get_user_role(auth.uid()) = 'faculty');

CREATE POLICY "Students can enroll in subjects"
  ON public.enrollments FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for assignments
CREATE POLICY "Enrolled users can view assignments"
  ON public.assignments FOR SELECT
  USING (
    subject_id IN (
      SELECT subject_id FROM public.enrollments 
      WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Faculty can create assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for submissions
CREATE POLICY "Students can view own submissions"
  ON public.submissions FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR assignment_id IN (
      SELECT id FROM public.assignments WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Students can create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Faculty can update submissions"
  ON public.submissions FOR UPDATE
  USING (
    assignment_id IN (
      SELECT id FROM public.assignments WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )
  );

-- RLS Policies for quizzes
CREATE POLICY "Enrolled users can view quizzes"
  ON public.quizzes FOR SELECT
  USING (
    subject_id IN (
      SELECT subject_id FROM public.enrollments 
      WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Faculty can create quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (
    subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for quiz attempts
CREATE POLICY "Students can view own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can create attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for notes
CREATE POLICY "Enrolled users can view notes"
  ON public.notes FOR SELECT
  USING (
    subject_id IN (
      SELECT subject_id FROM public.enrollments 
      WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Faculty can create notes"
  ON public.notes FOR INSERT
  WITH CHECK (
    subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for videos
CREATE POLICY "Enrolled users can view videos"
  ON public.videos FOR SELECT
  USING (
    subject_id IN (
      SELECT subject_id FROM public.enrollments 
      WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Faculty can create videos"
  ON public.videos FOR INSERT
  WITH CHECK (
    subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for forum posts
CREATE POLICY "Enrolled users can view forum posts"
  ON public.forum_posts FOR SELECT
  USING (
    subject_id IN (
      SELECT subject_id FROM public.enrollments 
      WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR subject_id IN (
      SELECT id FROM public.subjects 
      WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Enrolled users can create forum posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND (
      subject_id IN (
        SELECT subject_id FROM public.enrollments 
        WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
      OR subject_id IN (
        SELECT id FROM public.subjects 
        WHERE faculty_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )
  );

-- RLS Policies for student documents
CREATE POLICY "Students can view own documents"
  ON public.student_documents FOR SELECT
  USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can create own documents"
  ON public.student_documents FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can delete own documents"
  ON public.student_documents FOR DELETE
  USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('assignment-files', 'assignment-files', false),
  ('student-documents', 'student-documents', false),
  ('course-resources', 'course-resources', false);

-- Storage policies for assignment files
CREATE POLICY "Students can upload assignment files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view assignment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignment-files');

-- Storage policies for student documents
CREATE POLICY "Students can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for course resources
CREATE POLICY "Faculty can upload course resources"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-resources');

CREATE POLICY "Everyone can view course resources"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-resources');

-- Trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();