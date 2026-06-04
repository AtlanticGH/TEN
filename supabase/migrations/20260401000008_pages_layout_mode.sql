-- Page layout: hybrid (CMS blocks + built-in sections), blocks_only, or legacy fallback only
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS layout_mode text NOT NULL DEFAULT 'hybrid';

ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_layout_mode_chk;
ALTER TABLE public.pages ADD CONSTRAINT pages_layout_mode_chk
  CHECK (layout_mode IN ('hybrid', 'blocks_only', 'legacy'));

UPDATE public.pages SET layout_mode = 'hybrid' WHERE slug = 'home' AND layout_mode IS DISTINCT FROM 'hybrid';

COMMENT ON COLUMN public.pages.layout_mode IS 'hybrid: CMS blocks + legacy sections (home); blocks_only: blocks only; legacy: JSX fallback when no blocks';
