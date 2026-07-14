import type { Metadata } from "next";
import { logoutAction } from "@/app/admin/actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CategoryForm,
  EditForecasterForm,
  EditMarketForm,
  ForecasterForm,
  ForecastForm,
  InsightForm,
  LoginForm,
  MarketForm,
  MarkForecastForm,
  ProtocolForm,
  ResolveMarketForm
} from "@/features/admin/admin-forms";
import { isAdminAuthenticated } from "@/features/admin/auth";
import { forecasts, forecasters, markets } from "@/lib/data/seed";
import { platformStats } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return (
      <section className="container-page py-16">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight">Verity admin</h1>
          <p className="mt-3 text-muted-foreground">Protected MVP route. Configure ADMIN_PASSWORD and SESSION_SECRET to sign in.</p>
        </div>
        <LoginForm />
      </section>
    );
  }

  const stats = platformStats();
  return (
    <section className="container-page py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage MVP data through validated server actions. Supabase persistence activates when service credentials are configured.</p>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary">Log out</Button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Total forecasters", stats.totalForecasters],
          ["Total markets", stats.totalMarkets],
          ["Active markets", stats.activeMarkets],
          ["Resolved markets", stats.resolvedMarkets],
          ["Total forecasts", stats.totalForecasts],
          ["Resolved forecasts", stats.resolvedForecasts],
          ["Average accuracy", formatPercent(stats.averageAccuracy)]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><h2 className="font-semibold">Add forecaster</h2></CardHeader>
          <CardContent><ForecasterForm /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Add market</h2></CardHeader>
          <CardContent><MarketForm /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Add forecast</h2></CardHeader>
          <CardContent><ForecastForm forecasters={forecasters} markets={markets} /></CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><h2 className="font-semibold">Edit forecaster</h2></CardHeader>
          <CardContent><EditForecasterForm forecasters={forecasters} /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Edit market</h2></CardHeader>
          <CardContent><EditMarketForm markets={markets} /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Resolve market</h2></CardHeader>
          <CardContent><ResolveMarketForm markets={markets} /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Mark forecast</h2></CardHeader>
          <CardContent><MarkForecastForm forecasts={forecasts} /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Add protocol</h2></CardHeader>
          <CardContent><ProtocolForm /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Add category</h2></CardHeader>
          <CardContent><CategoryForm /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Add insight</h2></CardHeader>
          <CardContent><InsightForm /></CardContent>
        </Card>
      </div>
    </section>
  );
}
