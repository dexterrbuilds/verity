import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProbabilityChart } from "@/components/charts/probability-chart";
import { MarketCard } from "@/features/markets/market-card";
import { forecasterById, getMarketBySlug, getMarketStaticParams, getMetrics } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";
import { dataOriginLabel, formatCompact, formatDate, formatPercent, verificationLabel } from "@/lib/utils";

type Params = { slug: string };

export async function generateStaticParams() {
  return getMarketStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMarketBySlug(slug);
  const market = result?.market;
  if (!market) return {};
  return {
    title: market.question,
    description: market.description,
    alternates: {
      canonical: absoluteUrl(`/markets/${market.slug}`)
    },
    openGraph: {
      title: market.question,
      description: market.description,
      url: absoluteUrl(`/markets/${market.slug}`)
    }
  };
}

export default async function MarketDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getMarketBySlug(slug);
  if (!result) notFound();
  const { data, market, forecasts: marketForecasts, history, related } = result;
  const metrics = getMetrics(data);

  return (
    <section className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{market.category?.name}</Badge>
            <Badge>{market.protocol?.name}</Badge>
            <Badge tone={market.resolutionStatus === "active" ? "accent" : market.resolutionStatus === "resolved" ? "positive" : "warning"}>{market.resolutionStatus}</Badge>
            <Badge>{dataOriginLabel(market.dataOrigin)}</Badge>
            {market.verificationStatus !== "unverified" ? <Badge tone="positive">{verificationLabel(market.verificationStatus)}</Badge> : null}
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">{market.question}</h1>
          <p className="mt-4 leading-7 text-muted-foreground">{market.description}</p>
          <ButtonLink href={market.sourceUrl} target="_blank" rel="noreferrer" variant="secondary" className="mt-5">
            Source market <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <Card>
          <CardContent className="grid grid-cols-2 gap-4">
            <p><span className="block text-3xl font-bold">{formatPercent(market.currentProbability)}</span><span className="text-sm text-muted-foreground">Current probability</span></p>
            <p><span className="block text-3xl font-bold">{formatPercent(market.conviction.reputationWeightedForecast)}</span><span className="text-sm text-muted-foreground">Weighted forecast</span></p>
            <p><span className="block font-semibold">{formatCompact(market.volume)}</span><span className="text-sm text-muted-foreground">Tracked volume</span></p>
            <p><span className="block font-semibold">{market.participantCount}</span><span className="text-sm text-muted-foreground">Participants</span></p>
            <p><span className="block font-semibold">{formatDate(market.resolutionDate)}</span><span className="text-sm text-muted-foreground">Resolution date</span></p>
            <p className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /><span>{market.conviction.trackedForecasterCount} tracked</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><h2 className="font-semibold">Historical probability</h2></CardHeader>
          <CardContent><ProbabilityChart data={history} /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">What tracked forecasters think</h2></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex justify-between"><span>Average tracked forecast</span><strong>{formatPercent(market.conviction.averageTrackedForecast)}</strong></p>
            <p className="flex justify-between"><span>Reputation-weighted forecast</span><strong>{formatPercent(market.conviction.reputationWeightedForecast)}</strong></p>
            <p className="flex justify-between"><span>Highest-confidence position</span><strong>{market.conviction.highestConfidencePosition.toUpperCase()}</strong></p>
            <p className="flex justify-between"><span>Bullish split</span><strong>{formatPercent(market.conviction.bullishShare)}</strong></p>
            <p className="flex justify-between"><span>Bearish split</span><strong>{formatPercent(market.conviction.bearishShare)}</strong></p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader><h2 className="font-semibold">Tracked forecasts</h2></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {marketForecasts.map((forecast) => {
            const profile = forecasterById(data, forecast.forecasterId);
            const metric = metrics.find((item) => item.forecasterId === forecast.forecasterId);
            return (
              <div key={forecast.id} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{profile?.displayName ?? forecast.forecasterId}</p>
                    <p className="text-xs text-muted-foreground">Reputation score {metric?.verityScore.toFixed(1) ?? "n/a"}</p>
                  </div>
                  <Badge tone={forecast.position === "yes" ? "positive" : forecast.position === "no" ? "danger" : "default"}>{forecast.position}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{forecast.reasoning}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <span>{formatPercent(forecast.predictedProbability)} prediction</span>
                  <span>{formatPercent(forecast.confidence)} confidence</span>
                  <span>{forecast.isResolved ? (forecast.wasCorrect ? "Correct" : "Incorrect") : "Active"}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight">Related markets</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {related.map((item) => <MarketCard key={item.id} market={item} />)}
        </div>
      </div>
    </section>
  );
}
