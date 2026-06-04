-- 002_profiles_create: profiles + core learning tables + base RLS
-- Depends on: 20260321120000_extensions.sql
-- Rule: CREATE TABLE before ALTER TABLE; policies after tables exist.

-- Idempotent extensions (20000 may have been an empty placeholder on older remotes)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;

-- ---------------------------------------------------------------------------
-- PROFILES (create first — never ALTER before this on a clean database)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'staff', 'admin', 'super_admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  mentor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_image_url text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  bio text,
  phone text,
  country text,
  goals text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 003_profiles_updates: legacy column alignment (idempotent upgrades only)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN id TO user_id;
  END IF;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username citext;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_path text;

UPDATE public.profiles SET full_name = COALESCE(NULLIF(full_name, ''), '') WHERE full_name IS NULL;
UPDATE public.profiles SET role = 'student' WHERE role IS NULL OR role = 'member';
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;
UPDATE public.profiles SET joined_at = COALESCE(joined_at, now()) WHERE joined_at IS NULL;
UPDATE public.profiles SET updated_at = COALESCE(updated_at, now()) WHERE updated_at IS NULL;

ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student';
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_username_len_chk' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_len_chk
      CHECK (username IS NULL OR char_length(username::text) BETWEEN 3 AND 30) NOT VALID;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx ON public.profiles (username);

-- ---------------------------------------------------------------------------
-- Triggers + auth hook
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON public.profiles;
CREATE TRIGGER profiles_touch_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Core learning tables (FK order: courses → modules → enrollments)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor text,
  duration text,
  thumbnail_url text,
  category text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position int NOT NULL CHECK (position > 0),
  content jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, position)
);

CREATE INDEX IF NOT EXISTS modules_course_id_idx ON public.modules(course_id);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON public.enrollments(course_id);

CREATE TABLE IF NOT EXISTS public.module_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS module_completions_user_id_idx ON public.module_completions(user_id);
CREATE INDEX IF NOT EXISTS module_completions_module_id_idx ON public.module_completions(module_id);

CREATE TABLE IF NOT EXISTS public.user_course_state (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  last_module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.mentorship_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mentorship_milestones_user_id_idx ON public.mentorship_milestones(user_id);

CREATE OR REPLACE VIEW public.course_progress AS
SELECT
  e.user_id,
  e.course_id,
  count(DISTINCT m.id) AS total_modules,
  count(DISTINCT mc.module_id) AS completed_modules,
  CASE
    WHEN count(DISTINCT m.id) = 0 THEN 0
    ELSE round((count(DISTINCT mc.module_id)::numeric * 100) / count(DISTINCT m.id), 0)
  END AS percentage
FROM public.enrollments e
LEFT JOIN public.modules m ON m.course_id = e.course_id
LEFT JOIN public.module_completions mc ON mc.user_id = e.user_id AND mc.module_id = m.id
GROUP BY e.user_id, e.course_id;

-- ---------------------------------------------------------------------------
-- RLS (after all tables above exist)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_select_staff" ON public.profiles;
CREATE POLICY "profiles_select_staff"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_staff" ON public.profiles;
CREATE POLICY "profiles_update_staff"
ON public.profiles FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
);

-- Courses legacy column alignment (table exists above)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS published boolean;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS difficulty text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'status'
  ) THEN
    EXECUTE $sql$
      UPDATE public.courses
      SET published = (status = 'published')
      WHERE published IS NULL
    $sql$;
  END IF;
END $$;

UPDATE public.courses SET published = COALESCE(published, true) WHERE published IS NULL;
UPDATE public.courses SET created_at = COALESCE(created_at, now()) WHERE created_at IS NULL;

DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
CREATE POLICY "courses_select_published"
ON public.courses FOR SELECT TO authenticated
USING (published = true);

DROP POLICY IF EXISTS "courses_manage_staff" ON public.courses;
CREATE POLICY "courses_manage_staff"
ON public.courses FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
);

DROP POLICY IF EXISTS "modules_select_by_course" ON public.modules;
CREATE POLICY "modules_select_by_course"
ON public.modules FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = modules.course_id AND c.published = true
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
);

DROP POLICY IF EXISTS "modules_manage_staff" ON public.modules;
CREATE POLICY "modules_manage_staff"
ON public.modules FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'staff')
      AND p.status = 'active'
  )
);

DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
CREATE POLICY "enrollments_select_own"
ON public.enrollments FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_insert_own" ON public.enrollments;
CREATE POLICY "enrollments_insert_own"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;
CREATE POLICY "enrollments_update_own"
ON public.enrollments FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_delete_own" ON public.enrollments;
CREATE POLICY "enrollments_delete_own"
ON public.enrollments FOR DELETE TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "module_completions_select_own" ON public.module_completions;
CREATE POLICY "module_completions_select_own"
ON public.module_completions FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "module_completions_insert_own" ON public.module_completions;
CREATE POLICY "module_completions_insert_own"
ON public.module_completions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "module_completions_delete_own" ON public.module_completions;
CREATE POLICY "module_completions_delete_own"
ON public.module_completions FOR DELETE TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_course_state_select_own" ON public.user_course_state;
CREATE POLICY "user_course_state_select_own"
ON public.user_course_state FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_course_state_upsert_own" ON public.user_course_state;
CREATE POLICY "user_course_state_upsert_own"
ON public.user_course_state FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_course_state_update_own" ON public.user_course_state;
CREATE POLICY "user_course_state_update_own"
ON public.user_course_state FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "certificates_select_own" ON public.certificates;
CREATE POLICY "certificates_select_own"
ON public.certificates FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "milestones_select_own" ON public.mentorship_milestones;
CREATE POLICY "milestones_select_own"
ON public.mentorship_milestones FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "milestones_insert_own" ON public.mentorship_milestones;
CREATE POLICY "milestones_insert_own"
ON public.mentorship_milestones FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "milestones_update_own" ON public.mentorship_milestones;
CREATE POLICY "milestones_update_own"
ON public.mentorship_milestones FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
