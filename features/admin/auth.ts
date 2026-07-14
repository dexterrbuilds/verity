import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env, hasAdminConfig } from "@/lib/env";

const COOKIE_NAME = "verity_admin_session";

function sign(value: string) {
  return createHmac("sha256", env.SESSION_SECRET || "dev-secret-not-for-production").update(value).digest("hex");
}

export function verifyPassword(password: string) {
  if (!hasAdminConfig()) return false;
  const expected = Buffer.from(env.ADMIN_PASSWORD!);
  const provided = Buffer.from(password);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function createAdminSession() {
  const issuedAt = Date.now().toString();
  const token = `${issuedAt}.${sign(issuedAt)}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  if (!hasAdminConfig()) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age > 1000 * 60 * 60 * 8) return false;
  return sign(issuedAt) === signature;
}
