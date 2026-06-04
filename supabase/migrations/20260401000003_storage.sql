-- CMS v2 — storage buckets

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('public', 'public', true, 26214400, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','application/pdf','video/mp4']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('resources', 'resources', false, 26214400, ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO NOTHING;
