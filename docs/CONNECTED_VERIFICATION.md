# Connected Supabase Verification Checklist

Do not mark connected mode verified until these steps pass against a real Supabase project.

1. Apply migrations with `supabase db push`, or run every SQL file in `supabase/migrations/` in lexical order through the SQL Editor.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and `NEXT_PUBLIC_DATA_MODE=connected`.
3. Run `npm run verify:supabase`.
4. Run `npm run seed:supabase`.
5. Start the app with `npm run dev`.
6. Confirm the connected-mode disclosure appears.
7. Confirm markets load from Supabase.
8. Confirm forecasters load from Supabase.
9. Log into `/admin`.
10. Create a forecaster.
11. Confirm the forecaster appears publicly.
12. Create a market with a source URL, protocol, and category.
13. Confirm the market appears publicly.
14. Add a forecast.
15. Confirm the market detail and forecaster profile metrics update.
16. Resolve the market.
17. Confirm leaderboard and scoring update.
18. Restart the server.
19. Confirm records persist.
20. Deploy to Vercel with the same environment variables.
21. Repeat a basic production smoke test.
