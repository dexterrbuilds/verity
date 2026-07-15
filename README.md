# Verity

Verity is a lean MVP for market intelligence and forecaster reputation in the Solana/onchain markets ecosystem.

Product statement: **Find the most credible forecasters in crypto and track what they are predicting.**

This first version can run in local demo mode with fictional data or connected mode with Supabase-backed records. It is not a prediction market, trading venue, token product, wallet app, SDK, public API, DAO executor, or automated indexer.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style local UI primitives
- Supabase/PostgreSQL schema
- Zod validation
- Lucide icons
- Recharts for useful charts

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DATA_MODE=connected
```

`ADMIN_PASSWORD` must be at least 12 characters and `SESSION_SECRET` must be at least 32 characters for admin login to work.

Generate a session secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`NEXT_PUBLIC_DATA_MODE=demo` is explicit demo mode. In demo mode, public pages read local seed data and admin mutations are blocked as read-only so changes are not silently lost.

`NEXT_PUBLIC_DATA_MODE=connected` enables Supabase-backed reads and writes. Connected mode requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

On Vercel production deployments, incomplete Supabase configuration fails clearly instead of silently falling back to demo data.

## Supabase Setup

Recommended flow:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
npm run verify:supabase
npm run seed:supabase
```

If you do not use the Supabase CLI, run the migration files in `supabase/migrations/` in lexical order through the Supabase SQL Editor.

Public reads are allowed by RLS policies. Writes should go through server-side code using `SUPABASE_SERVICE_ROLE_KEY`.

Public and admin screens read through the repository layer in `lib/data/`. Demo mode uses `lib/data/seed.ts`; connected mode reads from Supabase via public RLS policies. Admin mutations use the service role only on the server.

## Seed Instructions

The seed dataset includes:

- 15 fictional forecasters
- 5 demo-labelled protocols
- 7 categories
- 25 markets
- 120+ generated forecasts
- probability history
- market insights

Check counts with:

```bash
npm run seed
```

Populate a connected Supabase project with the same dataset:

```bash
npm run seed:supabase
```

The connected seed uses stable UUIDs, schema preflight checks, and upserts, so it is safe to run multiple times. Seeded records are labelled `data_origin=demo` and `verification_status=unverified`.

## Admin Access

The admin route exists at `/admin` and is not linked in public navigation. It uses a server-side password check and HTTP-only signed session cookie.

Configure:

```env
ADMIN_PASSWORD=change-this
SESSION_SECRET=at-least-32-random-characters
```

## Deployment

Deploy to Vercel with the same environment variables. Set `NEXT_PUBLIC_SITE_URL` to the production domain so metadata, sitemap, and robots output canonical production URLs.

## Scoring Methodology

The initial Verity score is not final. It uses:

- 35% accuracy
- 25% calibration
- 15% consistency
- 15% experience
- 10% recent performance

A minimum-sample adjustment keeps small lucky samples from ranking first. Market conviction weights forecasts by Verity score, experience, and category performance with a cap on individual influence.

## Current Limitations

- Demo data is fictional and manually seeded.
- Admin forms validate, require authentication, and are read-only in demo mode.
- Connected mode calculates scores at read time from persisted markets and forecasts.
- The repository currently uses bounded read-time queries suitable for MVP-scale datasets, not a materialized scoring cache.
- Forecasts use the simple MVP rule: one forecast per forecaster per market, editable until market resolution.
- Seeded demonstration records are clearly distinguished from manually curated records with provenance fields.
- No wallet connection, onchain execution, token functionality, automated indexing, public API, AI analysis, or SDK.
- Scoring assumptions should be revisited with real samples and customer feedback.

## Suggested Next Steps

- Add CSV import for forecasts and market history.
- Add real source links after selecting initial partner protocols.
- Add event transport for the analytics abstraction.
- Add admin CRUD integration tests against a disposable Supabase database.
- Add pagination and materialized score caching before large datasets.
