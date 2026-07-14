"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-page py-24 text-center">
      <p className="text-sm font-semibold text-destructive">Error</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Something did not resolve cleanly.</h1>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Try again, or adjust the current filters.</p>
      <Button type="button" className="mt-6" onClick={reset}>Retry</Button>
    </section>
  );
}
