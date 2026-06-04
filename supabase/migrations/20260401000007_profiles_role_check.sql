-- Align profiles.role check with CMS v2 (legacy remotes kept student/mentor-only constraint)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role = ANY (ARRAY['super_admin', 'admin', 'editor', 'viewer', 'staff', 'student', 'mentor']::text[])
);
