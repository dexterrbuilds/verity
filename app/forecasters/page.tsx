import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ForecasterCard } from "@/features/forecasters/forecaster-card";
import { getCatalogData, getForecasters } from "@/lib/data";

export const metadata: Metadata = {
  title: "Forecasters",
  description: "Search and filter Verity forecaster reputation profiles."
};

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item ?? "";
}

export default async function ForecastersPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const q = value(params, "q").toLowerCase();
  const domain = value(params, "domain");
  const minForecasts = Number(value(params, "minForecasts") || 0);
  const accuracy = value(params, "accuracy");
  const score = value(params, "score");
  const sort = value(params, "sort") || "score";
  const [{ categories }, { data, forecasters: results }] = await Promise.all([
    getCatalogData(),
    getForecasters({ q, domain, minForecasts, accuracy, score, sort })
  ]);
  const demo = data.mode === "demo";

  return (
    <section className="container-page py-10">
      <div className="flex flex-col gap-2">
        <Badge tone="accent">Forecasters</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Forecaster reputation directory</h1>
        <p className="max-w-3xl text-muted-foreground">
          {demo ? "Search fictional MVP forecasters by domain, forecast count, accuracy, score, and consistency." : "Search tracked forecasters by domain, forecast count, accuracy, score, and consistency."}
        </p>
      </div>

      <form className="mt-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1.5fr_repeat(5,1fr)_auto]" aria-label="Forecaster filters">
        <Input name="q" defaultValue={value(params, "q")} placeholder="Search names, handles, domains" aria-label="Search forecasters" />
        <Select name="domain" defaultValue={domain} aria-label="Domain">
          <option value="">All domains</option>
          {categories.map((item) => <option key={item.id} value={item.name.toLowerCase()}>{item.name}</option>)}
        </Select>
        <Select name="minForecasts" defaultValue={value(params, "minForecasts")} aria-label="Minimum forecast count">
          <option value="">Any count</option>
          <option value="8">8+</option>
          <option value="12">12+</option>
          <option value="16">16+</option>
        </Select>
        <Select name="accuracy" defaultValue={accuracy} aria-label="Accuracy range">
          <option value="">Any accuracy</option>
          <option value="55">55%+</option>
          <option value="70">70%+</option>
        </Select>
        <Select name="score" defaultValue={score} aria-label="Score range">
          <option value="">Any score</option>
          <option value="65">65+</option>
          <option value="80">80+</option>
        </Select>
        <Select name="sort" defaultValue={sort} aria-label="Sort">
          <option value="score">Verity score</option>
          <option value="accuracy">Accuracy</option>
          <option value="forecasts">Total forecasts</option>
          <option value="recent">Recent performance</option>
          <option value="consistency">Consistency</option>
        </Select>
        <Button type="submit" variant="secondary"><SlidersHorizontal className="h-4 w-4" />Filter</Button>
      </form>

      <div className="mt-6 text-sm text-muted-foreground">{results.length} forecasters found</div>
      {results.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((forecaster) => <ForecasterCard key={forecaster.id} forecaster={forecaster} />)}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No forecasters match these filters" body="Try relaxing the score, accuracy, domain, or search query." />
        </div>
      )}
    </section>
  );
}
