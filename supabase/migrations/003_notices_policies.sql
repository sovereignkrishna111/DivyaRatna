-- Enable RLS and basic policies for notices
alter table public.notices enable row level security;

-- Allow anyone to read published notices
create policy if not exists notices_read_published
on public.notices for select
using (published = true);

-- Allow authenticated users full access (admin app)
create policy if not exists notices_authenticated_rw
on public.notices for all
to authenticated
using (true)
with check (true);
