-- Press Releases: table + optional storage bucket/policies for attachments

create extension if not exists pgcrypto;

create table if not exists public.press_releases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  release_date date not null,
  location text,
  summary text,
  body text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  -- Optional primary attachment (PDF/image) stored in Supabase Storage
  attachment_storage_path text,
  attachment_url text,
  -- Optional external link (e.g., hosted PDF)
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_press_releases_updated_at on public.press_releases;
create trigger set_press_releases_updated_at
before update on public.press_releases
for each row execute function public.set_updated_at();

create index if not exists idx_press_releases_published_date on public.press_releases (published, release_date desc);
create index if not exists idx_press_releases_featured on public.press_releases (featured, release_date desc);
create index if not exists idx_press_releases_sort_order on public.press_releases (sort_order);

alter table public.press_releases enable row level security;

-- Public site reads only published press releases
drop policy if exists press_releases_read_published on public.press_releases;
create policy press_releases_read_published
on public.press_releases for select
using (published = true);

-- Authenticated users can manage press releases (admin)
drop policy if exists press_releases_authenticated_rw on public.press_releases;
create policy press_releases_authenticated_rw
on public.press_releases for all
to authenticated
using (true)
with check (true);

-- Storage bucket for press release attachments (public read)
insert into storage.buckets (id, name, public)
select 'press-releases', 'press-releases', true
where not exists (select 1 from storage.buckets where id = 'press-releases');

-- Storage policies (public read, authenticated write/delete)
drop policy if exists "Press Releases public read" on storage.objects;
create policy "Press Releases public read" on storage.objects
  for select using (bucket_id = 'press-releases');

drop policy if exists "Press Releases authenticated uploads" on storage.objects;
create policy "Press Releases authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'press-releases');

drop policy if exists "Press Releases authenticated updates" on storage.objects;
create policy "Press Releases authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'press-releases')
  with check (bucket_id = 'press-releases');

drop policy if exists "Press Releases authenticated deletes" on storage.objects;
create policy "Press Releases authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'press-releases');
