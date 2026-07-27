-- Comprehensive Dynamic Theme System
-- Replaces the simple 5-color theme with a full color management system
-- All colors are organized in a JSONB structure for flexibility and scalability

-- Drop existing 5-color columns and replace with JSONB color palette
alter table public.site_theme 
drop column if exists primary_color,
drop column if exists secondary_color,
drop column if exists accent_color,
drop column if exists background_color,
drop column if exists text_color;

-- Add comprehensive color palette as JSONB (using JSON literal to avoid jsonb_build_object 100 arg limit)
alter table public.site_theme 
add column colors jsonb not null default '{
  "primary-50": "#fef2f2",
  "primary-100": "#fee2e2",
  "primary-200": "#fecaca",
  "primary-300": "#fca5a5",
  "primary-400": "#f87171",
  "primary-500": "#ef4444",
  "primary-600": "#dc2626",
  "primary-700": "#b91c1c",
  "primary-800": "#991b1b",
  "primary-900": "#7f1d1d",
  "secondary-50": "#faf5f5",
  "secondary-100": "#f5ebeb",
  "secondary-200": "#e8d5d5",
  "secondary-300": "#d4a5a5",
  "secondary-400": "#b87c7c",
  "secondary-500": "#a85555",
  "secondary-600": "#8b3b3b",
  "secondary-700": "#6b2c2c",
  "secondary-800": "#522020",
  "secondary-900": "#3d1616",
  "accent-50": "#fffbeb",
  "accent-100": "#fef3c7",
  "accent-200": "#fde68a",
  "accent-300": "#fcd34d",
  "accent-400": "#fbbf24",
  "accent-500": "#f59e0b",
  "accent-600": "#d97706",
  "accent-700": "#b45309",
  "accent-800": "#92400e",
  "accent-900": "#78350f",
  "background-primary": "#ffffff",
  "background-secondary": "#f9fafb",
  "background-tertiary": "#f3f4f6",
  "background-subtle": "#efefef",
  "background-dark": "#1f2937",
  "text-primary": "#111827",
  "text-secondary": "#374151",
  "text-tertiary": "#6b7280",
  "text-light": "#9ca3af",
  "text-inverse": "#ffffff",
  "text-muted": "#d1d5db",
  "button-primary-bg": "#991b1b",
  "button-primary-bg-hover": "#7f1d1d",
  "button-primary-text": "#ffffff",
  "button-secondary-bg": "#7f1d1d",
  "button-secondary-bg-hover": "#6b1515",
  "button-secondary-text": "#ffffff",
  "button-success-bg": "#10b981",
  "button-success-hover": "#059669",
  "button-danger-bg": "#ef4444",
  "button-danger-hover": "#dc2626",
  "button-warning-bg": "#f59e0b",
  "button-warning-hover": "#d97706",
  "button-outline-border": "#e5e7eb",
  "button-outline-text": "#111827",
  "border-light": "#f3f4f6",
  "border-default": "#e5e7eb",
  "border-medium": "#d1d5db",
  "border-dark": "#9ca3af",
  "border-primary": "#991b1b",
  "border-accent": "#f59e0b",
  "success-light": "#d1fae5",
  "success-main": "#10b981",
  "success-dark": "#047857",
  "warning-light": "#fef3c7",
  "warning-main": "#f59e0b",
  "warning-dark": "#d97706",
  "error-light": "#fee2e2",
  "error-main": "#ef4444",
  "error-dark": "#dc2626",
  "info-light": "#dbeafe",
  "info-main": "#3b82f6",
  "info-dark": "#1d4ed8",
  "hover-overlay": "#00000010",
  "focus-ring": "#3b82f6",
  "shadow-color": "#00000015",
  "gradient-start": "#991b1b",
  "gradient-end": "#7f1d1d",
  "gradient-accent-start": "#f59e0b",
  "gradient-accent-end": "#d97706"
}'::jsonb;

-- Add an optional color_mode field for light/dark theme support (future)
alter table public.site_theme 
add column if not exists color_mode text default 'light' check (color_mode in ('light', 'dark'));

-- Function to validate color hex format
create or replace function validate_hex_color(color_value text) returns boolean as $$
begin
  return color_value ~ '^\#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$' or color_value = 'transparent';
end;
$$ language plpgsql immutable;

-- Function to validate all colors in the JSONB object
create or replace function validate_theme_colors() returns trigger as $$
declare
  color_value text;
begin
  if new.colors is not null then
    for color_value in
      select jsonb_each_text(new.colors).value
    loop
      if color_value is not null and color_value != 'transparent' and not (color_value ~ '^\#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$') then
        raise exception 'Invalid color format: %', color_value;
      end if;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger to validate colors before insert/update
drop trigger if exists validate_theme_colors_trigger on public.site_theme;
create trigger validate_theme_colors_trigger
before insert or update on public.site_theme
for each row execute function validate_theme_colors();

-- Create a color history/audit table for tracking theme changes
create table if not exists public.theme_color_history (
  id bigserial primary key,
  theme_id integer not null,
  previous_colors jsonb,
  new_colors jsonb,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  description text,
  constraint fk_theme_color_history foreign key (theme_id) references public.site_theme(id) on delete cascade
);

create index if not exists idx_theme_color_history_theme_id on public.theme_color_history(theme_id);
create index if not exists idx_theme_color_history_changed_at on public.theme_color_history(changed_at desc);

-- Function to track color changes
create or replace function track_theme_color_changes() returns trigger as $$
begin
  if new.colors is distinct from old.colors then
    insert into public.theme_color_history (theme_id, previous_colors, new_colors, changed_by, description)
    values (new.id, old.colors, new.colors, auth.uid(), 'Theme colors updated');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists track_theme_changes on public.site_theme;
create trigger track_theme_changes
after update on public.site_theme
for each row execute function track_theme_color_changes();

-- RLS policies for theme_color_history (read for authenticated, write restricted)
alter table public.theme_color_history enable row level security;

drop policy if exists theme_color_history_read on public.theme_color_history;
create policy theme_color_history_read on public.theme_color_history for select
using (true);

drop policy if exists theme_color_history_admin_write on public.theme_color_history;
create policy theme_color_history_admin_write on public.theme_color_history for insert
with check (auth.uid()::text in (select uid::text from public.admin_users));

-- Add helpful comment to the colors column
comment on column public.site_theme.colors is 'JSONB object storing all theme colors organized by category. Keys follow pattern: category-shade or category-state (e.g., primary-500, button-primary-bg)';
