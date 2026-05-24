-- Add stored dependency metadata for required-mod tags.
-- Safe to run multiple times.

alter table public.modpacks
  add column if not exists dependency_state jsonb;
