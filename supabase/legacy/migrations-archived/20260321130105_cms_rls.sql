-- 005_cms RLS and security hardening
-- Ember Network CMS tables (run after schema.sql + platform.sql)

-- SITE CONTENT (simple JSON per key)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_content enable row level security;

drop policy if exists "site_content_read_public" on public.site_content;
create policy "site_content_read_public"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "site_content_manage_staff" on public.site_content;
create policy "site_content_manage_staff"
on public.site_content
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- Keep updated_at fresh
create or replace function public.touch_site_content()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_touch_updated_at on public.site_content;
create trigger site_content_touch_updated_at
before update on public.site_content
for each row
execute function public.touch_site_content();

-- MEDIA ASSETS (metadata + storage path)
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  bucket text not null default 'public',
  path text not null,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  alt text,
  title text,
  tags text[] not null default '{}',
  unique (bucket, path)
);

alter table public.media_assets enable row level security;

drop policy if exists "media_assets_select_authed" on public.media_assets;
create policy "media_assets_select_authed"
on public.media_assets
for select
to authenticated
using (true);

drop policy if exists "media_assets_manage_staff" on public.media_assets;
create policy "media_assets_manage_staff"
on public.media_assets
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- Run after schema.sql, platform.sql, and cms.sql
-- Structured CMS rows + audit log (production-oriented)

-- Applications: optional address from public apply form
alter table public.applications add column if not exists address text;

-- CMS content (page + section; draft/publish separate from site_content JSON)
create table if not exists public.cms_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  title text,
  body text,
  media_url text,
  published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create index if not exists cms_content_page_key_idx on public.cms_content(page_key);
create index if not exists cms_content_published_idx on public.cms_content(published, updated_at desc);

alter table public.cms_content enable row level security;

drop policy if exists "cms_content_read_public" on public.cms_content;
create policy "cms_content_read_public"
on public.cms_content
for select
to anon, authenticated
using (published = true);

drop policy if exists "cms_content_select_staff_all" on public.cms_content;
create policy "cms_content_select_staff_all"
on public.cms_content
for select
to authenticated
using (public.is_staff());

drop policy if exists "cms_content_manage_staff" on public.cms_content;
create policy "cms_content_manage_staff"
on public.cms_content
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop trigger if exists cms_content_touch_updated_at on public.cms_content;
create trigger cms_content_touch_updated_at
before update on public.cms_content
for each row
execute function public.touch_updated_at();

-- Activity / audit log (staff read; insert via trigger or service role — here: staff insert for app-side logging)
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);
create index if not exists activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_select_staff" on public.activity_logs;
create policy "activity_logs_select_staff"
on public.activity_logs
for select
to authenticated
using (public.is_staff());

drop policy if exists "activity_logs_insert_staff" on public.activity_logs;
create policy "activity_logs_insert_staff"
on public.activity_logs
for insert
to authenticated
with check (actor_user_id = auth.uid() and public.is_staff());
-- Contact submissions (public insert; staff read)
-- Run after schema.sql + platform.sql

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null
);

create index if not exists contact_submissions_created_at_idx on public.contact_submissions(created_at desc);
create index if not exists contact_submissions_email_idx on public.contact_submissions(email);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_insert_public" on public.contact_submissions;
create policy "contact_submissions_insert_public"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "contact_submissions_select_staff" on public.contact_submissions;
create policy "contact_submissions_select_staff"
on public.contact_submissions
for select
to authenticated
using (public.is_staff());

-- Security hardening migration
-- Run AFTER supabase/schema.sql + supabase/platform.sql have been applied.
-- Safe to re-run: all statements are idempotent.
--
-- Background:
-- The Express server uses the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Before this migration, several PUT endpoints applied req.body to Supabase as
-- an unwhitelisted patch — meaning a logged-in user could escalate their own
-- role to super_admin via PUT /api/profile with { "role": "super_admin" }.
-- The server-side fix is field whitelisting (see server/index.js). This file
-- adds defense-in-depth at the database layer so direct PostgREST calls
-- (which use the anon key and DO go through RLS) cannot escalate either.

-- 1) Trigger guard: only super_admin can change profiles.role / status / user_id
--
-- Service-role traffic (auth.uid() IS NULL) is allowed through, because the
-- server already enforces a field whitelist. Anything else must be authored
-- by an active super_admin.

create or replace function public.guard_profile_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  caller_status text;
begin
  -- Service role / postgres connections: auth.uid() is null. Trust the server's whitelist.
  if auth.uid() is null then
    return new;
  end if;

  -- No-op updates (no sensitive column changed) are always fine.
  if new.role is not distinct from old.role
     and new.status is not distinct from old.status
     and new.user_id is not distinct from old.user_id
  then
    return new;
  end if;

  select p.role, p.status
    into caller_role, caller_status
  from public.profiles p
  where p.user_id = auth.uid();

  if caller_role = 'super_admin' and caller_status = 'active' then
    return new;
  end if;

  raise exception 'Only an active super_admin may change profiles.role, profiles.status, or profiles.user_id'
    using errcode = '42501'; -- insufficient_privilege
end;
$$;

drop trigger if exists profiles_guard_sensitive on public.profiles;
create trigger profiles_guard_sensitive
before update on public.profiles
for each row
execute function public.guard_profile_sensitive_columns();

-- 2) Notify PostgREST to reload the schema cache so the new trigger is picked up.
notify pgrst, 'reload schema';

-- 3) profiles_admin view (B1) — safer surface for admin reads.
--
-- The existing profiles_select_staff policy lets staff read every column of
-- every user, including PII (phone, country, goals). The frontend currently
-- selects narrow column lists, so PII is not actively leaked in the UI, but
-- this view formalizes that contract so a future careless `.select('*')` in
-- an admin component can't accidentally exfiltrate PII.

create or replace view public.profiles_admin
with (security_invoker = true)
as
select
  user_id,
  full_name,
  email,
  role,
  status,
  mentor_user_id,
  profile_image_url,
  joined_at,
  updated_at
from public.profiles;

-- security_invoker = true means the view runs with the calling user's
-- permissions, so the underlying RLS on profiles still applies. That's the
-- correct behavior: staff sees rows their RLS lets them see, but only the
-- non-PII columns above. The view is the new pattern for admin UIs; the
-- broad table policy is kept in place to avoid breaking existing queries
-- in src/services/adminMembers.js and src/pages/admin/AdminCourseEditor.jsx
-- which already select narrow column lists. Migration path:
--   1) Switch admin services to read from profiles_admin.
--   2) Drop profiles_select_staff (the broad policy).
--   3) Optionally: revoke SELECT (phone, country, goals) on public.profiles
--      from authenticated. Self-reads via profiles_select_own still work.

grant select on public.profiles_admin to authenticated;

-- 4) Notify PostgREST a second time so the view is exposed in the API.
notify pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- Notes for follow-up work (NOT applied here):
--
-- * The applications stamp trigger relies on auth.uid(). The server now sets
--   reviewed_by / reviewed_at explicitly in the update payload because the
--   service-role connection has a NULL auth.uid(). No DB change needed.
--
-- * After admin services are migrated to profiles_admin, the next hardening
--   step is to revoke column-level SELECT for the most sensitive PII:
--     revoke select (phone, country, goals) on public.profiles from authenticated;
--   At that point, only the service-role server and the row-owner (via
--   profiles_select_own) can read those columns directly. The view excludes
--   them, so even staff can't pull them via PostgREST.
