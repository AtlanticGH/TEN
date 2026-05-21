-- Align legacy profiles.role check with TEN app roles (idempotent).

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'mentor', 'staff', 'admin', 'super_admin'));

UPDATE public.profiles
SET role = 'student'
WHERE role IS NULL OR role = 'member';
