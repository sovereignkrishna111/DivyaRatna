-- Create notices table
create table if not exists public.notices (
  id text primary key,
  title text not null,
  content text not null,
  date date not null,
  category text not null,
  priority text not null,
  attachment text,
  file_data_url text,
  author text,
  views integer not null default 0,
  link_url text,
  published boolean not null default false,
  created_at bigint,
  updated_at bigint
);

-- Helpful indexes
create index if not exists idx_notices_published_date on public.notices (published, date desc);
create index if not exists idx_notices_date on public.notices (date desc);
