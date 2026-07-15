import type { MetadataRoute } from "next";
import { getDataSet } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getDataSet();
  return [
    "",
    "/overview",
    "/markets",
    "/forecasters",
    "/leaderboard",
    "/about",
    ...data.markets.map((market) => `/markets/${market.slug}`),
    ...data.forecasters.map((forecaster) => `/forecasters/${forecaster.slug}`)
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date()
  }));
}
