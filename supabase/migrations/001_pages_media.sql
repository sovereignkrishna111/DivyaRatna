-- Migration: pages + media + storage bucket + RLS
create extension if not exists pgcrypto;

-- Pages
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  theme jsonb,
  meta jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Media
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  url text not null,
  filename text,
  size bigint,
  mime text,
  alt text,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at before update on public.pages for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_pages_slug on public.pages (slug);
create index if not exists idx_pages_status on public.pages (status);
create index if not exists idx_media_created_at on public.media (created_at);

-- RLS
alter table public.pages enable row level security;
alter table public.media enable row level security;

-- Basic permissive policies (tighten later with roles)
create policy if not exists "pages_select" on public.pages for select using (true);
create policy if not exists "pages_insert" on public.pages for insert with check (true);
create policy if not exists "pages_update" on public.pages for update using (true) with check (true);
create policy if not exists "pages_delete" on public.pages for delete using (true);

create policy if not exists "media_select" on public.media for select using (true);
create policy if not exists "media_insert" on public.media for insert with check (true);
create policy if not exists "media_update" on public.media for update using (true) with check (true);
create policy if not exists "media_delete" on public.media for delete using (true);

-- Storage bucket for media (public)
insert into storage.buckets (id, name, public)
select 'media', 'media', true
where not exists (select 1 from storage.buckets where id = 'media');

-- Storage policies (public read, authenticated write/delete)
create policy if not exists "Public read access" on storage.objects
  for select using (bucket_id = 'media');

create policy if not exists "Authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media');

create policy if not exists "Authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy if not exists "Authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media');
