-- Replace Blog with Gallery in CMS pages and navigation

INSERT INTO public.pages (slug, title, status, sort_order, seo_title, seo_description, layout_mode)
VALUES ('gallery', 'Gallery', 'published', 35, 'Gallery', 'Photos from The Ember Network', 'hybrid')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  status = 'published',
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

UPDATE public.navigation_items
SET label = 'Gallery', href = '/gallery'
WHERE href = '/blog';

INSERT INTO public.navigation_items (navigation_id, label, href, sort_order, enabled)
SELECT n.id, 'Gallery', '/gallery', 35, true
FROM public.navigation n
WHERE n.key = 'main'
  AND NOT EXISTS (
    SELECT 1 FROM public.navigation_items ni
    WHERE ni.navigation_id = n.id AND ni.href IN ('/gallery', '/blog')
  );
