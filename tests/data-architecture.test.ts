import assert from "node:assert/strict";
import test from "node:test";
import { getForecasterBySlug, getMarketBySlug, getMarkets, resolveDataMode } from "@/lib/data";
import { normalizeMarket, toPercent } from "@/lib/data/normalize";
import { marketSchema, resolveMarketSchema } from "@/features/admin/validation";
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
    slug: "market",
    question: "Will it happen?",
    description: null,
    source_url: null,
    current_probability: "61.5",
    previous_probability: "57.25",
    volume: "1000.50",
    participant_count: 10,
    resolution_date: "2026-12-31",
    resolution_status: "active",
    resolution_outcome: null,
    resolution_rules: null,
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

test("resolve-market validation rejects invalid resolved outcome", () => {
  const parsed = resolveMarketSchema.safeParse({
    id: "m1",
    resolutionStatus: "resolved",
    resolutionOutcome: ""
  });
  assert.equal(parsed.success, false);
});
