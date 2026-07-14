import type { Forecast, ForecasterMetrics, Market, MarketConviction } from "@/types";
import { categories } from "@/lib/data/seed";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function resolvedForecasts(forecasts: Forecast[]) {
  return forecasts.filter((forecast) => forecast.isResolved && forecast.wasCorrect !== null);
}

export function calculateAccuracy(forecasts: Forecast[]) {
  const resolved = resolvedForecasts(forecasts);
  if (!resolved.length) return 0;
  return (resolved.filter((forecast) => forecast.wasCorrect).length / resolved.length) * 100;
}

export function calculateCalibration(forecasts: Forecast[]) {
  const resolved = resolvedForecasts(forecasts);
  if (!resolved.length) return 0;
  const brier = mean(
    resolved.map((forecast) => {
      const predicted = forecast.predictedProbability / 100;
      const outcome = forecast.wasCorrect
        ? forecast.predictedProbability >= 50
          ? 1
          : 0
        : forecast.predictedProbability >= 50
          ? 0
          : 1;
      return (predicted - outcome) ** 2;
    })
  );
  return clamp((1 - brier) * 100);
}

export function calculateExperience(forecasts: Forecast[]) {
  const resolved = resolvedForecasts(forecasts).length;
  return clamp((1 - Math.exp(-resolved / 18)) * 100);
}

export function calculateConsistency(forecasts: Forecast[]) {
  const resolved = resolvedForecasts(forecasts);
  if (resolved.length < 3) return 45;
  const ordered = [...resolved].sort((a, b) => a.forecastedAt.localeCompare(b.forecastedAt));
  const chunks = [ordered.slice(0, Math.ceil(ordered.length / 2)), ordered.slice(Math.ceil(ordered.length / 2))];
  const rates = chunks.map(calculateAccuracy);
  return clamp(100 - Math.abs(rates[0] - rates[1]));
}

export function calculateRecentPerformance(forecasts: Forecast[]) {
  const recent = resolvedForecasts(forecasts)
    .sort((a, b) => b.forecastedAt.localeCompare(a.forecastedAt))
    .slice(0, 8);
  return recent.length ? calculateAccuracy(recent) : 45;
}

export function currentStreak(forecasts: Forecast[]) {
  let streak = 0;
  for (const forecast of resolvedForecasts(forecasts).sort((a, b) => b.forecastedAt.localeCompare(a.forecastedAt))) {
    if (!forecast.wasCorrect) break;
    streak += 1;
  }
  return streak;
}

export function calculateVerityScore(forecasts: Forecast[]) {
  const resolved = resolvedForecasts(forecasts).length;
  const raw =
    calculateAccuracy(forecasts) * 0.35 +
    calculateCalibration(forecasts) * 0.25 +
    calculateConsistency(forecasts) * 0.15 +
    calculateExperience(forecasts) * 0.15 +
    calculateRecentPerformance(forecasts) * 0.1;

  // Minimum-sample adjustment keeps one lucky forecast from outranking steady forecasters.
  const sampleWeight = Math.min(1, resolved / 12);
  return clamp(raw * sampleWeight + 50 * (1 - sampleWeight));
}

export function buildForecasterMetrics(allForecasts: Forecast[], markets: Market[]): ForecasterMetrics[] {
  const byForecaster = new Map<string, Forecast[]>();
  for (const forecast of allForecasts) {
    byForecaster.set(forecast.forecasterId, [...(byForecaster.get(forecast.forecasterId) ?? []), forecast]);
  }

  const metrics = Array.from(byForecaster.entries()).map(([forecasterId, items]) => {
    const categoryAccuracy: Record<string, number> = {};
    for (const category of categories) {
      const categoryMarketIds = new Set(markets.filter((market) => market.categoryId === category.id).map((market) => market.id));
      categoryAccuracy[category.name] = calculateAccuracy(items.filter((forecast) => categoryMarketIds.has(forecast.marketId)));
    }

    const trend = items
      .filter((forecast) => forecast.isResolved)
      .sort((a, b) => a.forecastedAt.localeCompare(b.forecastedAt))
      .slice(-6)
      .map((forecast) => (forecast.wasCorrect ? 1 : -1));

    return {
      forecasterId,
      verityScore: calculateVerityScore(items),
      accuracy: calculateAccuracy(items),
      calibration: calculateCalibration(items),
      consistency: calculateConsistency(items),
      experience: calculateExperience(items),
      recentPerformance: calculateRecentPerformance(items),
      totalForecasts: items.length,
      resolvedForecasts: resolvedForecasts(items).length,
      currentStreak: currentStreak(items),
      categoryAccuracy,
      trend,
      rank: 0
    };
  });

  return metrics
    .sort((a, b) => b.verityScore - a.verityScore)
    .map((metric, index) => ({ ...metric, rank: index + 1 }));
}

export function calculateMarketConviction(
  market: Market,
  forecasts: Forecast[],
  metrics: ForecasterMetrics[]
): MarketConviction {
  const marketForecasts = forecasts.filter((forecast) => forecast.marketId === market.id);
  if (!marketForecasts.length) {
    return {
      averageTrackedForecast: market.currentProbability,
      reputationWeightedForecast: market.currentProbability,
      highestConfidencePosition: "neutral",
      bullishShare: 0,
      bearishShare: 0,
      trackedForecasterCount: 0
    };
  }

  const metricByForecaster = new Map(metrics.map((metric) => [metric.forecasterId, metric]));
  const categoryName = categories.find((category) => category.id === market.categoryId)?.name ?? "Crypto";
  const weighted = marketForecasts.map((forecast) => {
    const metric = metricByForecaster.get(forecast.forecasterId);
    const categoryStrength = metric?.categoryAccuracy[categoryName] ?? 50;
    const weight = Math.min(0.18, ((metric?.verityScore ?? 50) / 100) * 0.11 + ((metric?.experience ?? 30) / 100) * 0.04 + (categoryStrength / 100) * 0.03);
    return { probability: forecast.predictedProbability, weight };
  });
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const highestConfidence = [...marketForecasts].sort((a, b) => b.confidence - a.confidence)[0];

  return {
    averageTrackedForecast: mean(marketForecasts.map((forecast) => forecast.predictedProbability)),
    reputationWeightedForecast: totalWeight
      ? weighted.reduce((sum, item) => sum + item.probability * item.weight, 0) / totalWeight
      : market.currentProbability,
    highestConfidencePosition: highestConfidence.position,
    bullishShare: (marketForecasts.filter((forecast) => forecast.predictedProbability >= 55).length / marketForecasts.length) * 100,
    bearishShare: (marketForecasts.filter((forecast) => forecast.predictedProbability <= 45).length / marketForecasts.length) * 100,
    trackedForecasterCount: marketForecasts.length
  };
}
