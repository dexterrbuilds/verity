do $$
begin
  create type data_origin as enum ('demo', 'manually_curated', 'integrated');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type verification_status as enum ('unverified', 'source_checked', 'protocol_verified');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type profile_status as enum ('unclaimed', 'claimed');
exception
  when duplicate_object then null;
end $$;

alter table public.forecasters
  add column if not exists data_origin data_origin not null default 'manually_curated',
  add column if not exists verification_status verification_status not null default 'unverified',
  add column if not exists profile_status profile_status not null default 'unclaimed';

alter table public.protocols
  add column if not exists data_origin data_origin not null default 'manually_curated',
  add column if not exists verification_status verification_status not null default 'unverified';

alter table public.categories
  add column if not exists data_origin data_origin not null default 'manually_curated',
  add column if not exists verification_status verification_status not null default 'unverified',
  add column if not exists updated_at timestamptz not null default now();

alter table public.markets
  add column if not exists data_origin data_origin not null default 'manually_curated',
  add column if not exists verification_status verification_status not null default 'unverified';

alter table public.forecasts
  add column if not exists data_origin data_origin not null default 'manually_curated',
  add column if not exists verification_status verification_status not null default 'unverified';

alter table public.insights
  add column if not exists data_origin data_origin not null default 'manually_curated',
  add column if not exists verification_status verification_status not null default 'unverified';

create or replace function public.reject_forecast_after_resolution()
returns trigger
language plpgsql
as $$
declare
  market_record public.markets%rowtype;
begin
  select * into market_record from public.markets where id = new.market_id;
  if tg_op = 'INSERT' and market_record.resolution_status <> 'active' then
    raise exception 'forecasts can only be added to active markets';
  end if;
  if market_record.resolution_date is not null and new.forecasted_at > market_record.resolution_date then
    raise exception 'forecasted_at cannot be after market resolution_date';
  end if;
  if tg_op = 'UPDATE' and market_record.resolution_status <> 'active' and (
    new.forecaster_id is distinct from old.forecaster_id
    or new.market_id is distinct from old.market_id
    or new.predicted_probability is distinct from old.predicted_probability
    or new.confidence is distinct from old.confidence
    or new.position is distinct from old.position
    or new.reasoning is distinct from old.reasoning
    or new.forecasted_at is distinct from old.forecasted_at
  ) then
    raise exception 'resolved or cancelled market forecasts cannot be edited';
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_categories_updated_at'
      and tgrelid = 'public.categories'::regclass
  ) then
    create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'forecasts_unique_timestamp'
      and conrelid = 'public.forecasts'::regclass
  ) then
    alter table public.forecasts drop constraint forecasts_unique_timestamp;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'forecasts_unique_forecaster_market'
      and conrelid = 'public.forecasts'::regclass
  ) then
    alter table public.forecasts add constraint forecasts_unique_forecaster_market unique (forecaster_id, market_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'reject_forecast_update_after_resolution'
      and tgrelid = 'public.forecasts'::regclass
  ) then
    create trigger reject_forecast_update_after_resolution before update on public.forecasts for each row execute function public.reject_forecast_after_resolution();
  end if;
end $$;
