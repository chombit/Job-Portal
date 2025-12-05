-- =====================================================
-- Data Export Script for Current PostgreSQL Database
-- =====================================================
-- Run this against your CURRENT database to export data
-- This will help you migrate existing data to Supabase
-- =====================================================

-- Export Jobs (excluding employer_id for now, will map after user migration)
COPY (
  SELECT 
    id,
    title,
    description,
    location,
    job_type,
    salary_range,
    skills,
    experience_level,
    is_remote,
    status,
    application_deadline,
    created_at,
    updated_at,
    employer_id -- We'll need to map this to new user IDs
  FROM jobs
  WHERE status IN ('published', 'draft')
  ORDER BY created_at
) TO '/tmp/jobs_export.csv' WITH CSV HEADER;

-- Export Applications (will need to map both job_id and applicant_id)
COPY (
  SELECT 
    id,
    job_id,
    applicant_id,
    cover_letter,
    resume_url,
    status,
    additional_info,
    created_at,
    updated_at
  FROM applications
  ORDER BY created_at
) TO '/tmp/applications_export.csv' WITH CSV HEADER;

-- Export Saved Jobs (will need to map both user_id and job_id)
COPY (
  SELECT 
    id,
    user_id,
    job_id,
    created_at,
    updated_at
  FROM saved_jobs
  ORDER BY created_at
) TO '/tmp/saved_jobs_export.csv' WITH CSV HEADER;

-- Export User Email List (for notification about password reset)
COPY (
  SELECT 
    email,
    name,
    role,
    created_at
  FROM users
  WHERE is_active = true
  ORDER BY created_at
) TO '/tmp/users_for_notification.csv' WITH CSV HEADER;

-- =====================================================
-- NOTES FOR MANUAL MIGRATION:
-- =====================================================
-- 1. Users CANNOT be migrated with passwords (different hashing)
-- 2. Send notification to all users about password reset
-- 3. After users re-register in Supabase:
--    - Create a mapping table: old_user_id -> new_user_id
--    - Update job employer_id references
--    - Update application applicant_id references
--    - Update saved_jobs user_id references
-- 4. Import jobs first, then applications, then saved_jobs
