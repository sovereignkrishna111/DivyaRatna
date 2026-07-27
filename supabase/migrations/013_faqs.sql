-- FAQs: dynamic FAQ items for public site + admin management

create extension if not exists pgcrypto;

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_faqs_updated_at on public.faqs;
create trigger set_faqs_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

create index if not exists idx_faqs_published on public.faqs (published);
create index if not exists idx_faqs_sort_order on public.faqs (sort_order);

-- Realtime payloads for updates
alter table public.faqs replica identity full;

-- RLS
alter table public.faqs enable row level security;

-- Public site reads only published FAQs
drop policy if exists faqs_read_published on public.faqs;
create policy faqs_read_published
on public.faqs for select
using (published = true);

-- Admin (authenticated) can manage FAQs
drop policy if exists faqs_authenticated_rw on public.faqs;
create policy faqs_authenticated_rw
on public.faqs for all
to authenticated
using (true)
with check (true);
