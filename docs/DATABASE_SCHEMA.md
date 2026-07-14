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
