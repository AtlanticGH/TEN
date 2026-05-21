# Migration chain (deterministic order)

Migrations apply in **filename timestamp** order. Do not insert `ALTER` before `CREATE` for the same table.

| Order | File | Purpose |
|------:|------|---------|
| 001 | `20260321120000_extensions.sql` | `uuid-ossp`, `pgcrypto`, `pg_trgm`, `citext` |
| 002 | `20260321130101_profiles_create.sql` | `profiles` CREATE → legacy ALTER → core tables → RLS |
| 003 | `20260321130102_teams.sql` | Teams (FK → `profiles.user_id`) |
| 004 | `20260321130103_courses.sql` | Applications, lessons, resources, helpers |
| 005 | `20260321130104_storage.sql` | Storage buckets + policies |
| 006 | `20260321130105_cms_rls.sql` | CMS tables + `is_staff` guards |
| 007 | `20260321130106_schema_cache.sql` | PostgREST reload + additive columns |
| 008 | `20260321130107_realtime_publication.sql` | Realtime publication |
| 009 | `20260321130108_profiles_role_constraint.sql` | Profile role CHECK alignment |
| 010 | `20260321130110_ensure_extensions.sql` | Repair remotes that applied empty `20000` placeholder |
| 011 | `20260321130112_mentor_workspace.sql` | Mentor courses ownership, assignment submissions, mentor RLS |
| 012 | `20260321130113_schema_completeness.sql` | View grants, mentor read policies, storage buckets, realtime |
| 013 | `20260321130114_fix_profiles_rls_recursion.sql` | `SECURITY DEFINER` `is_staff`/`is_admin`; fix profiles RLS recursion |
| 014 | `20260321130115_mentor_announcements.sql` | Legacy admin-audience mentor_mentees on `announcements` (superseded for mentors by 016) |
| 015 | `20260321130116_mentor_student_communication.sql` | `mentor_students`, `mentor_announcements`, recipients, peer profile RLS, realtime |
| 016 | `20260321130117_fix_mentor_announcements_rls.sql` | Break `mentor_announcements` ↔ recipients RLS recursion |

Full architecture: `docs/DATABASE_ARCHITECTURE.md`

## Clean database

```bash
supabase db reset    # local only
supabase db push --linked --yes
```

## Broken pattern (fixed)

Previously `20260321130101_profiles.sql` ran `ALTER TABLE public.profiles` **before** `CREATE TABLE public.profiles`, which fails on an empty database.
