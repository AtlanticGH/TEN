-- Fix: infinite recursion between mentor_announcements ↔ mentor_announcement_recipients RLS.
-- Cause: each SELECT policy subqueries the other table, re-triggering RLS.
-- Fix: SECURITY DEFINER helpers (same pattern as 20260321130114_fix_profiles_rls_recursion).

CREATE OR REPLACE FUNCTION public.is_recipient_of_mentor_announcement(ann_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_announcement_recipients mar
    WHERE mar.announcement_id = ann_id
      AND mar.student_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.mentor_owns_announcement(ann_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_announcements ma
    WHERE ma.id = ann_id
      AND ma.mentor_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_recipient_of_mentor_announcement(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mentor_owns_announcement(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_recipient_of_mentor_announcement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mentor_owns_announcement(uuid) TO authenticated;

DROP POLICY IF EXISTS "mentor_announcements_select" ON public.mentor_announcements;
CREATE POLICY "mentor_announcements_select"
ON public.mentor_announcements
FOR SELECT
TO authenticated
USING (
  mentor_id = auth.uid()
  OR public.is_staff()
  OR public.is_recipient_of_mentor_announcement(id)
);

DROP POLICY IF EXISTS "mentor_recipients_select" ON public.mentor_announcement_recipients;
CREATE POLICY "mentor_recipients_select"
ON public.mentor_announcement_recipients
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_staff()
  OR public.mentor_owns_announcement(announcement_id)
);
