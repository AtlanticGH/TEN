-- Video gallery block type for CMS page builder
INSERT INTO public.block_types (key, label, description, sort_order) VALUES
  ('video_gallery', 'Video gallery', 'Grid of embedded or hosted videos', 95)
ON CONFLICT (key) DO NOTHING;
