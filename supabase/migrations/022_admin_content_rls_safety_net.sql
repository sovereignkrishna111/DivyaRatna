do $$
begin
  if to_regclass('public.academics_items') is not null then
    execute 'alter table public.academics_items replica identity full';
    execute 'alter table public.academics_items enable row level security';
    execute 'drop policy if exists academics_items_read_published on public.academics_items';
    execute 'create policy academics_items_read_published on public.academics_items for select using (published = true)';
    execute 'drop policy if exists academics_items_authenticated_rw on public.academics_items';
    execute 'create policy academics_items_authenticated_rw on public.academics_items for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.services_items') is not null then
    execute 'alter table public.services_items replica identity full';
    execute 'alter table public.services_items enable row level security';
    execute 'drop policy if exists services_items_read_published on public.services_items';
    execute 'create policy services_items_read_published on public.services_items for select using (published = true)';
    execute 'drop policy if exists services_items_authenticated_rw on public.services_items';
    execute 'create policy services_items_authenticated_rw on public.services_items for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.community_items') is not null then
    execute 'alter table public.community_items replica identity full';
    execute 'alter table public.community_items enable row level security';
    execute 'drop policy if exists community_items_read_published on public.community_items';
    execute 'create policy community_items_read_published on public.community_items for select using (published = true)';
    execute 'drop policy if exists community_items_authenticated_rw on public.community_items';
    execute 'create policy community_items_authenticated_rw on public.community_items for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.faqs') is not null then
    execute 'alter table public.faqs replica identity full';
    execute 'alter table public.faqs enable row level security';
    execute 'drop policy if exists faqs_read_published on public.faqs';
    execute 'create policy faqs_read_published on public.faqs for select using (published = true)';
    execute 'drop policy if exists faqs_authenticated_rw on public.faqs';
    execute 'create policy faqs_authenticated_rw on public.faqs for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.gallery_items') is not null then
    execute 'alter table public.gallery_items replica identity full';
    execute 'alter table public.gallery_items enable row level security';
    execute 'drop policy if exists gallery_items_admin_rw on public.gallery_items';
    execute 'drop policy if exists gallery_items_read_published on public.gallery_items';
    execute 'create policy gallery_items_read_published on public.gallery_items for select using (published = true)';
    execute 'drop policy if exists gallery_items_authenticated_rw on public.gallery_items';
    execute 'create policy gallery_items_authenticated_rw on public.gallery_items for all to authenticated using (true) with check (true)';
  end if;

  -- Storage policies for gallery bucket (uploads)
  insert into storage.buckets (id, name, public)
  select 'gallery', 'gallery', true
  where not exists (select 1 from storage.buckets where id = 'gallery');

  execute 'drop policy if exists "Gallery public read" on storage.objects';
  execute 'drop policy if exists "Gallery admin read" on storage.objects';
  execute 'create policy "Gallery public read" on storage.objects for select using (bucket_id = ''gallery'')';

  execute 'drop policy if exists "Gallery admin uploads" on storage.objects';
  execute 'drop policy if exists "Gallery authenticated uploads" on storage.objects';
  execute 'create policy "Gallery authenticated uploads" on storage.objects for insert to authenticated with check (bucket_id = ''gallery'')';

  execute 'drop policy if exists "Gallery admin updates" on storage.objects';
  execute 'drop policy if exists "Gallery authenticated updates" on storage.objects';
  execute 'create policy "Gallery authenticated updates" on storage.objects for update to authenticated using (bucket_id = ''gallery'') with check (bucket_id = ''gallery'')';

  execute 'drop policy if exists "Gallery admin deletes" on storage.objects';
  execute 'drop policy if exists "Gallery authenticated deletes" on storage.objects';
  execute 'create policy "Gallery authenticated deletes" on storage.objects for delete to authenticated using (bucket_id = ''gallery'')';

  -- Storage policies for news bucket (uploads)
  insert into storage.buckets (id, name, public)
  select 'news', 'news', true
  where not exists (select 1 from storage.buckets where id = 'news');

  execute 'drop policy if exists "News public read" on storage.objects';
  execute 'create policy "News public read" on storage.objects for select using (bucket_id = ''news'')';

  execute 'drop policy if exists "News authenticated uploads" on storage.objects';
  execute 'create policy "News authenticated uploads" on storage.objects for insert to authenticated with check (bucket_id = ''news'')';

  execute 'drop policy if exists "News authenticated updates" on storage.objects';
  execute 'create policy "News authenticated updates" on storage.objects for update to authenticated using (bucket_id = ''news'') with check (bucket_id = ''news'')';

  execute 'drop policy if exists "News authenticated deletes" on storage.objects';
  execute 'create policy "News authenticated deletes" on storage.objects for delete to authenticated using (bucket_id = ''news'')';

  if to_regclass('public.achievements_activities') is not null then
    execute 'alter table public.achievements_activities replica identity full';
    execute 'alter table public.achievements_activities enable row level security';
    execute 'drop policy if exists achievements_activities_admin_rw on public.achievements_activities';
    execute 'drop policy if exists achievements_activities_read_published on public.achievements_activities';
    execute 'create policy achievements_activities_read_published on public.achievements_activities for select using (published = true)';
    execute 'drop policy if exists achievements_activities_authenticated_rw on public.achievements_activities';
    execute 'create policy achievements_activities_authenticated_rw on public.achievements_activities for all to authenticated using (true) with check (true)';
  end if;

  insert into storage.buckets (id, name, public)
  select 'achievements_activities', 'achievements_activities', true
  where not exists (select 1 from storage.buckets where id = 'achievements_activities');

  execute 'drop policy if exists "Achievements activities public read" on storage.objects';
  execute 'drop policy if exists "Achievements activities admin read" on storage.objects';
  execute 'create policy "Achievements activities public read" on storage.objects for select using (bucket_id = ''achievements_activities'')';

  execute 'drop policy if exists "Achievements activities admin uploads" on storage.objects';
  execute 'drop policy if exists "Achievements activities authenticated uploads" on storage.objects';
  execute 'create policy "Achievements activities authenticated uploads" on storage.objects for insert to authenticated with check (bucket_id = ''achievements_activities'')';

  execute 'drop policy if exists "Achievements activities admin updates" on storage.objects';
  execute 'drop policy if exists "Achievements activities authenticated updates" on storage.objects';
  execute 'create policy "Achievements activities authenticated updates" on storage.objects for update to authenticated using (bucket_id = ''achievements_activities'') with check (bucket_id = ''achievements_activities'')';

  execute 'drop policy if exists "Achievements activities admin deletes" on storage.objects';
  execute 'drop policy if exists "Achievements activities authenticated deletes" on storage.objects';
  execute 'create policy "Achievements activities authenticated deletes" on storage.objects for delete to authenticated using (bucket_id = ''achievements_activities'')';

  if to_regclass('public.bulletin_documents') is not null then
    execute 'alter table public.bulletin_documents replica identity full';
    execute 'alter table public.bulletin_documents enable row level security';
    execute 'drop policy if exists bulletin_documents_admin_rw on public.bulletin_documents';
    execute 'drop policy if exists bulletin_documents_read_published on public.bulletin_documents';
    execute 'create policy bulletin_documents_read_published on public.bulletin_documents for select using (published = true)';
    execute 'drop policy if exists bulletin_documents_authenticated_rw on public.bulletin_documents';
    execute 'create policy bulletin_documents_authenticated_rw on public.bulletin_documents for all to authenticated using (true) with check (true)';
  end if;

  insert into storage.buckets (id, name, public)
  select 'bulletin_documents', 'bulletin_documents', true
  where not exists (select 1 from storage.buckets where id = 'bulletin_documents');

  execute 'drop policy if exists "Bulletin documents public read" on storage.objects';
  execute 'drop policy if exists "Bulletin documents admin read" on storage.objects';
  execute 'create policy "Bulletin documents public read" on storage.objects for select using (bucket_id = ''bulletin_documents'')';

  execute 'drop policy if exists "Bulletin documents admin uploads" on storage.objects';
  execute 'drop policy if exists "Bulletin documents authenticated uploads" on storage.objects';
  execute 'create policy "Bulletin documents authenticated uploads" on storage.objects for insert to authenticated with check (bucket_id = ''bulletin_documents'')';

  execute 'drop policy if exists "Bulletin documents admin updates" on storage.objects';
  execute 'drop policy if exists "Bulletin documents authenticated updates" on storage.objects';
  execute 'create policy "Bulletin documents authenticated updates" on storage.objects for update to authenticated using (bucket_id = ''bulletin_documents'') with check (bucket_id = ''bulletin_documents'')';

  execute 'drop policy if exists "Bulletin documents admin deletes" on storage.objects';
  execute 'drop policy if exists "Bulletin documents authenticated deletes" on storage.objects';
  execute 'create policy "Bulletin documents authenticated deletes" on storage.objects for delete to authenticated using (bucket_id = ''bulletin_documents'')';

  if to_regclass('public.press_releases') is not null then
    execute 'alter table public.press_releases replica identity full';
    execute 'alter table public.press_releases enable row level security';
    execute 'drop policy if exists press_releases_read_published on public.press_releases';
    execute 'create policy press_releases_read_published on public.press_releases for select using (published = true)';
    execute 'drop policy if exists press_releases_authenticated_rw on public.press_releases';
    execute 'create policy press_releases_authenticated_rw on public.press_releases for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.admissions_grade_requirements') is not null then
    execute 'alter table public.admissions_grade_requirements replica identity full';
    execute 'alter table public.admissions_grade_requirements enable row level security';
    execute 'drop policy if exists admissions_grade_requirements_read_published on public.admissions_grade_requirements';
    execute 'create policy admissions_grade_requirements_read_published on public.admissions_grade_requirements for select using (published = true)';
    execute 'drop policy if exists admissions_grade_requirements_authenticated_rw on public.admissions_grade_requirements';
    execute 'create policy admissions_grade_requirements_authenticated_rw on public.admissions_grade_requirements for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.admissions_important_dates') is not null then
    execute 'alter table public.admissions_important_dates replica identity full';
    execute 'alter table public.admissions_important_dates enable row level security';
    execute 'drop policy if exists admissions_important_dates_read_published on public.admissions_important_dates';
    execute 'create policy admissions_important_dates_read_published on public.admissions_important_dates for select using (published = true)';
    execute 'drop policy if exists admissions_important_dates_authenticated_rw on public.admissions_important_dates';
    execute 'create policy admissions_important_dates_authenticated_rw on public.admissions_important_dates for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.careers_settings') is not null then
    execute 'alter table public.careers_settings replica identity full';
    execute 'alter table public.careers_settings enable row level security';
    execute 'drop policy if exists careers_settings_read_all on public.careers_settings';
    execute 'create policy careers_settings_read_all on public.careers_settings for select using (true)';
    execute 'drop policy if exists careers_settings_authenticated_rw on public.careers_settings';
    execute 'create policy careers_settings_authenticated_rw on public.careers_settings for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.job_openings') is not null then
    execute 'alter table public.job_openings replica identity full';
    execute 'alter table public.job_openings enable row level security';
    execute 'drop policy if exists job_openings_read_published on public.job_openings';
    execute 'create policy job_openings_read_published on public.job_openings for select using (published = true)';
    execute 'drop policy if exists job_openings_authenticated_rw on public.job_openings';
    execute 'create policy job_openings_authenticated_rw on public.job_openings for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.site_settings') is not null then
    execute 'alter table public.site_settings replica identity full';
    execute 'alter table public.site_settings enable row level security';
    execute 'drop policy if exists site_settings_read_all on public.site_settings';
    execute 'create policy site_settings_read_all on public.site_settings for select using (true)';
    execute 'drop policy if exists site_settings_authenticated_rw on public.site_settings';
    execute 'create policy site_settings_authenticated_rw on public.site_settings for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.site_theme') is not null then
    execute 'alter table public.site_theme replica identity full';
    execute 'alter table public.site_theme enable row level security';
    execute 'drop policy if exists site_theme_read on public.site_theme';
    execute 'create policy site_theme_read on public.site_theme for select using (true)';
    execute 'drop policy if exists site_theme_authenticated_rw on public.site_theme';
    execute 'create policy site_theme_authenticated_rw on public.site_theme for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.site_assets') is not null then
    execute 'alter table public.site_assets replica identity full';
    execute 'alter table public.site_assets enable row level security';
    execute 'drop policy if exists site_assets_read on public.site_assets';
    execute 'create policy site_assets_read on public.site_assets for select using (true)';
    execute 'drop policy if exists site_assets_authenticated_rw on public.site_assets';
    execute 'create policy site_assets_authenticated_rw on public.site_assets for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.media') is not null then
    execute 'alter table public.media replica identity full';
    execute 'alter table public.media enable row level security';
    execute 'drop policy if exists media_select on public.media';
    execute 'create policy media_select on public.media for select using (true)';
    execute 'drop policy if exists media_authenticated_rw on public.media';
    execute 'create policy media_authenticated_rw on public.media for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.notices') is not null then
    execute 'alter table public.notices replica identity full';
    execute 'alter table public.notices enable row level security';
    execute 'drop policy if exists notices_read_published on public.notices';
    execute 'create policy notices_read_published on public.notices for select using (published = true)';
    execute 'drop policy if exists notices_authenticated_rw on public.notices';
    execute 'create policy notices_authenticated_rw on public.notices for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.people_totals') is not null then
    execute 'alter table public.people_totals replica identity full';
    execute 'alter table public.people_totals enable row level security';
    execute 'drop policy if exists people_totals_read on public.people_totals';
    execute 'create policy people_totals_read on public.people_totals for select using (true)';
    execute 'drop policy if exists people_totals_authenticated_rw on public.people_totals';
    execute 'create policy people_totals_authenticated_rw on public.people_totals for all to authenticated using (true) with check (true)';
  end if;

  if to_regclass('public.pages') is not null then
    execute 'alter table public.pages replica identity full';
    execute 'alter table public.pages enable row level security';
    execute 'drop policy if exists pages_select on public.pages';
    execute 'create policy pages_select on public.pages for select using (true)';
    execute 'drop policy if exists pages_authenticated_rw on public.pages';
    execute 'create policy pages_authenticated_rw on public.pages for all to authenticated using (true) with check (true)';
  end if;
end
$$;
