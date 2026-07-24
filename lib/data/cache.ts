import { cache } from "react";
import { getPublicSupabaseClient } from "@/lib/supabase/public-server";
import { throwDataError } from "@/lib/data/errors";
import { isConnectedMode } from "@/lib/data/mode";

export function requirePublicClient() {
  if (!isConnectedMode()) return null;
  const supabase = getPublicSupabaseClient();
  if (!supabase) throw new Error("Connected mode could not initialize Supabase public client.");
  return supabase;
}

export const getConnectedBaseData = cache(async () => {
  const supabase = requirePublicClient();
  if (!supabase) return null;
  const [categories, protocols, markets, forecasters, forecasts] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,data_origin,verification_status,created_at,updated_at").order("name"),
    supabase.from("protocols").select("id,name,slug,logo_url,website_url,description,data_origin,verification_status,created_at,updated_at").order("name"),
    supabase.from("markets").select("id,protocol_id,category_id,provider,provider_market_id,slug,question,description,source_url,image_url,tags,current_probability,previous_probability,volume,participant_count,resolution_date,resolution_status,resolution_outcome,resolution_rules,data_origin,verification_status,last_synced_at,sync_status,created_at,updated_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("forecasters").select("id,slug,display_name,wallet_address,x_handle,avatar_url,bio,joined_at,is_verified,data_origin,verification_status,profile_status,created_at,updated_at").order("display_name").limit(500),
    supabase.from("forecasts").select("id,forecaster_id,market_id,predicted_probability,confidence,position,reasoning,forecasted_at,is_resolved,was_correct,score_impact,data_origin,verification_status,created_at,updated_at").order("forecasted_at", { ascending: false }).limit(5000)
  ]);

  if (categories.error) throwDataError("Failed to load categories", categories.error);
  if (protocols.error) throwDataError("Failed to load protocols", protocols.error);
  if (markets.error) throwDataError("Failed to load markets", markets.error);
  if (forecasters.error) throwDataError("Failed to load forecasters", forecasters.error);
  if (forecasts.error) throwDataError("Failed to load forecasts", forecasts.error);

  return {
    categoryRows: categories.data ?? [],
    protocolRows: protocols.data ?? [],
    marketRows: markets.data ?? [],
    forecasterRows: forecasters.data ?? [],
    forecastRows: forecasts.data ?? []
  };
});
