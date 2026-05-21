# Supabase CLI — The Ember Network

**Project ref:** `vawqdpalwuoyqntseqni`  
**URL:** `https://vawqdpalwuoyqntseqni.supabase.co`

## Prerequisites

```bash
brew install supabase/tap/supabase   # or: npm i -g supabase
supabase --version                   # expect 2.x
```

## Auth & link (required once per machine)

```bash
supabase login
supabase link --project-ref vawqdpalwuoyqntseqni
```

Use your **database password** from:  
Dashboard → Project Settings → Database.

## Pull remote baseline (recommended before first push)

```bash
supabase db pull --schema public,storage,auth
```

Replaces `migrations/20260321120000_remote_schema.sql` with the live snapshot.

## Apply local migrations

If the pooler hits **circuit breaker** / auth errors, set the DB password explicitly:

```bash
export SUPABASE_DB_PASSWORD='your-database-password'
supabase db push
```

```bash
supabase db push --dry-run
supabase db push
```

**Known remote drift:** If `profiles` was created with column `id` instead of `user_id`, migration `20260321130101` renames it automatically before RLS policies run.

## Migration order

| File | Contents |
|------|----------|
| `20260321120000_remote_schema.sql` | Pulled baseline (placeholder until `db pull`) |
| `20260321130101_profiles.sql` | Extensions, profiles, courses/modules/enrollments, base RLS |
| `20260321130102_teams.sql` | Teams + team_members |
| `20260321130103_courses.sql` | Platform (lessons, apps, sessions), learning CMS |
| `20260321130104_storage.sql` | Storage buckets + policies |
| `20260321130105_cms_rls.sql` | CMS, contact, security fixes |
| `20260321130106_schema_cache.sql` | `NOTIFY pgrst` + additive columns/indexes |

Legacy ad-hoc SQL lives in `supabase/legacy/` (reference only).

## Content

Public marketing copy is edited in **Admin → Website content** (`site_content` table).  
`supabase/seed.sql` is intentionally empty for production.

## Env vars (`.env` / `.env.local`)

```env
VITE_SUPABASE_URL=https://vawqdpalwuoyqntseqni.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from dashboard>
SUPABASE_URL=https://vawqdpalwuoyqntseqni.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role — server only, never commit>
```

## Post-deploy admin

```sql
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

## Schema cache refresh (if PostgREST misses tables)

```sql
NOTIFY pgrst, 'reload schema';
```
