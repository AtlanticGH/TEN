-- Footer navigation menu (optional; falls back to main nav + settings)
INSERT INTO public.navigation (key, label) VALUES ('footer', 'Footer menu')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.navigation_items (navigation_id, label, href, sort_order, enabled)
SELECT n.id, v.label, v.href, v.ord, true
FROM public.navigation n
CROSS JOIN (VALUES
  ('About', '/about', 10),
  ('Programs', '/programs', 20),
  ('Resources', '/resources', 30),
  ('Gallery', '/gallery', 35),
  ('Community', '/community', 40),
  ('Contact', '/contact', 50)
) AS v(label, href, ord)
WHERE n.key = 'footer'
  AND NOT EXISTS (SELECT 1 FROM public.navigation_items ni WHERE ni.navigation_id = n.id LIMIT 1);
