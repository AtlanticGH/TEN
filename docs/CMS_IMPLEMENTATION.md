# CMS implementation plan (approved)

## Decisions

| Item | Choice |
|------|--------|
| Framework | Vite + React Router (no Next.js) |
| Legacy editors | Deprecate `site_content` / `cms_content` admin UIs → block builder |
| Homepage | **Extended hybrid** (`layout_mode: hybrid`) — CMS hero + built-in sections |
| Courses / applications | **Out of CMS nav** (routes redirect to overview) |
| Production DB | Ready for `supabase db push` |
| Phase order | A → B → C → E → D → G; F (TypeScript) continuous |

## Phase A — DB & ops

```bash
npm run supabase:push:dry-run
npm run supabase:push
npm run bootstrap:nav
npm run bootstrap:homepage          # hero-only hybrid seed
npm run bootstrap:cms
npm run verify:cms
```

Migrations added:

- `20260401000008_pages_layout_mode.sql` — `hybrid` | `blocks_only` | `legacy`
- `20260401000009_storage_rls.sql` — storage.objects policies
- `20260401000010_footer_navigation.sql` — `footer` menu seed

## Phase B — Content model

- `/admin/pages/:slug` → redirects to **block builder**
- Legacy **Hero & sections** path removed from nav
- Home uses `resolveHomeCmsLayout(blocks, page)` + `HomeBelowFold`

## Phase C — Dynamic pages

- Route `/:slug` → `CmsDynamicPage` (published pages with blocks only)
- Reserved slugs: `src/config/reservedSlugs.ts`

## Phase E — Settings & chrome

- Logo / favicon from `site_settings` (header + `SiteBranding`)
- Footer: `footer` nav key + `footer.program_links` in settings

## Phase D — Builder UX

- HTML5 drag-and-drop block reorder in `AdminPageBuilder`
- Media picker modal: _planned next iteration_

## Phase G — Hardening

- `npm run verify:cms` after push
- Storage RLS migration (staff write, public read)

## Phase F — TypeScript

- `src/types/cms.ts` — expand as modules migrate

## Deprecated (do not use for new content)

- `AdminContentPage` / `site_content` hero editor
- `AdminPageSections` / `cms_content` section editor
- Public fallbacks in `*Page.jsx` remain until blocks are seeded per page
