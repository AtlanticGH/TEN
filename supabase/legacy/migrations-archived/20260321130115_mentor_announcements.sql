-- Mentor announcements to assigned mentees + audience-aware notification trigger

ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_audience_check;
ALTER TABLE public.announcements
  ADD CONSTRAINT announcements_audience_check
  CHECK (audience IN ('all', 'students', 'mentors', 'mentor_mentees'));

CREATE OR REPLACE FUNCTION public.notify_announcement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.published_at IS NULL THEN
    RETURN new;
  END IF;

  -- Only notify on first publish (avoid duplicate rows on re-update)
  IF tg_op = 'UPDATE' AND old.published_at IS NOT NULL THEN
    RETURN new;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  SELECT
    p.user_id,
    'announcement',
    new.title,
    new.body,
    jsonb_build_object(
      'announcement_id', new.id,
      'audience', new.audience,
      'from_mentor', (new.audience = 'mentor_mentees')
    )
  FROM public.profiles p
  WHERE p.status = 'active'
    AND (
      (new.audience = 'all')
      OR (new.audience = 'students' AND p.role = 'student')
      OR (new.audience = 'mentors' AND p.role = 'mentor')
      OR (
        new.audience = 'mentor_mentees'
        AND p.mentor_user_id = new.created_by
        AND p.role = 'student'
      )
    );

  RETURN new;
END;
$$;

-- Students only see mentor_mentees posts meant for them (not other mentors' groups)
DROP POLICY IF EXISTS "announcements_select_authed" ON public.announcements;
CREATE POLICY "announcements_select_authed"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  published_at IS NOT NULL
  AND (
    audience <> 'mentor_mentees'
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.mentor_user_id = announcements.created_by
    )
  )
);

-- Mentors manage their own mentee-targeted announcements (draft + published list for self)
DROP POLICY IF EXISTS "announcements_mentor_manage_own" ON public.announcements;
CREATE POLICY "announcements_mentor_manage_own"
ON public.announcements
FOR ALL
TO authenticated
USING (
  public.is_mentor()
  AND created_by = auth.uid()
  AND audience = 'mentor_mentees'
)
WITH CHECK (
  public.is_mentor()
  AND created_by = auth.uid()
  AND audience = 'mentor_mentees'
);
