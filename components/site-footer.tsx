import Link from "next/link";
import { getDataMode } from "@/lib/data/mode";

export function SiteFooter() {
  const demo = getDataMode() === "demo";
  return (
    <footer className="mt-20 border-t">
      <div className="container-page flex flex-col gap-3 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>{demo ? "Verity is an early market intelligence MVP using fictional demo data." : "Verity is an early market intelligence MVP using manually curated connected data."}</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-foreground">Methodology</Link>
          <Link href="/markets" className="hover:text-foreground">Markets</Link>
          <Link href="/forecasters" className="hover:text-foreground">Forecasters</Link>
        </div>
      </div>
    </footer>
  );
}
