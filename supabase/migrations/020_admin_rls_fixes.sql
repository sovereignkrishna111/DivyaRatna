-- Fix admin panel RLS issues for uploads and editable tables

-- Ensure the media storage bucket exists and is public for reads
insert into storage.buckets (id, name, public)
select 'media', 'media', true
where not exists (select 1 from storage.buckets where id = 'media');

-- Storage policies for media bucket
-- (public read, authenticated write/update/delete)
drop policy if exists "Media public read" on storage.objects;
create policy "Media public read" on storage.objects
  for select
  using (bucket_id = 'media');

drop policy if exists "Media authenticated uploads" on storage.objects;
create policy "Media authenticated uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media');

drop policy if exists "Media authenticated updates" on storage.objects;
create policy "Media authenticated updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

drop policy if exists "Media authenticated deletes" on storage.objects;
create policy "Media authenticated deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media');

-- Admin editable tables
-- Allow public reads where appropriate, but require authenticated session for writes

-- site_theme
do $$
begin
  if to_regclass('public.site_theme') is not null then
    execute 'alter table public.site_theme enable row level security';
    execute 'drop policy if exists site_theme_read on public.site_theme';
    execute 'create policy site_theme_read on public.site_theme for select using (true)';
    execute 'drop policy if exists site_theme_authenticated_rw on public.site_theme';
    execute 'create policy site_theme_authenticated_rw on public.site_theme for all to authenticated using (true) with check (true)';
  end if;
end
$$;

-- site_assets
do $$
begin
  if to_regclass('public.site_assets') is not null then
    execute 'alter table public.site_assets enable row level security';
    execute 'drop policy if exists site_assets_read on public.site_assets';
    execute 'create policy site_assets_read on public.site_assets for select using (true)';
    execute 'drop policy if exists site_assets_authenticated_rw on public.site_assets';
    execute 'create policy site_assets_authenticated_rw on public.site_assets for all to authenticated using (true) with check (true)';
  end if;
end
$$;

-- people_totals
do $$
begin
  if to_regclass('public.people_totals') is not null then
    execute 'alter table public.people_totals enable row level security';
    execute 'drop policy if exists people_totals_read on public.people_totals';
    execute 'create policy people_totals_read on public.people_totals for select using (true)';
    execute 'drop policy if exists people_totals_authenticated_rw on public.people_totals';
    execute 'create policy people_totals_authenticated_rw on public.people_totals for all to authenticated using (true) with check (true)';
  end if;
end
$$;

-- pages
do $$
begin
  if to_regclass('public.pages') is not null then
    execute 'alter table public.pages enable row level security';
    execute 'drop policy if exists pages_select on public.pages';
    execute 'create policy pages_select on public.pages for select using (true)';
    execute 'drop policy if exists pages_authenticated_rw on public.pages';
    execute 'create policy pages_authenticated_rw on public.pages for all to authenticated using (true) with check (true)';
  end if;
end
$$;

-- media table (app-level catalog, separate from storage.objects)
do $$
begin
  if to_regclass('public.media') is not null then
    execute 'alter table public.media enable row level security';
    execute 'drop policy if exists media_select on public.media';
    execute 'create policy media_select on public.media for select using (true)';
    execute 'drop policy if exists media_authenticated_rw on public.media';
    execute 'create policy media_authenticated_rw on public.media for all to authenticated using (true) with check (true)';
  end if;
end
$$;
