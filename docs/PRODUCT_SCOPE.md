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

The current implementation is explicitly demo-first. Public pages use fictional local seed data. Supabase-backed persistence is not complete until reads, writes, admin forms, and scoring all operate on the same persisted dataset.
