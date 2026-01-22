-- RESET (Cleanup old tables if they exist to prevent conflicts)
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.resumes CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES (Public wrapper for auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'SEEKER', -- 'SEEKER', 'EMPLOYER', 'COLLEGE'
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. JOBS TABLE
CREATE TABLE public.jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  type TEXT, -- 'Full-time', 'Part-time', 'Contract', 'Remote'
  description TEXT,
  requirements TEXT[], -- Array of strings
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  employer_id UUID -- Link to auth.users (user_profiles.id)
);

-- 3. RESUMES TABLE
CREATE TABLE public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'My Resume',
  summary TEXT,
  skills TEXT[],
  raw_text TEXT, -- Text extracted from PDF for AI analysis
  file_url TEXT, -- Link to storage bucket
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. APPLICATIONS TABLE
CREATE TABLE public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Applied', -- 'Applied', 'Screening', 'Interview', 'Rejected', 'Offer'
  ai_score INTEGER DEFAULT 0, -- AI calculated match score (0-100)
  ai_analysis TEXT, -- JSON string or text summary of AI analysis
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- e.g., 'resume-pro', 'hiring-starter'
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- User Profiles: Everyone can read (for displaying names), Users can update their own
CREATE POLICY "Public read access" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Jobs: Everyone can read, Authenticated employers can insert/update their own
CREATE POLICY "Read jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Insert jobs" ON public.jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Employers update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = employer_id);
CREATE POLICY "Employers delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

-- Resumes: Users can CRUD their own resumes
CREATE POLICY "Users manage own resumes" ON public.resumes USING (auth.uid() = user_id);

-- Applications Policies:

-- 1. Job Seekers can view their own applications
CREATE POLICY "Seekers view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);

-- 2. Job Seekers can create applications (apply)
CREATE POLICY "Seekers apply" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Employers can view applications for jobs they own
CREATE POLICY "Employers view job applications" ON public.applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.employer_id = auth.uid()
  )
);

-- 4. Employers can update applications (change status, add AI score) for jobs they own
CREATE POLICY "Employers update job applications" ON public.applications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.employer_id = auth.uid()
  )
);

-- Subscriptions: Users view their own
CREATE POLICY "Users view own sub" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Jobs
INSERT INTO public.jobs (title, company, location, salary, type, description, requirements)
VALUES 
('Senior React Engineer', 'TechFlow Solutions', 'Bangalore, India (Remote)', '₹25L - ₹35L', 'Full-time', 'We are looking for an experienced React developer to lead our frontend team.', ARRAY['React 18+', 'TypeScript', 'Tailwind CSS']),
('AI Product Manager', 'FutureScale AI', 'Gurugram, India', '₹18L - ₹28L', 'Full-time', 'Drive the product vision for our generative AI SaaS platform.', ARRAY['Product Management', 'LLM Knowledge', 'Agile']),
('Growth Hacker', 'StartupX', 'Mumbai, India', '₹12L - ₹20L', 'Contract', 'Looking for a marketing wizard to scale our user base.', ARRAY['SEO', 'Paid Ads', 'Content Marketing']);
