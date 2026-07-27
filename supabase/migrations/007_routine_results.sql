create extension if not exists pgcrypto;

create table if not exists public.bulletin_documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  class_level int not null,
  title text,
  date date not null,
  storage_path text,
  image_url text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bulletin_documents
  drop constraint if exists bulletin_documents_kind_check,
  add constraint bulletin_documents_kind_check check (kind in ('routine','result'));

alter table public.bulletin_documents
  drop constraint if exists bulletin_documents_class_level_check,
  add constraint bulletin_documents_class_level_check check (class_level between 1 and 12);

drop trigger if exists set_bulletin_documents_updated_at on public.bulletin_documents;
create trigger set_bulletin_documents_updated_at
before update on public.bulletin_documents
for each row execute function public.set_updated_at();

create index if not exists idx_bulletin_documents_kind_class on public.bulletin_documents (kind, class_level);
create index if not exists idx_bulletin_documents_published on public.bulletin_documents (published);
create index if not exists idx_bulletin_documents_date_sort on public.bulletin_documents (date asc, sort_order asc, created_at asc);
create index if not exists idx_bulletin_documents_updated_at on public.bulletin_documents (updated_at desc);

alter table public.bulletin_documents enable row level security;

drop policy if exists bulletin_documents_read_published on public.bulletin_documents;
create policy bulletin_documents_read_published
on public.bulletin_documents for select
using (published = true);

drop policy if exists bulletin_documents_authenticated_rw on public.bulletin_documents;
create policy bulletin_documents_authenticated_rw
on public.bulletin_documents for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
select 'bulletin_documents', 'bulletin_documents', true
where not exists (select 1 from storage.buckets where id = 'bulletin_documents');

drop policy if exists "Bulletin documents public read" on storage.objects;
create policy "Bulletin documents public read" on storage.objects
  for select using (bucket_id = 'bulletin_documents');

drop policy if exists "Bulletin documents authenticated uploads" on storage.objects;
create policy "Bulletin documents authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'bulletin_documents');

drop policy if exists "Bulletin documents authenticated updates" on storage.objects;
create policy "Bulletin documents authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'bulletin_documents')
  with check (bucket_id = 'bulletin_documents');

drop policy if exists "Bulletin documents authenticated deletes" on storage.objects;
create policy "Bulletin documents authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'bulletin_documents');

do $$
begin
  alter publication supabase_realtime add table public.bulletin_documents;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
