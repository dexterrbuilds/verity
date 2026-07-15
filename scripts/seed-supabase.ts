import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { categories, forecasts, forecasters, insights, markets, probabilityHistory, protocols } from "@/lib/data/seed";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

function requireEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) throw new Error(`${name} is required to seed Supabase.`);
  return value;
}

function stableUuid(namespace: string, id: string) {
  const hex = createHash("sha1").update(`verity:${namespace}:${id}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0")}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
}

function id(namespace: string, value: string) {
  return stableUuid(namespace, value);
}

const supabase = createClient<Database>(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false }
});

function failOnError(table: string, error: { message: string } | null) {
  if (error) throw new Error(`Failed to seed ${table}: ${error.message}`);
}

const categoryRows = categories.map((category) => ({
  id: id("category", category.id),
  name: category.name,
  slug: category.slug,
  description: category.description
}));

const protocolRows = protocols.map((protocol) => ({
  id: id("protocol", protocol.id),
  name: protocol.name,
  slug: protocol.slug,
  logo_url: protocol.logoUrl,
  website_url: protocol.websiteUrl,
  description: protocol.description
}));

const forecasterRows = forecasters.map((forecaster) => ({
  id: id("forecaster", forecaster.id),
  slug: forecaster.slug,
  display_name: forecaster.displayName,
  wallet_address: forecaster.walletAddress,
  x_handle: forecaster.xHandle,
  avatar_url: forecaster.avatarUrl,
  bio: forecaster.bio,
  joined_at: forecaster.joinedAt,
  is_verified: forecaster.isVerified
}));

const marketRows = markets.map((market) => ({
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
  created_at: market.createdAt,
  updated_at: market.updatedAt
}));

const activeMarketRows = marketRows.map((market) => ({
  ...market,
  resolution_status: "active" as const,
  resolution_outcome: null
}));

const forecastRows = forecasts.map((forecast) => ({
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
  score_impact: forecast.scoreImpact
}));

const historyRows = probabilityHistory.map((point) => ({
  id: id("history", point.id),
  market_id: id("market", point.marketId),
  probability: point.probability,
  recorded_at: point.recordedAt
}));

const insightRows = insights.map((insight) => ({
  id: id("insight", insight.id),
  title: insight.title,
  body: insight.body,
  category: insight.category,
  is_featured: insight.isFeatured,
  published_at: insight.publishedAt
}));

failOnError("categories", (await supabase.from("categories").upsert(categoryRows, { onConflict: "id" })).error);
failOnError("protocols", (await supabase.from("protocols").upsert(protocolRows, { onConflict: "id" })).error);
failOnError("forecasters", (await supabase.from("forecasters").upsert(forecasterRows, { onConflict: "id" })).error);
failOnError("markets", (await supabase.from("markets").upsert(activeMarketRows, { onConflict: "id" })).error);
failOnError("forecasts", (await supabase.from("forecasts").upsert(forecastRows, { onConflict: "id" })).error);
failOnError("market_probability_history", (await supabase.from("market_probability_history").upsert(historyRows, { onConflict: "id" })).error);
failOnError("markets", (await supabase.from("markets").upsert(marketRows, { onConflict: "id" })).error);
failOnError("insights", (await supabase.from("insights").upsert(insightRows, { onConflict: "id" })).error);

const countTables = ["categories", "protocols", "forecasters", "markets", "forecasts", "market_probability_history", "insights"] as const;
const counts: Record<string, number> = {};
for (const table of countTables) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
  counts[table] = count ?? 0;
}

console.table(counts);
