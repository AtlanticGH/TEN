-- 013_schema_completeness: grants, mentor read policies, storage buckets, realtime
-- Inferred from app usage (src/services/db.js, mentor workspace, member dashboard).
-- Idempotent — safe on databases that already applied 30101–30112.

-- ---------------------------------------------------------------------------
-- PostgREST / API visibility for progress views (member dashboard)
-- ---------------------------------------------------------------------------
GRANT SELECT ON public.course_progress TO authenticated;
GRANT SELECT ON public.lesson_progress TO authenticated;

-- ---------------------------------------------------------------------------
-- Mentor: read assigned mentee profiles and progress (client-side RLS)
-- Server APIs use service role; these policies support direct Supabase reads.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS profiles_mentor_user_id_idx
  ON public.profiles (mentor_user_id)
  WHERE mentor_user_id IS NOT NULL;

DROP POLICY IF EXISTS "profiles_select_mentor" ON public.profiles;
CREATE POLICY "profiles_select_mentor"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_mentor()
  AND mentor_user_id = auth.uid()
);

DROP POLICY IF EXISTS "enrollments_select_mentor" ON public.enrollments;
CREATE POLICY "enrollments_select_mentor"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
  public.is_mentor()
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = enrollments.user_id
      AND p.mentor_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "module_completions_select_mentor" ON public.module_completions;
CREATE POLICY "module_completions_select_mentor"
ON public.module_completions
FOR SELECT
TO authenticated
USING (
  public.is_mentor()
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = module_completions.user_id
      AND p.mentor_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "lesson_completions_select_mentor" ON public.lesson_completions;
CREATE POLICY "lesson_completions_select_mentor"
ON public.lesson_completions
FOR SELECT
TO authenticated
USING (
  public.is_mentor()
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = lesson_completions.user_id
      AND p.mentor_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "course_completions_select_mentor" ON public.course_completions;
CREATE POLICY "course_completions_select_mentor"
ON public.course_completions
FOR SELECT
TO authenticated
USING (
  public.is_mentor()
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = course_completions.user_id
      AND p.mentor_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "milestones_select_mentor" ON public.mentorship_milestones;
CREATE POLICY "milestones_select_mentor"
ON public.mentorship_milestones
FOR SELECT
TO authenticated
USING (
  public.is_mentor()
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = mentorship_milestones.user_id
      AND p.mentor_user_id = auth.uid()
  )
);

-- Mentors may read (not write) published course catalog for mentee context
DROP POLICY IF EXISTS "courses_select_mentor" ON public.courses;
CREATE POLICY "courses_select_mentor"
ON public.courses
FOR SELECT
TO authenticated
USING (public.is_mentor() AND published = true);

-- ---------------------------------------------------------------------------
-- Storage: course-media + resources buckets (created in 30106)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('course-media', 'course-media', true),
  ('resources', 'resources', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "course_media_read" ON storage.objects;
CREATE POLICY "course_media_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'course-media');

DROP POLICY IF EXISTS "course_media_staff_write" ON storage.objects;
CREATE POLICY "course_media_staff_write"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-media' AND public.is_staff());

DROP POLICY IF EXISTS "course_media_staff_update" ON storage.objects;
CREATE POLICY "course_media_staff_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-media' AND public.is_staff())
WITH CHECK (bucket_id = 'course-media' AND public.is_staff());

DROP POLICY IF EXISTS "course_media_staff_delete" ON storage.objects;
CREATE POLICY "course_media_staff_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'course-media' AND public.is_staff());

DROP POLICY IF EXISTS "resources_bucket_read" ON storage.objects;
CREATE POLICY "resources_bucket_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "resources_bucket_staff_write" ON storage.objects;
CREATE POLICY "resources_bucket_staff_write"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources' AND public.is_staff());

DROP POLICY IF EXISTS "resources_bucket_staff_update" ON storage.objects;
CREATE POLICY "resources_bucket_staff_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resources' AND public.is_staff())
WITH CHECK (bucket_id = 'resources' AND public.is_staff());

DROP POLICY IF EXISTS "resources_bucket_staff_delete" ON storage.objects;
CREATE POLICY "resources_bucket_staff_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND public.is_staff());

-- ---------------------------------------------------------------------------
-- Realtime (member + mentor dashboards)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_submissions;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_milestones;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Schema cache
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
