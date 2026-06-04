-- CMS v2 — production schema (replaces legacy LMS/mentor migrations)
-- Run: supabase db reset (local) or supabase db push (linked remote)

-- ---------------------------------------------------------------------------
-- Profiles & RBAC roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  username citext,
  role text NOT NULL DEFAULT 'viewer' CHECK (
    role IN ('super_admin', 'admin', 'editor', 'viewer', 'staff', 'student', 'mentor')
  ),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  profile_image_url text,
  avatar_path text,
  bio text,
  phone text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_len_chk CHECK (username IS NULL OR char_length(username::text) BETWEEN 3 AND 30)
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx ON public.profiles (username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);

-- ---------------------------------------------------------------------------
-- Global site settings (JSON per key)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Back-compat view for older code paths
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Dynamic pages & block builder
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order int NOT NULL DEFAULT 0,
  featured_image_url text,
  seo_title text,
  seo_description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  robots text NOT NULL DEFAULT 'index,follow',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS pages_status_idx ON public.pages (status, sort_order);
CREATE INDEX IF NOT EXISTS pages_slug_idx ON public.pages (slug);

CREATE TABLE IF NOT EXISTS public.block_types (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text,
  schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type text NOT NULL REFERENCES public.block_types(key),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS page_blocks_page_id_idx ON public.page_blocks (page_id, sort_order);

-- Legacy section rows (import bridge; admin can migrate to blocks)
CREATE TABLE IF NOT EXISTS public.cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL,
  title text,
  body text,
  media_url text,
  published boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_key, section_key)
);

CREATE INDEX IF NOT EXISTS cms_content_page_key_idx ON public.cms_content (page_key);

-- ---------------------------------------------------------------------------
-- Navigation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  navigation_id uuid NOT NULL REFERENCES public.navigation(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL DEFAULT '',
  external boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS navigation_items_nav_idx ON public.navigation_items (navigation_id, sort_order);

-- ---------------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder text NOT NULL DEFAULT 'general',
  bucket text NOT NULL DEFAULT 'public',
  path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  alt text,
  title text,
  tags text[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);

-- Legacy installs: ensure folder column exists (canonical folders: cms, gallery, resources, uploads, general)
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS folder text NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS media_assets_folder_idx ON public.media_assets (folder, created_at DESC);

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text NOT NULL DEFAULT '',
  cover_image_url text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  robots text NOT NULL DEFAULT 'index,follow',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Legacy blog_posts used author_user_id and optional body
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS excerpt text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS og_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS og_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS og_image_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS robots text NOT NULL DEFAULT 'index,follow';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'author_user_id'
  ) THEN
    UPDATE public.blog_posts SET author_id = author_user_id WHERE author_id IS NULL AND author_user_id IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON public.blog_posts (published, published_at DESC);

-- ---------------------------------------------------------------------------
-- Membership & contact
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  interest_role text,
  message text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'waitlist', 'approved', 'rejected')),
  notes text,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  mime_type text,
  size_bytes bigint,
  category text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Courses (lightweight — admin-managed learning content)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor text,
  duration text,
  thumbnail_url text,
  category text,
  difficulty text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text,
  position int NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text,
  position int NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_created_idx ON public.activity_logs (created_at DESC);

-- ---------------------------------------------------------------------------
-- Auth helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pages_touch_updated_at ON public.pages;
CREATE TRIGGER pages_touch_updated_at BEFORE UPDATE ON public.pages
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS page_blocks_touch_updated_at ON public.page_blocks;
CREATE TRIGGER page_blocks_touch_updated_at BEFORE UPDATE ON public.page_blocks
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS site_settings_touch_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_touch_updated_at BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS blog_posts_touch_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_touch_updated_at BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
