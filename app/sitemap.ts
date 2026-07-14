import type { MetadataRoute } from "next";
import { forecasters, markets } from "@/lib/data/seed";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/overview",
    "/markets",
    "/forecasters",
    "/leaderboard",
    "/about",
    ...markets.map((market) => `/markets/${market.slug}`),
    ...forecasters.map((forecaster) => `/forecasters/${forecaster.slug}`)
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
