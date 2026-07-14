import { ArrowRight, Award, BarChart3, Brain, LineChart, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketCard } from "@/features/markets/market-card";
import { ForecasterCard } from "@/features/forecasters/forecaster-card";
import { enrichForecaster, topForecasters, trendingMarkets } from "@/lib/data";

export default function LandingPage() {
  const top = topForecasters(3).map(({ forecaster }) => enrichForecaster(forecaster));
  const markets = trendingMarkets(3);

  return (
    <>
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <Badge tone="accent">Early market intelligence for onchain markets</Badge>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">Signal over noise.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Discover important onchain markets, identify credible forecasters, and track how conviction changes over time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/leaderboard">Explore Rankings <ArrowRight className="h-4 w-4" /></ButtonLink>
            <ButtonLink href="/markets" variant="secondary">Browse Markets</ButtonLink>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-muted p-4">
              <LineChart className="h-5 w-5 text-accent" />
              <p className="mt-5 text-3xl font-bold">25</p>
              <p className="text-sm text-muted-foreground">demo markets tracked</p>
            </div>
            <div className="rounded-md bg-muted p-4">
              <Award className="h-5 w-5 text-accent" />
              <p className="mt-5 text-3xl font-bold">15</p>
              <p className="text-sm text-muted-foreground">fictional forecasters ranked</p>
            </div>
          </div>
          <div className="mt-3 rounded-md border p-4">
            <p className="text-sm font-semibold">Product statement</p>
            <p className="mt-2 text-2xl font-bold leading-snug">Find the most credible forecasters in crypto and track what they are predicting.</p>
          </div>
        </div>
      </section>

      <section className="border-y bg-card/45 py-14">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {[
            ["What Verity Does", "Combines market discovery, forecaster rankings, and reputation-weighted conviction in one lightweight intelligence terminal.", BarChart3],
            ["Why Reputation Matters", "A forecast is more useful when you can see the forecaster's track record, calibration, sample size, and domain strength.", ShieldCheck],
            ["How Scores Work", "Initial rankings blend accuracy, calibration, consistency, experience, and recent performance with a minimum-sample adjustment.", Brain]
          ].map(([title, body, Icon]) => (
            <Card key={title as string}>
              <CardContent>
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-lg font-semibold">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body as string}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Top forecasters preview</h2>
            <p className="mt-2 text-muted-foreground">Initial rankings based on tracked demo forecasts.</p>
          </div>
          <ButtonLink href="/forecasters" variant="secondary">View Directory</ButtonLink>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {top.map((forecaster) => <ForecasterCard key={forecaster.id} forecaster={forecaster} />)}
        </div>
      </section>

      <section className="container-page py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Trending markets preview</h2>
            <p className="mt-2 text-muted-foreground">Seeded markets with the strongest current movement and activity.</p>
          </div>
          <ButtonLink href="/markets" variant="secondary">Open Markets</ButtonLink>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {markets.map((market) => <MarketCard key={market.id} market={market} />)}
        </div>
      </section>

      <section className="container-page grid gap-8 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Long-term vision</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Verity is building toward a shared identity, reputation, discovery, and intelligence layer for onchain markets. This MVP is intentionally narrower: manually tracked markets, transparent scoring, and a useful surface for customer interviews.
          </p>
        </div>
        <Card>
          <CardContent>
            <h2 className="text-2xl font-bold tracking-tight">Ready to inspect the signal?</h2>
            <p className="mt-2 text-muted-foreground">Explore ranked forecasters, active market conviction, and resolved prediction history.</p>
            <ButtonLink href="/overview" className="mt-6">Open Overview</ButtonLink>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
