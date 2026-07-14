# Deployment

## Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
5. Set `NEXT_PUBLIC_DATA_MODE=demo` only for a clearly labelled demo deployment. Do not use it for a public product launch.
6. Deploy.

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql`.
3. Copy the project URL and anon key into Vercel.
4. Add the service role key only as a server-side environment variable.

## Production Readiness Gate

Before public deployment, decide explicitly:

- Demo mode: `NEXT_PUBLIC_DATA_MODE=demo`; public pages use local fictional seed data and admin mutations are read-only.
- Connected mode: `NEXT_PUBLIC_DATA_MODE=connected`; configure Supabase credentials and migrate public data reads from local seed arrays to Supabase queries.

Do not deploy connected mode until admin-created records appear on public pages and scoring is recalculated from persisted records.

Use a strong `ADMIN_PASSWORD` and a random `SESSION_SECRET` of at least 32 characters. The admin cookie is HTTP-only, `sameSite=lax`, secure in production, signed, and expires after 8 hours.

## Verification

Run locally before deployment:

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm audit
```
