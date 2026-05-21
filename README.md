# The Ember Network

Production web platform for **The Ember Network (TEN)** — maintained by **Atlantic Catering & Logistics**.

React, Vite, Express, and Supabase power the public site, member area, and admin CMS.

## Getting started

Install dependencies:

```bash
npm install
```

Create a local env file:

- Copy `.env.example` → `.env` (or use `.env.local`)
- Configure (required for all features):
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client)
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server — secret)
  - (Optional) `SITE_URL`, `FRONTEND_ORIGIN` for invites and CORS

Start **frontend + API** together (recommended):

```bash
npm run dev:all
```

Open http://localhost:5173/

### First-time bootstrap (empty database)

```bash
npm run bootstrap:cms      # home hero in site_content
npm run bootstrap:admin -- --email you@company.com --password "YourSecurePass1" --name "Your Name"
npm run bootstrap:sample   # optional published starter course (local/staging)
```

Public sign-up is disabled; members join via **Apply** → admin approve → invite. The bootstrap admin is only for your initial staff account.

```bash
npm run setup:check   # verify env, tables, CMS hero, staff account, API
```

API only (e.g. port 3000):

```bash
npm start
```

## Troubleshooting

If the client reports Supabase is not configured, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then restart the dev server.

**Vercel: `/resources` shows `Request failed: 404`:** The Express API runs in `api/[[...slug]].js`. In Vercel project settings, set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `FRONTEND_ORIGIN` (your production URL, e.g. `https://your-app.vercel.app`). Leave `VITE_API_URL` **empty** so the browser calls same-origin `/api/*`. Redeploy after env changes. An empty resources list (`No resources published yet.`) is normal until you add items in **Admin → Resources**.

**Password reset / invite links land on a blank login page:** Supabase appends a one-time token in the URL hash. Add these to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**:

- `http://localhost:5173/reset-password` (local)
- `https://<your-production-domain>/reset-password` (production)

Forgot-password, invite, and recovery flows all redirect to `/reset-password` (not `/login`).

## Supabase

**Project ref:** `vawqdpalwuoyqntseqni`

```bash
supabase login
npm run supabase:link
npm run supabase:pull    # optional: snapshot remote baseline
npm run supabase:push    # apply migrations
```

Marketing copy is managed in **Admin → Website content** (not SQL seed files).  
To remove legacy test accounts: `scripts/cleanup-demo-test-data.sql` (review before running).

Set `VITE_SUPABASE_URL=https://vawqdpalwuoyqntseqni.supabase.co` and keys from the dashboard.  
Full guide: `supabase/SETUP.md`. Verify SQL: `scripts/verify-supabase-schema.sql`.

## Documentation

- `docs/PRODUCTION_AUDIT.md` — deployment and security checklist
- `docs/CMS_ARCHITECTURE.md` — admin CMS architecture
