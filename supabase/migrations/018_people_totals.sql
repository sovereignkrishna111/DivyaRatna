-- People totals (count-only mode for Students/Teachers/Staff)

create extension if not exists pgcrypto;

 create or replace function public.set_people_totals_updated_at()
 returns trigger as $$
 begin
   new.updated_at = now();
   return new;
 end;
 $$ language plpgsql;

create table if not exists public.people_totals (
  kind text primary key check (kind in ('students','teachers','staff')),
  mode text not null default 'manual' check (mode in ('manual','count_only')),
  total_count integer,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_people_totals_updated_at on public.people_totals;
create trigger set_people_totals_updated_at
before update on public.people_totals
for each row execute function public.set_people_totals_updated_at();

alter table public.people_totals
  drop constraint if exists people_totals_total_count_non_negative;
alter table public.people_totals
  add constraint people_totals_total_count_non_negative check (total_count is null or total_count >= 0);

alter table public.people_totals replica identity full;

alter table public.people_totals enable row level security;

-- Public site can read totals
drop policy if exists people_totals_read on public.people_totals;
create policy people_totals_read
on public.people_totals for select
using (true);

-- Admin (authenticated) can manage totals
drop policy if exists people_totals_authenticated_rw on public.people_totals;
create policy people_totals_authenticated_rw
on public.people_totals for all
to authenticated
using (true)
with check (true);

insert into public.people_totals (kind, mode, total_count)
values
  ('students', 'manual', null),
  ('teachers', 'manual', null),
  ('staff', 'manual', null)
on conflict (kind) do nothing;
