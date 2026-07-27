-- Supabase schema for admin panel
-- Run this in Supabase SQL editor

-- Extensions (for UUID generation if needed)
create extension if not exists pgcrypto;

-- Students
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  class_name text,
  section text,
  created_at timestamptz not null default now()
);

-- Teachers
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  class_name text,
  section text,
  created_at timestamptz not null default now()
);

-- Staff
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('Academic','Cultural','Sports','Holidays','Meetings','Examinations','Other')),
  date date,
  start_time time,
  end_time time,
  location text,
  audience text,
  image text,
  image_url text,
  link_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- RLS
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.staff enable row level security;
alter table public.events enable row level security;

-- Development policies (adjust for production)
create policy "allow read" on public.students for select using (true);
create policy "allow write" on public.students for insert with check (true);
create policy "allow delete" on public.students for delete using (true);

create policy "allow read" on public.teachers for select using (true);
create policy "allow write" on public.teachers for insert with check (true);
create policy "allow delete" on public.teachers for delete using (true);

create policy "allow read" on public.staff for select using (true);
create policy "allow write" on public.staff for insert with check (true);
create policy "allow delete" on public.staff for delete using (true);

create policy "allow read" on public.events for select using (true);
create policy "allow write" on public.events for insert with check (true);
create policy "allow update" on public.events for update using (true) with check (true);
create policy "allow delete" on public.events for delete using (true);

-- News & Media
create table if not exists public.news (
  id text primary key,
  title text not null,
  date date not null,
  category text,
  excerpt text not null,
  content text,
  image_url text,
  link_url text,
  author text,
  read_time text,
  published boolean not null default false,
  created_at bigint,
  updated_at bigint
);

alter table public.news enable row level security;
create policy "allow read" on public.news for select using (true);
create policy "allow write" on public.news for insert with check (true);
create policy "allow update" on public.news for update using (true) with check (true);
create policy "allow delete" on public.news for delete using (true);

-- Note: create a storage bucket named 'news' (public) in Supabase Storage UI for image uploads.
