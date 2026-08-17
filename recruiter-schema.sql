-- ═══════════════════════════════════════════════════════════════════════
-- Dronaskill — recruiter matching schema
-- ───────────────────────────────────────────────────────────────────────
-- Backs the "opt in to be visible to recruiters" toggle on dashboard.html
-- and the open criteria form on recruiters.html.
--
-- HOW TO RUN THIS:
--   Supabase Dashboard → SQL Editor → New query → paste this whole file →
--   Run. One-time setup; nothing here needs to be re-run later unless you
--   change the schema.
--
-- Row Level Security is what actually enforces the opt-in: a row is only
-- ever readable by the public (anon key) if visible_to_recruiters = true.
-- Turning that flag off on dashboard.html immediately stops the row from
-- being returned to recruiters.html, even though the row still exists.
-- ═══════════════════════════════════════════════════════════════════════

create table public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  career_track_id text,
  career_track_label text,
  education_level text,
  stream text,
  known_skills text[] not null default '{}',
  visible_to_recruiters boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.student_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.student_profiles(id) on delete cascade,
  domain text not null,
  score int not null,
  total int not null,
  date_iso date not null,
  cert_code text not null,
  synced_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;
alter table public.student_certifications enable row level security;

-- A signed-in student can always read/write their own row.
create policy "own profile select" on public.student_profiles
  for select to authenticated using (auth.uid() = id);

create policy "own profile upsert" on public.student_profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "own profile update" on public.student_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Anyone (including the anon key used by recruiters.html) can read a
-- profile row IF that student has opted in. This is the actual matching
-- query path, and the actual enforcement point for "opt-in required."
create policy "public visible profiles" on public.student_profiles
  for select to anon, authenticated using (visible_to_recruiters = true);

create policy "own certs select" on public.student_certifications
  for select to authenticated using (auth.uid() = user_id);

create policy "own certs insert" on public.student_certifications
  for insert to authenticated with check (auth.uid() = user_id);

create policy "own certs delete" on public.student_certifications
  for delete to authenticated using (auth.uid() = user_id);

-- Anon/public can read a student's certifications only if that student's
-- profile is currently opted in.
create policy "public visible certs" on public.student_certifications
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.student_profiles p
      where p.id = user_id and p.visible_to_recruiters = true
    )
  );
