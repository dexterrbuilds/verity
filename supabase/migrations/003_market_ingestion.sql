alter table public.markets
  add column if not exists provider text,
  add column if not exists provider_market_id text,
  add column if not exists image_url text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists last_synced_at timestamptz,
  add column if not exists sync_status text;

drop index if exists public.markets_provider_market_id_idx;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'markets_provider_market_id_unique'
      and conrelid = 'public.markets'::regclass
  ) then
    alter table public.markets
      add constraint markets_provider_market_id_unique unique (provider, provider_market_id);
  end if;
end $$;

create index if not exists markets_provider_idx on public.markets(provider);
create index if not exists markets_last_synced_idx on public.markets(last_synced_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'market_probability_history_market_recorded_unique'
      and conrelid = 'public.market_probability_history'::regclass
  ) then
    alter table public.market_probability_history
      add constraint market_probability_history_market_recorded_unique unique (market_id, recorded_at);
  end if;
end $$;
