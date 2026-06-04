# CMS v2 migrations

Legacy migrations were archived to `supabase/legacy/migrations-archived/`.

## Apply (linked remote)

```bash
npm run supabase:push:dry-run
npm run supabase:push
```

## Local fresh database

```bash
supabase db reset
```

This runs, in order:

1. `20260401000000_extensions.sql`
2. `20260401000001_cms_schema.sql`
3. `20260401000002_cms_rls.sql`
4. `20260401000003_storage.sql`
5. `20260401000004_cms_seed.sql`
6. `20260401000005_api_alignment.sql`
7. `supabase/seed.sql` (home hero JSON)

## After migrate

```bash
npm run bootstrap:admin -- --email you@example.com --password YourSecurePass1 --name "Admin"
npm run bootstrap:cms
```

See `docs/CMS_ARCHITECTURE.md` for schema and API reference.
