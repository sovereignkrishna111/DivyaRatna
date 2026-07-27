-- Careers / Work at DRESS: dynamic hero settings + job openings

create extension if not exists pgcrypto;

-- Singleton settings row (id = 'default')
create table if not exists public.careers_settings (
  id text primary key default 'default',
  hero_title text not null default 'Work at DRESS',
  hero_subtitle text not null default 'Join our dedicated team of educators and professionals committed to excellence in education',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure there is always at least one row
insert into public.careers_settings (id)
values ('default')
on conflict (id) do nothing;

drop trigger if exists set_careers_settings_updated_at on public.careers_settings;
create trigger set_careers_settings_updated_at
before update on public.careers_settings
for each row execute function public.set_updated_at();

-- Job openings
create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  type text not null,
  location text,
  experience text,
  deadline date,
  description text,
  requirements text[] not null default '{}',
  responsibilities text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_job_openings_updated_at on public.job_openings;
create trigger set_job_openings_updated_at
before update on public.job_openings
for each row execute function public.set_updated_at();

create index if not exists idx_job_openings_published on public.job_openings (published);
create index if not exists idx_job_openings_department on public.job_openings (department);
create index if not exists idx_job_openings_deadline on public.job_openings (deadline);
create index if not exists idx_job_openings_sort_order on public.job_openings (sort_order);

-- Realtime payloads for updates (optional but useful)
alter table public.careers_settings replica identity full;
alter table public.job_openings replica identity full;

-- RLS
alter table public.careers_settings enable row level security;
alter table public.job_openings enable row level security;

-- Public site can read careers settings
drop policy if exists careers_settings_read_all on public.careers_settings;
create policy careers_settings_read_all
on public.careers_settings for select
using (true);

-- Admin (authenticated) can manage careers settings
drop policy if exists careers_settings_authenticated_rw on public.careers_settings;
create policy careers_settings_authenticated_rw
on public.careers_settings for all
to authenticated
using (true)
with check (true);

-- Public site reads only published job openings
drop policy if exists job_openings_read_published on public.job_openings;
create policy job_openings_read_published
on public.job_openings for select
using (published = true);

-- Admin (authenticated) can manage job openings
drop policy if exists job_openings_authenticated_rw on public.job_openings;
create policy job_openings_authenticated_rw
on public.job_openings for all
to authenticated
using (true)
with check (true);
