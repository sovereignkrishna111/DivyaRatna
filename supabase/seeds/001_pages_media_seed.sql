-- Seed: minimal pages and media
insert into public.pages (slug, title, content, status)
values
  ('home', 'Home', '{"blocks":[]}', 'published'),
  ('about', 'About Us', '{"blocks":[]}', 'draft')
on conflict (slug) do nothing;

-- Note: media rows typically created after upload; seed a placeholder
insert into public.media (id, storage_path, url, filename, size, mime, alt)
values (
  gen_random_uuid(),
  'media/placeholder.jpg',
  'https://example.com/placeholder.jpg',
  'placeholder.jpg',
  0,
  'image/jpeg',
  'Placeholder image'
);
