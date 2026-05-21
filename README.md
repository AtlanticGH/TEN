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
- For **local UI without Supabase**, set `APP_MODE=demo` and leave Supabase keys blank
- For full features, configure:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client)
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server — secret)
  - (Optional) `SITE_URL`, `FRONTEND_ORIGIN` for invites and CORS

Start **frontend + API** together (recommended):

```bash
npm run dev:all
```

Open http://localhost:5173/

API only (e.g. port 3000):

```bash
npm start
```

## Troubleshooting

If the client reports Supabase is not configured, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then restart the dev server.

**Password reset / invite links land on a blank login page:** Supabase appends a one-time token in the URL hash. Add these to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**:

- `http://localhost:5173/reset-password` (local)
- `https://<your-production-domain>/reset-password` (production)

Forgot-password, invite, and recovery flows all redirect to `/reset-password` (not `/login`).

## Supabase (optional)

Apply SQL in order under `supabase/`, then seed development users:

```bash
node scripts/seed-dev-users.mjs
```

Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. See `supabase/SETUP.md`.

## Documentation

- `docs/PRODUCTION_AUDIT.md` — deployment and security checklist
- `docs/CMS_ARCHITECTURE.md` — admin CMS architecture
