-- Mentor workspace: course ownership, assignment submissions, mentor RLS helpers

create or replace function public.is_mentor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'mentor'
      and p.status = 'active'
  );
$$;

alter table public.courses
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists courses_created_by_idx on public.courses(created_by, created_at desc);

-- Student work submitted against lesson assignments
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'needs_revision')),
  notes text,
  link_url text,
  grade text,
  mentor_feedback text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  unique (assignment_id, user_id)
);

create index if not exists assignment_submissions_user_idx
  on public.assignment_submissions(user_id, updated_at desc);
create index if not exists assignment_submissions_assignment_idx
  on public.assignment_submissions(assignment_id, status, updated_at desc);

drop trigger if exists assignment_submissions_touch_updated_at on public.assignment_submissions;
create trigger assignment_submissions_touch_updated_at
before update on public.assignment_submissions
for each row
execute function public.touch_updated_at();

alter table public.assignment_submissions enable row level security;

drop policy if exists "assignment_submissions_select_own" on public.assignment_submissions;
create policy "assignment_submissions_select_own"
on public.assignment_submissions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "assignment_submissions_insert_own" on public.assignment_submissions;
create policy "assignment_submissions_insert_own"
on public.assignment_submissions
for insert
to authenticated
with check (user_id = auth.uid() and status = 'submitted');

drop policy if exists "assignment_submissions_update_own" on public.assignment_submissions;
create policy "assignment_submissions_update_own"
on public.assignment_submissions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and status = 'submitted');

drop policy if exists "assignment_submissions_select_mentor" on public.assignment_submissions;
create policy "assignment_submissions_select_mentor"
on public.assignment_submissions
for select
to authenticated
using (
  public.is_mentor()
  and exists (
    select 1
    from public.profiles p
    where p.user_id = assignment_submissions.user_id
      and p.mentor_user_id = auth.uid()
  )
);

drop policy if exists "assignment_submissions_update_mentor" on public.assignment_submissions;
create policy "assignment_submissions_update_mentor"
on public.assignment_submissions
for update
to authenticated
using (
  public.is_mentor()
  and exists (
    select 1
    from public.profiles p
    where p.user_id = assignment_submissions.user_id
      and p.mentor_user_id = auth.uid()
  )
)
with check (
  public.is_mentor()
  and exists (
    select 1
    from public.profiles p
    where p.user_id = assignment_submissions.user_id
      and p.mentor_user_id = auth.uid()
  )
);

drop policy if exists "assignment_submissions_manage_staff" on public.assignment_submissions;
create policy "assignment_submissions_manage_staff"
on public.assignment_submissions
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- Mentors may create/update their own courses (API also enforces created_by)
drop policy if exists "courses_manage_mentor_own" on public.courses;
create policy "courses_manage_mentor_own"
on public.courses
for all
to authenticated
using (public.is_mentor() and created_by = auth.uid())
with check (public.is_mentor() and created_by = auth.uid());
