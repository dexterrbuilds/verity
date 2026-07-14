import assert from "node:assert/strict";
import test from "node:test";
import {
  buildForecasterMetrics,
  calculateAccuracy,
  calculateCalibration,
  calculateMarketConviction,
  calculateVerityScore
} from "@/lib/scoring";
import type { Forecast, ForecasterMetrics, Market } from "@/types";

const baseMarket: Market = {
  id: "m-yes",
  protocolId: "proto",
  categoryId: "cat-sol",
  slug: "yes-market",
  question: "Will the event happen?",
  description: "Test market",
  sourceUrl: "https://example.com",
  currentProbability: 100,
  previousProbability: 50,
  volume: 1,
  participantCount: 1,
  resolutionDate: "2026-06-30",
  resolutionStatus: "resolved",
  resolutionOutcome: "yes",
  resolutionRules: "Resolves yes or no.",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
};

const noMarket: Market = {
  ...baseMarket,
  id: "m-no",
  slug: "no-market",
  currentProbability: 0,
  resolutionOutcome: "no"
};

const activeMarket: Market = {
  ...baseMarket,
  id: "m-active",
  slug: "active-market",
  currentProbability: 55,
  resolutionStatus: "active",
  resolutionOutcome: null,
  resolutionDate: "2026-12-31"
};

const cancelledMarket: Market = {
  ...baseMarket,
  id: "m-cancelled",
  slug: "cancelled-market",
  resolutionStatus: "cancelled",
  resolutionOutcome: null
};

function forecast(overrides: Partial<Forecast> = {}): Forecast {
  const predictedProbability = overrides.predictedProbability ?? 75;
  return {
    id: `f-${Math.random()}`,
    forecasterId: "forecaster-1",
    marketId: baseMarket.id,
    predictedProbability,
    confidence: 70,
    position: predictedProbability > 55 ? "yes" : predictedProbability < 45 ? "no" : "neutral",
    reasoning: "Test reasoning",
    forecastedAt: "2026-05-01",
    isResolved: true,
    wasCorrect: null,
    scoreImpact: 0,
    ...overrides
  };
}

test("no resolved forecasts return zero core scores", () => {
  const forecasts = [forecast({ marketId: activeMarket.id, isResolved: false })];
  assert.equal(calculateAccuracy(forecasts, [activeMarket]), 0);
  assert.equal(calculateCalibration(forecasts, [activeMarket]), 0);
});

test("one correct forecast is directionally accurate but sample-adjusted", () => {
  const forecasts = [forecast({ predictedProbability: 70, position: "yes" })];
  assert.equal(calculateAccuracy(forecasts, [baseMarket]), 100);
  assert.ok(calculateVerityScore(forecasts, [baseMarket]) < 60);
});

test("one incorrect high-confidence probability is penalized by calibration", () => {
  const forecasts = [forecast({ predictedProbability: 95, position: "yes", marketId: noMarket.id })];
  assert.equal(calculateAccuracy(forecasts, [noMarket]), 0);
  assert.ok(calculateCalibration(forecasts, [noMarket]) < 10);
});

test("perfectly calibrated deterministic predictions score 100 calibration", () => {
  const forecasts = [
    forecast({ predictedProbability: 100, position: "yes", marketId: baseMarket.id }),
    forecast({ predictedProbability: 0, position: "no", marketId: noMarket.id })
  ];
  assert.equal(calculateCalibration(forecasts, [baseMarket, noMarket]), 100);
});

test("poorly calibrated predictions score lower", () => {
  const forecasts = [
    forecast({ predictedProbability: 0, position: "no", marketId: baseMarket.id }),
    forecast({ predictedProbability: 100, position: "yes", marketId: noMarket.id })
  ];
  assert.equal(calculateCalibration(forecasts, [baseMarket, noMarket]), 0);
});

test("equal accuracy can have different calibration", () => {
  const cautious = [forecast({ predictedProbability: 51, position: "yes" })];
  const decisive = [forecast({ predictedProbability: 95, position: "yes" })];
  assert.equal(calculateAccuracy(cautious, [baseMarket]), calculateAccuracy(decisive, [baseMarket]));
  assert.ok(calculateCalibration(decisive, [baseMarket]) > calculateCalibration(cautious, [baseMarket]));
});

test("minimum-sample adjustment rewards larger histories", () => {
  const one = [forecast({ predictedProbability: 80, position: "yes" })];
  const many = Array.from({ length: 12 }, (_, index) => forecast({ id: `f-many-${index}`, predictedProbability: 80, position: "yes" }));
  assert.ok(calculateVerityScore(many, [baseMarket]) > calculateVerityScore(one, [baseMarket]));
});

test("cancelled markets are excluded from scoring", () => {
  const forecasts = [forecast({ marketId: cancelledMarket.id, predictedProbability: 99, position: "yes" })];
  assert.equal(calculateAccuracy(forecasts, [cancelledMarket]), 0);
  assert.equal(calculateCalibration(forecasts, [cancelledMarket]), 0);
});

test("neutral predictions do not count toward directional accuracy", () => {
  const forecasts = [
    forecast({ predictedProbability: 50, position: "neutral" }),
    forecast({ predictedProbability: 80, position: "yes" })
  ];
  assert.equal(calculateAccuracy(forecasts, [baseMarket]), 100);
  assert.ok(calculateCalibration(forecasts, [baseMarket]) < 100);
});

test("category-specific scoring is computed independently", () => {
  const markets = [baseMarket, { ...noMarket, categoryId: "cat-ai" }];
  const metrics = buildForecasterMetrics([
    forecast({ forecasterId: "f1", marketId: baseMarket.id, predictedProbability: 80, position: "yes" }),
    forecast({ forecasterId: "f1", marketId: noMarket.id, predictedProbability: 80, position: "yes" })
  ], markets);
  assert.equal(metrics[0].categoryAccuracy.Solana, 100);
  assert.equal(metrics[0].categoryAccuracy.AI, 0);
});

test("reputation-weighted conviction calculates a bounded aggregate", () => {
  const forecasts = [
    forecast({ forecasterId: "f1", marketId: activeMarket.id, predictedProbability: 80 }),
    forecast({ forecasterId: "f2", marketId: activeMarket.id, predictedProbability: 40 })
  ];
  const metrics: ForecasterMetrics[] = [
    { forecasterId: "f1", verityScore: 80, accuracy: 80, calibration: 80, consistency: 80, experience: 80, recentPerformance: 80, totalForecasts: 20, resolvedForecasts: 20, currentStreak: 2, rank: 1, categoryAccuracy: { Solana: 80 }, trend: [] },
    { forecasterId: "f2", verityScore: 50, accuracy: 50, calibration: 50, consistency: 50, experience: 50, recentPerformance: 50, totalForecasts: 20, resolvedForecasts: 20, currentStreak: 0, rank: 2, categoryAccuracy: { Solana: 50 }, trend: [] }
  ];
  const conviction = calculateMarketConviction(activeMarket, forecasts, metrics);
  assert.ok(conviction.reputationWeightedForecast > 40);
  assert.ok(conviction.reputationWeightedForecast < 80);
});

test("individual influence caps prevent one forecaster from dominating", () => {
  const forecasts = [
    forecast({ forecasterId: "dominant", marketId: activeMarket.id, predictedProbability: 100 }),
    forecast({ forecasterId: "low-1", marketId: activeMarket.id, predictedProbability: 0 }),
    forecast({ forecasterId: "low-2", marketId: activeMarket.id, predictedProbability: 0 })
  ];
  const metrics: ForecasterMetrics[] = [
    { forecasterId: "dominant", verityScore: 100, accuracy: 100, calibration: 100, consistency: 100, experience: 100, recentPerformance: 100, totalForecasts: 100, resolvedForecasts: 100, currentStreak: 20, rank: 1, categoryAccuracy: { Solana: 100 }, trend: [] },
    { forecasterId: "low-1", verityScore: 1, accuracy: 1, calibration: 1, consistency: 1, experience: 1, recentPerformance: 1, totalForecasts: 1, resolvedForecasts: 1, currentStreak: 0, rank: 2, categoryAccuracy: { Solana: 1 }, trend: [] },
    { forecasterId: "low-2", verityScore: 1, accuracy: 1, calibration: 1, consistency: 1, experience: 1, recentPerformance: 1, totalForecasts: 1, resolvedForecasts: 1, currentStreak: 0, rank: 3, categoryAccuracy: { Solana: 1 }, trend: [] }
  ];
  assert.ok(calculateMarketConviction(activeMarket, forecasts, metrics).reputationWeightedForecast < 80);
});

test("invalid probability values throw", () => {
  assert.throws(() => calculateAccuracy([forecast({ predictedProbability: 101 })], [baseMarket]), RangeError);
  assert.throws(() => calculateMarketConviction(activeMarket, [forecast({ marketId: activeMarket.id, confidence: -1 })], []), RangeError);
});

test("forecast made after resolution throws", () => {
  assert.throws(() => calculateAccuracy([forecast({ forecastedAt: "2026-07-01" })], [baseMarket]), RangeError);
});

test("large forecast histories remain finite", () => {
  const forecasts = Array.from({ length: 500 }, (_, index) =>
    forecast({ id: `large-${index}`, predictedProbability: index % 2 ? 80 : 20, position: index % 2 ? "yes" : "no" })
  );
  const score = calculateVerityScore(forecasts, [baseMarket]);
  assert.ok(Number.isFinite(score));
  assert.ok(score >= 0 && score <= 100);
});
