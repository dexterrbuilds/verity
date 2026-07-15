import { z } from "zod";

const slugSchema = z.string().min(2).regex(/^[a-z0-9-]+$/);
const probabilitySchema = z.coerce.number().finite().min(0).max(100);
const nonNegativeNumberSchema = z.coerce.number().finite().min(0);
const nonNegativeIntegerSchema = z.coerce.number().int().min(0);
const dateSchema = z.string().refine((value) => Number.isFinite(Date.parse(value)), "Use a valid date.");

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required")
});

export const forecasterSchema = z.object({
  displayName: z.string().min(2),
  slug: slugSchema,
  walletAddress: z.string().min(4),
  xHandle: z.string().optional(),
  bio: z.string().min(10),
  strongestDomain: z.string().min(2)
});

export const editForecasterSchema = forecasterSchema.extend({
  id: z.string().min(1)
});

export const marketSchema = z.object({
  question: z.string().min(12),
  slug: slugSchema,
  currentProbability: probabilitySchema,
  previousProbability: probabilitySchema,
  volume: nonNegativeNumberSchema,
  participantCount: nonNegativeIntegerSchema,
  resolutionDate: dateSchema,
  resolutionStatus: z.enum(["active", "resolved", "cancelled"]),
  resolutionOutcome: z.enum(["yes", "no"]).optional().or(z.literal("")),
  resolutionRules: z.string().min(10)
}).refine((value) => value.resolutionStatus !== "resolved" || value.resolutionOutcome === "yes" || value.resolutionOutcome === "no", {
  message: "Resolved markets require a yes/no outcome.",
  path: ["resolutionOutcome"]
});

export const editMarketSchema = marketSchema.extend({
  id: z.string().min(1)
});

export const resolveMarketSchema = z.object({
  id: z.string().min(1),
  resolutionStatus: z.enum(["resolved", "cancelled"]),
  resolutionOutcome: z.enum(["yes", "no"]).optional().or(z.literal(""))
}).refine((value) => value.resolutionStatus !== "resolved" || value.resolutionOutcome === "yes" || value.resolutionOutcome === "no", {
  message: "Resolved markets require a yes/no outcome.",
  path: ["resolutionOutcome"]
});

export const forecastSchema = z.object({
  forecasterId: z.string().min(1),
  marketId: z.string().min(1),
  predictedProbability: probabilitySchema,
  confidence: probabilitySchema,
  position: z.enum(["yes", "no", "neutral"]),
  forecastedAt: dateSchema,
  reasoning: z.string().min(8)
});

export const editForecastSchema = forecastSchema.extend({
  id: z.string().min(1)
});

export const markForecastSchema = z.object({
  id: z.string().min(1),
  wasCorrect: z.enum(["true", "false"])
});

export const protocolSchema = z.object({
  name: z.string().min(2),
  slug: slugSchema,
  websiteUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().min(8)
});

export const editProtocolSchema = protocolSchema.extend({
  id: z.string().min(1)
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: slugSchema,
  description: z.string().min(8)
});

export const editCategorySchema = categorySchema.extend({
  id: z.string().min(1)
});

export const insightSchema = z.object({
  title: z.string().min(4),
  body: z.string().min(10),
  category: z.string().min(2),
  isFeatured: z.enum(["on", "true"]).optional()
});

export const editInsightSchema = insightSchema.extend({
  id: z.string().min(1)
});
