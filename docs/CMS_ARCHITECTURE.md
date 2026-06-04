# CMS v2 Architecture — The Ember Network

## Overview

Production CMS with:

- **Dynamic pages** (`pages` + `page_blocks`) — block-based page builder
- **Global settings** (`site_settings`) — branding, contact, SEO defaults, analytics
- **Navigation** (`navigation` + `navigation_items`) — main menu
- **Media library** (`media_assets`) — images, PDFs, videos
- **Blog** (`blog_posts`, categories, tags)
- **Legacy sections** (`cms_content`) — section editor (bridged until migrated to blocks)
- **Site JSON** (`site_content`) — home hero key `home.hero.v1`

Public site loads content via Express API (`/api/public/cms/*`). Admin writes use service role with staff guards.

## Schema (core tables)

| Table | Purpose |
|-------|---------|
| `profiles` | Auth users; roles: `super_admin`, `admin`, `editor`, `viewer`, `staff` |
| `site_settings` | Global JSON (`global.v1`) |
| `site_content` | Keyed JSON blobs (hero, legacy) |
| `pages` | Slug, title, status, SEO fields |
| `page_blocks` | Block type + JSON content, sort order |
| `block_types` | Reference list of block types |
| `cms_content` | Legacy page/section rows |
| `navigation` / `navigation_items` | Menus |
| `media_assets` | File metadata |
| `blog_posts` / `blog_categories` / `blog_tags` | Blog CMS |
| `applications` | Membership intake |
| `activity_logs` | Audit trail |
| `courses` / `modules` / `lessons` | Learning content (admin) |

## Roles

| Role | Access |
|------|--------|
| `super_admin` | Full CMS + assign super_admin |
| `admin` | Content, settings, users |
| `editor` | Content edit |
| `viewer` | Dashboard read-only (no writes in UI) |
| `staff` | Legacy alias → editor |

## Public API

- `GET /api/public/cms/settings?key=global.v1`
- `GET /api/public/cms/navigation/:key`
- `GET /api/public/cms/pages`
- `GET /api/public/cms/pages/:slug` — page + enabled blocks
- `GET /api/public/site-content/:key`
- `GET /api/public/cms-content`

## Admin API (staff JWT)

- Pages/blocks: `/api/admin/pages`, `/api/admin/pages/:id/blocks`, reorder, block-types
- Settings: `/api/admin/site-settings`
- Navigation: `/api/admin/navigation/:key`
- Users: `/api/admin/users` (admin+)
- Summary: `/api/admin/cms-summary`
- Blog, media, courses, applications — existing routes in `server/adminRoutes.js`

## Frontend

| Path | Usage |
|------|--------|
| `src/hooks/useCmsPage.js` | Load page + blocks |
| `src/hooks/useSiteSettings.js` | Global settings |
| `src/hooks/useNavigation.js` | Main nav |
| `src/components/cms/CmsPublicPage.jsx` | CMS-first page wrapper |
| `src/components/cms/CmsBlockRenderer.jsx` | Block → React |
| `src/pages/admin/AdminPageBuilder.jsx` | Block editor |
| `src/pages/admin/AdminPagesManager.jsx` | Page CRUD |

## Migration from v1

1. Archive old migrations (done).
2. `supabase db reset` locally or push v2 chain to new project.
3. Run `bootstrap:cms` for hero JSON.
4. Build pages in admin → Pages → Edit blocks, or use Page content tabs for legacy sections.
5. Publish pages (`status = published`) for public block rendering.

## Production checklist

- [ ] `supabase db push` on production project
- [ ] Bootstrap admin + CMS seed
- [ ] Supabase Auth redirect URLs for `/admin`
- [ ] Env: `VITE_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verify RLS + staff routes with test editor account
