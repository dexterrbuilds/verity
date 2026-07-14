import { categories, forecasts, forecasters, insights, markets, probabilityHistory, protocols } from "@/lib/data/seed";
import { buildForecasterMetrics, calculateMarketConviction } from "@/lib/scoring";
import type { Forecast, Forecaster, Market } from "@/types";

export const forecasterMetrics = buildForecasterMetrics(forecasts, markets);

export function getCategory(idOrSlug: string) {
  return categories.find((category) => category.id === idOrSlug || category.slug === idOrSlug);
}

export function getProtocol(idOrSlug: string) {
  return protocols.find((protocol) => protocol.id === idOrSlug || protocol.slug === idOrSlug);
}

export function getMarket(slug: string) {
  return markets.find((market) => market.slug === slug);
}

export function getMarketById(id: string) {
  return markets.find((market) => market.id === id);
}

export function getForecaster(slug: string) {
  return forecasters.find((forecaster) => forecaster.slug === slug);
}

export function getForecasterById(id: string) {
  return forecasters.find((forecaster) => forecaster.id === id);
}

export function getForecasterMetric(forecasterId: string) {
  return forecasterMetrics.find((metric) => metric.forecasterId === forecasterId);
}

export function forecastsForMarket(marketId: string) {
  return forecasts.filter((forecast) => forecast.marketId === marketId);
}

export function forecastsForForecaster(forecasterId: string) {
  return forecasts.filter((forecast) => forecast.forecasterId === forecasterId);
}

export function historyForMarket(marketId: string) {
  return probabilityHistory.filter((point) => point.marketId === marketId);
}

export function enrichMarket(market: Market) {
  return {
    ...market,
    category: getCategory(market.categoryId),
    protocol: getProtocol(market.protocolId),
    conviction: calculateMarketConviction(market, forecasts, forecasterMetrics)
  };
}

export function enrichForecaster(forecaster: Forecaster) {
  return {
    ...forecaster,
    metrics: getForecasterMetric(forecaster.id),
    forecasts: forecastsForForecaster(forecaster.id)
  };
}

export function topForecasters(limit = 5) {
  return forecasterMetrics
    .slice(0, limit)
    .map((metric) => ({ forecaster: forecasters.find((item) => item.id === metric.forecasterId), metric }))
    .filter((item): item is { forecaster: Forecaster; metric: NonNullable<typeof item.metric> } => Boolean(item.forecaster));
}

export function trendingMarkets(limit = 6) {
  return markets
    .filter((market) => market.resolutionStatus === "active")
    .map(enrichMarket)
    .sort((a, b) => Math.abs(b.currentProbability - b.previousProbability) + b.volume / 1000000 - (Math.abs(a.currentProbability - a.previousProbability) + a.volume / 1000000))
    .slice(0, limit);
}

export function recentResolvedForecasts(limit = 6) {
  return forecasts
    .filter((forecast) => forecast.isResolved)
    .sort((a, b) => b.forecastedAt.localeCompare(a.forecastedAt))
    .slice(0, limit)
    .map((forecast) => ({
      forecast,
      forecaster: forecasters.find((item) => item.id === forecast.forecasterId),
      market: markets.find((item) => item.id === forecast.marketId)
    }))
    .filter((item): item is { forecast: Forecast; forecaster: Forecaster; market: Market } => Boolean(item.forecaster && item.market));
}

export function featuredInsights() {
  return insights.filter((insight) => insight.isFeatured);
}

export function platformStats() {
  const resolvedForecasts = forecasts.filter((forecast) => forecast.isResolved);
  const correctForecasts = resolvedForecasts.filter((forecast) => forecast.wasCorrect);
  return {
    totalForecasters: forecasters.length,
    totalMarkets: markets.length,
    activeMarkets: markets.filter((market) => market.resolutionStatus === "active").length,
    resolvedMarkets: markets.filter((market) => market.resolutionStatus === "resolved").length,
    totalForecasts: forecasts.length,
    resolvedForecasts: resolvedForecasts.length,
    averageAccuracy: resolvedForecasts.length ? (correctForecasts.length / resolvedForecasts.length) * 100 : 0
  };
}
