-- 006_schema_cache_refresh and additive indexes
NOTIFY pgrst, 'reload schema';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cohort text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
CREATE OR REPLACE VIEW public.lesson_progress AS SELECT id, user_id, lesson_id, true AS completed, completed_at, marked_at AS updated_at FROM public.lesson_completions;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-media', 'course-media', true), ('resources', 'resources', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = EXCLUDED.public;
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
