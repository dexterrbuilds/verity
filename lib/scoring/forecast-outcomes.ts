import type { Forecast, Market } from "@/types";

export function derivedForecastOutcome(forecast: Forecast, market: Market | undefined): Pick<Forecast, "isResolved" | "wasCorrect"> {
  if (!market || market.resolutionStatus !== "resolved" || !market.resolutionOutcome) {
    return { isResolved: false, wasCorrect: null };
  }

  if (forecast.position === "neutral") {
    return { isResolved: true, wasCorrect: null };
  }

  return {
    isResolved: true,
    wasCorrect: forecast.position === market.resolutionOutcome
  };
}

export function reconcileForecastOutcomes(forecasts: Forecast[], markets: Market[]) {
  const marketById = new Map(markets.map((market) => [market.id, market]));
  return forecasts.map((forecast) => ({
    ...forecast,
    ...derivedForecastOutcome(forecast, marketById.get(forecast.marketId))
  }));
}
