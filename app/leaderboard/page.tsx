import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { forecasterMetrics, getForecasterById } from "@/lib/data";
import { categories } from "@/lib/data/seed";
import { formatPercent } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Verity leaderboards by overall score and market category."
};

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item ?? "";
}

export default async function LeaderboardPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const domain = value(params, "domain") || "overall";
  const rows = [...forecasterMetrics].sort((a, b) => {
    if (domain === "overall") return a.rank - b.rank;
    const label = categories.find((category) => category.slug === domain)?.name ?? "Overall";
    return (b.categoryAccuracy[label] ?? 0) - (a.categoryAccuracy[label] ?? 0);
  });

  return (
    <section className="container-page py-10">
      <div className="flex flex-col gap-2">
        <Badge tone="accent">Leaderboard</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Forecaster rankings</h1>
        <p className="max-w-3xl text-muted-foreground">Rankings blend accuracy, calibration, consistency, experience, and recent performance. Category boards highlight domain-specific track records.</p>
      </div>

      <form className="mt-8 max-w-xs">
        <Select name="domain" defaultValue={domain} aria-label="Leaderboard domain" onChange={undefined}>
          <option value="overall">Overall</option>
          <option value="ai">AI</option>
          <option value="solana">Solana</option>
          <option value="defi">DeFi</option>
          <option value="governance">Governance</option>
          <option value="infrastructure">Infrastructure</option>
        </Select>
      </form>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Forecaster</th>
                <th className="px-4 py-3">Verity score</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Calibration</th>
                <th className="px-4 py-3">Resolved</th>
                <th className="px-4 py-3">Best domain</th>
                <th className="px-4 py-3">Recent trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((metric, index) => {
                const forecaster = getForecasterById(metric.forecasterId);
                if (!forecaster) return null;
                return (
                  <tr key={metric.forecasterId} className="border-b last:border-0">
                    <td className="px-4 py-4 font-semibold">{domain === "overall" ? metric.rank : index + 1}</td>
                    <td className="px-4 py-4">
                      <Link href={`/forecasters/${forecaster.slug}`} className="font-semibold hover:text-accent">{forecaster.displayName}</Link>
                      <p className="text-xs text-muted-foreground">{forecaster.xHandle}</p>
                    </td>
                    <td className="px-4 py-4">{metric.verityScore.toFixed(1)}</td>
                    <td className="px-4 py-4">{formatPercent(metric.accuracy)}</td>
                    <td className="px-4 py-4">{formatPercent(metric.calibration)}</td>
                    <td className="px-4 py-4">{metric.resolvedForecasts}</td>
                    <td className="px-4 py-4">{forecaster.strongestDomain}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {metric.trend.map((point, trendIndex) => (
                          <span key={trendIndex} className={point > 0 ? "h-2 w-5 rounded-full bg-positive" : "h-2 w-5 rounded-full bg-destructive"} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-8">
        <CardHeader className="flex-row items-center gap-3">
          <Trophy className="h-5 w-5 text-accent" />
          <h2 className="font-semibold">How rankings work</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>Verity score is an MVP formula, not a final reputation standard. It currently uses 35% accuracy, 25% calibration, 15% consistency, 15% experience, and 10% recent performance.</p>
          <p>A minimum-sample adjustment prevents a forecaster with one correct prediction from ranking ahead of consistent forecasters with deeper resolved history.</p>
        </CardContent>
      </Card>
    </section>
  );
}
