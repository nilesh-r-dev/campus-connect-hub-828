-- Create career_news table for career and internship updates
CREATE TABLE public.career_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  category TEXT NOT NULL CHECK (category IN ('career', 'internship', 'placement', 'skill')),
  posted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_news ENABLE ROW LEVEL SECURITY;

-- Students can view all career news
CREATE POLICY "Students can view all career news"
ON public.career_news
FOR SELECT
USING (true);

-- Faculty and admin can create career news
CREATE POLICY "Faculty can create career news"
ON public.career_news
FOR INSERT
WITH CHECK (
  posted_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Faculty can update their own career news
CREATE POLICY "Faculty can update own career news"
ON public.career_news
FOR UPDATE
USING (
  posted_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Faculty can delete their own career news
CREATE POLICY "Faculty can delete own career news"
ON public.career_news
FOR DELETE
USING (
  posted_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_career_news_updated_at
BEFORE UPDATE ON public.career_news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for career news
ALTER PUBLICATION supabase_realtime ADD TABLE public.career_news;