# Supabase migration audit (Phase 2)

**Project ref:** `vawqdpalwuoyqntseqni`  
**Remote pull:** Not executed in CI — requires `npx supabase login` then `supabase link` + `supabase db pull`.  
**Baseline file:** `supabase/migrations/20260321120000_remote_schema.sql` (placeholder until pull).  
**Canonical migrations:** `supabase/migrations/20260321130101–08_*.sql` (split from legacy `supabase/legacy/*.sql`).  
**Remote status (2026-05-21):** All migrations applied — `supabase migration list` shows local/remote in sync.

## A) Tables — expected vs actual (app + legacy SQL)

| Table | In legacy migration | In app code | Spec checklist name |
|-------|---------------------|-------------|---------------------|
| profiles | Yes (`user_id` PK) | Yes | profiles (spec uses `id`; **app uses `user_id`**) |
| applications | Yes | Yes | Yes (columns differ — see B) |
| courses | Yes | Yes | Yes (`published` bool vs `status` enum) |
| lessons | Yes (`module_id` FK) | Yes | Spec: `course_id` FK — **app uses modules** |
| modules | Yes | Yes | Not in spec list (required by app) |
| enrollments | Yes | Yes | Yes |
| lesson_progress | View alias only | App uses `lesson_completions` | Spec table name differs |
| lesson_completions | Yes | Yes | Actual progress table |
| announcements | Yes | Yes | Yes (uses `published_at` vs `published` bool) |
| resources | Yes | Yes | Yes (no `type`/`is_public` in DB; public RLS) |
| sessions | Yes | Yes | Yes (`starts_at` vs `scheduled_at`) |
| session_attendees | Yes | Yes | Yes (`status` vs `attended` bool) |
| site_content | Yes | Yes | Yes (`key` PK, no `id` column) |

**Also in migration (app/server):** `cms_content`, `contact_submissions`, `media_assets`, `activity_logs`, `teams`, `team_members`, `quizzes`, `quiz_attempts`, `lesson_files`, `assignments`, `module_completions`, `course_completions`, `notifications`, `mentorship_milestones`, etc.

## B) Column mismatches (spec vs production schema)

- **profiles:** PK is `user_id`, not `id`. Roles include `student`, `mentor`, `staff`, `admin`, `super_admin` (not only `member`). `profile_image_url` / `avatar_path` instead of single `avatar_url` (migration adds `avatar_url` optionally).
- **applications:** Status enum `submitted|waitlist|approved|rejected`; fields `interest_role`, `message`, `reviewed_by` (not `reviewer_id` / `business_name` / `motivation`).
- **courses:** `published` boolean; no `slug` / `status` / `created_by` in base schema.
- **lessons:** Belong to `modules`, not directly to `courses`.
- **site_content:** `key` is primary key; no surrogate `id`.

## C) Indexes

Legacy SQL + `20240101000001` add most indexes. Added in migration: GIN FTS on `courses` and `resources`. Spec email index on profiles — add via `profiles_email_idx` if missing (email column exists).

## D) Functions & triggers

Present in consolidated migration: `touch_updated_at`, `handle_new_user`, `is_admin`, `is_staff`, `stamp_application_review`, `guard_profile_sensitive_columns`, team helpers, announcement notify, etc.

## E) RLS

Enabled on all public app tables in legacy files. Policies use `is_staff()` / `is_admin()` helpers.

## F) Extensions

`pgcrypto`, `citext`, `uuid-ossp`, `pg_trgm` declared at top of `20240101000001`.

## G) Storage buckets

| Bucket | Status |
|--------|--------|
| public | In `storage.sql` |
| avatars | In `avatars_storage.sql` |
| course-media | Added in `20240101000001` |
| resources | Added in `20240101000001` |

## Next steps for operators

1. `npx supabase login`
2. `npx supabase link --project-ref vawqdpalwuoyqntseqni`
3. `npx supabase db pull --schema public,storage,auth` → replaces `20260321120000_remote_schema.sql`
4. `npx supabase db push` (or `db push --dry-run` first)
