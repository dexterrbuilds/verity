import { createClient } from "@supabase/supabase-js";
import { getModeError, resolveDataMode } from "@/lib/data/mode";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";

type Check = {
  name: string;
  ok: boolean;
  detail?: string;
};

const tableChecks = [
  ["categories", "id,slug,data_origin,verification_status,updated_at"],
  ["protocols", "id,slug,data_origin,verification_status"],
  ["forecasters", "id,slug,data_origin,verification_status,profile_status"],
  ["markets", "id,slug,provider,provider_market_id,source_url,image_url,tags,last_synced_at,sync_status,data_origin,verification_status"],
  ["forecasts", "id,forecaster_id,market_id,data_origin,verification_status"],
  ["market_probability_history", "id,market_id,probability,recorded_at"],
  ["insights", "id,data_origin,verification_status"]
] as const;

function maskDetail(message: string | undefined) {
  if (!message) return undefined;
  return message.replace(/eyJ[a-zA-Z0-9._-]+/g, "[redacted-jwt]");
}

function hasRequiredEnv() {
  const mode = resolveDataMode({
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    requestedMode: env.NEXT_PUBLIC_DATA_MODE,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  });
  return mode.mode === "connected" && !mode.error && !getModeError();
}

async function runCheck(name: string, fn: () => Promise<void>): Promise<Check> {
  try {
    await fn();
    return { name, ok: true };
  } catch (error) {
    const detail = error instanceof Error ? maskDetail(error.message) : "Unknown failure";
    logger.error("supabase_verify_failed", { check: name, detail });
    return { name, ok: false, detail };
  }
}

async function main() {
  const checks: Check[] = [];
  checks.push({
    name: "connected environment",
    ok: hasRequiredEnv(),
    detail: hasRequiredEnv() ? undefined : getModeError() ?? "NEXT_PUBLIC_DATA_MODE=connected and complete Supabase keys are required."
  });

  if (!checks[0].ok) {
    console.table(checks);
    process.exitCode = 1;
    return;
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = createClient<Database>(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const service = createClient<Database>(url, env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  checks.push(await runCheck("Supabase URL is valid", async () => {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error("Supabase URL must use https.");
  }));

  checks.push(await runCheck("anon client can connect", async () => {
    const { error } = await anon.from("categories").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw new Error(error.message);
  }));

  checks.push(await runCheck("service-role client can connect", async () => {
    const { error } = await service.from("categories").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw new Error(error.message);
  }));

  for (const [table, columns] of tableChecks) {
    checks.push(await runCheck(`schema columns: ${table}`, async () => {
      const { error } = await service.from(table).select(columns, { head: true }).limit(1);
      if (error) throw new Error(error.message);
    }));
  }

  for (const [table] of tableChecks) {
    checks.push(await runCheck(`public read policy: ${table}`, async () => {
      const { error } = await anon.from(table).select("id", { head: true, count: "exact" }).limit(1);
      if (error) throw new Error(error.message);
    }));
  }

  checks.push(await runCheck("anonymous writes blocked by RLS", async () => {
      const response = await fetch(`${url}/rest/v1/categories`, {
        method: "POST",
        headers: {
          apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: "{}"
      });
      const text = await response.text();
      const denied = response.status === 401 || response.status === 403 || text.includes("42501") || text.toLowerCase().includes("row-level security");
      if (!denied) throw new Error("Anonymous insert was not blocked by RLS before constraint validation.");
  }));

  console.table(checks);
  if (checks.some((check) => !check.ok)) process.exitCode = 1;
}

main().catch((error) => {
  logger.error("supabase_verify_failed", { check: "unhandled", detail: error instanceof Error ? maskDetail(error.message) : "Unknown failure" });
  console.error(error instanceof Error ? error.message : "Supabase verification failed.");
  process.exitCode = 1;
});
