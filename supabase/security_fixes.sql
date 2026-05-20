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
