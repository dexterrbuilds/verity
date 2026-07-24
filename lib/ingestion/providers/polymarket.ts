import { fetchJson } from "@/lib/ingestion/providers/http";
import { normalizeOutcome, normalizeStatus, toFiniteNumber, toProbabilityPercent, validateExternalMarket } from "@/lib/ingestion/normalize/market";
import { slugify } from "@/lib/ingestion/normalize/slug";
import type { ExternalCategory, ExternalMarket, ExternalProbabilityPoint, MarketProvider } from "@/lib/ingestion/types";

const GAMMA_BASE = "https://gamma-api.polymarket.com";
const CLOB_BASE = "https://clob.polymarket.com";
const MARKET_LIMIT = 100;

type PolymarketRawMarket = {
  id?: string | number;
  conditionId?: string;
  question?: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  endDate?: string;
  end_date?: string;
  outcomePrices?: string | unknown[];
  outcomes?: string | unknown[];
  liquidity?: string | number;
  liquidityNum?: string | number;
  volume?: string | number;
  volumeNum?: string | number;
  image?: string;
  icon?: string;
  tags?: unknown[];
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  resolutionOutcome?: string;
  outcome?: string;
  winner?: string;
  winningOutcome?: string;
  clobTokenIds?: string | unknown[];
};

type PolymarketTag = {
  id?: string | number;
  label?: string;
  name?: string;
  slug?: string;
};

type PolymarketHistoryResponse = {
  history?: Array<{ t: number; p: number | string }>;
};

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function yesProbability(raw: PolymarketRawMarket) {
  const outcomes = parseJsonArray(raw.outcomes).map((item) => String(item).toLowerCase());
  const prices = parseJsonArray(raw.outcomePrices);
  const yesIndex = Math.max(0, outcomes.findIndex((item) => item === "yes"));
  return toProbabilityPercent(prices[yesIndex] ?? prices[0] ?? 0);
}

function tagNames(raw: PolymarketRawMarket) {
  return (raw.tags ?? [])
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (tag && typeof tag === "object") {
        const item = tag as PolymarketTag;
        return item.label ?? item.name ?? item.slug ?? "";
      }
      return "";
    })
    .filter(Boolean);
}

function category(raw: PolymarketRawMarket): ExternalCategory | undefined {
  const name = firstString(raw.category, tagNames(raw)[0], "Polymarket");
  if (!name) return undefined;
  return {
    id: slugify(name),
    name,
    slug: slugify(name)
  };
}

function sourceUrl(slug: string) {
  return `https://polymarket.com/event/${slug}`;
}

function yesToken(raw: PolymarketRawMarket) {
  const tokens = parseJsonArray(raw.clobTokenIds);
  return firstString(tokens[0]);
}

async function fetchHistory(providerMarketId: string, tokenId: string): Promise<ExternalProbabilityPoint[]> {
  if (!tokenId) return [];
  try {
    const params = new URLSearchParams({ market: tokenId, interval: "1m", fidelity: "1440" });
    const response = await fetchJson<PolymarketHistoryResponse>(`${CLOB_BASE}/prices-history?${params.toString()}`, undefined, 1);
    return (response.history ?? []).map((point) => ({
      provider: "polymarket",
      providerMarketId,
      probability: toProbabilityPercent(point.p),
      recordedAt: new Date(point.t * 1000).toISOString()
    }));
  } catch {
    return [];
  }
}

async function normalizeRawMarket(raw: PolymarketRawMarket, includeHistory = true): Promise<ExternalMarket> {
  const providerMarketId = firstString(raw.id, raw.conditionId);
  if (!providerMarketId) throw new Error("Polymarket market is missing id.");
  const title = firstString(raw.question, raw.title);
  if (!title) throw new Error(`Polymarket market ${providerMarketId} is missing title.`);
  const slug = slugify(firstString(raw.slug, title));
  const resolutionOutcome = normalizeOutcome(firstString(raw.resolutionOutcome, raw.outcome, raw.winner, raw.winningOutcome));
  const status = normalizeStatus({ active: raw.active, closed: raw.closed, archived: raw.archived, resolvedOutcome: resolutionOutcome });
  const history = includeHistory ? await fetchHistory(providerMarketId, yesToken(raw)) : [];
  return validateExternalMarket({
    provider: "polymarket",
    providerMarketId,
    title,
    slug: `polymarket-${slug}`,
    category: category(raw),
    description: firstString(raw.description),
    sourceUrl: sourceUrl(slug),
    imageUrl: firstString(raw.image, raw.icon),
    tags: tagNames(raw),
    endDate: firstString(raw.endDate, raw.end_date) || undefined,
    probability: yesProbability(raw),
    liquidity: toFiniteNumber(raw.liquidityNum ?? raw.liquidity),
    volume: toFiniteNumber(raw.volumeNum ?? raw.volume),
    status,
    resolutionOutcome: status === "resolved" ? resolutionOutcome : null,
    resolutionRules: "Resolves according to the public Polymarket market resolution source.",
    lastSyncedAt: new Date().toISOString(),
    history
  });
}

async function fetchMarketPage(params: Record<string, string>) {
  const url = new URL(`${GAMMA_BASE}/markets`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return fetchJson<PolymarketRawMarket[]>(url.toString());
}

export const polymarketProvider: MarketProvider = {
  id: "polymarket",
  name: "Polymarket",
  supportsHistory: true,
  supportsResolution: true,
  async fetchMarkets() {
    const [active, closed] = await Promise.all([
      fetchMarketPage({ active: "true", closed: "false", limit: String(MARKET_LIMIT), order: "volume", ascending: "false" }),
      fetchMarketPage({ closed: "true", limit: "25", order: "closed_time", ascending: "false" })
    ]);
    const seen = new Set<string>();
    const markets: ExternalMarket[] = [];
    for (const raw of [...active, ...closed]) {
      const key = firstString(raw.id, raw.conditionId);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      markets.push(await normalizeRawMarket(raw));
    }
    return markets;
  },
  async fetchMarket(id: string) {
    const raw = await fetchJson<PolymarketRawMarket>(`${GAMMA_BASE}/markets/${encodeURIComponent(id)}`);
    return normalizeRawMarket(raw);
  },
  async fetchCategories() {
    const tags = await fetchJson<PolymarketTag[]>(`${GAMMA_BASE}/tags?limit=100`);
    return tags.flatMap((tag) => {
      const name = firstString(tag.label, tag.name, tag.slug);
      return name ? [{ id: firstString(tag.id, tag.slug, name), name, slug: slugify(name) }] : [];
    });
  }
};
