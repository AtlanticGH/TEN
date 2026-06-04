-- CMS v2 — reference data (block types, default pages, navigation)

INSERT INTO public.block_types (key, label, description, sort_order) VALUES
  ('hero', 'Hero', 'Large hero with headline, subcopy, media, and CTAs', 10),
  ('text', 'Text', 'Plain text section', 20),
  ('rich_text', 'Rich text', 'Formatted HTML content', 30),
  ('features', 'Features', 'Feature grid with icons', 40),
  ('faq', 'FAQ', 'Question and answer list', 50),
  ('testimonials', 'Testimonials', 'Quotes and attribution', 60),
  ('cta', 'Call to action', 'CTA band with buttons', 70),
  ('stats', 'Statistics', 'Numeric highlights', 80),
  ('gallery', 'Gallery', 'Image gallery', 90),
  ('video_gallery', 'Video gallery', 'Grid of embedded or hosted videos', 95),
  ('team', 'Team', 'Team member cards', 100),
  ('pricing', 'Pricing', 'Pricing tiers', 110),
  ('partners', 'Partners', 'Logo strip', 120),
  ('custom_html', 'Custom HTML', 'Raw HTML block', 130)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.pages (slug, title, status, sort_order, seo_title, seo_description) VALUES
  ('home', 'Home', 'published', 0, 'The Ember Network', 'Culinary mentorship and community'),
  ('about', 'About', 'published', 10, 'About', 'Our mission and story'),
  ('programs', 'Programs', 'published', 20, 'Programs', 'Workshops and programs'),
  ('resources', 'Resources', 'published', 30, 'Resources', 'Downloads and guides'),
  ('contact', 'Contact', 'published', 40, 'Contact', 'Get in touch'),
  ('community', 'Community', 'published', 50, 'Community', 'Join the network'),
  ('gallery', 'Gallery', 'published', 35, 'Gallery', 'Photos from The Ember Network')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.navigation (key, label) VALUES ('main', 'Main menu')
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
WHERE n.key = 'main'
  AND NOT EXISTS (SELECT 1 FROM public.navigation_items ni WHERE ni.navigation_id = n.id LIMIT 1);

INSERT INTO public.site_settings (key, value) VALUES
  ('global.v1', jsonb_build_object(
    'site_name', 'The Ember Network',
    'tagline', 'Culinary mentorship for the next generation',
    'contact_email', 'info@theembernetwork.com',
    'contact_phone', '+233 50 940 4673',
    'social', jsonb_build_object('website', 'https://www.theembernetwork.com'),
    'footer', jsonb_build_object('copyright', 'The Ember Network'),
    'seo', jsonb_build_object('default_title', 'The Ember Network', 'default_description', 'Culinary mentorship and community'),
    'analytics', jsonb_build_object()
  ))
ON CONFLICT (key) DO NOTHING;
