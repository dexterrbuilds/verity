import type { MetadataRoute } from "next";
import { getDataSet } from "@/lib/data";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
