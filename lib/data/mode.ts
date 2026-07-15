import { env } from "@/lib/env";

export type DataMode = "demo" | "connected";
type ModeInput = {
  nodeEnv: string | undefined;
  vercelEnv?: string;
  requestedMode?: DataMode;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  serviceRoleKey?: string;
};

export function getModeError() {
  return resolveDataMode({
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    requestedMode: env.NEXT_PUBLIC_DATA_MODE,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  }).error;
}

export function assertValidDataMode() {
  const issue = getModeError();
  if (issue) throw new Error(`Verity configuration error: ${issue}`);
}

export function getDataMode(): DataMode {
  assertValidDataMode();
  return resolveDataMode({
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    requestedMode: env.NEXT_PUBLIC_DATA_MODE,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  }).mode;
}

export function isDemoMode() {
  return getDataMode() === "demo";
}

export function isConnectedMode() {
  return getDataMode() === "connected";
}

export function getModeDisclosure() {
  return isDemoMode()
    ? "Verity is currently showing fictional demonstration data."
    : "Verity is in early access. Market and forecast data may currently be manually curated.";
}

export function resolveDataMode(input: ModeInput): { mode: DataMode; error: string | null } {
  const complete = Boolean(input.supabaseUrl && input.supabaseAnonKey && input.serviceRoleKey);
  const partial = Boolean(input.supabaseUrl || input.supabaseAnonKey || input.serviceRoleKey);
  const productionDeployment = input.nodeEnv === "production" && input.vercelEnv === "production";

  if (productionDeployment) {
    if (input.requestedMode === "demo") return { mode: "connected", error: "Production deployments cannot run in demo mode." };
    if (!complete) {
      return { mode: "connected", error: partial ? "Production Supabase configuration is incomplete." : "Production requires complete Supabase configuration." };
    }
  }

  if (input.requestedMode === "demo") return { mode: "demo", error: null };
  if (input.requestedMode === "connected") {
    if (!input.supabaseUrl) return { mode: "connected", error: "NEXT_PUBLIC_SUPABASE_URL is required for connected mode." };
    if (!input.supabaseAnonKey || input.supabaseAnonKey.length < 20) {
      return { mode: "connected", error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or too short for connected mode." };
    }
    if (!input.serviceRoleKey || input.serviceRoleKey.length < 20) {
      return { mode: "connected", error: "SUPABASE_SERVICE_ROLE_KEY is missing or too short for connected mode." };
    }
    return { mode: "connected", error: null };
  }

  return { mode: complete ? "connected" : "demo", error: null };
}
