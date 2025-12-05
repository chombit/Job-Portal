-- =====================================================
-- Job Portal - Supabase Database Schema
-- =====================================================
-- This script creates all necessary tables, policies, 
-- functions, and triggers for the Job Portal application
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Extends auth.users with custom profile data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'job_seeker' CHECK (role IN ('admin', 'employer', 'job_seeker')),
  profile_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =====================================================
-- JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'temporary', 'internship')),
  salary_range JSONB DEFAULT '{"min": null, "max": null, "currency": "USD", "period": "year"}'::jsonb,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  is_remote BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'closed')),
  application_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'rejected', 'accepted')),
  additional_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, applicant_id) -- Prevent duplicate applications
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- =====================================================
-- SAVED JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id) -- Prevent duplicate saved jobs
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Anyone can read profiles (for displaying employer info, etc.)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- JOBS POLICIES
-- =====================================================

-- Anyone can view published jobs
CREATE POLICY "Published jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (status = 'published' OR employer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Employers and admins can create jobs
CREATE POLICY "Employers and admins can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('employer', 'admin')
    )
  );

-- Employers can update their own jobs, admins can update any
CREATE POLICY "Employers can update their own jobs"
  ON public.jobs FOR UPDATE
  USING (
    employer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Employers can delete their own jobs, admins can delete any
CREATE POLICY "Employers can delete their own jobs"
  ON public.jobs FOR DELETE
  USING (
    employer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- APPLICATIONS POLICIES
-- =====================================================

-- Job seekers can view their own applications
-- Employers can view applications for their jobs
-- Admins can view all applications
CREATE POLICY "Users can view relevant applications"
  ON public.applications FOR SELECT
  USING (
    applicant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Job seekers can create applications
CREATE POLICY "Job seekers can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    auth.uid() = applicant_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'job_seeker'
    )
  );

-- Applicants can update their own applications (withdraw)
-- Employers can update status of applications for their jobs
CREATE POLICY "Users can update relevant applications"
  ON public.applications FOR UPDATE
  USING (
    applicant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Applicants can delete their own applications
CREATE POLICY "Applicants can delete their own applications"
  ON public.applications FOR DELETE
  USING (applicant_id = auth.uid());

-- =====================================================
-- SAVED JOBS POLICIES
-- =====================================================

-- Users can only see their own saved jobs
CREATE POLICY "Users can view their own saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (user_id = auth.uid());

-- Users can save jobs
CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own saved jobs
CREATE POLICY "Users can update their own saved jobs"
  ON public.saved_jobs FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own saved jobs
CREATE POLICY "Users can delete their own saved jobs"
  ON public.saved_jobs FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'job_seeker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_jobs ON public.jobs;
CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_applications ON public.applications;
CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_saved_jobs ON public.saved_jobs;
CREATE TRIGGER set_updated_at_saved_jobs
  BEFORE UPDATE ON public.saved_jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- HELPER VIEWS (Optional - for easier querying)
-- =====================================================

-- View for jobs with employer details
CREATE OR REPLACE VIEW public.jobs_with_employer AS
SELECT 
  j.*,
  p.name as employer_name,
  p.email as employer_email
FROM public.jobs j
LEFT JOIN public.profiles p ON j.employer_id = p.id;

-- View for applications with job and applicant details
CREATE OR REPLACE VIEW public.applications_with_details AS
SELECT 
  a.*,
  j.title as job_title,
  j.employer_id,
  applicant.name as applicant_name,
  applicant.email as applicant_email
FROM public.applications a
LEFT JOIN public.jobs j ON a.job_id = j.id
LEFT JOIN public.profiles applicant ON a.applicant_id = applicant.id;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.applications TO authenticated;
GRANT ALL ON public.saved_jobs TO authenticated;

-- Grant select on views
GRANT SELECT ON public.jobs_with_employer TO authenticated;
GRANT SELECT ON public.applications_with_details TO authenticated;

-- =====================================================
-- COMPLETE
-- =====================================================
-- Schema creation complete!
-- Next steps:
-- 1. Verify tables created in Supabase dashboard
-- 2. Test RLS policies
-- 3. Begin backend migration
