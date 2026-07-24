import { getDataSet, getHistoryForMarket, enrichMarket, forecastsForMarket, getMetrics, marketById } from "@/lib/data/source";
import { requirePublicClient } from "@/lib/data/cache";
import { isConnectedMode } from "@/lib/data/mode";
import { normalizeMarket } from "@/lib/data/normalize";

export type MarketFilters = {
  q?: string;
  category?: string;
  protocol?: string;
  status?: string;
  timeframe?: string;
  sort?: string;
  limit?: number;
};

const REFERENCE_TIME = new Date("2026-07-14T00:00:00-07:00").getTime();
const MARKET_SELECT = "id,protocol_id,category_id,provider,provider_market_id,slug,question,description,source_url,image_url,tags,current_probability,previous_probability,volume,participant_count,resolution_date,resolution_status,resolution_outcome,resolution_rules,data_origin,verification_status,last_synced_at,sync_status,created_at,updated_at";

export async function getMarkets(filters: MarketFilters = {}) {
  if (isConnectedMode()) return getConnectedMarkets(filters);
  const data = await getDataSet();
  const q = filters.q?.toLowerCase() ?? "";
  const metrics = getMetrics(data);
  let results = data.markets.map((market) => enrichMarket(data, market, metrics)).filter((market) => {
    const matchesSearch = !q || `${market.question} ${market.description} ${market.category?.name} ${market.protocol?.name}`.toLowerCase().includes(q);
    const matchesCategory = !filters.category || market.category?.slug === filters.category;
    const matchesProtocol = !filters.protocol || market.protocol?.slug === filters.protocol;
    const matchesStatus = !filters.status || market.resolutionStatus === filters.status;
    const days = (new Date(market.resolutionDate).getTime() - REFERENCE_TIME) / (1000 * 60 * 60 * 24);
    const matchesTimeframe = !filters.timeframe || (filters.timeframe === "30" ? days <= 30 : filters.timeframe === "90" ? days <= 90 : days > 90);
    return matchesSearch && matchesCategory && matchesProtocol && matchesStatus && matchesTimeframe;
  });

  results = results.sort((a, b) => {
    if (filters.sort === "volume") return b.volume - a.volume;
    if (filters.sort === "forecasters") return b.conviction.trackedForecasterCount - a.conviction.trackedForecasterCount;
    if (filters.sort === "change") return Math.abs(b.currentProbability - b.previousProbability) - Math.abs(a.currentProbability - a.previousProbability);
    if (filters.sort === "resolution") return new Date(a.resolutionDate).getTime() - new Date(b.resolutionDate).getTime();
    return Math.abs(b.currentProbability - b.previousProbability) + b.volume / 1000000 - (Math.abs(a.currentProbability - a.previousProbability) + a.volume / 1000000);
  });

  return {
    data,
    markets: filters.limit ? results.slice(0, filters.limit) : results
  };
}

async function getConnectedMarkets(filters: MarketFilters = {}) {
  const data = await getDataSet();
  const supabase = requirePublicClient();
  if (!supabase) return { data, markets: [] };
  let query = supabase.from("markets").select(MARKET_SELECT);
  const q = filters.q?.trim().replace(/[,]/g, " ") ?? "";
  if (q) {
    query = query.or(`question.ilike.%${q}%,description.ilike.%${q}%,provider.ilike.%${q}%`);
  }
  if (filters.category) {
    const category = data.categories.find((item) => item.slug === filters.category);
    query = category ? query.eq("category_id", category.id) : query.eq("category_id", "__missing__");
  }
  if (filters.protocol) {
    const protocol = data.protocols.find((item) => item.slug === filters.protocol);
    query = protocol ? query.eq("protocol_id", protocol.id) : query.eq("protocol_id", "__missing__");
  }
  if (filters.status === "active" || filters.status === "resolved" || filters.status === "cancelled") {
    query = query.eq("resolution_status", filters.status);
  }
  if (filters.timeframe) {
    const now = new Date(REFERENCE_TIME);
    const max = new Date(now);
    if (filters.timeframe === "30") {
      max.setDate(max.getDate() + 30);
      query = query.lte("resolution_date", max.toISOString());
    } else if (filters.timeframe === "90") {
      max.setDate(max.getDate() + 90);
      query = query.lte("resolution_date", max.toISOString());
    } else {
      max.setDate(max.getDate() + 90);
      query = query.gt("resolution_date", max.toISOString());
    }
  }
  if (filters.sort === "volume") query = query.order("volume", { ascending: false });
  else if (filters.sort === "resolution") query = query.order("resolution_date", { ascending: true });
  else if (filters.sort === "change") query = query.order("updated_at", { ascending: false });
  else query = query.order("volume", { ascending: false });
  query = query.limit(filters.limit ?? 100);
  const { data: rows, error } = await query;
  if (error) throw new Error(`Failed to load connected markets: ${error.message}`);
  const metrics = getMetrics(data);
  return {
    data,
    markets: (rows ?? []).map(normalizeMarket).map((market) => enrichMarket(data, market, metrics))
  };
}

export async function getTrendingMarkets(limit = 6) {
  return (await getMarkets({ status: "active", sort: "trending", limit })).markets;
}

export async function getMarketBySlug(slug: string) {
  const data = await getDataSet();
  const market = data.markets.find((item) => item.slug === slug);
  if (!market) return null;
  const enriched = enrichMarket(data, market);
  return {
    data,
    market: enriched,
    forecasts: forecastsForMarket(data, market.id),
    history: await getHistoryForMarket(market.id),
    related: (await getMarkets({ status: "active", sort: "trending", limit: 4 })).markets.filter((item) => item.id !== market.id).slice(0, 3)
  };
}

export async function getMarketStaticParams() {
  const data = await getDataSet();
  return data.markets.map((market) => ({ slug: market.slug }));
}

export async function getMarketById(id: string) {
  const data = await getDataSet();
  return marketById(data, id) ?? null;
}
