# Vercel deployment checklist

**Supabase project:** `zygkofiiurlsnrkcmaya` — https://zygkofiiurlsnrkcmaya.supabase.co  
**Production URL:** https://ember-network-qc25.vercel.app

> After switching Supabase projects, update **all** Vercel env vars to match local `.env` (URL + anon + service_role from the **same** project).

## 1. Environment variables (required)

Vercel → Project → **Settings** → **Environment Variables** → add for **Production** (and Preview if needed):

| Variable | Notes |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://zygkofiiurlsnrkcmaya.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → API → anon |
| `SUPABASE_URL` | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (secret) — server only |
| `FRONTEND_ORIGIN` | `https://ember-network-qc25.vercel.app` |
| `SITE_URL` | Same as `FRONTEND_ORIGIN` |

**Leave empty:** `VITE_API_URL` (browser must use same-origin `/api/*`).

## 2. Supabase Auth redirects

Dashboard → **Authentication** → **URL Configuration**:

- `https://ember-network-qc25.vercel.app/reset-password`
- `http://localhost:5173/reset-password`
- `http://localhost:5174/reset-password`
- `http://localhost:5175/reset-password`
- `http://localhost:5176/reset-password`

## 3. Redeploy

Deployments → latest → **Redeploy** → enable **Use existing Build Cache** off if env just changed.

## Troubleshooting: `Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY`

The API serverless function has no Supabase credentials at runtime.

1. Vercel → Project → **Settings** → **Environment Variables**
2. Add (or fix) for **Production** and **Preview**:
   - `SUPABASE_URL` = `https://zygkofiiurlsnrkcmaya.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role secret (not anon)
3. **All four** Supabase vars must be from the **same** project:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
4. **Redeploy** with **Use existing Build Cache** turned **off**.

Note: `SUPABASE_SERVICE_ROLE_KEY` is used at **API runtime** only (not during the Vite frontend build). After deploy, check `GET /api/env-status` returns `"ok": true`.

If public pages load but admin fails, the client bundle may still point at an old Supabase project — update `VITE_*` vars and redeploy.

## Troubleshooting: `Invalid API key`

The server env is set but Supabase rejected the key. In Vercel, fix:

1. `SUPABASE_SERVICE_ROLE_KEY` must be the **service_role** secret (not `anon`).
2. `SUPABASE_URL` must be `https://zygkofiiurlsnrkcmaya.supabase.co` (same project as local `.env`).
3. No quotes or trailing spaces in values.
4. **Redeploy** after editing env vars.

Get keys: Supabase Dashboard → Project **zygkofiiurlsnrkcmaya** → Settings → API.

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
