-- Notices: ensure RLS + realtime + storage bucket policies so admin changes reflect on public site

-- 1) Table settings for realtime
-- Realtime works best when replica identity is FULL for updates/deletes payloads
alter table public.notices replica identity full;

-- Ensure table is part of realtime publication
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notices'
  ) then
    execute 'alter publication supabase_realtime add table public.notices';
  end if;
end
$$;

-- 2) RLS policies
alter table public.notices enable row level security;

drop policy if exists notices_read_published on public.notices;
create policy notices_read_published
on public.notices for select
using (published = true);

drop policy if exists notices_authenticated_rw on public.notices;
create policy notices_authenticated_rw
on public.notices for all
to authenticated
using (true)
with check (true);

-- 3) Storage bucket for notice attachments
-- Admin UI uploads to bucket: "notices"
insert into storage.buckets (id, name, public)
select 'notices', 'notices', true
where not exists (select 1 from storage.buckets where id = 'notices');

-- Storage policies (public read, authenticated write/update/delete)
drop policy if exists "Notices public read" on storage.objects;
create policy "Notices public read" on storage.objects
  for select using (bucket_id = 'notices');

drop policy if exists "Notices authenticated uploads" on storage.objects;
create policy "Notices authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'notices');

drop policy if exists "Notices authenticated updates" on storage.objects;
create policy "Notices authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'notices')
  with check (bucket_id = 'notices');

drop policy if exists "Notices authenticated deletes" on storage.objects;
create policy "Notices authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'notices');
