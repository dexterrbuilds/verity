import { cache } from "react";
import { categories as demoCategories, forecasts as demoForecasts, forecasters as demoForecasters, insights as demoInsights, markets as demoMarkets, probabilityHistory as demoProbabilityHistory, protocols as demoProtocols } from "@/lib/data/seed";
import { getConnectedBaseData } from "@/lib/data/cache";
import { getPublicSupabaseClient } from "@/lib/supabase/public-server";
import { throwDataError } from "@/lib/data/errors";
import { getDataMode, isDemoMode } from "@/lib/data/mode";
import { buildForecasterMetrics, calculateAccuracy, calculateMarketConviction } from "@/lib/scoring";
import {
  normalizeCategory,
  normalizeForecast,
  normalizeForecaster,
  normalizeInsight,
  normalizeMarket,
  normalizeProbabilityPoint,
  normalizeProtocol
} from "@/lib/data/normalize";
import type { Category, EnrichedForecaster, EnrichedMarket, Forecast, Forecaster, Insight, Market, PlatformStats, ProbabilityPoint, Protocol, ResolvedForecastSummary } from "@/types";

export type DataSet = {
  mode: ReturnType<typeof getDataMode>;
  categories: Category[];
  protocols: Protocol[];
  markets: Market[];
  forecasters: Forecaster[];
  forecasts: Forecast[];
  insights: Insight[];
  probabilityHistory: ProbabilityPoint[];
};

export const getDataSet = cache(async (): Promise<DataSet> => {
  if (isDemoMode()) {
    return {
      mode: "demo",
      categories: demoCategories.map((category) => ({ ...category, dataOrigin: "demo" as const, verificationStatus: "unverified" as const })),
      protocols: demoProtocols.map((protocol) => ({ ...protocol, dataOrigin: "demo" as const, verificationStatus: "unverified" as const })),
      markets: demoMarkets.map((market) => ({ ...market, dataOrigin: "demo" as const, verificationStatus: "unverified" as const })),
      forecasters: demoForecasters.map((forecaster) => ({ ...forecaster, dataOrigin: "demo" as const, verificationStatus: "unverified" as const, profileStatus: "unclaimed" as const })),
      forecasts: demoForecasts.map((forecast) => ({ ...forecast, dataOrigin: "demo" as const, verificationStatus: "unverified" as const })),
      insights: demoInsights.map((insight) => ({ ...insight, dataOrigin: "demo" as const, verificationStatus: "unverified" as const })),
      probabilityHistory: demoProbabilityHistory
    };
  }

  const base = await getConnectedBaseData();
  if (!base) throw new Error("Connected mode did not return Supabase data.");
  return {
    mode: "connected",
    categories: base.categoryRows.map(normalizeCategory),
    protocols: base.protocolRows.map(normalizeProtocol),
    markets: base.marketRows.map(normalizeMarket),
    forecasters: base.forecasterRows.map(normalizeForecaster),
    forecasts: base.forecastRows.map(normalizeForecast),
    insights: [],
    probabilityHistory: []
  };
});

export const getInsights = cache(async () => {
  if (isDemoMode()) return demoInsights.map((insight) => ({ ...insight, dataOrigin: "demo" as const, verificationStatus: "unverified" as const }));
  const supabase = getPublicSupabaseClient();
  if (!supabase) throw new Error("Connected mode could not initialize Supabase public client.");
  const { data, error } = await supabase
    .from("insights")
    .select("id,title,body,category,is_featured,data_origin,verification_status,published_at,created_at,updated_at")
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throwDataError("Failed to load insights", error);
  return (data ?? []).map(normalizeInsight);
});

export async function getHistoryForMarket(marketId: string) {
  if (isDemoMode()) return demoProbabilityHistory.filter((point) => point.marketId === marketId);
  const supabase = getPublicSupabaseClient();
  if (!supabase) throw new Error("Connected mode could not initialize Supabase public client.");
  const { data, error } = await supabase
    .from("market_probability_history")
    .select("id,market_id,probability,recorded_at")
    .eq("market_id", marketId)
    .order("recorded_at", { ascending: true })
    .limit(500);
  if (error) throwDataError("Failed to load market probability history", error);
  return (data ?? []).map(normalizeProbabilityPoint);
}

export function getMetrics(data: Pick<DataSet, "forecasts" | "markets" | "categories">) {
  return buildForecasterMetrics(data.forecasts, data.markets, data.categories);
}

export function categoryFor(data: Pick<DataSet, "categories">, idOrSlug: string) {
  return data.categories.find((category) => category.id === idOrSlug || category.slug === idOrSlug);
}

export function protocolFor(data: Pick<DataSet, "protocols">, idOrSlug: string) {
  return data.protocols.find((protocol) => protocol.id === idOrSlug || protocol.slug === idOrSlug);
}

export function marketById(data: Pick<DataSet, "markets">, id: string) {
  return data.markets.find((market) => market.id === id);
}

export function forecasterById(data: Pick<DataSet, "forecasters">, id: string) {
  return data.forecasters.find((forecaster) => forecaster.id === id);
}

export function forecastsForMarket(data: Pick<DataSet, "forecasts">, marketId: string) {
  return data.forecasts.filter((forecast) => forecast.marketId === marketId);
}

export function forecastsForForecaster(data: Pick<DataSet, "forecasts">, forecasterId: string) {
  return data.forecasts.filter((forecast) => forecast.forecasterId === forecasterId);
}

export function strongestDomain(metric: ReturnType<typeof getMetrics>[number] | undefined, fallback = "Unscored") {
  if (!metric) return fallback;
  const best = Object.entries(metric.categoryAccuracy)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])[0];
  return best?.[0] ?? fallback;
}

export function enrichMarket(data: Pick<DataSet, "categories" | "protocols" | "forecasts" | "markets">, market: Market, metrics = getMetrics({ forecasts: data.forecasts, markets: data.markets, categories: data.categories })): EnrichedMarket {
  return {
    ...market,
    category: categoryFor(data, market.categoryId),
    protocol: protocolFor(data, market.protocolId),
    conviction: calculateMarketConviction(market, data.forecasts, metrics, data.categories)
  };
}

export function enrichForecaster(data: Pick<DataSet, "categories" | "forecasts" | "markets">, forecaster: Forecaster, metrics = getMetrics({ forecasts: data.forecasts, markets: data.markets, categories: data.categories })): EnrichedForecaster {
  const metric = metrics.find((item) => item.forecasterId === forecaster.id);
  return {
    ...forecaster,
    strongestDomain: forecaster.strongestDomain || strongestDomain(metric),
    metrics: metric,
    forecasts: forecastsForForecaster(data, forecaster.id)
  };
}

export function platformStats(data: Pick<DataSet, "forecasters" | "markets" | "forecasts">): PlatformStats {
  const resolvedMarketIds = new Set(data.markets.filter((market) => market.resolutionStatus === "resolved").map((market) => market.id));
  const resolvedForecasts = data.forecasts.filter((forecast) => resolvedMarketIds.has(forecast.marketId));
  const accuracy = calculateAccuracy(data.forecasts, data.markets);
  return {
    totalForecasters: data.forecasters.length,
    totalMarkets: data.markets.length,
    activeMarkets: data.markets.filter((market) => market.resolutionStatus === "active").length,
    resolvedMarkets: data.markets.filter((market) => market.resolutionStatus === "resolved").length,
    totalForecasts: data.forecasts.length,
    resolvedForecasts: resolvedForecasts.length,
    averageAccuracy: accuracy
  };
}

export function recentResolvedForecasts(data: Pick<DataSet, "forecasters" | "forecasts" | "markets">, limit = 6): ResolvedForecastSummary[] {
  const resolvedMarketIds = new Set(data.markets.filter((market) => market.resolutionStatus === "resolved").map((market) => market.id));
  return data.forecasts
    .filter((forecast) => resolvedMarketIds.has(forecast.marketId))
    .sort((a, b) => b.forecastedAt.localeCompare(a.forecastedAt))
    .slice(0, limit)
    .flatMap((forecast) => {
      const forecaster = forecasterById(data, forecast.forecasterId);
      const market = marketById(data, forecast.marketId);
      return forecaster && market ? [{ forecast, forecaster, market }] : [];
    });
}
