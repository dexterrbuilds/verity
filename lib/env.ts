import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),
  ADMIN_PASSWORD: z.string().min(8).optional().or(z.literal("")),
  SESSION_SECRET: z.string().min(32).optional().or(z.literal("")),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_DATA_MODE: z.enum(["demo", "connected"]).optional()
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE
});

export function hasSupabaseConfig() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasAdminConfig() {
  return Boolean(env.ADMIN_PASSWORD && env.SESSION_SECRET);
}

export function hasServiceRoleConfig() {
  return Boolean(hasSupabaseConfig() && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function adminConfigIssue() {
  if (!env.ADMIN_PASSWORD) return "ADMIN_PASSWORD is not configured.";
  if (env.ADMIN_PASSWORD.length < 12) return "ADMIN_PASSWORD must be at least 12 characters for admin access.";
  if (!env.SESSION_SECRET) return "SESSION_SECRET is not configured.";
  if (env.SESSION_SECRET.length < 32) return "SESSION_SECRET must be at least 32 characters.";
  return null;
}
