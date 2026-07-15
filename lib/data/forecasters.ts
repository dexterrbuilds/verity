import { enrichForecaster, getDataSet, getMetrics } from "@/lib/data/source";

export type ForecasterFilters = {
  q?: string;
  domain?: string;
  minForecasts?: number;
  accuracy?: string;
  score?: string;
  sort?: string;
  limit?: number;
};

export async function getForecasters(filters: ForecasterFilters = {}) {
  const data = await getDataSet();
  const q = filters.q?.toLowerCase() ?? "";
  const metrics = getMetrics(data);
  let results = data.forecasters.map((forecaster) => enrichForecaster(data, forecaster, metrics)).filter((forecaster) => {
    const metric = forecaster.metrics;
    const matchesSearch = !q || `${forecaster.displayName} ${forecaster.xHandle} ${forecaster.bio} ${forecaster.strongestDomain}`.toLowerCase().includes(q);
    const matchesDomain = !filters.domain || forecaster.strongestDomain.toLowerCase() === filters.domain;
    const matchesMinForecasts = (metric?.totalForecasts ?? 0) >= (filters.minForecasts ?? 0);
    const matchesAccuracy = !filters.accuracy || (filters.accuracy === "70" ? (metric?.accuracy ?? 0) >= 70 : (metric?.accuracy ?? 0) >= 55);
    const matchesScore = !filters.score || (filters.score === "80" ? (metric?.verityScore ?? 0) >= 80 : (metric?.verityScore ?? 0) >= 65);
    return matchesSearch && matchesDomain && matchesMinForecasts && matchesAccuracy && matchesScore;
  });

  results = results.sort((a, b) => {
    if (filters.sort === "accuracy") return (b.metrics?.accuracy ?? 0) - (a.metrics?.accuracy ?? 0);
    if (filters.sort === "forecasts") return (b.metrics?.totalForecasts ?? 0) - (a.metrics?.totalForecasts ?? 0);
    if (filters.sort === "recent") return (b.metrics?.recentPerformance ?? 0) - (a.metrics?.recentPerformance ?? 0);
    if (filters.sort === "consistency") return (b.metrics?.consistency ?? 0) - (a.metrics?.consistency ?? 0);
    return (b.metrics?.verityScore ?? 0) - (a.metrics?.verityScore ?? 0);
  });

  return {
    data,
    forecasters: filters.limit ? results.slice(0, filters.limit) : results
  };
}

export async function getTopForecasters(limit = 5) {
  return (await getForecasters({ sort: "score", limit })).forecasters;
}

export async function getForecasterBySlug(slug: string) {
  const data = await getDataSet();
  const forecaster = data.forecasters.find((item) => item.slug === slug);
  if (!forecaster) return null;
  return { data, forecaster: enrichForecaster(data, forecaster) };
}

export async function getForecasterStaticParams() {
  const data = await getDataSet();
  return data.forecasters.map((forecaster) => ({ slug: forecaster.slug }));
}
