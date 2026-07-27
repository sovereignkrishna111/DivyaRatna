create extension if not exists pgcrypto;

create table if not exists public.home_hero_slides (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null default 'hero_1',
  title text not null default '',
  subtitle text not null default '',
  cta_text text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_home_hero_slides_updated_at on public.home_hero_slides;
create trigger set_home_hero_slides_updated_at
before update on public.home_hero_slides
for each row execute function public.set_updated_at();

create index if not exists idx_home_hero_slides_published on public.home_hero_slides (published);
create index if not exists idx_home_hero_slides_sort_order on public.home_hero_slides (sort_order asc);
create index if not exists idx_home_hero_slides_updated_at on public.home_hero_slides (updated_at desc);

alter table public.home_hero_slides enable row level security;

drop policy if exists home_hero_slides_public_read_published on public.home_hero_slides;
create policy home_hero_slides_public_read_published
on public.home_hero_slides for select
using (published = true);

drop policy if exists home_hero_slides_authenticated_rw on public.home_hero_slides;
create policy home_hero_slides_authenticated_rw
on public.home_hero_slides for all
to authenticated
using (true)
with check (true);

insert into public.home_hero_slides (asset_key, title, subtitle, cta_text, sort_order, published)
select 'hero_1', 'Excellence in Education', 'Nurturing minds, building futures at DRESS', 'Discover Our Programs', 0, true
where not exists (select 1 from public.home_hero_slides where asset_key = 'hero_1');

insert into public.home_hero_slides (asset_key, title, subtitle, cta_text, sort_order, published)
select 'hero_2', 'A passion for learning', 'Where every student is encouraged to reach their full potential', 'Virtual Tour', 1, true
where not exists (select 1 from public.home_hero_slides where asset_key = 'hero_2');

insert into public.home_hero_slides (asset_key, title, subtitle, cta_text, sort_order, published)
select 'hero_3', 'The commitment to serve as a compassionate global citizen and leader', 'Preparing students for success in an interconnected world', 'Learn More', 2, true
where not exists (select 1 from public.home_hero_slides where asset_key = 'hero_3');
