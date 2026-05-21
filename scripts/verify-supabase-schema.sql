-- Run in Supabase SQL Editor after migrations apply.
-- Confirms core tables exist and refreshes PostgREST schema cache.

NOTIFY pgrst, 'reload schema';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected core tables (among others):
-- profiles, teams, team_members, courses, modules, lessons, enrollments

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'teams', 'team_members', 'courses')
ORDER BY tablename;
