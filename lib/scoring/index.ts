import type { Category, Forecast, ForecasterMetrics, Market, MarketConviction } from "@/types";

const INFLUENCE_CAP = 0.35;
const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  "cat-sol": "Solana",
  "cat-ai": "AI",
  "cat-defi": "DeFi",
  "cat-gov": "Governance",
  "cat-macro": "Macro",
  "cat-crypto": "Crypto",
  "cat-infra": "Infrastructure"
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function assertValidProbability(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${label} must be between 0 and 100.`);
  }
}

function marketById(markets: Market[]) {
  return new Map(markets.map((market) => [market.id, market]));
}

function normalizeWithCap(weights: number[], cap: number) {
  if (!weights.length) return [];
  if (weights.length * cap < 1) return weights.map(() => 1 / weights.length);

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!total) return weights.map(() => 1 / weights.length);

  const shares = weights.map((weight) => weight / total);
  const capped = new Array<number>(weights.length).fill(0);
  const remaining = new Set(weights.map((_, index) => index));
  let remainingShare = 1;

  while (remaining.size) {
    const remainingRaw = Array.from(remaining).reduce((sum, index) => sum + shares[index], 0);
    let cappedThisRound = false;
    for (const index of Array.from(remaining)) {
      const redistributed = remainingRaw ? (shares[index] / remainingRaw) * remainingShare : remainingShare / remaining.size;
      if (redistributed > cap) {
        capped[index] = cap;
        remaining.delete(index);
        remainingShare -= cap;
        cappedThisRound = true;
      }
    }
    if (!cappedThisRound) {
      for (const index of remaining) {
        capped[index] = remainingRaw ? (shares[index] / remainingRaw) * remainingShare : remainingShare / remaining.size;
      }
      break;
    }
  }

  return capped;
}

type ScoredForecast = Forecast & { outcome: "yes" | "no"; market: Market };

function resolvedForecasts(forecasts: Forecast[], markets: Market[]): ScoredForecast[] {
  const marketsById = marketById(markets);
  return forecasts.flatMap((forecast) => {
    assertValidProbability(forecast.predictedProbability, "predictedProbability");
    assertValidProbability(forecast.confidence, "confidence");
    const market = marketsById.get(forecast.marketId);
    if (!market || market.resolutionStatus !== "resolved" || !market.resolutionOutcome) return [];
    if (Date.parse(forecast.forecastedAt) > Date.parse(market.resolutionDate)) {
      throw new RangeError("forecastedAt cannot be after market resolutionDate.");
    }
    return [{ ...forecast, market, outcome: market.resolutionOutcome }];
  });
}

function directionalForecasts(forecasts: Forecast[], markets: Market[]) {
  return resolvedForecasts(forecasts, markets).filter((forecast) => forecast.position !== "neutral");
}

function isDirectionallyCorrect(forecast: ScoredForecast) {
  return (forecast.position === "yes" && forecast.outcome === "yes") || (forecast.position === "no" && forecast.outcome === "no");
}

export function calculateAccuracy(forecasts: Forecast[], markets: Market[] = []) {
  const resolved = directionalForecasts(forecasts, markets);
  if (!resolved.length) return 0;
  return (resolved.filter(isDirectionallyCorrect).length / resolved.length) * 100;
}

export function calculateCalibration(forecasts: Forecast[], markets: Market[] = []) {
  const resolved = resolvedForecasts(forecasts, markets);
  if (!resolved.length) return 0;
  const brier = mean(
    resolved.map((forecast) => {
      const predictedYes = forecast.predictedProbability / 100;
      const outcome = forecast.outcome === "yes" ? 1 : 0;
      return (predictedYes - outcome) ** 2;
    })
  );
  return clamp((1 - brier) * 100);
}

export function calculateExperience(forecasts: Forecast[], markets: Market[] = []) {
  const resolved = resolvedForecasts(forecasts, markets).length;
  return clamp((1 - Math.exp(-resolved / 18)) * 100);
}

export function calculateConsistency(forecasts: Forecast[], markets: Market[] = []) {
  const resolved = directionalForecasts(forecasts, markets);
  if (resolved.length < 3) return 45;
  const ordered = [...resolved].sort((a, b) => a.forecastedAt.localeCompare(b.forecastedAt));
  const chunks = [ordered.slice(0, Math.ceil(ordered.length / 2)), ordered.slice(Math.ceil(ordered.length / 2))];
  const rates = chunks.map((chunk) => calculateAccuracy(chunk, markets));
  return clamp(100 - Math.abs(rates[0] - rates[1]));
}

export function calculateRecentPerformance(forecasts: Forecast[], markets: Market[] = []) {
  const recent = directionalForecasts(forecasts, markets)
    .sort((a, b) => b.forecastedAt.localeCompare(a.forecastedAt))
    .slice(0, 8);
  return recent.length ? calculateAccuracy(recent, markets) : 45;
}

export function currentStreak(forecasts: Forecast[], markets: Market[] = []) {
  let streak = 0;
  for (const forecast of directionalForecasts(forecasts, markets).sort((a, b) => b.forecastedAt.localeCompare(a.forecastedAt))) {
    if (!isDirectionallyCorrect(forecast)) break;
    streak += 1;
  }
  return streak;
}

export function calculateVerityScore(forecasts: Forecast[], markets: Market[] = []) {
  const resolved = resolvedForecasts(forecasts, markets).length;
  const raw =
    calculateAccuracy(forecasts, markets) * 0.35 +
    calculateCalibration(forecasts, markets) * 0.25 +
    calculateConsistency(forecasts, markets) * 0.15 +
    calculateExperience(forecasts, markets) * 0.15 +
    calculateRecentPerformance(forecasts, markets) * 0.1;

  // Minimum-sample adjustment keeps one lucky forecast from outranking steady forecasters.
  const sampleWeight = Math.min(1, resolved / 12);
  return clamp(raw * sampleWeight + 50 * (1 - sampleWeight));
}

function categoryLabel(categoryId: string, categories: Category[]) {
  return categories.find((category) => category.id === categoryId)?.name ?? DEFAULT_CATEGORY_LABELS[categoryId] ?? categoryId;
}

function categoryList(markets: Market[], categories: Category[]) {
  const seen = new Map<string, string>();
  for (const market of markets) {
    seen.set(market.categoryId, categoryLabel(market.categoryId, categories));
  }
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

export function buildForecasterMetrics(allForecasts: Forecast[], markets: Market[], categories: Category[] = []): ForecasterMetrics[] {
  const byForecaster = new Map<string, Forecast[]>();
  for (const forecast of allForecasts) {
    byForecaster.set(forecast.forecasterId, [...(byForecaster.get(forecast.forecasterId) ?? []), forecast]);
  }

  const metrics = Array.from(byForecaster.entries()).map(([forecasterId, items]) => {
    const categoryAccuracy: Record<string, number> = {};
    for (const category of categoryList(markets, categories)) {
      const categoryMarketIds = new Set(markets.filter((market) => market.categoryId === category.id).map((market) => market.id));
      categoryAccuracy[category.name] = calculateAccuracy(items.filter((forecast) => categoryMarketIds.has(forecast.marketId)), markets);
    }

    const trend = items
      .filter((forecast) => resolvedForecasts([forecast], markets).length > 0 && forecast.position !== "neutral")
      .sort((a, b) => a.forecastedAt.localeCompare(b.forecastedAt))
      .slice(-6)
      .map((forecast) => {
        const scored = resolvedForecasts([forecast], markets)[0];
        return scored && isDirectionallyCorrect(scored) ? 1 : -1;
      });

    return {
      forecasterId,
      verityScore: calculateVerityScore(items, markets),
      accuracy: calculateAccuracy(items, markets),
      calibration: calculateCalibration(items, markets),
      consistency: calculateConsistency(items, markets),
      experience: calculateExperience(items, markets),
      recentPerformance: calculateRecentPerformance(items, markets),
      totalForecasts: items.length,
      resolvedForecasts: resolvedForecasts(items, markets).length,
      currentStreak: currentStreak(items, markets),
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
  metrics: ForecasterMetrics[],
  categories: Category[] = []
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
  const categoryName = categoryLabel(market.categoryId, categories);
  const weighted = marketForecasts.map((forecast) => {
    assertValidProbability(forecast.predictedProbability, "predictedProbability");
    assertValidProbability(forecast.confidence, "confidence");
    const metric = metricByForecaster.get(forecast.forecasterId);
    const categoryStrength = metric?.categoryAccuracy[categoryName] ?? 50;
    const weight = ((metric?.verityScore ?? 50) / 100) * 0.11 + ((metric?.experience ?? 30) / 100) * 0.04 + (categoryStrength / 100) * 0.03;
    return { probability: forecast.predictedProbability, weight };
  });
  const cappedShares = normalizeWithCap(weighted.map((item) => item.weight), INFLUENCE_CAP);
  const totalWeight = cappedShares.reduce((sum, item) => sum + item, 0);
  const highestConfidence = [...marketForecasts].sort((a, b) => b.confidence - a.confidence)[0];

  return {
    averageTrackedForecast: mean(marketForecasts.map((forecast) => forecast.predictedProbability)),
    reputationWeightedForecast: totalWeight
      ? weighted.reduce((sum, item, index) => sum + item.probability * cappedShares[index], 0) / totalWeight
      : market.currentProbability,
    highestConfidencePosition: highestConfidence.position,
    bullishShare: (marketForecasts.filter((forecast) => forecast.predictedProbability >= 55).length / marketForecasts.length) * 100,
    bearishShare: (marketForecasts.filter((forecast) => forecast.predictedProbability <= 45).length / marketForecasts.length) * 100,
    trackedForecasterCount: marketForecasts.length
  };
}
