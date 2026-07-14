create extension if not exists pgcrypto;

create type resolution_status as enum ('active', 'resolved', 'cancelled');
create type forecast_position as enum ('yes', 'no', 'neutral');

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
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
  volume numeric(20,2) not null default 0,
  participant_count integer not null default 0,
  resolution_date timestamptz,
  resolution_status resolution_status not null default 'active',
  resolution_outcome forecast_position,
  resolution_rules text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
