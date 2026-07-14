import Link from "next/link";
import { ArrowDown, ArrowUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompact, formatDate, formatPercent } from "@/lib/utils";
import type { enrichMarket } from "@/lib/data";

type EnrichedMarket = ReturnType<typeof enrichMarket>;

export function MarketCard({ market }: { market: EnrichedMarket }) {
  const change = market.currentProbability - market.previousProbability;
  return (
    <Link href={`/markets/${market.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
      <Card className="h-full transition hover:border-accent/60 hover:shadow-soft">
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge tone={market.resolutionStatus === "active" ? "accent" : market.resolutionStatus === "resolved" ? "positive" : "warning"}>
                {market.resolutionStatus}
              </Badge>
              <h2 className="line-clamp-3 text-base font-semibold leading-snug group-hover:text-accent">{market.question}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatPercent(market.currentProbability)}</p>
              <p className={change >= 0 ? "flex items-center justify-end gap-1 text-xs text-positive" : "flex items-center justify-end gap-1 text-xs text-destructive"}>
                {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(change)} pts
              </p>
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <p><span className="text-foreground">{market.protocol?.name}</span><br />{market.category?.name}</p>
            <p><span className="text-foreground">{formatCompact(market.volume)}</span><br />demo volume</p>
            <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{market.participantCount} participants</p>
            <p><span className="text-foreground">{market.conviction.trackedForecasterCount}</span><br />forecasters</p>
            <p><span className="text-foreground">{formatPercent(market.conviction.reputationWeightedForecast)}</span><br />weighted conviction</p>
            <p><span className="text-foreground">{formatDate(market.resolutionDate)}</span><br />resolution</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
