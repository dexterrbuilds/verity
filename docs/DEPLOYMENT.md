# Deployment

## Vercel

1. Create a Supabase project.
2. Apply migrations with `supabase db push` or run every SQL file in `supabase/migrations/` in lexical order.
3. Copy `.env.example` to `.env.local` and fill the Supabase URL, anon key, service-role key, admin password, session secret, and `NEXT_PUBLIC_DATA_MODE=connected`.
4. Run `npm run verify:supabase`.
5. Run `npm run seed:supabase` if you want the initial demonstration dataset.
6. Run `npm run dev` and test public routes plus `/admin`.
7. Push the repository to GitHub.
8. Import the project in Vercel.
9. Add production environment variables from `.env.example`.
10. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
11. Deploy.
12. Verify `/`, `/overview`, `/markets`, `/forecasters`, `/leaderboard`, `/api/health`, `/sitemap.xml`, and `/robots.txt`.
13. Verify admin login.
14. Create a small test record.
15. Confirm the public page updates after mutation.
16. Remove or clearly label temporary test data.

## Supabase

1. Create a Supabase project.
2. Apply migrations with `supabase db push`.
3. Copy the project URL and anon key into local/Vercel environment variables.
4. Add the service role key only as a server-side environment variable.
5. Run `npm run verify:supabase`.

## Production Readiness Gate

Before public deployment, decide explicitly:

- Demo mode: `NEXT_PUBLIC_DATA_MODE=demo`; public pages use local fictional seed data and admin mutations are read-only.
- Connected mode: `NEXT_PUBLIC_DATA_MODE=connected`; public and admin pages read from Supabase, admin mutations write through the service-role client, and scores are calculated from persisted records.

Vercel production deployments with incomplete Supabase credentials fail instead of falling back to demo data.

Use a strong `ADMIN_PASSWORD` and a random `SESSION_SECRET` of at least 32 characters. The admin cookie is HTTP-only, `sameSite=lax`, secure in production, signed, and expires after 8 hours.

## Verification

Run locally before deployment:

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm audit
npm run verify:supabase
```

## Revalidation

Admin mutations call `revalidatePath` for the landing page, overview, market directory, market detail route pattern, forecaster directory, forecaster detail route pattern, leaderboard, admin, and sitemap. This keeps the MVP fresh without a separate cache invalidation service.

## Health

`GET /api/health` returns a no-store JSON status. Demo mode reports a healthy demo status without touching Supabase. Connected mode performs one lightweight public read and returns `503` if the database is unavailable.
