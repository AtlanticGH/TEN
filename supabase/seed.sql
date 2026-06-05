-- Local seed — run after migrations via `supabase db reset`
-- site_content rows use ON CONFLICT DO NOTHING in migration 20260401000013 for heroes/programs.

INSERT INTO public.site_content (key, value) VALUES (
  'home.hero.v1',
  '{
    "badge": "A COMMUNITY OF IGNITION & EMPOWERMENT",
    "headline_before": "Here, Small Sparks Ignite",
    "headline_emphasis": "Big Dreams",
    "description": "We help aspiring entrepreneurs and early-stage founders transform bold ideas into lasting ventures through mentorship, structured learning, and meaningful connections.",
    "cta_primary_label": "Apply for Membership",
    "cta_primary_href": "/apply",
    "cta_secondary_label": "Explore Our Story",
    "cta_secondary_href": "/about",
    "background_image": "/assets/images/1523240795612-9a054b0db644.jpg",
    "background_video": ""
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
