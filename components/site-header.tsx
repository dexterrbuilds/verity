import Link from "next/link";
import { BarChart3, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getModeDisclosure } from "@/lib/data/mode";

const navItems = [
  ["Overview", "/overview"],
  ["Markets", "/markets"],
  ["Forecasters", "/forecasters"],
  ["Leaderboard", "/leaderboard"],
  ["About", "/about"]
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/88 backdrop-blur">
      <div className="border-b bg-accent/10 py-2 text-center text-xs text-muted-foreground">
        {getModeDisclosure()}
      </div>
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight" aria-label="Verity home">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-lg">Verity</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <form action="/markets" className="ml-auto hidden min-w-64 items-center gap-2 rounded-md border bg-card px-3 lg:flex">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            name="q"
            aria-label="Search markets"
            placeholder="Search markets"
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
        <ThemeToggle />
        <ButtonLink href="/leaderboard" className="hidden lg:inline-flex">Explore Rankings</ButtonLink>
      </div>
      <nav className="container-page flex gap-1 overflow-x-auto pb-3 md:hidden" aria-label="Mobile navigation">
        {navItems.map(([label, href]) => (
          <Link key={href} href={href} className="shrink-0 rounded-md border bg-card px-3 py-2 text-sm">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
