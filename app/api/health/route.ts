import { NextResponse } from "next/server";
import { getDataMode } from "@/lib/data/mode";
import { evaluateHealth, unhealthyHealth } from "@/lib/health";
import { logger } from "@/lib/logger";
import { getPublicSupabaseClient } from "@/lib/supabase/public-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = {
    "Cache-Control": "no-store, max-age=0"
  };

  try {
    const mode = getDataMode();
    const result = await evaluateHealth(mode, async () => {
      const supabase = getPublicSupabaseClient();
      if (!supabase) return false;
      const { error } = await supabase.from("categories").select("id", { head: true, count: "exact" }).limit(1);
      if (error) {
        logger.warn("health_database_failed", { message: error.message });
        return false;
      }
      return true;
    });
    return NextResponse.json(result, {
      status: result.status === "healthy" ? 200 : 503,
      headers
    });
  } catch {
    logger.error("health_configuration_failed");
    return NextResponse.json(unhealthyHealth(), { status: 500, headers });
  }
}
