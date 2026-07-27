create extension if not exists pgcrypto;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  content text not null,
  rating int not null default 5 check (rating between 0 and 5),
  sort_order int not null default 0,
  storage_path text,
  image_url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

create index if not exists idx_testimonials_published on public.testimonials (published);
create index if not exists idx_testimonials_sort_order on public.testimonials (sort_order asc);
create index if not exists idx_testimonials_updated_at on public.testimonials (updated_at desc);

alter table public.testimonials enable row level security;

drop policy if exists testimonials_public_read_published on public.testimonials;
create policy testimonials_public_read_published
on public.testimonials for select
using (published = true);

drop policy if exists testimonials_authenticated_rw on public.testimonials;
create policy testimonials_authenticated_rw
on public.testimonials for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
select 'testimonials', 'testimonials', true
where not exists (select 1 from storage.buckets where id = 'testimonials');

drop policy if exists "Testimonials public read" on storage.objects;
create policy "Testimonials public read" on storage.objects
  for select using (bucket_id = 'testimonials');

drop policy if exists "Testimonials authenticated uploads" on storage.objects;
create policy "Testimonials authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'testimonials');

drop policy if exists "Testimonials authenticated updates" on storage.objects;
create policy "Testimonials authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'testimonials')
  with check (bucket_id = 'testimonials');

drop policy if exists "Testimonials authenticated deletes" on storage.objects;
create policy "Testimonials authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'testimonials');
