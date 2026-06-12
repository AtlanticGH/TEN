-- Refresh PostgREST schema cache (fixes API errors after column/table changes).
-- Run in Supabase SQL Editor if migrations cannot apply auth fixes.

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS cover_image_url text;

NOTIFY pgrst, 'reload schema';
