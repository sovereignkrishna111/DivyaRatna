-- Gallery: items + storage bucket + RLS
create extension if not exists pgcrypto;

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  storage_path text,
  image_url text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_gallery_items_updated_at on public.gallery_items;
create trigger set_gallery_items_updated_at
before update on public.gallery_items
for each row execute function public.set_updated_at();

create index if not exists idx_gallery_items_published on public.gallery_items (published);
create index if not exists idx_gallery_items_type on public.gallery_items (type);
create index if not exists idx_gallery_items_sort_order on public.gallery_items (sort_order);
create index if not exists idx_gallery_items_updated_at on public.gallery_items (updated_at desc);

alter table public.gallery_items enable row level security;

-- Public website can read published gallery items
drop policy if exists gallery_items_read_published on public.gallery_items;
create policy gallery_items_read_published on public.gallery_items
for select using (published = true);

-- Authenticated users can manage gallery items (admin)
drop policy if exists gallery_items_authenticated_rw on public.gallery_items;
create policy gallery_items_authenticated_rw on public.gallery_items
for all to authenticated
using (true)
with check (true);

-- Storage bucket for gallery images (public read)
insert into storage.buckets (id, name, public)
select 'gallery', 'gallery', true
where not exists (select 1 from storage.buckets where id = 'gallery');

-- Storage policies (public read, authenticated write/delete)
drop policy if exists "Gallery public read" on storage.objects;
create policy "Gallery public read" on storage.objects
  for select using (bucket_id = 'gallery');

drop policy if exists "Gallery authenticated uploads" on storage.objects;
create policy "Gallery authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery');

drop policy if exists "Gallery authenticated updates" on storage.objects;
create policy "Gallery authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery')
  with check (bucket_id = 'gallery');

drop policy if exists "Gallery authenticated deletes" on storage.objects;
create policy "Gallery authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery');
