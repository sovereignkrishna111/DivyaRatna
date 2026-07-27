-- Achievements & Activities table + RLS
create table if not exists public.achievements_activities (
  id text primary key,
  title text not null,
  excerpt text not null,
  content text,
  date date not null,
  kind text not null,
  category text,
  image_url text,
  link_url text,
  author text,
  published boolean not null default false,
  created_at bigint,
  updated_at bigint
);

 alter table public.achievements_activities
   drop constraint if exists achievements_activities_kind_check,
   add constraint achievements_activities_kind_check check (kind in ('achievement','activity'));

-- Helpful indexes
create index if not exists idx_ach_act_published_date on public.achievements_activities (published, date desc);
create index if not exists idx_ach_act_kind_date on public.achievements_activities (kind, date desc);

-- RLS
alter table public.achievements_activities enable row level security;

-- Allow anyone to read published items
drop policy if exists achievements_activities_read_published on public.achievements_activities;
create policy achievements_activities_read_published
on public.achievements_activities for select
using (published = true);

-- Allow authenticated users full access (admin app)
drop policy if exists achievements_activities_authenticated_rw on public.achievements_activities;
create policy achievements_activities_authenticated_rw
on public.achievements_activities for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
select 'achievements_activities', 'achievements_activities', true
where not exists (select 1 from storage.buckets where id = 'achievements_activities');

drop policy if exists "Achievements activities public read" on storage.objects;
create policy "Achievements activities public read" on storage.objects
  for select using (bucket_id = 'achievements_activities');

drop policy if exists "Achievements activities authenticated uploads" on storage.objects;
create policy "Achievements activities authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'achievements_activities');

drop policy if exists "Achievements activities authenticated updates" on storage.objects;
create policy "Achievements activities authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'achievements_activities')
  with check (bucket_id = 'achievements_activities');

drop policy if exists "Achievements activities authenticated deletes" on storage.objects;
create policy "Achievements activities authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'achievements_activities');

 do $$
 begin
   alter publication supabase_realtime add table public.achievements_activities;
 exception
   when duplicate_object then null;
   when undefined_object then null;
 end $$;
