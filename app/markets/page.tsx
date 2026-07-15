import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { MarketCard } from "@/features/markets/market-card";
import { getCatalogData, getMarkets } from "@/lib/data";

export const metadata: Metadata = {
  title: "Markets",
  description: "Search and filter Verity's tracked onchain market directory."
};

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item ?? "";
}

export default async function MarketsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const q = value(params, "q").toLowerCase();
  const category = value(params, "category");
  const protocol = value(params, "protocol");
  const status = value(params, "status");
  const timeframe = value(params, "timeframe");
  const sort = value(params, "sort") || "trending";
  const [{ categories, protocols }, { data, markets: results }] = await Promise.all([
    getCatalogData(),
    getMarkets({ q, category, protocol, status, timeframe, sort })
  ]);
  const demo = data.mode === "demo";

  return (
    <section className="container-page py-10">
      <div className="flex flex-col gap-2">
        <Badge tone="accent">Markets</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Onchain market directory</h1>
        <p className="max-w-3xl text-muted-foreground">
          {demo ? "Searchable demo markets with probability movement, volume, resolution status, and tracked forecaster conviction." : "Searchable tracked markets with probability movement, volume, resolution status, and forecaster conviction."}
        </p>
      </div>

      <form className="mt-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1.4fr_repeat(5,1fr)_auto]" aria-label="Market filters">
        <Input name="q" defaultValue={value(params, "q")} placeholder="Search questions, categories, protocols" aria-label="Search markets" />
        <Select name="category" defaultValue={category} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </Select>
        <Select name="protocol" defaultValue={protocol} aria-label="Protocol">
          <option value="">All protocols</option>
          {protocols.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </Select>
        <Select name="status" defaultValue={status} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select name="timeframe" defaultValue={timeframe} aria-label="Resolution timeframe">
          <option value="">Any date</option>
          <option value="30">Next 30 days</option>
          <option value="90">Next 90 days</option>
          <option value="later">Later</option>
        </Select>
        <Select name="sort" defaultValue={sort} aria-label="Sort">
          <option value="trending">Trending</option>
          <option value="volume">Highest volume</option>
          <option value="forecasters">Most forecasters</option>
          <option value="change">Largest change</option>
          <option value="resolution">Resolution date</option>
        </Select>
        <Button type="submit" variant="secondary"><SlidersHorizontal className="h-4 w-4" />Filter</Button>
      </form>

      <div className="mt-6 text-sm text-muted-foreground">{results.length} markets found</div>
      {results.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {results.map((market) => <MarketCard key={market.id} market={market} />)}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No markets match these filters" body="Try removing a category, protocol, status, or search term." />
        </div>
      )}
    </section>
  );
}
