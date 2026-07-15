# Product Scope

Verity is a market intelligence and forecaster reputation MVP for onchain markets.

## In Scope

- Landing page with clear positioning
- Overview dashboard
- Market directory and market detail pages
- Forecaster directory and profile pages
- Leaderboard pages
- About/methodology page
- Password-protected admin route
- Supabase schema
- Seeded demo data
- Record provenance labels for demo and manually curated data
- Scoring and market conviction utilities

## Out of Scope

- Wallet connection
- Onchain transactions
- Token functionality
- Prediction market execution
- Perp exchange behavior
- Public SDK or API product
- AI-generated market analysis
- Automated indexing
- DAO governance or futarchy execution

## MVP Principle

The first product should be credible enough for demos and customer interviews without pretending the system is already a mature protocol.

The implementation supports demo and connected modes. Demo mode uses fictional local seed data and is read-only for admin mutations. Connected mode uses Supabase for public reads, admin reads, admin writes, and read-time score calculation.

Public records distinguish seeded demonstration data from manually curated records. Verity should not claim protocol verification or integrated data until a real verification or integration process exists.
