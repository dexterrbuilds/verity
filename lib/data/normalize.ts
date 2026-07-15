import type { Category, DataOrigin, Forecast, ForecastPosition, Forecaster, Insight, Market, ProbabilityPoint, ProfileStatus, Protocol, ResolutionStatus, VerificationStatus } from "@/types";
import type { Database } from "@/types/database";

type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export function toNumber(value: number | string | null | undefined, label: string) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new TypeError(`${label} must be a finite number.`);
  return parsed;
}

export function toPercent(value: number | string | null | undefined, label: string) {
  const parsed = toNumber(value, label);
  if (parsed < 0 || parsed > 100) throw new RangeError(`${label} must be between 0 and 100.`);
  return parsed;
}

export function toCount(value: number | string | null | undefined, label: string) {
  const parsed = toNumber(value, label);
  if (!Number.isInteger(parsed) || parsed < 0) throw new RangeError(`${label} must be a non-negative integer.`);
  return parsed;
}

export function toDateString(value: string | null | undefined, fallback = new Date(0).toISOString()) {
  const next = value ?? fallback;
  if (!Number.isFinite(Date.parse(next))) throw new TypeError(`Invalid date: ${next}`);
  return next;
}

export function toResolutionStatus(value: string): ResolutionStatus {
  if (value === "active" || value === "resolved" || value === "cancelled") return value;
  throw new TypeError(`Invalid resolution status: ${value}`);
}

export function toForecastPosition(value: string): ForecastPosition {
  if (value === "yes" || value === "no" || value === "neutral") return value;
  throw new TypeError(`Invalid forecast position: ${value}`);
}

export function toDataOrigin(value: string | null | undefined): DataOrigin {
  if (value === "demo" || value === "manually_curated" || value === "integrated") return value;
  return "manually_curated";
}

export function toVerificationStatus(value: string | null | undefined): VerificationStatus {
  if (value === "unverified" || value === "source_checked" || value === "protocol_verified") return value;
  return "unverified";
}

export function toProfileStatus(value: string | null | undefined): ProfileStatus {
  if (value === "claimed" || value === "unclaimed") return value;
  return "unclaimed";
}

export function normalizeCategory(row: Row<"categories">): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    dataOrigin: toDataOrigin(row.data_origin),
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

export function normalizeProtocol(row: Row<"protocols">): Protocol {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url ?? "",
    websiteUrl: row.website_url ?? "",
    description: row.description ?? "",
    dataOrigin: toDataOrigin(row.data_origin),
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

export function normalizeForecaster(row: Row<"forecasters">): Forecaster {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    walletAddress: row.wallet_address ?? "",
    xHandle: row.x_handle ?? "",
    avatarUrl: row.avatar_url ?? initials(row.display_name),
    bio: row.bio ?? "",
    joinedAt: toDateString(row.joined_at),
    isVerified: row.is_verified,
    strongestDomain: "",
    dataOrigin: toDataOrigin(row.data_origin),
    verificationStatus: toVerificationStatus(row.verification_status),
    profileStatus: toProfileStatus(row.profile_status)
  };
}

export function normalizeMarket(row: Row<"markets">): Market {
  return {
    id: row.id,
    protocolId: row.protocol_id ?? "",
    categoryId: row.category_id ?? "",
    slug: row.slug,
    question: row.question,
    description: row.description ?? "",
    sourceUrl: row.source_url ?? "",
    currentProbability: toPercent(row.current_probability, "current_probability"),
    previousProbability: toPercent(row.previous_probability, "previous_probability"),
    volume: toNumber(row.volume, "volume"),
    participantCount: toCount(row.participant_count, "participant_count"),
    resolutionDate: toDateString(row.resolution_date),
    resolutionStatus: toResolutionStatus(row.resolution_status),
    resolutionOutcome: row.resolution_outcome,
    resolutionRules: row.resolution_rules ?? "",
    dataOrigin: toDataOrigin(row.data_origin),
    verificationStatus: toVerificationStatus(row.verification_status),
    createdAt: toDateString(row.created_at),
    updatedAt: toDateString(row.updated_at)
  };
}

export function normalizeForecast(row: Row<"forecasts">): Forecast {
  return {
    id: row.id,
    forecasterId: row.forecaster_id,
    marketId: row.market_id,
    predictedProbability: toPercent(row.predicted_probability, "predicted_probability"),
    confidence: toPercent(row.confidence, "confidence"),
    position: toForecastPosition(row.position),
    reasoning: row.reasoning ?? "",
    forecastedAt: toDateString(row.forecasted_at),
    isResolved: row.is_resolved,
    wasCorrect: row.was_correct,
    scoreImpact: toNumber(row.score_impact, "score_impact"),
    dataOrigin: toDataOrigin(row.data_origin),
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

export function normalizeProbabilityPoint(row: Row<"market_probability_history">): ProbabilityPoint {
  return {
    id: row.id,
    marketId: row.market_id,
    probability: toPercent(row.probability, "probability"),
    recordedAt: toDateString(row.recorded_at)
  };
}

export function normalizeInsight(row: Row<"insights">): Insight {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category ?? "",
    isFeatured: row.is_featured,
    publishedAt: toDateString(row.published_at),
    dataOrigin: toDataOrigin(row.data_origin),
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "V";
}
