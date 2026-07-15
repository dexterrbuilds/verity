"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  createCategoryAction,
  createForecasterAction,
  createForecastAction,
  createInsightAction,
  createMarketAction,
  createProtocolAction,
  editCategoryAction,
  editForecasterAction,
  editForecastAction,
  editInsightAction,
  editMarketAction,
  editProtocolAction,
  loginAction,
  markForecastAction,
  resolveMarketAction
} from "@/app/admin/actions";
import type { Category, Forecast, Forecaster, Insight, Market, Protocol } from "@/types";

const initial = { ok: false, message: "" };

function Status({ state }: { state: typeof initial }) {
  if (!state.message) return null;
  return <p className={state.ok ? "text-sm text-positive" : "text-sm text-destructive"}>{state.message}</p>;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="mx-auto mt-8 max-w-sm space-y-4 rounded-lg border bg-card p-5">
      <label className="grid gap-2 text-sm font-medium">
        Admin password
        <Input name="password" type="password" autoComplete="current-password" required />
      </label>
      <Status state={state} />
      <Button disabled={pending} className="w-full">{pending ? "Checking..." : "Enter Admin"}</Button>
    </form>
  );
}

export function ForecasterForm() {
  const [state, action, pending] = useActionState(createForecasterAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Input name="displayName" placeholder="Display name" required />
      <Input name="slug" placeholder="slug-like-this" required />
      <Input name="walletAddress" placeholder="Wallet label or address" required />
      <Input name="xHandle" placeholder="@handle" />
      <Input name="strongestDomain" placeholder="Strongest domain" required />
      <Textarea name="bio" placeholder="Short bio" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Add Forecaster"}</Button>
    </form>
  );
}

export function MarketForm() {
  const [state, action, pending] = useActionState(createMarketAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Textarea name="question" placeholder="Market question" required />
      <Input name="slug" placeholder="market-slug" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="currentProbability" type="number" placeholder="Current probability" required />
        <Input name="previousProbability" type="number" placeholder="Previous probability" required />
        <Input name="volume" type="number" placeholder="Volume" required />
        <Input name="participantCount" type="number" placeholder="Participants" required />
      </div>
      <Input name="resolutionDate" type="date" required />
      <Select name="resolutionStatus" defaultValue="active">
        <option value="active">Active</option>
        <option value="resolved">Resolved</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <Select name="resolutionOutcome" defaultValue="">
        <option value="">No outcome</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </Select>
      <Textarea name="resolutionRules" placeholder="Resolution rules" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Add Market"}</Button>
    </form>
  );
}

export function ForecastForm({ forecasters, markets }: { forecasters: Forecaster[]; markets: Market[] }) {
  const [state, action, pending] = useActionState(createForecastAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Select name="forecasterId" required>
        {forecasters.map((forecaster) => <option key={forecaster.id} value={forecaster.id}>{forecaster.displayName}</option>)}
      </Select>
      <Select name="marketId" required>
        {markets.map((market) => <option key={market.id} value={market.id}>{market.question}</option>)}
      </Select>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input name="predictedProbability" type="number" placeholder="Prediction" required />
        <Input name="confidence" type="number" placeholder="Confidence" required />
        <Select name="position" defaultValue="yes">
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="neutral">Neutral</option>
        </Select>
      </div>
      <Input name="forecastedAt" type="datetime-local" required />
      <Textarea name="reasoning" placeholder="Short reasoning" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Add Forecast"}</Button>
    </form>
  );
}

export function EditForecasterForm({ forecasters }: { forecasters: Forecaster[] }) {
  const [state, action, pending] = useActionState(editForecasterAction, initial);
  const first = forecasters[0];
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {forecasters.map((forecaster) => <option key={forecaster.id} value={forecaster.id}>{forecaster.displayName}</option>)}
      </Select>
      <Input name="displayName" defaultValue={first?.displayName} placeholder="Display name" required />
      <Input name="slug" defaultValue={first?.slug} placeholder="slug-like-this" required />
      <Input name="walletAddress" defaultValue={first?.walletAddress} placeholder="Wallet label or address" required />
      <Input name="xHandle" defaultValue={first?.xHandle} placeholder="@handle" />
      <Input name="strongestDomain" defaultValue={first?.strongestDomain} placeholder="Strongest domain" required />
      <Textarea name="bio" defaultValue={first?.bio} placeholder="Short bio" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Edit Forecaster"}</Button>
    </form>
  );
}

export function EditMarketForm({ markets }: { markets: Market[] }) {
  const [state, action, pending] = useActionState(editMarketAction, initial);
  const first = markets[0];
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {markets.map((market) => <option key={market.id} value={market.id}>{market.question}</option>)}
      </Select>
      <Textarea name="question" defaultValue={first?.question} placeholder="Market question" required />
      <Input name="slug" defaultValue={first?.slug} placeholder="market-slug" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="currentProbability" type="number" defaultValue={first?.currentProbability} placeholder="Current probability" required />
        <Input name="previousProbability" type="number" defaultValue={first?.previousProbability} placeholder="Previous probability" required />
        <Input name="volume" type="number" defaultValue={first?.volume} placeholder="Volume" required />
        <Input name="participantCount" type="number" defaultValue={first?.participantCount} placeholder="Participants" required />
      </div>
      <Input name="resolutionDate" type="date" defaultValue={first?.resolutionDate} required />
      <Select name="resolutionStatus" defaultValue={first?.resolutionStatus ?? "active"}>
        <option value="active">Active</option>
        <option value="resolved">Resolved</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <Select name="resolutionOutcome" defaultValue={first?.resolutionOutcome ?? ""}>
        <option value="">No outcome</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </Select>
      <Textarea name="resolutionRules" defaultValue={first?.resolutionRules} placeholder="Resolution rules" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Edit Market"}</Button>
    </form>
  );
}

export function ResolveMarketForm({ markets }: { markets: Market[] }) {
  const [state, action, pending] = useActionState(resolveMarketAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {markets.map((market) => <option key={market.id} value={market.id}>{market.question}</option>)}
      </Select>
      <Select name="resolutionStatus" defaultValue="resolved">
        <option value="resolved">Resolved</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <Select name="resolutionOutcome" defaultValue="yes">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </Select>
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Resolve Market"}</Button>
    </form>
  );
}

export function MarkForecastForm({ forecasts }: { forecasts: Forecast[] }) {
  const [state, action, pending] = useActionState(markForecastAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {forecasts.map((forecast) => <option key={forecast.id} value={forecast.id}>{forecast.id}</option>)}
      </Select>
      <Select name="wasCorrect" defaultValue="true">
        <option value="true">Correct</option>
        <option value="false">Incorrect</option>
      </Select>
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Mark Forecast"}</Button>
    </form>
  );
}

export function EditForecastForm({ forecasts, forecasters, markets }: { forecasts: Forecast[]; forecasters: Forecaster[]; markets: Market[] }) {
  const [state, action, pending] = useActionState(editForecastAction, initial);
  const first = forecasts[0];
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {forecasts.map((forecast) => <option key={forecast.id} value={forecast.id}>{forecast.id}</option>)}
      </Select>
      <Select name="forecasterId" defaultValue={first?.forecasterId} required>
        {forecasters.map((forecaster) => <option key={forecaster.id} value={forecaster.id}>{forecaster.displayName}</option>)}
      </Select>
      <Select name="marketId" defaultValue={first?.marketId} required>
        {markets.map((market) => <option key={market.id} value={market.id}>{market.question}</option>)}
      </Select>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input name="predictedProbability" type="number" defaultValue={first?.predictedProbability} placeholder="Prediction" required />
        <Input name="confidence" type="number" defaultValue={first?.confidence} placeholder="Confidence" required />
        <Select name="position" defaultValue={first?.position ?? "yes"}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="neutral">Neutral</option>
        </Select>
      </div>
      <Input name="forecastedAt" type="datetime-local" defaultValue={first?.forecastedAt.slice(0, 16)} required />
      <Textarea name="reasoning" defaultValue={first?.reasoning} placeholder="Short reasoning" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Edit Forecast"}</Button>
    </form>
  );
}

export function ProtocolForm() {
  const [state, action, pending] = useActionState(createProtocolAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Input name="name" placeholder="Protocol name" required />
      <Input name="slug" placeholder="protocol-slug" required />
      <Input name="websiteUrl" placeholder="https://example.com" />
      <Textarea name="description" placeholder="Description" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Add Protocol"}</Button>
    </form>
  );
}

export function EditProtocolForm({ protocols }: { protocols: Protocol[] }) {
  const [state, action, pending] = useActionState(editProtocolAction, initial);
  const first = protocols[0];
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {protocols.map((protocol) => <option key={protocol.id} value={protocol.id}>{protocol.name}</option>)}
      </Select>
      <Input name="name" defaultValue={first?.name} placeholder="Protocol name" required />
      <Input name="slug" defaultValue={first?.slug} placeholder="protocol-slug" required />
      <Input name="websiteUrl" defaultValue={first?.websiteUrl} placeholder="https://example.com" />
      <Textarea name="description" defaultValue={first?.description} placeholder="Description" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Edit Protocol"}</Button>
    </form>
  );
}

export function CategoryForm() {
  const [state, action, pending] = useActionState(createCategoryAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Input name="name" placeholder="Category name" required />
      <Input name="slug" placeholder="category-slug" required />
      <Textarea name="description" placeholder="Description" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Add Category"}</Button>
    </form>
  );
}

export function EditCategoryForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(editCategoryAction, initial);
  const first = categories[0];
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </Select>
      <Input name="name" defaultValue={first?.name} placeholder="Category name" required />
      <Input name="slug" defaultValue={first?.slug} placeholder="category-slug" required />
      <Textarea name="description" defaultValue={first?.description} placeholder="Description" required />
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Edit Category"}</Button>
    </form>
  );
}

export function InsightForm() {
  const [state, action, pending] = useActionState(createInsightAction, initial);
  return (
    <form action={action} className="grid gap-3">
      <Input name="title" placeholder="Insight title" required />
      <Textarea name="body" placeholder="Insight body" required />
      <Input name="category" placeholder="Category" required />
      <label className="flex items-center gap-2 text-sm">
        <input name="isFeatured" type="checkbox" className="h-4 w-4" />
        Featured
      </label>
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Add Insight"}</Button>
    </form>
  );
}

export function EditInsightForm({ insights }: { insights: Insight[] }) {
  const [state, action, pending] = useActionState(editInsightAction, initial);
  const first = insights[0];
  return (
    <form action={action} className="grid gap-3">
      <Select name="id" required>
        {insights.map((insight) => <option key={insight.id} value={insight.id}>{insight.title}</option>)}
      </Select>
      <Input name="title" defaultValue={first?.title} placeholder="Insight title" required />
      <Textarea name="body" defaultValue={first?.body} placeholder="Insight body" required />
      <Input name="category" defaultValue={first?.category} placeholder="Category" required />
      <label className="flex items-center gap-2 text-sm">
        <input name="isFeatured" type="checkbox" defaultChecked={first?.isFeatured} className="h-4 w-4" />
        Featured
      </label>
      <Status state={state} />
      <Button disabled={pending}>{pending ? "Saving..." : "Edit Insight"}</Button>
    </form>
  );
}
