# Market Ingestion

Verity ingests market data as ETL:

```text
External provider -> normalize -> Supabase -> repository layer -> UI
```

React pages must not call external provider APIs directly.

## V1 Provider

Polymarket is the first supported provider.

- Market discovery: public Gamma API.
- Price history: public CLOB price-history endpoint when a YES token ID is available.
- Stored provenance: `provider=polymarket`, `provider_market_id=<external id>`, `data_origin=integrated`, `verification_status=source_checked`.

Kalshi, Manifold, and Predict.fun/Percolator-compatible sources are intentionally not implemented yet. Add them after Polymarket has been verified against a real connected Supabase project.

## Commands

Sync all enabled providers:

```bash
npm run sync:markets
```

Sync one Polymarket market by external provider market ID:

```bash
npm run sync:market -- <polymarket-market-id>
```

Both commands require connected Supabase configuration. They upsert records and never delete markets automatically.

## Cron Endpoint

`GET` or `POST /api/sync/markets` runs the same sync and is compatible with Vercel Cron.

Authenticate with either:

```text
Authorization: Bearer <SYNC_SECRET>
```

or `?token=<SYNC_SECRET>`.

`SYNC_SECRET` must be at least 24 characters. The endpoint returns `401` without a valid token.

## Database Fields

Market ingestion uses:

- `provider`
- `provider_market_id`
- `source_url`
- `image_url`
- `tags`
- `last_synced_at`
- `sync_status`
- `data_origin`
- `verification_status`

Provider-backed rows dedupe on `provider + provider_market_id`. Manual records can leave those fields empty. Probability history is unique by `market_id + recorded_at`.

## Adding A Provider

1. Implement `MarketProvider` from `lib/ingestion/types.ts`.
2. Normalize provider-specific fields into `ExternalMarket`.
3. Add provider-specific tests for probability, status, outcome, slug, and history normalization.
4. Add the provider to `lib/ingestion/providers/index.ts`.
5. Run `npm run sync:markets` against a connected Supabase project.

Providers should fail independently. A provider API outage should increase that provider's `failed` count without blocking other providers or public page reads.
