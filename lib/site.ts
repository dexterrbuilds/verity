import type { Metadata } from "next";
import { env } from "@/lib/env";

export const siteConfig = {
  name: "Verity",
  title: "Verity | Crypto Forecaster Reputation",
  description: "Early MVP for tracking market forecasts, initial reputation scores, and forecaster conviction.",
  ogDescription: "An early market intelligence and forecaster reputation MVP for onchain markets.",
  xHandle: "@UseVerity",
  navigation: [
    { href: "/overview", label: "Overview" },
    { href: "/markets", label: "Markets" },
    { href: "/forecasters", label: "Forecasters" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" }
  ]
} as const;

export function getSiteUrl() {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function defaultMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`
    },
    description: siteConfig.description,
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.ogDescription,
      type: "website",
      url: getSiteUrl()
    },
    twitter: {
      card: "summary",
      site: siteConfig.xHandle,
      creator: siteConfig.xHandle,
      title: siteConfig.name,
      description: siteConfig.ogDescription
    }
  };
}
