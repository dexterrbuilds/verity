import type { ExternalMarket, ExternalProbabilityPoint } from "@/lib/ingestion/types";
import type { ForecastPosition, ResolutionStatus } from "@/types";

export function toProbabilityPercent(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) throw new TypeError("Probability must be numeric.");
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  if (percent < 0 || percent > 100) throw new RangeError("Probability must be between 0 and 100.");
  return Number(percent.toFixed(2));
}

export function toFiniteNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

export function normalizeStatus(input: { active?: unknown; closed?: unknown; archived?: unknown; resolvedOutcome?: ForecastPosition | null }): ResolutionStatus {
  if (input.archived === true) return "cancelled";
  if (input.closed === true) return input.resolvedOutcome ? "resolved" : "cancelled";
  if (input.active === false) return "cancelled";
  return "active";
}

export function normalizeOutcome(value: unknown): ForecastPosition | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "yes" || normalized === "true" || normalized === "1") return "yes";
  if (normalized === "no" || normalized === "false" || normalized === "0") return "no";
  return null;
}

export function normalizeHistoryPoint(point: ExternalProbabilityPoint): ExternalProbabilityPoint {
  return {
    ...point,
    probability: toProbabilityPercent(point.probability),
    recordedAt: new Date(point.recordedAt).toISOString()
  };
}

export function validateExternalMarket(market: ExternalMarket): ExternalMarket {
  return {
    ...market,
    probability: toProbabilityPercent(market.probability),
    liquidity: toFiniteNumber(market.liquidity),
    volume: toFiniteNumber(market.volume),
    history: market.history?.map(normalizeHistoryPoint)
  };
}
