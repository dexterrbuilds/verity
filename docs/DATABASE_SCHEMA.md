# Database Schema

The authoritative SQL schema is in `supabase/migrations/`. Apply files in lexical order. For new projects, prefer:

```bash
supabase db push
```

## Tables

- `forecasters`
- `protocols`
- `categories`
- `markets`
- `forecasts`
- `market_probability_history`
- `insights`

## Ingestion Columns

Markets include provider sync fields:

- `provider`
- `provider_market_id`
- `image_url`
- `tags`
- `last_synced_at`
- `sync_status`

Provider-backed rows dedupe on `provider + provider_market_id`. Manual records can leave those fields empty. Probability history has a unique `market_id + recorded_at` constraint.

## Enums

- `resolution_status`: `active`, `resolved`, `cancelled`
- `forecast_position`: `yes`, `no`, `neutral`
- `data_origin`: `demo`, `manually_curated`, `integrated`
- `verification_status`: `unverified`, `source_checked`, `protocol_verified`
- `profile_status`: `unclaimed`, `claimed`

## Security

RLS is enabled on all tables. Public read policies are included for the MVP public product. Writes should only be performed through server-side code using `SUPABASE_SERVICE_ROLE_KEY`.

Never expose the service role key to the browser.

Important invariants are enforced in SQL where possible:

- probabilities and confidence values must be 0-100
- volume and participant counts cannot be negative
- resolved markets require a yes/no outcome
- non-resolved markets must not carry an outcome
- forecast correctness must match resolved state
- duplicate forecasts for the same forecaster/market are rejected
- the MVP forecast model is one forecast per forecaster per market, editable until market resolution
- forecasts cannot be inserted into non-active markets or after the resolution date
- forecast content cannot be edited after resolution, while correctness bookkeeping may be updated

## Provenance

Public records include `data_origin` and `verification_status`. Forecasters also include `profile_status`.

- Seeded demonstration records use `data_origin=demo`, `verification_status=unverified`, and forecaster `profile_status=unclaimed`.
- Admin-created records default to `data_origin=manually_curated` and `verification_status=unverified`.
- Do not use `protocol_verified` until a real verification process exists.

## Connected Seed

Run:

```bash
npm run verify:supabase
npm run seed:supabase
```

The seed script uses deterministic UUIDs derived from the local demo IDs, verifies expected columns before writing, inserts records in foreign-key order, temporarily keeps markets active while inserting historical forecasts, then updates markets to their final statuses. It uses upserts and is intended to be idempotent.

There is intentionally no full reset command. A safe reset would need to avoid deleting manually created records that reference seeded records.
