"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, clearAdminSession, verifyPassword } from "@/features/admin/auth";
import {
  adminLoginSchema,
  categorySchema,
  editForecasterSchema,
  editMarketSchema,
  forecasterSchema,
  forecastSchema,
  insightSchema,
  markForecastSchema,
  marketSchema,
  protocolSchema,
  resolveMarketSchema
} from "@/features/admin/validation";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = adminLoginSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success || !verifyPassword(parsed.data.password)) {
    return { ok: false, message: "Invalid admin password or missing server configuration." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function createForecasterAction(_: unknown, formData: FormData) {
  const parsed = forecasterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the forecaster fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("forecasters").insert({
      slug: parsed.data.slug,
      display_name: parsed.data.displayName,
      wallet_address: parsed.data.walletAddress,
      x_handle: parsed.data.xHandle,
      bio: parsed.data.bio
    });
    if (error) return { ok: false, message: "Supabase rejected the forecaster insert." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Forecaster added." : "Forecaster validated. Configure Supabase to persist changes." };
}

export async function createMarketAction(_: unknown, formData: FormData) {
  const parsed = marketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the market fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("markets").insert({
      slug: parsed.data.slug,
      question: parsed.data.question,
      current_probability: parsed.data.currentProbability,
      previous_probability: parsed.data.previousProbability,
      volume: parsed.data.volume,
      participant_count: parsed.data.participantCount,
      resolution_date: parsed.data.resolutionDate,
      resolution_status: parsed.data.resolutionStatus,
      resolution_rules: parsed.data.resolutionRules
    });
    if (error) return { ok: false, message: "Supabase rejected the market insert." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Market added." : "Market validated. Configure Supabase to persist changes." };
}

export async function createForecastAction(_: unknown, formData: FormData) {
  const parsed = forecastSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the forecast fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("forecasts").insert({
      forecaster_id: parsed.data.forecasterId,
      market_id: parsed.data.marketId,
      predicted_probability: parsed.data.predictedProbability,
      confidence: parsed.data.confidence,
      position: parsed.data.position,
      reasoning: parsed.data.reasoning
    });
    if (error) return { ok: false, message: "Supabase rejected the forecast insert." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Forecast added." : "Forecast validated. Configure Supabase to persist changes." };
}

export async function editForecasterAction(_: unknown, formData: FormData) {
  const parsed = editForecasterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the forecaster edit fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("forecasters").update({
      slug: parsed.data.slug,
      display_name: parsed.data.displayName,
      wallet_address: parsed.data.walletAddress,
      x_handle: parsed.data.xHandle,
      bio: parsed.data.bio
    }).eq("id", parsed.data.id);
    if (error) return { ok: false, message: "Supabase rejected the forecaster update." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Forecaster updated." : "Forecaster edit validated. Configure Supabase to persist changes." };
}

export async function editMarketAction(_: unknown, formData: FormData) {
  const parsed = editMarketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the market edit fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("markets").update({
      slug: parsed.data.slug,
      question: parsed.data.question,
      current_probability: parsed.data.currentProbability,
      previous_probability: parsed.data.previousProbability,
      volume: parsed.data.volume,
      participant_count: parsed.data.participantCount,
      resolution_date: parsed.data.resolutionDate,
      resolution_status: parsed.data.resolutionStatus,
      resolution_rules: parsed.data.resolutionRules
    }).eq("id", parsed.data.id);
    if (error) return { ok: false, message: "Supabase rejected the market update." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Market updated." : "Market edit validated. Configure Supabase to persist changes." };
}

export async function resolveMarketAction(_: unknown, formData: FormData) {
  const parsed = resolveMarketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Choose a market and resolution outcome." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("markets").update({
      resolution_status: parsed.data.resolutionStatus,
      resolution_outcome: parsed.data.resolutionOutcome
    }).eq("id", parsed.data.id);
    if (error) return { ok: false, message: "Supabase rejected the market resolution." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Market resolution saved." : "Market resolution validated. Configure Supabase to persist changes." };
}

export async function markForecastAction(_: unknown, formData: FormData) {
  const parsed = markForecastSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Choose a forecast and correctness value." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("forecasts").update({
      is_resolved: true,
      was_correct: parsed.data.wasCorrect === "true"
    }).eq("id", parsed.data.id);
    if (error) return { ok: false, message: "Supabase rejected the forecast update." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Forecast correctness saved." : "Forecast correctness validated. Configure Supabase to persist changes." };
}

export async function createProtocolAction(_: unknown, formData: FormData) {
  const parsed = protocolSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the protocol fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("protocols").insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      website_url: parsed.data.websiteUrl,
      description: parsed.data.description
    });
    if (error) return { ok: false, message: "Supabase rejected the protocol insert." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Protocol added." : "Protocol validated. Configure Supabase to persist changes." };
}

export async function createCategoryAction(_: unknown, formData: FormData) {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the category fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("categories").insert(parsed.data);
    if (error) return { ok: false, message: "Supabase rejected the category insert." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Category added." : "Category validated. Configure Supabase to persist changes." };
}

export async function createInsightAction(_: unknown, formData: FormData) {
  const parsed = insightSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the insight fields and try again." };
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("insights").insert({
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      is_featured: Boolean(parsed.data.isFeatured)
    });
    if (error) return { ok: false, message: "Supabase rejected the insight insert." };
  }
  revalidatePath("/admin");
  return { ok: true, message: supabase ? "Insight added." : "Insight validated. Configure Supabase to persist changes." };
}
