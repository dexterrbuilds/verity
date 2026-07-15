import { getDataSet, getInsights, platformStats, recentResolvedForecasts } from "@/lib/data/source";
import { getTopForecasters } from "@/lib/data/forecasters";
import { getTrendingMarkets } from "@/lib/data/markets";

export async function getOverviewData() {
  const data = await getDataSet();
  return {
    data,
    stats: platformStats(data),
    topForecasters: await getTopForecasters(4),
    trendingMarkets: await getTrendingMarkets(4),
    recentResolved: recentResolvedForecasts(data, 5),
    insights: (await getInsights()).filter((insight) => insight.isFeatured)
  };
}

export async function getLandingData() {
  const data = await getDataSet();
  return {
    data,
    stats: platformStats(data),
    topForecasters: await getTopForecasters(3),
    trendingMarkets: await getTrendingMarkets(3)
  };
}
