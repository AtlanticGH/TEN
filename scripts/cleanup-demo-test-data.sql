-- Remove development/test accounts and related rows.
-- Review results before running in production. Adjust email patterns if needed.

-- Test/dev auth users (created by legacy seed scripts)
DELETE FROM auth.users
WHERE email ILIKE '%@embernetwork.test';

-- Orphan profiles without auth users (optional)
DELETE FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = p.user_id
);
