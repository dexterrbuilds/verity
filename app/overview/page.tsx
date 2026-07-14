import type { Metadata } from "next";
import { Activity, Award, CheckCircle2, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { MarketCard } from "@/features/markets/market-card";
import { ForecasterCard } from "@/features/forecasters/forecaster-card";
import { enrichForecaster, featuredInsights, platformStats, recentResolvedForecasts, topForecasters, trendingMarkets } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Overview",
  description: "Verity overview of trending markets, top forecasters, conviction, and recent resolved predictions."
};

export default function OverviewPage() {
  const stats = platformStats();
  const top = topForecasters(4).map(({ forecaster }) => enrichForecaster(forecaster));
  const resolved = recentResolvedForecasts(5);
  const insights = featuredInsights();

  return (
    <section className="container-page py-10">
      <div className="flex flex-col gap-2">
        <Badge tone="accent">Overview</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Market intelligence dashboard</h1>
        <p className="max-w-3xl text-muted-foreground">A seeded view of important markets, credible forecasters, and reputation-weighted conviction.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Active markets" value={String(stats.activeMarkets)} detail={`${stats.totalMarkets} total`} icon={<LineChart className="h-5 w-5" />} />
        <StatCard label="Forecasters" value={String(stats.totalForecasters)} detail="fictional demo identities" icon={<Award className="h-5 w-5" />} />
        <StatCard label="Resolved forecasts" value={String(stats.resolvedForecasts)} detail={`${formatPercent(stats.averageAccuracy)} avg accuracy`} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Tracked forecasts" value={String(stats.totalForecasts)} detail="seeded for validation" icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {insights.map((insight) => (
          <Card key={insight.id}>
            <CardContent>
              <Badge>{insight.category}</Badge>
              <h2 className="mt-4 font-semibold">{insight.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trending markets</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {trendingMarkets(4).map((market) => <MarketCard key={market.id} market={market} />)}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Top-ranked forecasters</h2>
            <div className="mt-4 grid gap-4">
              {top.map((forecaster) => <ForecasterCard key={forecaster.id} forecaster={forecaster} />)}
            </div>
          </div>
          <Card>
            <CardHeader><h2 className="font-semibold">Recent resolved predictions</h2></CardHeader>
            <CardContent className="space-y-4">
              {resolved.map(({ forecast, forecaster, market }) => (
                <div key={forecast.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{forecaster.displayName}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{market.question}</p>
                  <p className={forecast.wasCorrect ? "mt-1 text-xs text-positive" : "mt-1 text-xs text-destructive"}>
                    {forecast.wasCorrect ? "Correct" : "Incorrect"} · {forecast.scoreImpact.toFixed(2)} score impact
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
