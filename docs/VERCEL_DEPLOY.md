# Vercel deployment checklist

**Production URL:** https://ember-network-qc25.vercel.app

## 1. Environment variables (required)

Vercel → Project → **Settings** → **Environment Variables** → add for **Production** (and Preview if needed):

| Variable | Notes |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://vawqdpalwuoyqntseqni.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → API → anon |
| `SUPABASE_URL` | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (secret) — server only |
| `FRONTEND_ORIGIN` | `https://ember-network-qc25.vercel.app` |
| `SITE_URL` | Same as `FRONTEND_ORIGIN` |

**Leave empty:** `VITE_API_URL` (browser must use same-origin `/api/*`).

## 2. Supabase Auth redirects

Dashboard → **Authentication** → **URL Configuration**:

- `https://ember-network-qc25.vercel.app/reset-password`

## 3. Redeploy

Deployments → latest → **Redeploy** → enable **Use existing Build Cache** off if env just changed.

## 4. Verify

```bash
npm run verify:prod
```

Expected:

- `/api/healthz` → `ok`
- `/api/public/resources` → JSON array (not 500)
- `/resources` → no “Request failed: 404”

## 5. API routing

- Handler: `api/index.js` (not `api/[[...slug]].js`)
- `vercel.json` rewrite: `/api/(.*)` → `/api?__path=$1`

## 6. Database

Migrations: see `supabase/migrations/README.md`

```bash
supabase db push --linked --yes
npm run setup:check
```
