create extension if not exists pgcrypto;

create table if not exists public.birthdays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  class_name text,
  section text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  storage_path text,
  image_url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_birthdays_updated_at on public.birthdays;
create trigger set_birthdays_updated_at
before update on public.birthdays
for each row execute function public.set_updated_at();

create index if not exists idx_birthdays_published on public.birthdays (published);
create index if not exists idx_birthdays_start_end on public.birthdays (start_at, end_at);
create index if not exists idx_birthdays_updated_at on public.birthdays (updated_at desc);

alter table public.birthdays enable row level security;

drop policy if exists birthdays_public_read_active on public.birthdays;
create policy birthdays_public_read_active
on public.birthdays for select
using (
  published = true
  and start_at <= now()
  and end_at > now()
);

drop policy if exists birthdays_authenticated_rw on public.birthdays;
create policy birthdays_authenticated_rw
on public.birthdays for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
select 'birthdays', 'birthdays', true
where not exists (select 1 from storage.buckets where id = 'birthdays');

drop policy if exists "Birthdays public read" on storage.objects;
create policy "Birthdays public read" on storage.objects
  for select using (bucket_id = 'birthdays');

drop policy if exists "Birthdays authenticated uploads" on storage.objects;
create policy "Birthdays authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'birthdays');

drop policy if exists "Birthdays authenticated updates" on storage.objects;
create policy "Birthdays authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'birthdays')
  with check (bucket_id = 'birthdays');

drop policy if exists "Birthdays authenticated deletes" on storage.objects;
create policy "Birthdays authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'birthdays');
