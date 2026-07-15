"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearLoginAttempts,
  createAdminSession,
  clearAdminSession,
  isLoginRateLimited,
  requireAdmin,
  verifyPassword
} from "@/features/admin/auth";
import {
  adminLoginSchema,
  categorySchema,
  editForecasterSchema,
  editCategorySchema,
  editForecastSchema,
  editInsightSchema,
  editMarketSchema,
  editProtocolSchema,
  forecasterSchema,
  forecastSchema,
  insightSchema,
  markForecastSchema,
  marketSchema,
  protocolSchema,
  resolveMarketSchema
} from "@/features/admin/validation";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getDataMode, getDataSet, getMarketById, getModeError } from "@/lib/data";

function revalidatePublicData() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/overview");
  revalidatePath("/markets");
  revalidatePath("/forecasters");
  revalidatePath("/leaderboard");
  revalidatePath("/markets/[slug]", "page");
  revalidatePath("/forecasters/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

function writableClientOrIssue(): { ok: true; supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>> } | { ok: false; message: string } {
  if (getDataMode() === "demo") {
    return { ok: false, message: "Demo mode is read-only. Set NEXT_PUBLIC_DATA_MODE=connected and configure Supabase before admin mutations can persist." };
  }
  const issue = getModeError();
  if (issue) return { ok: false, message: issue };
  const supabase = createServiceSupabaseClient();
  if (!supabase) return { ok: false, message: "Supabase service client is not configured." };
  return { ok: true, supabase };
}

function mutationError(message: string, error: { code?: string; message?: string }) {
  if (error.code === "23505") return { ok: false, message: "A record with that unique value already exists." };
  return { ok: false, message };
}

export async function loginAction(_: unknown, formData: FormData) {
  if (await isLoginRateLimited()) {
    return { ok: false, message: "Too many attempts. Wait a few minutes and try again." };
  }
  const parsed = adminLoginSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success || !verifyPassword(parsed.data.password)) {
    return { ok: false, message: "Invalid admin credentials." };
  }
  await clearLoginAttempts();
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function createForecasterAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = forecasterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the forecaster fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("forecasters").insert({
    slug: parsed.data.slug,
    display_name: parsed.data.displayName,
    wallet_address: parsed.data.walletAddress,
    x_handle: parsed.data.xHandle,
    bio: parsed.data.bio
  });
  if (error) return mutationError("Supabase rejected the forecaster insert.", error);
  revalidatePublicData();
  return { ok: true, message: "Forecaster added." };
}

export async function createMarketAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = marketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the market fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("markets").insert({
    slug: parsed.data.slug,
    question: parsed.data.question,
    current_probability: parsed.data.currentProbability,
    previous_probability: parsed.data.previousProbability,
    volume: parsed.data.volume,
    participant_count: parsed.data.participantCount,
    resolution_date: parsed.data.resolutionDate,
    resolution_status: parsed.data.resolutionStatus,
    resolution_rules: parsed.data.resolutionRules,
    resolution_outcome: parsed.data.resolutionOutcome || null
  });
  if (error) return mutationError("Supabase rejected the market insert.", error);
  revalidatePublicData();
  return { ok: true, message: "Market added." };
}

export async function createForecastAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = forecastSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the forecast fields and try again." };
  const market = await getMarketById(parsed.data.marketId);
  if (!market) return { ok: false, message: "Market does not exist." };
  const data = await getDataSet();
  if (!data.forecasters.some((forecaster) => forecaster.id === parsed.data.forecasterId)) {
    return { ok: false, message: "Forecaster does not exist." };
  }
  if (market.resolutionStatus !== "active") {
    return { ok: false, message: "Forecasts can only be added to active markets." };
  }
  if (Date.parse(parsed.data.forecastedAt) > Date.parse(market.resolutionDate)) {
    return { ok: false, message: "Forecast timestamp cannot be after the market resolution date." };
  }
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("forecasts").insert({
    forecaster_id: parsed.data.forecasterId,
    market_id: parsed.data.marketId,
    predicted_probability: parsed.data.predictedProbability,
    confidence: parsed.data.confidence,
    position: parsed.data.position,
    reasoning: parsed.data.reasoning,
    forecasted_at: parsed.data.forecastedAt
  });
  if (error) return mutationError("Supabase rejected the forecast insert.", error);
  revalidatePublicData();
  return { ok: true, message: "Forecast added." };
}

export async function editForecasterAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = editForecasterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the forecaster edit fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("forecasters").update({
    slug: parsed.data.slug,
    display_name: parsed.data.displayName,
    wallet_address: parsed.data.walletAddress,
    x_handle: parsed.data.xHandle,
    bio: parsed.data.bio
  }).eq("id", parsed.data.id);
  if (error) return mutationError("Supabase rejected the forecaster update.", error);
  revalidatePublicData();
  return { ok: true, message: "Forecaster updated." };
}

export async function editMarketAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = editMarketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the market edit fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("markets").update({
    slug: parsed.data.slug,
    question: parsed.data.question,
    current_probability: parsed.data.currentProbability,
    previous_probability: parsed.data.previousProbability,
    volume: parsed.data.volume,
    participant_count: parsed.data.participantCount,
    resolution_date: parsed.data.resolutionDate,
    resolution_status: parsed.data.resolutionStatus,
    resolution_rules: parsed.data.resolutionRules,
    resolution_outcome: parsed.data.resolutionOutcome || null
  }).eq("id", parsed.data.id);
  if (error) return mutationError("Supabase rejected the market update.", error);
  revalidatePublicData();
  return { ok: true, message: "Market updated." };
}

export async function resolveMarketAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = resolveMarketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Choose a market and resolution outcome." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("markets").update({
    resolution_status: parsed.data.resolutionStatus,
    resolution_outcome: parsed.data.resolutionOutcome || null
  }).eq("id", parsed.data.id);
  if (error) return mutationError("Supabase rejected the market resolution.", error);
  revalidatePublicData();
  return { ok: true, message: "Market resolution saved." };
}

export async function markForecastAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = markForecastSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Choose a forecast and correctness value." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("forecasts").update({
    is_resolved: true,
    was_correct: parsed.data.wasCorrect === "true"
  }).eq("id", parsed.data.id);
  if (error) return mutationError("Supabase rejected the forecast update.", error);
  revalidatePublicData();
  return { ok: true, message: "Forecast correctness saved." };
}

export async function createProtocolAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = protocolSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the protocol fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("protocols").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    website_url: parsed.data.websiteUrl,
    description: parsed.data.description
  });
  if (error) return mutationError("Supabase rejected the protocol insert.", error);
  revalidatePublicData();
  return { ok: true, message: "Protocol added." };
}

export async function createCategoryAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the category fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("categories").insert(parsed.data);
  if (error) return mutationError("Supabase rejected the category insert.", error);
  revalidatePublicData();
  return { ok: true, message: "Category added." };
}

export async function createInsightAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = insightSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the insight fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("insights").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    category: parsed.data.category,
    is_featured: Boolean(parsed.data.isFeatured)
  });
  if (error) return mutationError("Supabase rejected the insight insert.", error);
  revalidatePublicData();
  return { ok: true, message: "Insight added." };
}

export async function editForecastAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = editForecastSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the forecast edit fields and try again." };
  const market = await getMarketById(parsed.data.marketId);
  if (!market) return { ok: false, message: "Market does not exist." };
  const data = await getDataSet();
  if (!data.forecasters.some((forecaster) => forecaster.id === parsed.data.forecasterId)) {
    return { ok: false, message: "Forecaster does not exist." };
  }
  if (market.resolutionStatus !== "active") return { ok: false, message: "Forecasts can only be edited while the market is active." };
  if (Date.parse(parsed.data.forecastedAt) > Date.parse(market.resolutionDate)) {
    return { ok: false, message: "Forecast timestamp cannot be after the market resolution date." };
  }
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("forecasts").update({
    forecaster_id: parsed.data.forecasterId,
    market_id: parsed.data.marketId,
    predicted_probability: parsed.data.predictedProbability,
    confidence: parsed.data.confidence,
    position: parsed.data.position,
    reasoning: parsed.data.reasoning,
    forecasted_at: parsed.data.forecastedAt
  }).eq("id", parsed.data.id);
  if (error) return mutationError("Supabase rejected the forecast update.", error);
  revalidatePublicData();
  return { ok: true, message: "Forecast updated." };
}

export async function editProtocolAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = editProtocolSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the protocol edit fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("protocols").update({
    name: parsed.data.name,
    slug: parsed.data.slug,
    website_url: parsed.data.websiteUrl || null,
    description: parsed.data.description
  }).eq("id", parsed.data.id);
  if (error) return mutationError("Supabase rejected the protocol update.", error);
  revalidatePublicData();
  return { ok: true, message: "Protocol updated." };
}

export async function editCategoryAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = editCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the category edit fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { id, ...updates } = parsed.data;
  const { error } = await writable.supabase.from("categories").update(updates).eq("id", id);
  if (error) return mutationError("Supabase rejected the category update.", error);
  revalidatePublicData();
  return { ok: true, message: "Category updated." };
}

export async function editInsightAction(_: unknown, formData: FormData) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = editInsightSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the insight edit fields and try again." };
  const writable = writableClientOrIssue();
  if (!writable.ok) return { ok: false, message: writable.message };
  const { error } = await writable.supabase.from("insights").update({
    title: parsed.data.title,
    body: parsed.data.body,
    category: parsed.data.category,
    is_featured: Boolean(parsed.data.isFeatured)
  }).eq("id", parsed.data.id);
  if (error) return mutationError("Supabase rejected the insight update.", error);
  revalidatePublicData();
  return { ok: true, message: "Insight updated." };
}
