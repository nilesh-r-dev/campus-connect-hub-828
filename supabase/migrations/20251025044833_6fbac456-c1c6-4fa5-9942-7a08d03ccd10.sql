-- Create colleges table
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Everyone can view colleges
CREATE POLICY "Everyone can view colleges"
ON public.colleges
FOR SELECT
USING (true);

-- Add college_id to profiles
ALTER TABLE public.profiles
ADD COLUMN college_id UUID REFERENCES public.colleges(id);

-- Add college_id to subjects
ALTER TABLE public.subjects
ADD COLUMN college_id UUID REFERENCES public.colleges(id);

-- Update subjects RLS policies to scope by college
DROP POLICY IF EXISTS "Everyone can view subjects" ON public.subjects;
CREATE POLICY "Users can view college subjects"
ON public.subjects
FOR SELECT
USING (
  college_id IN (
    SELECT college_id FROM profiles WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Faculty can create subjects" ON public.subjects;
CREATE POLICY "Faculty can create college subjects"
ON public.subjects
FOR INSERT
WITH CHECK (
  (get_user_role(auth.uid()) = 'faculty'::app_role OR get_user_role(auth.uid()) = 'admin'::app_role)
  AND college_id IN (
    SELECT college_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Insert sample engineering colleges in India
INSERT INTO public.colleges (name, location, state) VALUES
('Indian Institute of Technology Delhi', 'New Delhi', 'Delhi'),
('Indian Institute of Technology Bombay', 'Mumbai', 'Maharashtra'),
('Indian Institute of Technology Madras', 'Chennai', 'Tamil Nadu'),
('Indian Institute of Technology Kanpur', 'Kanpur', 'Uttar Pradesh'),
('Indian Institute of Technology Kharagpur', 'Kharagpur', 'West Bengal'),
('Indian Institute of Technology Roorkee', 'Roorkee', 'Uttarakhand'),
('Indian Institute of Technology Guwahati', 'Guwahati', 'Assam'),
('Indian Institute of Technology Hyderabad', 'Hyderabad', 'Telangana'),
('National Institute of Technology Trichy', 'Tiruchirappalli', 'Tamil Nadu'),
('National Institute of Technology Karnataka', 'Surathkal', 'Karnataka'),
('Delhi Technological University', 'New Delhi', 'Delhi'),
('Birla Institute of Technology and Science Pilani', 'Pilani', 'Rajasthan'),
('Vellore Institute of Technology', 'Vellore', 'Tamil Nadu'),
('SRM Institute of Science and Technology', 'Chennai', 'Tamil Nadu'),
('Manipal Institute of Technology', 'Manipal', 'Karnataka'),
('Anna University', 'Chennai', 'Tamil Nadu'),
('Jadavpur University', 'Kolkata', 'West Bengal'),
('College of Engineering Pune', 'Pune', 'Maharashtra'),
('PSG College of Technology', 'Coimbatore', 'Tamil Nadu'),
('Netaji Subhas University of Technology', 'New Delhi', 'Delhi');