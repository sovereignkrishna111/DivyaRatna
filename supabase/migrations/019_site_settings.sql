create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id text primary key default 'default',
  school_name text not null default 'Divya Ratna English Secondary School',
  public_site_url text not null default 'https://example.com',
  contact_email text not null default 'info@example.com',
  timezone text not null default 'Asia/Kathmandu',
  locale text not null default 'en-US',
  announcements_enabled boolean not null default false,
  announcement_text text not null default '',
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'We are currently undergoing scheduled maintenance. Please check back soon.',
  allow_public_registration boolean not null default true,
  features jsonb not null default jsonb_build_object(
    'show_notices', true,
    'show_events', true,
    'show_gallery', true,
    'show_news', true,
    'show_testimonials', true,
    'show_achievements', true
  ),
  social_links jsonb not null default '{}'::jsonb,
  seo jsonb not null default jsonb_build_object(
    'default_title', 'Divya Ratna English Secondary School',
    'default_description', 'Official website',
    'og_image_url', ''
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values ('default')
on conflict (id) do nothing;

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings replica identity full;

alter table public.site_settings enable row level security;

drop policy if exists site_settings_read_all on public.site_settings;
create policy site_settings_read_all
on public.site_settings for select
using (true);

drop policy if exists site_settings_authenticated_rw on public.site_settings;
create policy site_settings_authenticated_rw
on public.site_settings for all
to authenticated
using (true)
with check (true);
