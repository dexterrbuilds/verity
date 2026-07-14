# Deployment

## Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
5. Deploy.

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql`.
3. Copy the project URL and anon key into Vercel.
4. Add the service role key only as a server-side environment variable.

## Verification

Run locally before deployment:

```bash
npm run lint
npm run typecheck
npm run build
```
