import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getDataMode } from "@/lib/data/mode";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

export const getPublicSupabaseClient = cache(() => {
  if (getDataMode() !== "connected") return null;
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false }
  });
});
