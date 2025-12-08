-- Allow public access to view profiles (needed for job employer details)
GRANT SELECT ON public.profiles TO anon;

-- Allow public access to view jobs
GRANT SELECT ON public.jobs TO anon;

-- Note: RLS policies still apply, so they essentially filter what is seen.
-- Ensure the RLS policy for profiles allows public viewing:
-- DONE: CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Ensure the RLS policy for jobs allows public viewing of published jobs:
-- DONE: CREATE POLICY "Published jobs are viewable by everyone" ON public.jobs FOR SELECT USING (status = 'published' ...);
