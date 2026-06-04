-- resources: add file metadata columns expected by /api/admin/resources

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS size_bytes bigint;

NOTIFY pgrst, 'reload schema';
