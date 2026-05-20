# Ten dummy (React + Vite + Supabase)

## Getting started

Install dependencies:

```bash
npm install
```

Create a local env file:

- Copy `.env.example` → `.env` (or use the included `.env` for demo mode)
- For **demo / UI-only** local dev, set `APP_MODE=demo` and leave Supabase keys blank
- For full features, fill in Supabase keys:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client)
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server — secret)
  - (Optional) `SITE_URL` for `/api/inviteApplicant`

Start **frontend + API** together (recommended):

```bash
npm run dev:all
```

Open http://localhost:5173/

API-only (e.g. production-style on port 3000):

```bash
npm start
```

## Troubleshooting

If you see:

> Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env.

…it means `.env` is missing those values (or they’re empty). After updating `.env`, restart the dev server so Vite picks up the new env vars.

## Supabase dev users (optional)

If you want the same dummy accounts inside Supabase Auth:
- Run the SQL files in order:
  - `supabase/schema.sql`
  - `supabase/platform.sql`
  - `supabase/cms.sql`
  - `supabase/platform_cms_v2.sql`
  - `supabase/contact.sql`
  - `supabase/learning_cms.sql`
  - `supabase/admin_progress.sql`
  - `supabase/storage.sql`
- Create users + profiles:
  - **Script**: `node scripts/seed-dev-users.mjs` (requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
  - **SQL only**: `supabase/seed-dev-users.sql` (requires you to create auth users first)
