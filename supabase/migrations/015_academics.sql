-- Academics: dynamic items editable via admin

create extension if not exists pgcrypto;

create table if not exists public.academics_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  category text,
  link_url text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_academics_items_updated_at on public.academics_items;
create trigger set_academics_items_updated_at
before update on public.academics_items
for each row execute function public.set_updated_at();

create index if not exists idx_academics_items_published on public.academics_items (published);
create index if not exists idx_academics_items_sort_order on public.academics_items (sort_order);

alter table public.academics_items replica identity full;

alter table public.academics_items enable row level security;

-- Public site reads only published items
drop policy if exists academics_items_read_published on public.academics_items;
create policy academics_items_read_published
on public.academics_items for select
using (published = true);

-- Admin (authenticated) can manage items
drop policy if exists academics_items_authenticated_rw on public.academics_items;
create policy academics_items_authenticated_rw
on public.academics_items for all
to authenticated
using (true)
with check (true);
