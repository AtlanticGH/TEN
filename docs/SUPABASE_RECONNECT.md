# Disconnect / reconnect Supabase (correct project)

This repo uses **Ember Network** only:

| | Value |
|---|--------|
| **Project name** | Ember Network |
| **Project ref** | `vawqdpalwuoyqntseqni` |
| **URL** | `https://vawqdpalwuoyqntseqni.supabase.co` |

Do **not** use **Ember Backend** (`lfdttxwvjgypljuhgjeu`) or **The Ember Network** (`fzonjmztifrptdlvfhwa`) for this codebase unless you intentionally migrate.

---

## 1. Supabase CLI (local)

```bash
cd "/path/to/TEN-fixed"
supabase unlink
supabase link --project-ref vawqdpalwuoyqntseqni
```

Verify:

```bash
cat supabase/.temp/project-ref
# must print: vawqdpalwuoyqntseqni

supabase projects list
# Ember Network row should show ● LINKED
```

Push migrations to the correct remote:

```bash
supabase db push --linked --yes
npm run setup:check
```

---

## 2. Local `.env` / `.env.local`

From [Supabase Dashboard → Ember Network → Settings → API](https://supabase.com/dashboard/project/vawqdpalwuoyqntseqni/settings/api):

```env
VITE_SUPABASE_URL=https://vawqdpalwuoyqntseqni.supabase.co
VITE_SUPABASE_ANON_KEY=<anon eyJ... key>

SUPABASE_URL=https://vawqdpalwuoyqntseqni.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role eyJ... key>
```

Confirm JWT payload includes `"ref":"vawqdpalwuoyqntseqni"` (paste key at [jwt.io](https://jwt.io) — do not share publicly).

```bash
npm run setup:check
```

---

## 3. Vercel (production)

### If Supabase integration is connected

1. Vercel → Project → **Settings** → **Integrations** (or **Storage**)
2. **Disconnect** the wrong Supabase project (e.g. Ember Backend)
3. **Connect** integration to **Ember Network** (`vawqdpalwuoyqntseqni`),  
   **or** skip integration and set env vars manually (recommended for full control)

### Environment variables (manual)

Delete old Supabase vars, then add from **Ember Network** API settings:

| Variable | Source |
|----------|--------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret |
| `FRONTEND_ORIGIN` | `https://ember-network-qc25.vercel.app` |
| `SITE_URL` | same |

Leave `VITE_API_URL` empty. **Redeploy** without build cache.

Verify:

```bash
curl -s https://ember-network-qc25.vercel.app/api/healthz
# expect: ok

npm run verify:prod
```

---

## 4. Symptom → cause

| Symptom | Likely cause |
|---------|----------------|
| `Invalid API key` on Vercel | Keys from wrong Supabase project |
| `setup:check` OK locally, prod fails | Vercel still on old project keys |
| `db push` changes wrong DB | CLI linked to `lfdttxwvjgypljuhgjeu` instead of `vawqdpalwuoyqntseqni` |
| Empty admin / missing CMS | Data lives in a different project |

---

## 5. Optional: fetch keys via CLI

```bash
supabase link --project-ref vawqdpalwuoyqntseqni
supabase projects api-keys --project-ref vawqdpalwuoyqntseqni
```

Copy **anon** and **service_role** into `.env` and Vercel (never commit `.env`).
