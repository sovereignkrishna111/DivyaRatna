-- Site-wide theme + replaceable assets
-- Provides a single place to update colors and key images used across the public website.

create extension if not exists pgcrypto;

-- Theme (single row)
create table if not exists public.site_theme (
  id integer primary key,
  primary_color text not null default '#991b1b',
  secondary_color text not null default '#7f1d1d',
  accent_color text not null default '#f59e0b',
  background_color text not null default '#ffffff',
  text_color text not null default '#111827',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_theme (id)
select 1
where not exists (select 1 from public.site_theme where id = 1);

-- Assets are keyed (logo, hero_1, about_image, etc.)
create table if not exists public.site_assets (
  key text primary key,
  storage_path text,
  public_url text not null default '',
  mime text,
  alt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
-- Note: public.set_updated_at() is created in earlier migrations.
drop trigger if exists set_site_theme_updated_at on public.site_theme;
create trigger set_site_theme_updated_at
before update on public.site_theme
for each row execute function public.set_updated_at();

drop trigger if exists set_site_assets_updated_at on public.site_assets;
create trigger set_site_assets_updated_at
before update on public.site_assets
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_site_assets_updated_at on public.site_assets (updated_at desc);

-- RLS
alter table public.site_theme enable row level security;
alter table public.site_assets enable row level security;

-- Anyone can read theme/assets (public website)
drop policy if exists site_theme_read on public.site_theme;
create policy site_theme_read on public.site_theme for select using (true);

drop policy if exists site_assets_read on public.site_assets;
create policy site_assets_read on public.site_assets for select using (true);

-- Authenticated users can update (admin app)
drop policy if exists site_theme_authenticated_rw on public.site_theme;
create policy site_theme_authenticated_rw on public.site_theme
for all to authenticated
using (true)
with check (true);

drop policy if exists site_assets_authenticated_rw on public.site_assets;
create policy site_assets_authenticated_rw on public.site_assets
for all to authenticated
using (true)
with check (true);
