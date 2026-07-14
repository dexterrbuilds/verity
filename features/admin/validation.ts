import { z } from "zod";

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required")
});

export const forecasterSchema = z.object({
  displayName: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
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
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  currentProbability: z.coerce.number().min(0).max(100),
  previousProbability: z.coerce.number().min(0).max(100),
  volume: z.coerce.number().min(0),
  participantCount: z.coerce.number().min(0),
  resolutionDate: z.string().min(8),
  resolutionStatus: z.enum(["active", "resolved", "cancelled"]),
  resolutionRules: z.string().min(10)
});

export const editMarketSchema = marketSchema.extend({
  id: z.string().min(1)
});

export const resolveMarketSchema = z.object({
  id: z.string().min(1),
  resolutionStatus: z.enum(["resolved", "cancelled"]),
  resolutionOutcome: z.enum(["yes", "no", "neutral"]).optional()
});

export const forecastSchema = z.object({
  forecasterId: z.string().min(1),
  marketId: z.string().min(1),
  predictedProbability: z.coerce.number().min(0).max(100),
  confidence: z.coerce.number().min(0).max(100),
  position: z.enum(["yes", "no", "neutral"]),
  reasoning: z.string().min(8)
});

export const markForecastSchema = z.object({
  id: z.string().min(1),
  wasCorrect: z.enum(["true", "false"])
});

export const protocolSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().min(8)
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(8)
});

export const insightSchema = z.object({
  title: z.string().min(4),
  body: z.string().min(10),
  category: z.string().min(2),
  isFeatured: z.enum(["on", "true"]).optional()
});
