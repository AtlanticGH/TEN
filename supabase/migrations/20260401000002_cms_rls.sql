-- CMS v2 — RLS policies & role helpers

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.status = 'active'
      AND p.role IN ('staff', 'admin', 'super_admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.status = 'active'
      AND p.role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.status = 'active' AND p.role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_content()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_staff();
$$;

-- Legacy schema gaps (idempotent)
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS profiles_manage_admin ON public.profiles;
CREATE POLICY profiles_manage_admin ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Site settings / content — public read
DROP POLICY IF EXISTS site_settings_read ON public.site_settings;
CREATE POLICY site_settings_read ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS site_settings_staff ON public.site_settings;
CREATE POLICY site_settings_staff ON public.site_settings FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS site_content_read ON public.site_content;
CREATE POLICY site_content_read ON public.site_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS site_content_staff ON public.site_content;
CREATE POLICY site_content_staff ON public.site_content FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Pages — published public read
DROP POLICY IF EXISTS pages_public_read ON public.pages;
CREATE POLICY pages_public_read ON public.pages FOR SELECT TO anon, authenticated
  USING (status = 'published');
DROP POLICY IF EXISTS pages_staff_all ON public.pages;
CREATE POLICY pages_staff_all ON public.pages FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Page blocks — enabled on published pages
DROP POLICY IF EXISTS page_blocks_public_read ON public.page_blocks;
CREATE POLICY page_blocks_public_read ON public.page_blocks FOR SELECT TO anon, authenticated
  USING (
    enabled = true
    AND EXISTS (SELECT 1 FROM public.pages pg WHERE pg.id = page_id AND pg.status = 'published')
  );
DROP POLICY IF EXISTS page_blocks_staff ON public.page_blocks;
CREATE POLICY page_blocks_staff ON public.page_blocks FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS block_types_read ON public.block_types;
CREATE POLICY block_types_read ON public.block_types FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS block_types_staff ON public.block_types;
CREATE POLICY block_types_staff ON public.block_types FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Legacy cms_content
DROP POLICY IF EXISTS cms_content_public ON public.cms_content;
CREATE POLICY cms_content_public ON public.cms_content FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS cms_content_staff ON public.cms_content;
CREATE POLICY cms_content_staff ON public.cms_content FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Navigation
DROP POLICY IF EXISTS navigation_read ON public.navigation;
CREATE POLICY navigation_read ON public.navigation FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS navigation_staff ON public.navigation;
CREATE POLICY navigation_staff ON public.navigation FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS navigation_items_read ON public.navigation_items;
CREATE POLICY navigation_items_read ON public.navigation_items FOR SELECT TO anon, authenticated USING (enabled = true);
DROP POLICY IF EXISTS navigation_items_staff ON public.navigation_items;
CREATE POLICY navigation_items_staff ON public.navigation_items FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Media
DROP POLICY IF EXISTS media_read ON public.media_assets;
CREATE POLICY media_read ON public.media_assets FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS media_staff ON public.media_assets;
CREATE POLICY media_staff ON public.media_assets FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Blog
DROP POLICY IF EXISTS blog_categories_read ON public.blog_categories;
CREATE POLICY blog_categories_read ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS blog_categories_staff ON public.blog_categories;
CREATE POLICY blog_categories_staff ON public.blog_categories FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS blog_tags_read ON public.blog_tags;
CREATE POLICY blog_tags_read ON public.blog_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS blog_tags_staff ON public.blog_tags;
CREATE POLICY blog_tags_staff ON public.blog_tags FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS blog_posts_public ON public.blog_posts;
CREATE POLICY blog_posts_public ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS blog_posts_staff ON public.blog_posts;
CREATE POLICY blog_posts_staff ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS blog_post_tags_read ON public.blog_post_tags;
CREATE POLICY blog_post_tags_read ON public.blog_post_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS blog_post_tags_staff ON public.blog_post_tags;
CREATE POLICY blog_post_tags_staff ON public.blog_post_tags FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Applications — public insert via API only (service role); staff read
DROP POLICY IF EXISTS applications_staff ON public.applications;
CREATE POLICY applications_staff ON public.applications FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS contact_staff ON public.contact_submissions;
CREATE POLICY contact_staff ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS resources_public ON public.resources;
CREATE POLICY resources_public ON public.resources FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS resources_staff ON public.resources;
CREATE POLICY resources_staff ON public.resources FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS courses_public ON public.courses;
CREATE POLICY courses_public ON public.courses FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS courses_staff ON public.courses;
CREATE POLICY courses_staff ON public.courses FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS modules_staff ON public.modules;
CREATE POLICY modules_staff ON public.modules FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS lessons_staff ON public.lessons;
CREATE POLICY lessons_staff ON public.lessons FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS activity_logs_insert ON public.activity_logs;
CREATE POLICY activity_logs_insert ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS activity_logs_staff ON public.activity_logs;
CREATE POLICY activity_logs_staff ON public.activity_logs FOR SELECT TO authenticated USING (public.is_staff());

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
