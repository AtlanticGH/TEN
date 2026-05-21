# The Ember Network

Production web platform for **The Ember Network (TEN)** — maintained by **Atlantic Catering & Logistics**.

React, Vite, Express, and Supabase power the public site, **member** area, **mentor** workspace, and **admin** CMS.

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

Open the URL Vite prints (usually http://localhost:5173/; if that port is busy it may use 5174, 5175, etc.). Set `FRONTEND_ORIGIN` in `.env` to match (e.g. `http://localhost:5175`) for bootstrap script hints.

### First-time bootstrap (empty database)

```bash
npm run bootstrap:cms      # home hero in site_content
npm run bootstrap:admin -- --email you@company.com --password "YourSecurePass1" --name "Your Name"
npm run bootstrap:sample     # optional published starter course (local/staging)
npm run bootstrap:resources  # optional public /resources listings (local/staging)
```

Public sign-up is disabled; members join via **Apply** → admin approve → invite. The bootstrap admin is only for your initial staff account.

**Mentor account (optional):**

```bash
npm run bootstrap:mentor -- --email mentor@company.com --password "YourSecurePass1" --name "Mentor Name"
```

Then in **Admin → Users**, assign each student’s **Mentor** field to that mentor’s user id. Mentors sign in at `/mentor` (overview, students, courses, assignment reviews).

```bash
npm run setup:check   # verify env, tables, CMS hero, staff account, API
```

API only (e.g. port 3000):

```bash
npm start
```

## Troubleshooting

If the client reports Supabase is not configured, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then restart the dev server.

**Vercel: `/resources` shows `Request failed: 404`:** The API must deploy as `api/index.js` with the `/api/(.*)` rewrite in `vercel.json` (do not use `api/[[...slug]].js` — that is Next.js-only). Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `FRONTEND_ORIGIN` (e.g. `https://your-app.vercel.app`). Leave `VITE_API_URL` **empty**. After deploy, `https://<app>/api/healthz` should return `ok` and `https://<app>/api/public/resources` should return JSON. Redeploy without build cache if routes still 404.

**Password reset / invite links land on a blank login page:** Supabase appends a one-time token in the URL hash. Add these to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**:

- `http://localhost:5173/reset-password` (local)
- `https://<your-production-domain>/reset-password` (production)

Forgot-password, invite, and recovery flows all redirect to `/reset-password` (not `/login`).

## Supabase

**Project ref:** `lfdttxwvjgypljuhgjeu`

```bash
supabase login
npm run supabase:link
npm run supabase:pull    # optional: snapshot remote baseline
npm run supabase:push    # apply migrations
```

Marketing copy is managed in **Admin → Website content** (not SQL seed files).  
To remove legacy test accounts: `scripts/cleanup-demo-test-data.sql` (review before running).

Set `VITE_SUPABASE_URL=https://lfdttxwvjgypljuhgjeu.supabase.co` and keys from the dashboard.  
Full guide: `supabase/SETUP.md`. Verify SQL: `scripts/verify-supabase-schema.sql`.

## Documentation

- `docs/VERCEL_DEPLOY.md` — Vercel env vars + production verify
- `docs/PRODUCTION_AUDIT.md` — deployment and security checklist
- `docs/CMS_ARCHITECTURE.md` — admin CMS architecture
