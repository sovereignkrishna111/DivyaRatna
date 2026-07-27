-- Extend Academics/Services/Community items to support card-style page content

create extension if not exists pgcrypto;

alter table if exists public.academics_items
  add column if not exists icon_key text,
  add column if not exists image_key text,
  add column if not exists color text,
  add column if not exists features text[] not null default '{}'::text[],
  add column if not exists details text;

alter table if exists public.services_items
  add column if not exists icon_key text,
  add column if not exists image_key text,
  add column if not exists color text,
  add column if not exists features text[] not null default '{}'::text[],
  add column if not exists details text;

alter table if exists public.community_items
  add column if not exists icon_key text,
  add column if not exists image_key text,
  add column if not exists color text,
  add column if not exists features text[] not null default '{}'::text[],
  add column if not exists details text;
