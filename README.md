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
npm run dev
```

Open the URL printed in the terminal (usually **http://localhost:5190**). The project also writes it to `.ten-dev-url`.

Do **not** use `localhost:5173` unless another app already owns it — TEN uses **5190** (Vite) and **3090** (API) by default.

API only (e.g. port 3090):

```bash
PORT=3090 npm start
```

## Troubleshooting

If the client reports Supabase is not configured, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then restart the dev server.

**Password reset / invite links land on a blank login page:** Supabase appends a one-time token in the URL hash. Add these to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**:

- `http://localhost:5190/reset-password` (local)
- `https://<your-production-domain>/reset-password` (production)

Forgot-password, invite, and recovery flows all redirect to `/reset-password` (not `/login`).

## Supabase

**Project ref:** `zygkofiiurlsnrkcmaya`

```bash
supabase login
npm run supabase:link
npm run supabase:pull    # optional: snapshot remote baseline
npm run supabase:push    # apply migrations
```

Marketing copy is managed in **Admin → Website content** (not SQL seed files).  
To remove legacy test accounts: `scripts/cleanup-demo-test-data.sql` (review before running).

Set `VITE_SUPABASE_URL=https://zygkofiiurlsnrkcmaya.supabase.co` and keys from the dashboard.  
Full guide: `supabase/SETUP.md`. Verify SQL: `scripts/verify-supabase-schema.sql`.

## Documentation

- `docs/PRODUCTION_AUDIT.md` — deployment and security checklist
- `docs/CMS_ARCHITECTURE.md` — admin CMS architecture
