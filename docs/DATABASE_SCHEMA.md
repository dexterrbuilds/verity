# Database Schema

The authoritative SQL schema is in `supabase/migrations/001_initial_schema.sql`.

## Tables

- `forecasters`
- `protocols`
- `categories`
- `markets`
- `forecasts`
- `market_probability_history`
- `insights`

## Enums

- `resolution_status`: `active`, `resolved`, `cancelled`
- `forecast_position`: `yes`, `no`, `neutral`

## Security

RLS is enabled on all tables. Public read policies are included for the MVP public product. Writes should only be performed through server-side code using `SUPABASE_SERVICE_ROLE_KEY`.

Never expose the service role key to the browser.

Important invariants are enforced in SQL where possible:

- probabilities and confidence values must be 0-100
- volume and participant counts cannot be negative
- resolved markets require a yes/no outcome
- non-resolved markets must not carry an outcome
- forecast correctness must match resolved state
- duplicate forecasts for the same forecaster/market/timestamp are rejected
- forecasts cannot be inserted into non-active markets or after the resolution date

## Connected Seed

Run:

```bash
NEXT_PUBLIC_DATA_MODE=connected npm run seed:supabase
```

The seed script uses deterministic UUIDs derived from the local demo IDs, inserts records in foreign-key order, temporarily keeps markets active while inserting historical forecasts, then updates markets to their final statuses. It uses upserts and is intended to be idempotent.
