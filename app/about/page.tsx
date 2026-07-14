import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Verity product scope, scoring methodology, limitations, and long-term vision."
};

const sections = [
  ["What Verity is", "Verity is an early market intelligence and forecaster reputation product for onchain markets. It helps users discover markets, inspect credible forecasters, and understand what high-performing forecasters currently believe."],
  ["What Verity is not", "Verity is not a prediction market, perp exchange, trading venue, token product, DAO governance executor, or futarchy execution layer."],
  ["Why portable reputation matters", "Forecasts become more useful when reputation can travel across markets and protocols. A shared scoring layer can make market intelligence easier to evaluate and compare."],
  ["How the MVP works", "The first version uses manually tracked and imported demo data. It focuses on product validation, customer interviews, and clear scoring surfaces before automated indexing."],
  ["How scoring works", "Accuracy measures directional correctness. Calibration uses a Brier-style approach. Experience and consistency reduce luck. Recent performance keeps rankings responsive without letting one call dominate."],
  ["Current limitations", "The data is seeded and demo-labelled, rankings are early, and scoring assumptions are intentionally simple. The methodology should evolve with real user feedback and larger samples."],
  ["Long-term vision", "Verity can become a shared identity, reputation, discovery, and intelligence layer for onchain markets, with more integrations after the core reputation thesis is validated."]
];

export default function AboutPage() {
  return (
    <section className="container-page py-10">
      <Badge tone="accent">About & Methodology</Badge>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">Building the reputation and intelligence layer for onchain markets.</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        Verity is deliberately lean in this MVP. The aim is to test whether users value market discovery, forecaster credibility, and reputation-weighted conviction before adding deeper integrations.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {sections.map(([title, body]) => (
          <Card key={title}>
            <CardContent>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
