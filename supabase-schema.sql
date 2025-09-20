-- AI-Powered EdTech Platform (Mentor3D) Database Schema
-- This script creates all necessary tables for the mentor3d project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  lessons JSONB,
  assessments JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'completed', 'archived')),
  thumbnail_url TEXT,
  total_lessons INTEGER DEFAULT 0,
  estimated_hours DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lessons table (detailed lesson content)
CREATE TABLE public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  lesson_type TEXT DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'practical', 'assessment', 'project')),
  order_number INTEGER NOT NULL,
  duration_minutes INTEGER,
  objectives TEXT[],
  resources JSONB DEFAULT '{}',
  video_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, order_number)
);

-- 4. User Progress table
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 5. Assessments table
CREATE TABLE public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT DEFAULT 'quiz' CHECK (assessment_type IN ('quiz', 'coding', 'project', 'essay')),
  questions JSONB,
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Submissions table (for code/project submissions)
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  code TEXT,
  language TEXT,
  score INTEGER,
  max_score INTEGER DEFAULT 100,
  feedback TEXT,
  ai_feedback TEXT,
  execution_result JSONB,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Chat History table (AI Professor interactions)
CREATE TABLE public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  context JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Learning Analytics table
CREATE TABLE public.learning_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  total_time_minutes INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  assessments_taken INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  engagement_score DECIMAL(5,2),
  device_type TEXT,
  browser_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Course Enrollments table
CREATE TABLE public.course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 10. Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_url TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_courses_user_id ON public.courses(user_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_tags ON public.courses USING GIN(tags);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_number);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_course_id ON public.submissions(course_id);
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_course_lesson ON public.chat_history(course_id, lesson_id);
CREATE INDEX idx_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.course_enrollments(course_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Users can view published courses" ON public.courses
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON public.courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" ON public.courses
  FOR DELETE USING (auth.uid() = user_id);

-- Lessons policies
CREATE POLICY "Users can view lessons of accessible courses" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND (courses.status = 'active' OR courses.user_id = auth.uid())
    )
  );

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Submissions policies
CREATE POLICY "Users can view own submissions" ON public.submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON public.submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "Users can view own chat history" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat history" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning analytics policies
CREATE POLICY "Users can view own analytics" ON public.learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics" ON public.learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Course enrollments policies
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own enrollments" ON public.course_enrollments
  FOR ALL USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  'student'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
