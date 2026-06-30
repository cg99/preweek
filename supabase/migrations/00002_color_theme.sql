-- Add color_theme column to settings table
alter table public.settings
  add column color_theme text not null default 'warm' check (color_theme in ('warm', 'sage', 'sky', 'rose', 'slate'));
