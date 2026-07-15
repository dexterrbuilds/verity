create extension if not exists pgcrypto;

create type resolution_status as enum ('active', 'resolved', 'cancelled');
create type forecast_position as enum ('yes', 'no', 'neutral');
create type data_origin as enum ('demo', 'manually_curated', 'integrated');
create type verification_status as enum ('unverified', 'source_checked', 'protocol_verified');
create type profile_status as enum ('unclaimed', 'claimed');

create table public.forecasters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  wallet_address text,
  x_handle text,
  avatar_url text,
  bio text,
  joined_at timestamptz not null default now(),
  is_verified boolean not null default false,
  data_origin data_origin not null default 'manually_curated',
  verification_status verification_status not null default 'unverified',
  profile_status profile_status not null default 'unclaimed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.protocols (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  website_url text,
  description text,
  data_origin data_origin not null default 'manually_curated',
  verification_status verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  data_origin data_origin not null default 'manually_curated',
  verification_status verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.markets (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid references public.protocols(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  question text not null,
  description text,
  source_url text,
  current_probability numeric(5,2) not null check (current_probability >= 0 and current_probability <= 100),
  previous_probability numeric(5,2) not null check (previous_probability >= 0 and previous_probability <= 100),
  volume numeric(20,2) not null default 0 check (volume >= 0),
  participant_count integer not null default 0 check (participant_count >= 0),
  resolution_date timestamptz,
  resolution_status resolution_status not null default 'active',
  resolution_outcome forecast_position,
  resolution_rules text,
  data_origin data_origin not null default 'manually_curated',
  verification_status verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint markets_resolution_outcome_check check (
    (resolution_status = 'resolved' and resolution_outcome in ('yes', 'no'))
    or (resolution_status <> 'resolved' and resolution_outcome is null)
  )
);

create table public.forecasts (
  id uuid primary key default gen_random_uuid(),
  forecaster_id uuid not null references public.forecasters(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade,
  predicted_probability numeric(5,2) not null check (predicted_probability >= 0 and predicted_probability <= 100),
  confidence numeric(5,2) not null check (confidence >= 0 and confidence <= 100),
  position forecast_position not null,
  reasoning text,
  forecasted_at timestamptz not null default now(),
  is_resolved boolean not null default false,
  was_correct boolean,
  score_impact numeric(7,3) not null default 0,
  data_origin data_origin not null default 'manually_curated',
  verification_status verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forecasts_correctness_resolution_check check (
    (is_resolved = true and was_correct is not null)
    or (is_resolved = false and was_correct is null)
  ),
  constraint forecasts_unique_forecaster_market unique (forecaster_id, market_id)
);

create table public.market_probability_history (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  probability numeric(5,2) not null check (probability >= 0 and probability <= 100),
  recorded_at timestamptz not null default now()
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text,
  is_featured boolean not null default false,
  data_origin data_origin not null default 'manually_curated',
  verification_status verification_status not null default 'unverified',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index forecasts_forecaster_id_idx on public.forecasts(forecaster_id);
create index forecasts_market_id_idx on public.forecasts(market_id);
create index markets_protocol_id_idx on public.markets(protocol_id);
create index markets_category_id_idx on public.markets(category_id);
create index markets_status_resolution_date_idx on public.markets(resolution_status, resolution_date);
create index markets_probability_change_idx on public.markets((abs(current_probability - previous_probability)));
create index market_probability_history_market_recorded_idx on public.market_probability_history(market_id, recorded_at);
create index insights_featured_published_idx on public.insights(is_featured, published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_forecasters_updated_at before update on public.forecasters for each row execute function public.set_updated_at();
create trigger set_protocols_updated_at before update on public.protocols for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger set_markets_updated_at before update on public.markets for each row execute function public.set_updated_at();
create trigger set_forecasts_updated_at before update on public.forecasts for each row execute function public.set_updated_at();
create trigger set_insights_updated_at before update on public.insights for each row execute function public.set_updated_at();

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

create trigger reject_forecast_after_resolution before insert on public.forecasts for each row execute function public.reject_forecast_after_resolution();
create trigger reject_forecast_update_after_resolution before update on public.forecasts for each row execute function public.reject_forecast_after_resolution();

alter table public.forecasters enable row level security;
alter table public.protocols enable row level security;
alter table public.categories enable row level security;
alter table public.markets enable row level security;
alter table public.forecasts enable row level security;
alter table public.market_probability_history enable row level security;
alter table public.insights enable row level security;

create policy "public read forecasters" on public.forecasters for select using (true);
create policy "public read protocols" on public.protocols for select using (true);
create policy "public read categories" on public.categories for select using (true);
create policy "public read markets" on public.markets for select using (true);
create policy "public read forecasts" on public.forecasts for select using (true);
create policy "public read probability history" on public.market_probability_history for select using (true);
create policy "public read insights" on public.insights for select using (true);

-- Writes should be performed only through server-side code with SUPABASE_SERVICE_ROLE_KEY.
