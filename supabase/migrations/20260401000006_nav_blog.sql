-- Add Blog to main menu (existing projects that already ran cms_seed)
INSERT INTO public.navigation_items (navigation_id, label, href, sort_order, enabled)
SELECT n.id, 'Blog', '/blog', 35, true
FROM public.navigation n
WHERE n.key = 'main'
  AND NOT EXISTS (
    SELECT 1 FROM public.navigation_items ni
    WHERE ni.navigation_id = n.id AND ni.href = '/blog'
  );
