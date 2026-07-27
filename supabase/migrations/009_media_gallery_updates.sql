-- Media Gallery: extend gallery_items to support videos + featured videos

-- Ensure extension available for any UUID usage elsewhere
create extension if not exists pgcrypto;

-- Add columns for video support and featured section
alter table public.gallery_items
  add column if not exists media_kind text not null default 'image',
  add column if not exists video_url text,
  add column if not exists thumbnail_url text,
  add column if not exists featured boolean not null default false,
  add column if not exists featured_order integer not null default 0;

alter table public.gallery_items
  drop constraint if exists gallery_items_media_kind_check;

alter table public.gallery_items
  add constraint gallery_items_media_kind_check
  check (media_kind in ('image', 'video'));

-- Indexes to power UI sections
create index if not exists idx_gallery_items_featured on public.gallery_items (featured, featured_order, updated_at desc);
create index if not exists idx_gallery_items_published_type on public.gallery_items (published, type, sort_order);
