import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getDataMode, getModeError } from "@/lib/data/mode";
import { env } from "@/lib/env";
import { slugify } from "@/lib/ingestion/normalize/slug";
import { marketProviders } from "@/lib/ingestion/providers";
import { addCounts, countUpsertIntent, emptyCounts } from "@/lib/ingestion/sync/counts";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";
import type { ExternalMarket, MarketProvider, ProviderSyncResult, SyncCounts, SyncResult } from "@/lib/ingestion/types";

type ServiceClient = SupabaseClient<Database>;

function requireServiceClient() {
  const issue = getModeError();
  if (issue) throw new Error(`Market sync configuration error: ${issue}`);
  if (getDataMode() !== "connected") throw new Error("Market sync requires connected mode.");
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  });
}

async function upsertProtocol(supabase: ServiceClient, provider: MarketProvider) {
  const { data, error } = await supabase
    .from("protocols")
    .upsert({
      name: provider.name,
      slug: provider.id,
      website_url: provider.id === "polymarket" ? "https://polymarket.com" : null,
      description: `${provider.name} public market data source.`,
      data_origin: "integrated",
      verification_status: "source_checked"
    }, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to upsert provider protocol ${provider.id}: ${error.message}`);
  return data.id;
}

async function upsertCategories(supabase: ServiceClient, markets: ExternalMarket[]) {
  const categories = new Map<string, { name: string; slug: string }>();
  for (const market of markets) {
    const name = market.category?.name || "Prediction Markets";
    const slug = market.category?.slug || slugify(name);
    categories.set(slug, { name, slug });
  }
  const rows = [...categories.values()].map((category) => ({
    name: category.name,
    slug: category.slug,
    description: `Markets categorized as ${category.name}.`,
    data_origin: "integrated" as const,
    verification_status: "source_checked" as const
  }));
  if (!rows.length) return new Map<string, string>();
  const { data, error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" }).select("id,slug");
  if (error) throw new Error(`Failed to upsert categories: ${error.message}`);
  return new Map((data ?? []).map((row) => [row.slug, row.id]));
}

async function existingMarketKeys(supabase: ServiceClient, provider: string, providerMarketIds: string[]) {
  if (!providerMarketIds.length) return new Set<string>();
  const { data, error } = await supabase
    .from("markets")
    .select("provider_market_id")
    .eq("provider", provider)
    .in("provider_market_id", providerMarketIds);
  if (error) throw new Error(`Failed to check existing markets for ${provider}: ${error.message}`);
  return new Set((data ?? []).flatMap((row) => row.provider_market_id ? [row.provider_market_id] : []));
}

function marketRow(market: ExternalMarket, protocolId: string, categoryId: string | undefined): Database["public"]["Tables"]["markets"]["Insert"] {
  return {
    protocol_id: protocolId,
    category_id: categoryId ?? null,
    provider: market.provider,
    provider_market_id: market.providerMarketId,
    slug: market.slug,
    question: market.title,
    description: market.description ?? "",
    source_url: market.sourceUrl ?? null,
    image_url: market.imageUrl ?? null,
    tags: market.tags,
    current_probability: market.probability,
    previous_probability: market.probability,
    volume: market.volume ?? 0,
    participant_count: 0,
    resolution_date: market.endDate ?? null,
    resolution_status: market.status,
    resolution_outcome: market.status === "resolved" && (market.resolutionOutcome === "yes" || market.resolutionOutcome === "no") ? market.resolutionOutcome : null,
    resolution_rules: market.resolutionRules ?? null,
    data_origin: "integrated",
    verification_status: "source_checked",
    last_synced_at: market.lastSyncedAt,
    sync_status: "synced"
  };
}

async function upsertHistory(supabase: ServiceClient, markets: ExternalMarket[]) {
  const withHistory = markets.filter((market) => market.history?.length);
  if (!withHistory.length) return emptyCounts();
  const { data: marketRows, error: marketError } = await supabase
    .from("markets")
    .select("id,provider,provider_market_id")
    .in("provider_market_id", withHistory.map((market) => market.providerMarketId));
  if (marketError) throw new Error(`Failed to resolve synced market ids for history: ${marketError.message}`);
  const idByProviderKey = new Map((marketRows ?? []).map((row) => [`${row.provider}:${row.provider_market_id}`, row.id]));
  const rows = withHistory.flatMap((market) => {
    const marketId = idByProviderKey.get(`${market.provider}:${market.providerMarketId}`);
    if (!marketId) return [];
    return (market.history ?? []).map((point) => ({
      market_id: marketId,
      probability: point.probability,
      recorded_at: point.recordedAt
    }));
  });
  if (!rows.length) return emptyCounts();
  const { error } = await supabase
    .from("market_probability_history")
    .upsert(rows, { onConflict: "market_id,recorded_at", ignoreDuplicates: false });
  if (error) throw new Error(`Failed to upsert market history: ${error.message}`);
  return { inserted: rows.length, updated: 0, skipped: 0, failed: 0 };
}

async function syncProvider(provider: MarketProvider, fetcher: () => Promise<ExternalMarket[]>): Promise<ProviderSyncResult> {
  const errors: string[] = [];
  try {
    const supabase = requireServiceClient();
    const markets = await fetcher();
    const validMarkets = markets.filter((market) => {
      const valid = market.provider === provider.id && Boolean(market.providerMarketId && market.title);
      if (!valid) errors.push(`Skipped malformed market from ${provider.id}.`);
      return valid;
    });
    const protocolId = await upsertProtocol(supabase, provider);
    const categoryIds = await upsertCategories(supabase, validMarkets);
    const existing = await existingMarketKeys(supabase, provider.id, validMarkets.map((market) => market.providerMarketId));
    const counts = countUpsertIntent(existing, validMarkets.map((market) => market.providerMarketId));
    const rows = validMarkets.map((market) => marketRow(market, protocolId, categoryIds.get(market.category?.slug ?? slugify(market.category?.name ?? "Prediction Markets"))));
    if (rows.length) {
      const { error } = await supabase.from("markets").upsert(rows, { onConflict: "provider,provider_market_id" });
      if (error) throw new Error(`Failed to upsert ${provider.id} markets: ${error.message}`);
    }
    const historyCounts = await upsertHistory(supabase, validMarkets);
    return {
      provider: provider.id,
      ...addCounts(counts, { ...historyCounts, inserted: 0 }),
      errors
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown provider sync failure";
    logger.error("market_provider_sync_failed", { provider: provider.id, message });
    return { provider: provider.id, inserted: 0, updated: 0, skipped: 0, failed: 1, errors: [message] };
  }
}

export async function syncMarkets(providers: readonly MarketProvider[] = marketProviders): Promise<SyncResult> {
  const results = await Promise.all(providers.map((provider) => syncProvider(provider, () => provider.fetchMarkets())));
  const total = results.reduce<SyncCounts>((acc, result) => addCounts(acc, result), emptyCounts());
  return { ...total, providers: results };
}

export async function syncMarket(id: string, provider: MarketProvider = marketProviders[0]): Promise<SyncResult> {
  const result = await syncProvider(provider, async () => [await provider.fetchMarket(id)]);
  return { inserted: result.inserted, updated: result.updated, skipped: result.skipped, failed: result.failed, providers: [result] };
}
