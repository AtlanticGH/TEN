-- Blog posts for admin CMS (public read when published)

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  slug citext NOT NULL,
  body text,
  cover_image_url text,
  tags text[] DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts (slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_select_published" ON public.blog_posts;
CREATE POLICY "blog_posts_select_published"
ON public.blog_posts FOR SELECT TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "blog_posts_manage_staff" ON public.blog_posts;
CREATE POLICY "blog_posts_manage_staff"
ON public.blog_posts FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.status = 'active'
      AND p.role IN ('staff', 'admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.status = 'active'
      AND p.role IN ('staff', 'admin', 'super_admin')
  )
);
