import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DataOrigin, ProfileStatus, VerificationStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dataOriginLabel(origin: DataOrigin) {
  if (origin === "demo") return "Demo data";
  if (origin === "integrated") return "Integrated source";
  return "Manually curated";
}

export function verificationLabel(status: VerificationStatus) {
  if (status === "protocol_verified") return "Protocol verified";
  if (status === "source_checked") return "Source checked";
  return "Unverified";
}

export function profileStatusLabel(status: ProfileStatus) {
  return status === "claimed" ? "Claimed profile" : "Unclaimed profile";
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
