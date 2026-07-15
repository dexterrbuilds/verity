import Link from "next/link";
import { CheckCircle2, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { dataOriginLabel, formatPercent, profileStatusLabel, verificationLabel } from "@/lib/utils";
import type { EnrichedForecaster } from "@/types";

export function ForecasterCard({ forecaster }: { forecaster: EnrichedForecaster }) {
  const metric = forecaster.metrics;
  return (
    <Link href={`/forecasters/${forecaster.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
      <Card className="h-full transition hover:border-accent/60 hover:shadow-soft">
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted font-bold">{forecaster.avatarUrl}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-semibold group-hover:text-accent">{forecaster.displayName}</h2>
                {forecaster.isVerified ? <CheckCircle2 className="h-4 w-4 text-accent" aria-label="Verified" /> : null}
              </div>
              <p className="truncate text-sm text-muted-foreground">{forecaster.xHandle} · {forecaster.walletAddress}</p>
            </div>
            <Badge tone="accent">#{metric?.rank ?? "-"}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{dataOriginLabel(forecaster.dataOrigin)}</Badge>
            <Badge>{profileStatusLabel(forecaster.profileStatus)}</Badge>
            {forecaster.verificationStatus !== "unverified" ? <Badge tone="positive">{verificationLabel(forecaster.verificationStatus)}</Badge> : null}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{forecaster.bio}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><span className="block text-xl font-bold">{metric?.verityScore.toFixed(1)}</span><span className="text-muted-foreground">Verity score</span></p>
            <p><span className="block text-xl font-bold">{formatPercent(metric?.accuracy ?? 0)}</span><span className="text-muted-foreground">Accuracy</span></p>
            <p><span className="block font-semibold">{metric?.resolvedForecasts}</span><span className="text-muted-foreground">Resolved</span></p>
            <p className="flex items-center gap-1"><Flame className="h-4 w-4 text-warning" /><span>{metric?.currentStreak} streak</span></p>
          </div>
          <div className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
            <span>{forecaster.strongestDomain}</span>
            <span className="text-muted-foreground">{metric?.calibration.toFixed(0)} calibration</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
