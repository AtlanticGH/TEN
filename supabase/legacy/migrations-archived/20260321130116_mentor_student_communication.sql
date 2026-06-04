-- Mentor ↔ student relationships, announcements, profile visibility, realtime.
-- Uses profiles.user_id (auth uid) as profile PK — not a separate profiles.id column.
-- Admin broadcast table public.announcements is unchanged.

-- ---------------------------------------------------------------------------
-- 1. Role constraint (student, mentor, admin, super_admin + legacy staff)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'mentor', 'staff', 'admin', 'super_admin'));

UPDATE public.profiles SET role = 'student' WHERE role IS NULL OR role = 'member';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- 2. mentor_students (canonical assignment; syncs with profiles.mentor_user_id)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mentor_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, student_id)
);

CREATE INDEX IF NOT EXISTS mentor_students_mentor_id_idx
  ON public.mentor_students (mentor_id);
CREATE INDEX IF NOT EXISTS mentor_students_student_id_idx
  ON public.mentor_students (student_id);

-- ---------------------------------------------------------------------------
-- 3. mentor_announcements + mentor_announcement_recipients
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mentor_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mentor_announcements_mentor_id_created_idx
  ON public.mentor_announcements (mentor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.mentor_announcement_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.mentor_announcements(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, student_id)
);

CREATE INDEX IF NOT EXISTS mentor_announcement_recipients_student_read_idx
  ON public.mentor_announcement_recipients (student_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS mentor_announcement_recipients_announcement_id_idx
  ON public.mentor_announcement_recipients (announcement_id);

-- ---------------------------------------------------------------------------
-- 4. Sync mentor_user_id ↔ mentor_students (backward compatible)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_mentor_students_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'UPDATE' AND OLD.mentor_user_id IS DISTINCT FROM NEW.mentor_user_id THEN
    IF OLD.mentor_user_id IS NOT NULL THEN
      DELETE FROM public.mentor_students ms
      WHERE ms.student_id = NEW.user_id
        AND ms.mentor_id = OLD.mentor_user_id;
    END IF;
  END IF;

  IF NEW.role = 'student' AND NEW.mentor_user_id IS NOT NULL THEN
    INSERT INTO public.mentor_students (mentor_id, student_id)
    VALUES (NEW.mentor_user_id, NEW.user_id)
    ON CONFLICT (mentor_id, student_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_mentor_students ON public.profiles;
CREATE TRIGGER profiles_sync_mentor_students
AFTER INSERT OR UPDATE OF mentor_user_id, role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_mentor_students_from_profile();

INSERT INTO public.mentor_students (mentor_id, student_id)
SELECT p.mentor_user_id, p.user_id
FROM public.profiles p
WHERE p.mentor_user_id IS NOT NULL
  AND p.role = 'student'
ON CONFLICT (mentor_id, student_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. Fan-out recipients + in-app notifications on new mentor announcement
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fan_out_mentor_announcement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mentor_announcement_recipients (announcement_id, student_id)
  SELECT NEW.id, ms.student_id
  FROM public.mentor_students ms
  WHERE ms.mentor_id = NEW.mentor_id
  ON CONFLICT (announcement_id, student_id) DO NOTHING;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  SELECT
    mar.student_id,
    'mentor_announcement',
    NEW.title,
    NEW.message,
    jsonb_build_object(
      'mentor_announcement_id', NEW.id,
      'mentor_id', NEW.mentor_id
    )
  FROM public.mentor_announcement_recipients mar
  WHERE mar.announcement_id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mentor_announcements_fan_out ON public.mentor_announcements;
CREATE TRIGGER mentor_announcements_fan_out
AFTER INSERT ON public.mentor_announcements
FOR EACH ROW
EXECUTE FUNCTION public.fan_out_mentor_announcement();

CREATE OR REPLACE FUNCTION public.touch_mentor_recipient_read_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.read = true AND (OLD.read IS DISTINCT FROM true) THEN
    NEW.read_at = COALESCE(NEW.read_at, now());
  ELSIF NEW.read = false THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mentor_announcement_recipients_read_at ON public.mentor_announcement_recipients;
CREATE TRIGGER mentor_announcement_recipients_read_at
BEFORE UPDATE OF read ON public.mentor_announcement_recipients
FOR EACH ROW
EXECUTE FUNCTION public.touch_mentor_recipient_read_at();

-- ---------------------------------------------------------------------------
-- 6. Non-recursive profile visibility helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_assigned_mentor_of(student_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_students ms
    WHERE ms.mentor_id = auth.uid()
      AND ms.student_id = student_uid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_student_of(mentor_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_students ms
    WHERE ms.student_id = auth.uid()
      AND ms.mentor_id = mentor_uid
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_peer_profile(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_user_id = auth.uid()
    OR public.is_staff()
    OR public.is_assigned_mentor_of(target_user_id)
    OR public.is_assigned_student_of(target_user_id);
$$;

REVOKE ALL ON FUNCTION public.is_assigned_mentor_of(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_assigned_student_of(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_peer_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_assigned_mentor_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_student_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_peer_profile(uuid) TO authenticated;

DROP POLICY IF EXISTS "profiles_select_mentor" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_mentor_peer" ON public.profiles;
CREATE POLICY "profiles_select_mentor_peer"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.can_view_peer_profile(user_id));

-- ---------------------------------------------------------------------------
-- 7. RLS: mentor_students
-- ---------------------------------------------------------------------------
ALTER TABLE public.mentor_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_students_select_participant" ON public.mentor_students;
CREATE POLICY "mentor_students_select_participant"
ON public.mentor_students
FOR SELECT
TO authenticated
USING (
  mentor_id = auth.uid()
  OR student_id = auth.uid()
  OR public.is_staff()
);

DROP POLICY IF EXISTS "mentor_students_manage_staff" ON public.mentor_students;
CREATE POLICY "mentor_students_manage_staff"
ON public.mentor_students
FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- 8. RLS: mentor_announcements
-- ---------------------------------------------------------------------------
ALTER TABLE public.mentor_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_announcements_select" ON public.mentor_announcements;
CREATE POLICY "mentor_announcements_select"
ON public.mentor_announcements
FOR SELECT
TO authenticated
USING (
  mentor_id = auth.uid()
  OR public.is_staff()
  OR EXISTS (
    SELECT 1
    FROM public.mentor_announcement_recipients mar
    WHERE mar.announcement_id = mentor_announcements.id
      AND mar.student_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "mentor_announcements_insert_mentor" ON public.mentor_announcements;
CREATE POLICY "mentor_announcements_insert_mentor"
ON public.mentor_announcements
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_mentor()
  AND mentor_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- 9. RLS: mentor_announcement_recipients
-- ---------------------------------------------------------------------------
ALTER TABLE public.mentor_announcement_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_recipients_select" ON public.mentor_announcement_recipients;
CREATE POLICY "mentor_recipients_select"
ON public.mentor_announcement_recipients
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_staff()
  OR EXISTS (
    SELECT 1
    FROM public.mentor_announcements ma
    WHERE ma.id = mentor_announcement_recipients.announcement_id
      AND ma.mentor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "mentor_recipients_update_own" ON public.mentor_announcement_recipients;
CREATE POLICY "mentor_recipients_update_own"
ON public.mentor_announcement_recipients
FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 10. Realtime publication
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_announcements;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_announcement_recipients;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_students;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.mentor_students TO authenticated;
GRANT SELECT, INSERT ON public.mentor_announcements TO authenticated;
GRANT SELECT, UPDATE ON public.mentor_announcement_recipients TO authenticated;
