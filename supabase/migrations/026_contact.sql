create extension if not exists pgcrypto;

create table if not exists public.contact_settings (
  id text primary key,
  hero_title text not null default 'Contact Us',
  hero_subtitle text not null default 'Get in touch with us for any questions, concerns, or information about DRESS',
  intro_title text not null default 'Get in Touch',
  intro_subtitle text not null default 'We''re here to help and answer any questions you might have about our school and programs',
  map_title text not null default 'Find Us',
  map_embed_url text not null default '',
  map_directions_url text not null default '',
  emergency_title text not null default 'Emergency Contact',
  emergency_text text not null default 'For urgent matters outside office hours:',
  emergency_hotline text not null default '',
  emergency_note text not null default 'Available 24/7 for student emergencies',
  department_section_title text not null default 'Department Contacts',
  department_section_subtitle text not null default 'Connect directly with specific departments for specialized assistance',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_contact_settings_updated_at on public.contact_settings;
create trigger set_contact_settings_updated_at
before update on public.contact_settings
for each row execute function public.set_updated_at();

alter table public.contact_settings enable row level security;

drop policy if exists contact_settings_read_all on public.contact_settings;
create policy contact_settings_read_all on public.contact_settings for select using (true);

drop policy if exists contact_settings_authenticated_rw on public.contact_settings;
create policy contact_settings_authenticated_rw on public.contact_settings for all to authenticated using (true) with check (true);

create table if not exists public.contact_info_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon_key text not null default 'phone',
  details jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_contact_info_items_updated_at on public.contact_info_items;
create trigger set_contact_info_items_updated_at
before update on public.contact_info_items
for each row execute function public.set_updated_at();

create index if not exists idx_contact_info_items_published on public.contact_info_items (published);
create index if not exists idx_contact_info_items_sort_order on public.contact_info_items (sort_order asc);
create index if not exists idx_contact_info_items_updated_at on public.contact_info_items (updated_at desc);

alter table public.contact_info_items enable row level security;

drop policy if exists contact_info_items_public_read_published on public.contact_info_items;
create policy contact_info_items_public_read_published on public.contact_info_items for select using (published = true);

drop policy if exists contact_info_items_authenticated_rw on public.contact_info_items;
create policy contact_info_items_authenticated_rw on public.contact_info_items for all to authenticated using (true) with check (true);

create table if not exists public.contact_departments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  email text not null default '',
  phone text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_contact_departments_updated_at on public.contact_departments;
create trigger set_contact_departments_updated_at
before update on public.contact_departments
for each row execute function public.set_updated_at();

create index if not exists idx_contact_departments_published on public.contact_departments (published);
create index if not exists idx_contact_departments_sort_order on public.contact_departments (sort_order asc);
create index if not exists idx_contact_departments_updated_at on public.contact_departments (updated_at desc);

alter table public.contact_departments enable row level security;

drop policy if exists contact_departments_public_read_published on public.contact_departments;
create policy contact_departments_public_read_published on public.contact_departments for select using (published = true);

drop policy if exists contact_departments_authenticated_rw on public.contact_departments;
create policy contact_departments_authenticated_rw on public.contact_departments for all to authenticated using (true) with check (true);

insert into public.contact_settings (
  id,
  hero_title,
  hero_subtitle,
  intro_title,
  intro_subtitle,
  map_title,
  map_embed_url,
  map_directions_url,
  emergency_title,
  emergency_text,
  emergency_hotline,
  emergency_note,
  department_section_title,
  department_section_subtitle
)
select
  'default',
  'Contact Us',
  'Get in touch with us for any questions, concerns, or information about DRESS',
  'Get in Touch',
  'We''re here to help and answer any questions you might have about our school and programs',
  'Find Us',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2073.2783493966795!2d87.8873558011278!3d26.628661440644372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e5bd04cff5ea19%3A0x8ec95d0959b8acd7!2sDivya%20Ratna%20Secondary%20English%20School!5e0!3m2!1sen!2snp!4v1768044637823!5m2!1sen!2snp',
  'https://www.google.com/maps/search/?api=1&query=Divya%20Ratna%20Secondary%20English%20School',
  'Emergency Contact',
  'For urgent matters outside office hours:',
  '+977 1-5370484',
  'Available 24/7 for student emergencies',
  'Department Contacts',
  'Connect directly with specific departments for specialized assistance'
where not exists (select 1 from public.contact_settings where id = 'default');

insert into public.contact_info_items (title, icon_key, details, sort_order, published)
select
  'Phone Numbers',
  'phone',
  jsonb_build_array(
    'Main Office: +977 1-5370482',
    'Admissions: +977 1-5370483',
    'Emergency: +977 1-5370484'
  ),
  0,
  true
where not exists (select 1 from public.contact_info_items where title = 'Phone Numbers');

insert into public.contact_info_items (title, icon_key, details, sort_order, published)
select
  'Email Addresses',
  'mail',
  jsonb_build_array(
    'General: info@divyaratna.edu.np',
    'Admissions: admissions@divyaratna.edu.np',
    'Careers: careers@divyaratna.edu.np'
  ),
  1,
  true
where not exists (select 1 from public.contact_info_items where title = 'Email Addresses');

insert into public.contact_info_items (title, icon_key, details, sort_order, published)
select
  'Address',
  'map',
  jsonb_build_array(
    'Divya Ratna English Secondary School',
    'P.O. Box 2673, Rabi Bhawan',
    'Kathmandu, Nepal'
  ),
  2,
  true
where not exists (select 1 from public.contact_info_items where title = 'Address');

insert into public.contact_info_items (title, icon_key, details, sort_order, published)
select
  'Office Hours',
  'clock',
  jsonb_build_array(
    'Monday - Friday: 8:00 AM - 4:00 PM',
    'Saturday: 9:00 AM - 1:00 PM',
    'Sunday: Closed'
  ),
  3,
  true
where not exists (select 1 from public.contact_info_items where title = 'Office Hours');

insert into public.contact_departments (slug, name, description, email, phone, sort_order, published)
select 'admissions', 'Admissions Office', 'Information about enrollment, applications, and school visits', 'admissions@divyaratna.edu.np', '+977 1-5370483', 0, true
where not exists (select 1 from public.contact_departments where slug = 'admissions');

insert into public.contact_departments (slug, name, description, email, phone, sort_order, published)
select 'academic', 'Academic Office', 'Curriculum inquiries, academic programs, and student progress', 'academic@divyaratna.edu.np', '+977 1-5370485', 1, true
where not exists (select 1 from public.contact_departments where slug = 'academic');

insert into public.contact_departments (slug, name, description, email, phone, sort_order, published)
select 'transportation', 'Transportation', 'Bus routes, transportation services, and safety protocols', 'transport@divyaratna.edu.np', '+977 1-5370486', 2, true
where not exists (select 1 from public.contact_departments where slug = 'transportation');

insert into public.contact_departments (slug, name, description, email, phone, sort_order, published)
select 'health', 'Health Services', 'Medical services, health records, and wellness programs', 'health@divyaratna.edu.np', '+977 1-5370487', 3, true
where not exists (select 1 from public.contact_departments where slug = 'health');

insert into public.contact_departments (slug, name, description, email, phone, sort_order, published)
select 'security', 'Security Office', 'Campus security, visitor management, and emergency procedures', 'security@divyaratna.edu.np', '+977 1-5370488', 4, true
where not exists (select 1 from public.contact_departments where slug = 'security');

insert into public.contact_departments (slug, name, description, email, phone, sort_order, published)
select 'student-services', 'Student Services', 'Counseling, extracurricular activities, and student support', 'services@divyaratna.edu.np', '+977 1-5370489', 5, true
where not exists (select 1 from public.contact_departments where slug = 'student-services');
