-- Run in Supabase SQL Editor after `supabase db push`.
-- Confirms core tables exist and refreshes PostgREST schema cache.

NOTIFY pgrst, 'reload schema';

-- Tables the app queries (must all return rows or empty — not "relation does not exist")
WITH expected AS (
  SELECT unnest(ARRAY[
    'profiles',
    'teams',
    'team_members',
    'courses',
    'modules',
    'lessons',
    'lesson_files',
    'assignments',
    'assignment_submissions',
    'quizzes',
    'quiz_attempts',
    'enrollments',
    'module_completions',
    'lesson_completions',
    'course_completions',
    'mentorship_milestones',
    'notifications',
    'announcements',
    'sessions',
    'session_attendees',
    'applications',
    'contact_submissions',
    'site_content',
    'cms_content',
    'media_assets',
    'resources',
    'activity_logs',
    'certificates',
    'user_course_state'
  ]) AS table_name
)
SELECT e.table_name,
       CASE WHEN t.table_name IS NOT NULL THEN 'ok' ELSE 'MISSING' END AS status
FROM expected e
LEFT JOIN information_schema.tables t
  ON t.table_schema = 'public'
 AND t.table_type = 'BASE TABLE'
 AND t.table_name = e.table_name
ORDER BY e.table_name;

-- Views used by member dashboard
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('course_progress', 'lesson_progress', 'profiles_admin')
ORDER BY table_name;

-- RLS enabled on sensitive tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'teams', 'enrollments', 'assignment_submissions', 'courses')
ORDER BY tablename;

-- Helpers
SELECT proname
FROM pg_proc
JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
WHERE n.nspname = 'public'
  AND proname IN ('is_staff', 'is_admin', 'is_mentor', 'handle_new_user')
ORDER BY proname;
