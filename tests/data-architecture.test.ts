import assert from "node:assert/strict";
import test from "node:test";
import { getForecasterBySlug, getMarketBySlug, getMarkets, resolveDataMode } from "@/lib/data";
import { normalizeMarket, toPercent } from "@/lib/data/normalize";
import { forecasterSchema, marketSchema, markForecastSchema, resolveMarketSchema } from "@/features/admin/validation";
import { evaluateHealth } from "@/lib/health";
import { adminMutationRevalidationPaths } from "@/lib/revalidation";
import { derivedForecastOutcome } from "@/lib/scoring";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { dataOriginLabel, formatForecasterIdentity } from "@/lib/utils";
import type { Forecast, Market } from "@/types";
import type { Database } from "@/types/database";

test("demo mode resolves to local data", async () => {
  const { markets } = await getMarkets({ limit: 2 });
  assert.equal(markets.length, 2);
  assert.equal(markets[0].conviction.trackedForecasterCount > 0, true);
});

test("missing market slug returns no record", async () => {
  assert.equal(await getMarketBySlug("not-a-real-market"), null);
});

test("missing forecaster slug returns no record", async () => {
  assert.equal(await getForecasterBySlug("not-a-real-forecaster"), null);
});

test("production with incomplete Supabase variables fails mode resolution", () => {
  const result = resolveDataMode({
    nodeEnv: "production",
    vercelEnv: "production",
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: undefined,
    serviceRoleKey: undefined
  });
  assert.equal(result.error, "Production Supabase configuration is incomplete.");
});

test("production deployment cannot request demo mode", () => {
  const result = resolveDataMode({
    nodeEnv: "production",
    vercelEnv: "production",
    requestedMode: "demo",
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "anon-key-with-enough-length",
    serviceRoleKey: "service-role-with-enough-length"
  });
  assert.equal(result.error, "Production deployments cannot run in demo mode.");
});

test("connected mode requires all Supabase variables", () => {
  const result = resolveDataMode({
    nodeEnv: "development",
    requestedMode: "connected",
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "short",
    serviceRoleKey: "also-short"
  });
  assert.match(result.error ?? "", /ANON_KEY/);
});

test("database normalization handles numeric strings", () => {
  const row: Database["public"]["Tables"]["markets"]["Row"] = {
    id: "m1",
    protocol_id: null,
    category_id: null,
    provider: null,
    provider_market_id: null,
    slug: "market",
    question: "Will it happen?",
    description: null,
    source_url: null,
    image_url: null,
    tags: [],
    current_probability: "61.5",
    previous_probability: "57.25",
    volume: "1000.50",
    participant_count: 10,
    resolution_date: "2026-12-31",
    resolution_status: "active",
    resolution_outcome: null,
    resolution_rules: null,
    data_origin: "manually_curated",
    verification_status: "unverified",
    last_synced_at: null,
    sync_status: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01"
  };
  const market = normalizeMarket(row);
  assert.equal(market.currentProbability, 61.5);
  assert.equal(market.volume, 1000.5);
});

test("invalid probability values are rejected by normalization", () => {
  assert.throws(() => toPercent("101", "bad_probability"), RangeError);
});

test("admin market validation rejects resolved market without outcome", () => {
  const parsed = marketSchema.safeParse({
    question: "Will this resolve?",
    slug: "will-this-resolve",
    description: "A real market description.",
    protocolId: "",
    categoryId: "",
    sourceUrl: "",
    currentProbability: 50,
    previousProbability: 40,
    volume: 1,
    participantCount: 1,
    resolutionDate: "2026-12-31",
    resolutionStatus: "resolved",
    resolutionOutcome: "",
    resolutionRules: "Rules"
  });
  assert.equal(parsed.success, false);
});

test("health endpoint model reports demo mode honestly", async () => {
  const result = await evaluateHealth("demo");
  assert.equal(result.status, "healthy");
  assert.equal(result.database, false);
});

test("health endpoint model degrades on database failure", async () => {
  const result = await evaluateHealth("connected", async () => false);
  assert.equal(result.status, "degraded");
  assert.equal(result.database, false);
});

test("successful mutations revalidate public and admin routes", () => {
  assert.ok(adminMutationRevalidationPaths.includes("/"));
  assert.ok(adminMutationRevalidationPaths.includes("/markets/[slug]"));
  assert.ok(adminMutationRevalidationPaths.includes("/forecasters/[slug]"));
  assert.ok(adminMutationRevalidationPaths.includes("/admin"));
});

test("site URL helper creates canonical absolute URLs", () => {
  assert.equal(siteConfig.xHandle, "@UseVerity");
  assert.equal(absoluteUrl("/markets/example"), "http://localhost:3000/markets/example");
});

test("data origin labels distinguish demo and curated records", () => {
  assert.equal(dataOriginLabel("demo"), "Demo data");
  assert.equal(dataOriginLabel("manually_curated"), "Manually curated");
});

test("resolve-market validation rejects invalid resolved outcome", () => {
  const parsed = resolveMarketSchema.safeParse({
    id: "m1",
    resolutionStatus: "resolved",
    resolutionOutcome: ""
  });
  assert.equal(parsed.success, false);
});

const resolvedMarket: Market = {
  id: "m1",
  protocolId: "",
  categoryId: "",
  slug: "resolved-market",
  question: "Will this resolve yes?",
  description: "Test market",
  sourceUrl: "",
  currentProbability: 100,
  previousProbability: 50,
  volume: 0,
  participantCount: 0,
  resolutionDate: "2026-07-01",
  resolutionStatus: "resolved",
  resolutionOutcome: "yes",
  resolutionRules: "Rules",
  dataOrigin: "manually_curated",
  verificationStatus: "unverified",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
};

const baseForecast: Forecast = {
  id: "f1",
  forecasterId: "forecaster-1",
  marketId: "m1",
  predictedProbability: 70,
  confidence: 60,
  position: "yes",
  reasoning: "Test reasoning",
  forecastedAt: "2026-06-01",
  isResolved: false,
  wasCorrect: null,
  scoreImpact: 0,
  dataOrigin: "manually_curated",
  verificationStatus: "unverified"
};

test("resolved market outcome drives forecast correctness", () => {
  assert.deepEqual(derivedForecastOutcome(baseForecast, resolvedMarket), { isResolved: true, wasCorrect: true });
  assert.deepEqual(derivedForecastOutcome({ ...baseForecast, position: "no" }, resolvedMarket), { isResolved: true, wasCorrect: false });
  assert.deepEqual(derivedForecastOutcome({ ...baseForecast, position: "neutral" }, resolvedMarket), { isResolved: true, wasCorrect: null });
});

test("cancelled or active markets do not mark forecasts resolved", () => {
  assert.deepEqual(derivedForecastOutcome(baseForecast, { ...resolvedMarket, resolutionStatus: "cancelled", resolutionOutcome: null }), {
    isResolved: false,
    wasCorrect: null
  });
});

test("forecaster identity and admin schema allow curated profiles without wallets", () => {
  const parsed = forecasterSchema.safeParse({
    displayName: "Curated Analyst",
    slug: "curated-analyst",
    walletAddress: "",
    xHandle: "@curated",
    bio: "A curated forecaster profile."
  });
  assert.equal(parsed.success, true);
  assert.equal(formatForecasterIdentity({ xHandle: "", walletAddress: "" }), "Curated profile");
});

test("forecast reconciliation action no longer accepts manual correctness", () => {
  assert.equal(markForecastSchema.safeParse({ id: "forecast-1" }).success, true);
});
