import "server-only";

import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { adminConfigIssue, env } from "@/lib/env";
import { logger } from "@/lib/logger";

const COOKIE_NAME = "verity_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const MAX_LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 1000 * 60 * 10;

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(value: string) {
  return createHmac("sha256", env.SESSION_SECRET!).update(value).digest("hex");
}

async function loginKey() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "local";
}

export async function isLoginRateLimited() {
  const key = await loginKey();
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  record.count += 1;
  if (record.count > MAX_LOGIN_ATTEMPTS) logger.warn("admin_login_rate_limited", { key });
  return record.count > MAX_LOGIN_ATTEMPTS;
}

export async function clearLoginAttempts() {
  loginAttempts.delete(await loginKey());
}

export function verifyPassword(password: string) {
  if (adminConfigIssue()) return false;
  return safeEqual(env.ADMIN_PASSWORD!, password);
}

export async function createAdminSession() {
  const issuedAt = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const payload = `${issuedAt}.${nonce}`;
  const token = `${payload}.${sign(payload)}`;
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
  if (adminConfigIssue()) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [issuedAt, nonce, signature] = token.split(".");
  if (!issuedAt || !nonce || !signature) return false;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_MS) return false;
  return safeEqual(sign(`${issuedAt}.${nonce}`), signature);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return { ok: false as const, message: "Unauthorized admin action." };
  }
  return null;
}
