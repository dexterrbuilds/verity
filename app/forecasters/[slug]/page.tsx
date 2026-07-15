import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, Calendar, CheckCircle2, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { StatCard } from "@/components/stat-card";
import { getForecasterBySlug, getForecasterStaticParams, marketById } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";
import { dataOriginLabel, formatDate, formatPercent, profileStatusLabel, verificationLabel } from "@/lib/utils";
import type { EnrichedForecaster } from "@/types";
import type { DataSet } from "@/lib/data/source";

type Params = { slug: string };

export async function generateStaticParams() {
  return getForecasterStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getForecasterBySlug(slug);
  const forecaster = result?.forecaster;
  if (!forecaster) return {};
  return {
    title: forecaster.displayName,
    description: forecaster.bio,
    alternates: {
      canonical: absoluteUrl(`/forecasters/${forecaster.slug}`)
    },
    openGraph: {
      title: `${forecaster.displayName} forecast reputation`,
      description: forecaster.bio,
      url: absoluteUrl(`/forecasters/${forecaster.slug}`)
    }
  };
}

export default async function ForecasterProfilePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getForecasterBySlug(slug);
  if (!result) notFound();
  const { data, forecaster } = result;
  const metric = forecaster.metrics;
  const history = forecaster.forecasts.sort((a, b) => b.forecastedAt.localeCompare(a.forecastedAt));
  const active = history.filter((forecast) => !forecast.isResolved);
  const resolved = history.filter((forecast) => forecast.isResolved);
  const best = resolved.filter((forecast) => forecast.wasCorrect).slice(0, 3);
  const worst = resolved.filter((forecast) => !forecast.wasCorrect).slice(0, 3);
  const categoryValues = Object.entries(metric?.categoryAccuracy ?? {}).map(([label, value]) => ({ label, value }));

  return (
    <section className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-xl font-bold">{forecaster.avatarUrl}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">{forecaster.displayName}</h1>
              {forecaster.isVerified ? <CheckCircle2 className="h-5 w-5 text-accent" aria-label="Verified" /> : null}
              <Badge tone="accent">Rank #{metric?.rank}</Badge>
              <Badge>{dataOriginLabel(forecaster.dataOrigin)}</Badge>
              <Badge>{profileStatusLabel(forecaster.profileStatus)}</Badge>
              {forecaster.verificationStatus !== "unverified" ? <Badge tone="positive">{verificationLabel(forecaster.verificationStatus)}</Badge> : null}
            </div>
            <p className="mt-2 text-muted-foreground">{forecaster.xHandle} · {forecaster.walletAddress}</p>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{forecaster.bio}</p>
          </div>
        </div>
        <Card>
          <CardContent className="grid grid-cols-2 gap-4">
            <p><span className="block text-3xl font-bold">{metric?.verityScore.toFixed(1)}</span><span className="text-sm text-muted-foreground">Verity score</span></p>
            <p><span className="block text-3xl font-bold">{formatPercent(metric?.accuracy ?? 0)}</span><span className="text-sm text-muted-foreground">Accuracy</span></p>
            <p><span className="block font-semibold">{formatPercent(metric?.calibration ?? 0)}</span><span className="text-sm text-muted-foreground">Calibration</span></p>
            <p><span className="block font-semibold">{metric?.totalForecasts}</span><span className="text-sm text-muted-foreground">Total forecasts</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Resolved forecasts" value={String(metric?.resolvedForecasts ?? 0)} detail="sample-adjusted scoring" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Current streak" value={String(metric?.currentStreak ?? 0)} detail="resolved correct calls" icon={<Award className="h-5 w-5" />} />
        <StatCard label="Best category" value={forecaster.strongestDomain} detail="domain signal" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Member since" value={formatDate(forecaster.joinedAt)} detail="shareable profile URL" icon={<Calendar className="h-5 w-5" />} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><h2 className="font-semibold">Performance by category</h2></CardHeader>
          <CardContent><PerformanceChart values={categoryValues} /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Domain-specific performance</h2></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {categoryValues.map((item) => (
              <p key={item.label} className="flex justify-between"><span>{item.label}</span><strong>{formatPercent(item.value)}</strong></p>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <ForecastList title="Active forecasts" forecasts={active} data={data} />
        <ForecastList title="Resolved forecasts" forecasts={resolved} data={data} />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <ForecastList title="Best calls" forecasts={best} data={data} />
        <ForecastList title="Worst calls" forecasts={worst} data={data} />
      </div>
    </section>
  );
}

function ForecastList({ title, forecasts, data }: { title: string; forecasts: EnrichedForecaster["forecasts"]; data: DataSet }) {
  return (
    <Card>
      <CardHeader><h2 className="font-semibold">{title}</h2></CardHeader>
      <CardContent className="space-y-4">
        {forecasts.length ? forecasts.map((forecast) => {
          const market = marketById(data, forecast.marketId);
          return (
            <div key={forecast.id} className="rounded-md border p-4">
              <p className="line-clamp-2 font-medium">{market?.question ?? forecast.marketId}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <span>{formatPercent(forecast.predictedProbability)} prediction</span>
                <span>{formatPercent(forecast.confidence)} confidence</span>
                <span>{forecast.isResolved ? (forecast.wasCorrect ? "Correct" : "Incorrect") : "Active"}</span>
                <span>{forecast.scoreImpact.toFixed(2)} score impact</span>
                <span>{formatDate(forecast.forecastedAt)}</span>
                <span>{forecast.position}</span>
              </div>
            </div>
          );
        }) : <p className="text-sm text-muted-foreground">No forecasts in this section yet.</p>}
      </CardContent>
    </Card>
  );
}
