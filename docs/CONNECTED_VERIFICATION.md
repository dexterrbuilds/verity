# Connected Supabase Verification Checklist

Do not mark connected mode verified until these steps pass against a real Supabase project.

1. Apply `supabase/migrations/001_initial_schema.sql`.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and `NEXT_PUBLIC_DATA_MODE=connected`.
3. Run `npm run seed:supabase`.
4. Start the app with `npm run dev`.
5. Confirm the connected-mode disclosure appears.
6. Confirm markets load from Supabase.
7. Confirm forecasters load from Supabase.
8. Log into `/admin`.
9. Create a forecaster.
10. Confirm the forecaster appears publicly.
11. Create a market.
12. Confirm the market appears publicly.
13. Add a forecast.
14. Confirm the market detail and forecaster profile metrics update.
15. Resolve the market.
16. Confirm leaderboard and scoring update.
17. Restart the server.
18. Confirm records persist.
19. Deploy to Vercel with the same environment variables.
20. Repeat a basic production smoke test.
