-- News: storage bucket + policies for image uploads

insert into storage.buckets (id, name, public)
select 'news', 'news', true
where not exists (select 1 from storage.buckets where id = 'news');

-- Storage policies (public read, authenticated write/delete)
drop policy if exists "News public read" on storage.objects;
create policy "News public read" on storage.objects
  for select using (bucket_id = 'news');

drop policy if exists "News authenticated uploads" on storage.objects;
create policy "News authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'news');

drop policy if exists "News authenticated updates" on storage.objects;
create policy "News authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'news')
  with check (bucket_id = 'news');

drop policy if exists "News authenticated deletes" on storage.objects;
create policy "News authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'news');
