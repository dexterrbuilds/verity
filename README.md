# Verity

Verity is a lean MVP for market intelligence and forecaster reputation in the Solana/onchain markets ecosystem.

Product statement: **Find the most credible forecasters in crypto and track what they are predicting.**

This first version uses fictional, demo-labelled, manually seeded data. It is not a prediction market, trading venue, token product, wallet app, SDK, public API, DAO executor, or automated indexer.

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
```

`ADMIN_PASSWORD` must be at least 8 characters and `SESSION_SECRET` must be at least 16 characters for admin login to work.

## Supabase Setup

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor or through the Supabase CLI. Public reads are allowed by RLS policies. Writes should go through server-side code using `SUPABASE_SERVICE_ROLE_KEY`.

The local MVP reads from `lib/data/seed.ts`. Supabase persistence is ready in the server actions and can be expanded as real admin CRUD needs harden.

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

## Admin Access

The admin route exists at `/admin` and is not linked in public navigation. It uses a server-side password check and HTTP-only signed session cookie.

Configure:

```env
ADMIN_PASSWORD=change-this
SESSION_SECRET=at-least-sixteen-characters
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
- Admin forms validate and persist only when Supabase service credentials are configured.
- No wallet connection, onchain execution, token functionality, automated indexing, public API, AI analysis, or SDK.
- Scoring assumptions should be revisited with real samples and customer feedback.

## Suggested Next Steps

- Expand Supabase-backed edit/update/delete admin flows.
- Add CSV import for forecasts and market history.
- Add real source links after selecting initial partner protocols.
- Add event transport for the analytics abstraction.
- Add tests around scoring and filters.
