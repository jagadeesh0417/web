-- ============================================================
-- Akradhii — Supabase schema & Row Level Security
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Works with the code in src/lib/supabase/* — same column names
-- as the demo data layer (src/lib/data/sample-data.ts).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  phone text,
  role text not null default 'user'
    check (role in ('user','applicant','intern','client','mentor','employee','admin','super_admin')),
  title text,
  company text,
  college text,
  year text,
  location text,
  bio text,
  skills text[] default '{}',
  links jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- internship programs ----------
create table if not exists public.programs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  category text not null,
  duration_weeks int not null,
  price int not null,
  featured boolean default false,
  skills text[] default '{}',
  created_at timestamptz not null default now()
);

-- ---------- applications ----------
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  program_title text not null,
  category text not null,
  duration_weeks int not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  college text,
  degree text,
  graduation_year text,
  mode text default 'remote',
  start_date date,
  cover_letter text,
  resume_url text,
  id_proof_url text,
  status text not null default 'pending'
    check (status in ('pending','under_review','approved','rejected','request_info','enrolled','completed','withdrawn')),
  review_note text,
  mentor_id uuid references public.profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------- modules / curriculum ----------
create table if not exists public.modules (
  id uuid primary key default uuid_generate_v4(),
  program_slug text not null,
  title text not null,
  description text,
  duration_hours int default 2,
  lessons jsonb default '[]'::jsonb,
  resources jsonb default '[]'::jsonb,
  quiz jsonb default '{"questions": []}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- assignments ----------
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  program_slug text not null,
  module_id uuid references public.modules(id),
  title text not null,
  description text,
  due_date timestamptz,
  max_score int default 100
);

-- ---------- submissions ----------
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text,
  file_urls text[] default '{}',
  status text not null default 'submitted'
    check (status in ('submitted','resubmitted','reviewed')),
  score int,
  feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (assignment_id, user_id)
);

-- ---------- sessions (live / recorded) ----------
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  program_slug text not null,
  title text not null,
  description text,
  type text default 'live' check (type in ('live','recorded','workshop')),
  starts_at timestamptz,
  duration_minutes int default 60,
  meeting_url text,
  recording_url text
);

-- ---------- attendance ----------
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'present' check (status in ('present','absent','excused')),
  marked_at timestamptz not null default now(),
  unique (session_id, user_id)
);

-- ---------- certificates ----------
create table if not exists public.certificates (
  id uuid primary key default uuid_generate_v4(),
  certificate_id text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  program_title text not null,
  category text not null,
  duration_weeks int not null,
  student_name text not null,
  score int,
  start_date date,
  end_date date,
  issued_by text default 'Akradhii',
  issued_at timestamptz not null default now()
);

-- ---------- notifications ----------
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text default 'info',
  title text not null,
  message text,
  link text,
  read boolean default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.modules enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;
alter table public.programs enable row level security;

-- helper: is the current user an admin (or super_admin)?
create or replace function public.is_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','super_admin')
  );
$$;

-- helper: is the current user a mentor?
create or replace function public.is_mentor()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('mentor')
  );
$$;

-- profiles: users manage their own, admins manage all
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_admin() or public.is_mentor());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- applications: applicant or admin
drop policy if exists "applications_select" on public.applications;
create policy "applications_select" on public.applications
  for select using (user_id = auth.uid() or public.is_admin() or public.is_mentor());

drop policy if exists "applications_insert" on public.applications;
create policy "applications_insert" on public.applications
  for insert with check (user_id = auth.uid());

drop policy if exists "applications_update" on public.applications;
create policy "applications_update" on public.applications
  for update using (public.is_admin());

-- programs & modules: public read, admin write
drop policy if exists "programs_read" on public.programs;
create policy "programs_read" on public.programs for select using (true);

drop policy if exists "programs_write" on public.programs;
create policy "programs_write" on public.programs for all using (public.is_admin());

drop policy if exists "modules_read" on public.modules;
create policy "modules_read" on public.modules for select using (true);

drop policy if exists "modules_write" on public.modules;
create policy "modules_write" on public.modules for all using (public.is_admin());

-- assignments & submissions: student, mentor, admin
drop policy if exists "assignments_read" on public.assignments;
create policy "assignments_read" on public.assignments for select using (true);

drop policy if exists "submissions_select" on public.submissions;
create policy "submissions_select" on public.submissions
  for select using (user_id = auth.uid() or public.is_admin() or public.is_mentor());

drop policy if exists "submissions_insert" on public.submissions;
create policy "submissions_insert" on public.submissions
  for insert with check (user_id = auth.uid());

drop policy if exists "submissions_update" on public.submissions;
create policy "submissions_update" on public.submissions
  for update using (user_id = auth.uid() or public.is_admin() or public.is_mentor());

-- sessions & attendance: enrolled students, mentors, admins
drop policy if exists "sessions_read" on public.sessions;
create policy "sessions_read" on public.sessions for select using (true);

drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance
  for select using (user_id = auth.uid() or public.is_admin() or public.is_mentor());

drop policy if exists "attendance_insert" on public.attendance;
create policy "attendance_insert" on public.attendance
  for insert with check (user_id = auth.uid() or public.is_mentor());

-- certificates: read own (public verification uses the api/verify route with service role)
drop policy if exists "certificates_select" on public.certificates;
create policy "certificates_select" on public.certificates
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "certificates_insert" on public.certificates;
create policy "certificates_insert" on public.certificates
  for insert with check (public.is_admin());

-- notifications: own only
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications
  for insert with check (user_id = auth.uid());

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications
  for update using (user_id = auth.uid());

-- ============================================================
-- Triggers
-- ============================================================
-- keep profiles in sync with auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Website leads (contact / internship / support → WhatsApp)
-- Optional table when you want durable storage beyond the
-- server file store used by /api/leads.
-- ============================================================
create table if not exists public.website_leads (
  id text primary key,
  form_type text not null,
  source text not null,
  page text,
  page_path text,
  name text,
  email text,
  phone text,
  company text,
  service text,
  internship text,
  course text,
  duration text,
  message text,
  fields jsonb not null default '{}'::jsonb,
  whatsapp_status text not null default 'pending'
    check (whatsapp_status in ('pending','sent','failed','skipped')),
  whatsapp_message_id text,
  whatsapp_error text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  language text,
  device_type text,
  ip_hash text,
  user_agent text,
  submitted_at timestamptz not null default now()
);

alter table public.website_leads enable row level security;

drop policy if exists "website_leads_admin_all" on public.website_leads;
create policy "website_leads_admin_all" on public.website_leads
  for all using (public.is_admin()) with check (public.is_admin());

-- Inserts are performed by the server (service role / route handler), not by anon clients.
