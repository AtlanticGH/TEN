-- Fix: infinite recursion in profiles RLS
-- Cause: profiles_select_staff / profiles_update_staff subquery public.profiles
-- while evaluating policies ON public.profiles.
-- Fix: SECURITY DEFINER role helpers (same pattern as public.is_mentor).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
      AND p.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- Profiles: never self-reference profiles inside profiles policies
DROP POLICY IF EXISTS "profiles_select_staff" ON public.profiles;
CREATE POLICY "profiles_select_staff"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_staff());

DROP POLICY IF EXISTS "profiles_update_staff" ON public.profiles;
CREATE POLICY "profiles_update_staff"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- Core learning tables still used inline profile subqueries in 30101
DROP POLICY IF EXISTS "courses_manage_staff" ON public.courses;
CREATE POLICY "courses_manage_staff"
ON public.courses
FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "modules_select_by_course" ON public.modules;
CREATE POLICY "modules_select_by_course"
ON public.modules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = modules.course_id
      AND c.published = true
  )
  OR public.is_staff()
);

DROP POLICY IF EXISTS "modules_manage_staff" ON public.modules;
CREATE POLICY "modules_manage_staff"
ON public.modules
FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());
