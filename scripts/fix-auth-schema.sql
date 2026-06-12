-- Run once in Supabase Dashboard → SQL Editor (fixes login "Database error querying schema").
-- Hosted projects cannot ALTER auth.users via CLI migrations (table owned by supabase_auth_admin).

UPDATE auth.users SET confirmation_token = '' WHERE confirmation_token IS NULL;
UPDATE auth.users SET recovery_token = '' WHERE recovery_token IS NULL;
UPDATE auth.users SET email_change_token_new = '' WHERE email_change_token_new IS NULL;
UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'email_change_token_current'
  ) THEN
    UPDATE auth.users SET email_change_token_current = '' WHERE email_change_token_current IS NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'reauthentication_token'
  ) THEN
    UPDATE auth.users SET reauthentication_token = '' WHERE reauthentication_token IS NULL;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
