import { getDataSet, getHistoryForMarket, enrichMarket, forecastsForMarket, getMetrics, marketById } from "@/lib/data/source";

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

export async function getMarkets(filters: MarketFilters = {}) {
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
