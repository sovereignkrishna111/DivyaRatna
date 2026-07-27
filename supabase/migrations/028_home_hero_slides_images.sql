create extension if not exists pgcrypto;

alter table if exists public.home_hero_slides
  add column if not exists storage_path text,
  add column if not exists image_url text not null default '';

insert into storage.buckets (id, name, public)
select 'home_hero', 'home_hero', true
where not exists (select 1 from storage.buckets where id = 'home_hero');

drop policy if exists "Home hero public read" on storage.objects;
create policy "Home hero public read" on storage.objects
  for select using (bucket_id = 'home_hero');

drop policy if exists "Home hero authenticated uploads" on storage.objects;
create policy "Home hero authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'home_hero');

drop policy if exists "Home hero authenticated updates" on storage.objects;
create policy "Home hero authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'home_hero')
  with check (bucket_id = 'home_hero');

drop policy if exists "Home hero authenticated deletes" on storage.objects;
create policy "Home hero authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'home_hero');
