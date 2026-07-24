import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { categories, forecasts, forecasters, insights, markets, probabilityHistory, protocols } from "@/lib/data/seed";
import { getDataMode, getModeError } from "@/lib/data/mode";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";

const seedTables = ["categories", "protocols", "forecasters", "markets", "forecasts", "market_probability_history", "insights"] as const;

function requireEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) throw new Error(`${name} is required to seed Supabase.`);
  return value;
}

function stableUuid(namespace: string, value: string) {
  const hex = createHash("sha1").update(`verity:${namespace}:${value}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0")}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
}

function id(namespace: string, value: string) {
  return stableUuid(namespace, value);
}

function failOnError(context: string, error: { message: string } | null) {
  if (!error) return;
  logger.error("seed_failed", { context, message: error.message });
  throw new Error(`Failed to seed ${context}: ${error.message}`);
}

function ensureConnectedMode() {
  const issue = getModeError();
  if (issue) throw new Error(`Supabase seed configuration is invalid: ${issue}`);
  if (getDataMode() !== "connected") {
    throw new Error("Supabase seed requires connected mode. Set NEXT_PUBLIC_DATA_MODE=connected and configure Supabase keys.");
  }
}

const supabase = createClient<Database>(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false }
});

async function verifySchema() {
  const checks = [
    supabase.from("categories").select("id,slug,data_origin,verification_status,updated_at", { head: true }).limit(1),
    supabase.from("protocols").select("id,slug,data_origin,verification_status", { head: true }).limit(1),
    supabase.from("forecasters").select("id,slug,data_origin,verification_status,profile_status", { head: true }).limit(1),
    supabase.from("markets").select("id,slug,provider,provider_market_id,data_origin,verification_status,source_url,image_url,tags,last_synced_at,sync_status", { head: true }).limit(1),
    supabase.from("forecasts").select("id,forecaster_id,market_id,data_origin,verification_status", { head: true }).limit(1),
    supabase.from("market_probability_history").select("id,market_id,probability,recorded_at", { head: true }).limit(1),
    supabase.from("insights").select("id,data_origin,verification_status", { head: true }).limit(1)
  ];
  const results = await Promise.all(checks);
  results.forEach((result, index) => failOnError(`schema check for ${seedTables[index]}`, result.error));
}

async function countExisting(table: (typeof seedTables)[number], ids: string[]) {
  if (!ids.length) return 0;
  const { data, error } = await supabase.from(table).select("id").in("id", ids);
  failOnError(`${table} existing count`, error);
  return data?.length ?? 0;
}

async function totalCount(table: (typeof seedTables)[number]) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  failOnError(`${table} total count`, error);
  return count ?? 0;
}

async function report(table: (typeof seedTables)[number], ids: string[], before: number) {
  const total = await totalCount(table);
  return {
    table,
    inserted: ids.length - before,
    updated: before,
    skipped: 0,
    total
  };
}

ensureConnectedMode();
await verifySchema();

const categoryRows: Database["public"]["Tables"]["categories"]["Insert"][] = categories.map((category) => ({
  id: id("category", category.id),
  name: category.name,
  slug: category.slug,
  description: category.description,
  data_origin: "demo",
  verification_status: "unverified"
}));

const protocolRows: Database["public"]["Tables"]["protocols"]["Insert"][] = protocols.map((protocol) => ({
  id: id("protocol", protocol.id),
  name: protocol.name,
  slug: protocol.slug,
  logo_url: protocol.logoUrl,
  website_url: protocol.websiteUrl,
  description: protocol.description,
  data_origin: "demo",
  verification_status: "unverified"
}));

const forecasterRows: Database["public"]["Tables"]["forecasters"]["Insert"][] = forecasters.map((forecaster) => ({
  id: id("forecaster", forecaster.id),
  slug: forecaster.slug,
  display_name: forecaster.displayName,
  wallet_address: forecaster.walletAddress,
  x_handle: forecaster.xHandle,
  avatar_url: forecaster.avatarUrl,
  bio: forecaster.bio,
  joined_at: forecaster.joinedAt,
  is_verified: forecaster.isVerified,
  data_origin: "demo",
  verification_status: "unverified",
  profile_status: "unclaimed"
}));

const marketRows: Database["public"]["Tables"]["markets"]["Insert"][] = markets.map((market) => ({
  id: id("market", market.id),
  protocol_id: id("protocol", market.protocolId),
  category_id: id("category", market.categoryId),
  slug: market.slug,
  question: market.question,
  description: market.description,
  source_url: market.sourceUrl,
  current_probability: market.currentProbability,
  previous_probability: market.previousProbability,
  volume: market.volume,
  participant_count: market.participantCount,
  resolution_date: market.resolutionDate,
  resolution_status: market.resolutionStatus,
  resolution_outcome: market.resolutionOutcome,
  resolution_rules: market.resolutionRules,
  data_origin: "demo",
  verification_status: "unverified",
  created_at: market.createdAt,
  updated_at: market.updatedAt
}));

const activeMarketRows = marketRows.map((market) => ({
  ...market,
  resolution_status: "active" as const,
  resolution_outcome: null
}));

const forecastRows: Database["public"]["Tables"]["forecasts"]["Insert"][] = forecasts.map((forecast) => ({
  id: id("forecast", forecast.id),
  forecaster_id: id("forecaster", forecast.forecasterId),
  market_id: id("market", forecast.marketId),
  predicted_probability: forecast.predictedProbability,
  confidence: forecast.confidence,
  position: forecast.position,
  reasoning: forecast.reasoning,
  forecasted_at: forecast.forecastedAt,
  is_resolved: forecast.isResolved,
  was_correct: forecast.wasCorrect,
  score_impact: forecast.scoreImpact,
  data_origin: "demo",
  verification_status: "unverified"
}));

const historyRows: Database["public"]["Tables"]["market_probability_history"]["Insert"][] = probabilityHistory.map((point) => ({
  id: id("history", point.id),
  market_id: id("market", point.marketId),
  probability: point.probability,
  recorded_at: point.recordedAt
}));

const insightRows: Database["public"]["Tables"]["insights"]["Insert"][] = insights.map((insight) => ({
  id: id("insight", insight.id),
  title: insight.title,
  body: insight.body,
  category: insight.category,
  is_featured: insight.isFeatured,
  data_origin: "demo",
  verification_status: "unverified",
  published_at: insight.publishedAt
}));

const before = {
  categories: await countExisting("categories", categoryRows.map((row) => row.id!)),
  protocols: await countExisting("protocols", protocolRows.map((row) => row.id!)),
  forecasters: await countExisting("forecasters", forecasterRows.map((row) => row.id!)),
  markets: await countExisting("markets", marketRows.map((row) => row.id!)),
  forecasts: await countExisting("forecasts", forecastRows.map((row) => row.id!)),
  market_probability_history: await countExisting("market_probability_history", historyRows.map((row) => row.id!)),
  insights: await countExisting("insights", insightRows.map((row) => row.id!))
};

failOnError("categories", (await supabase.from("categories").upsert(categoryRows, { onConflict: "id" })).error);
failOnError("protocols", (await supabase.from("protocols").upsert(protocolRows, { onConflict: "id" })).error);
failOnError("forecasters", (await supabase.from("forecasters").upsert(forecasterRows, { onConflict: "id" })).error);
failOnError("markets active preseed", (await supabase.from("markets").upsert(activeMarketRows, { onConflict: "id" })).error);
failOnError("forecasts", (await supabase.from("forecasts").upsert(forecastRows, { onConflict: "id" })).error);
failOnError("market_probability_history", (await supabase.from("market_probability_history").upsert(historyRows, { onConflict: "id" })).error);
failOnError("markets final status", (await supabase.from("markets").upsert(marketRows, { onConflict: "id" })).error);
failOnError("insights", (await supabase.from("insights").upsert(insightRows, { onConflict: "id" })).error);

const reports = await Promise.all([
  report("categories", categoryRows.map((row) => row.id!), before.categories),
  report("protocols", protocolRows.map((row) => row.id!), before.protocols),
  report("forecasters", forecasterRows.map((row) => row.id!), before.forecasters),
  report("markets", marketRows.map((row) => row.id!), before.markets),
  report("forecasts", forecastRows.map((row) => row.id!), before.forecasts),
  report("market_probability_history", historyRows.map((row) => row.id!), before.market_probability_history),
  report("insights", insightRows.map((row) => row.id!), before.insights)
]);

console.table(reports);
