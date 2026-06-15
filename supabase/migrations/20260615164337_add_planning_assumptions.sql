-- Add user-adjustable planning assumptions to profiles.
-- Defaults mirror ASSUMPTION_DEFAULTS in lib/types.ts so the DB and app agree.
-- Existing rows backfill to these defaults automatically.
alter table public.profiles
  add column if not exists annual_return       numeric not null default 0.07,
  add column if not exists inflation_rate      numeric not null default 0.025,
  add column if not exists years_in_retirement integer not null default 25;
