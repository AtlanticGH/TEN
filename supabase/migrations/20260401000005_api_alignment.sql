-- Align schema with Express API (idempotent alters)

ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS bucket text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS path text;

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS resources_published_idx ON public.resources (published, created_at DESC);
