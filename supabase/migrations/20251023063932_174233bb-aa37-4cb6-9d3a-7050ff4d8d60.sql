-- Create video_completions table to track student progress
CREATE TABLE public.video_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, video_id)
);

-- Enable RLS on video_completions
ALTER TABLE public.video_completions ENABLE ROW LEVEL SECURITY;

-- Students can view their own completions
CREATE POLICY "Students can view own completions"
ON public.video_completions
FOR SELECT
USING (student_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Students can mark videos as complete
CREATE POLICY "Students can create completions"
ON public.video_completions
FOR INSERT
WITH CHECK (student_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Faculty can view completions for their subject videos
CREATE POLICY "Faculty can view subject completions"
ON public.video_completions
FOR SELECT
USING (video_id IN (
  SELECT v.id FROM videos v
  JOIN subjects s ON s.id = v.subject_id
  WHERE s.faculty_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
));

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  issued_by UUID NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_url TEXT,
  UNIQUE(student_id, subject_id)
);

-- Enable RLS on certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Students can view their own certificates
CREATE POLICY "Students can view own certificates"
ON public.certificates
FOR SELECT
USING (student_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Faculty can create certificates for their subjects
CREATE POLICY "Faculty can create certificates"
ON public.certificates
FOR INSERT
WITH CHECK (
  subject_id IN (
    SELECT id FROM subjects WHERE faculty_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  AND issued_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Faculty can view certificates for their subjects
CREATE POLICY "Faculty can view subject certificates"
ON public.certificates
FOR SELECT
USING (subject_id IN (
  SELECT id FROM subjects WHERE faculty_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
));

-- Add index for performance
CREATE INDEX idx_video_completions_student ON video_completions(student_id);
CREATE INDEX idx_video_completions_video ON video_completions(video_id);
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_subject ON certificates(subject_id);