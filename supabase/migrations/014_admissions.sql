-- Admissions: grade-level requirements + important dates (dynamic + admin editable)

create extension if not exists pgcrypto;

-- Grade-level requirements
create table if not exists public.admissions_grade_requirements (
  id uuid primary key default gen_random_uuid(),
  grade_key text not null unique check (grade_key in ('elementary','middle','high')),
  title text not null,
  requirements text[] not null default '{}',
  annual_tuition text,
  application_deadline date,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_admissions_grade_requirements_updated_at on public.admissions_grade_requirements;
create trigger set_admissions_grade_requirements_updated_at
before update on public.admissions_grade_requirements
for each row execute function public.set_updated_at();

create index if not exists idx_admissions_grade_requirements_published on public.admissions_grade_requirements (published);
create index if not exists idx_admissions_grade_requirements_sort_order on public.admissions_grade_requirements (sort_order);

-- Important dates
create table if not exists public.admissions_important_dates (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  date date not null,
  type text not null default 'info' check (type in ('info','deadline','success','important')),
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_admissions_important_dates_updated_at on public.admissions_important_dates;
create trigger set_admissions_important_dates_updated_at
before update on public.admissions_important_dates
for each row execute function public.set_updated_at();

create index if not exists idx_admissions_important_dates_published on public.admissions_important_dates (published);
create index if not exists idx_admissions_important_dates_date on public.admissions_important_dates (date);
create index if not exists idx_admissions_important_dates_sort_order on public.admissions_important_dates (sort_order);

-- Realtime payloads for updates
alter table public.admissions_grade_requirements replica identity full;
alter table public.admissions_important_dates replica identity full;

-- RLS
alter table public.admissions_grade_requirements enable row level security;
alter table public.admissions_important_dates enable row level security;

-- Public site reads only published content
drop policy if exists admissions_grade_requirements_read_published on public.admissions_grade_requirements;
create policy admissions_grade_requirements_read_published
on public.admissions_grade_requirements for select
using (published = true);

drop policy if exists admissions_important_dates_read_published on public.admissions_important_dates;
create policy admissions_important_dates_read_published
on public.admissions_important_dates for select
using (published = true);

-- Admin (authenticated) can manage admissions content
drop policy if exists admissions_grade_requirements_authenticated_rw on public.admissions_grade_requirements;
create policy admissions_grade_requirements_authenticated_rw
on public.admissions_grade_requirements for all
to authenticated
using (true)
with check (true);

drop policy if exists admissions_important_dates_authenticated_rw on public.admissions_important_dates;
create policy admissions_important_dates_authenticated_rw
on public.admissions_important_dates for all
to authenticated
using (true)
with check (true);

-- Seed defaults (idempotent)
insert into public.admissions_grade_requirements (grade_key, title, requirements, annual_tuition, application_deadline, published, sort_order)
values
  (
    'elementary',
    'Elementary School (Grades K-5)',
    array[
      'Completed application form',
      'Birth certificate',
      'Previous school records (if applicable)',
      'Immunization records',
      'Parent/guardian interview',
      'Student assessment (age-appropriate)'
    ],
    'NPR 180,000 per year',
    date '2025-03-31',
    true,
    1
  ),
  (
    'middle',
    'Middle School (Grades 6-8)',
    array[
      'Completed application form',
      'Official transcripts from previous school',
      'Teacher recommendation letters (2)',
      'Student essay or portfolio',
      'Parent/guardian interview',
      'Academic assessment test'
    ],
    'NPR 220,000 per year',
    date '2025-02-28',
    true,
    2
  ),
  (
    'high',
    'High School (Grades 9-12)',
    array[
      'Completed application form',
      'Official transcripts (last 2 years)',
      'Teacher recommendation letters (3)',
      'Personal statement essay',
      'Extracurricular activity record',
      'Entrance examination',
      'Parent/guardian interview'
    ],
    'NPR 280,000 per year',
    date '2025-01-31',
    true,
    3
  )
on conflict (grade_key) do update set
  title = excluded.title,
  requirements = excluded.requirements,
  annual_tuition = excluded.annual_tuition,
  application_deadline = excluded.application_deadline,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.admissions_important_dates (event, date, type, published, sort_order)
values
  ('Application Opens', date '2024-12-01', 'info', true, 1),
  ('High School Application Deadline', date '2025-01-31', 'deadline', true, 2),
  ('Middle School Application Deadline', date '2025-02-28', 'deadline', true, 3),
  ('Elementary Application Deadline', date '2025-03-31', 'deadline', true, 4),
  ('Admission Decisions Released', date '2025-04-15', 'success', true, 5),
  ('Enrollment Confirmation Deadline', date '2025-05-01', 'important', true, 6);
