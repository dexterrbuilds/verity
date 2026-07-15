export type ResolutionStatus = "active" | "resolved" | "cancelled";
export type ForecastPosition = "yes" | "no" | "neutral";
export type DataOrigin = "demo" | "manually_curated" | "integrated";
export type VerificationStatus = "unverified" | "source_checked" | "protocol_verified";
export type ProfileStatus = "unclaimed" | "claimed";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  dataOrigin: DataOrigin;
  verificationStatus: VerificationStatus;
};

export type Protocol = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  dataOrigin: DataOrigin;
  verificationStatus: VerificationStatus;
};

export type Market = {
  id: string;
  protocolId: string;
  categoryId: string;
  slug: string;
  question: string;
  description: string;
  sourceUrl: string;
  currentProbability: number;
  previousProbability: number;
  volume: number;
  participantCount: number;
  resolutionDate: string;
  resolutionStatus: ResolutionStatus;
  resolutionOutcome: "yes" | "no" | null;
  resolutionRules: string;
  dataOrigin: DataOrigin;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
};

export type Forecaster = {
  id: string;
  slug: string;
  displayName: string;
  walletAddress: string;
  xHandle: string;
  avatarUrl: string;
  bio: string;
  joinedAt: string;
  isVerified: boolean;
  strongestDomain: string;
  dataOrigin: DataOrigin;
  verificationStatus: VerificationStatus;
  profileStatus: ProfileStatus;
};

export type Forecast = {
  id: string;
  forecasterId: string;
  marketId: string;
  predictedProbability: number;
  confidence: number;
  position: ForecastPosition;
  reasoning: string;
  forecastedAt: string;
  isResolved: boolean;
  wasCorrect: boolean | null;
  scoreImpact: number;
  dataOrigin: DataOrigin;
  verificationStatus: VerificationStatus;
};

export type ProbabilityPoint = {
  id: string;
  marketId: string;
  probability: number;
  recordedAt: string;
};

export type Insight = {
  id: string;
  title: string;
  body: string;
  category: string;
  isFeatured: boolean;
  publishedAt: string;
  dataOrigin: DataOrigin;
  verificationStatus: VerificationStatus;
};

export type ForecasterMetrics = {
  forecasterId: string;
  verityScore: number;
  accuracy: number;
  calibration: number;
  consistency: number;
  experience: number;
  recentPerformance: number;
  totalForecasts: number;
  resolvedForecasts: number;
  currentStreak: number;
  rank: number;
  categoryAccuracy: Record<string, number>;
  trend: number[];
};

export type MarketConviction = {
  averageTrackedForecast: number;
  reputationWeightedForecast: number;
  highestConfidencePosition: ForecastPosition;
  bullishShare: number;
  bearishShare: number;
  trackedForecasterCount: number;
};

export type EnrichedMarket = Market & {
  category?: Category;
  protocol?: Protocol;
  conviction: MarketConviction;
};

export type EnrichedForecaster = Forecaster & {
  metrics?: ForecasterMetrics;
  forecasts: Forecast[];
};

export type PlatformStats = {
  totalForecasters: number;
  totalMarkets: number;
  activeMarkets: number;
  resolvedMarkets: number;
  totalForecasts: number;
  resolvedForecasts: number;
  averageAccuracy: number;
};

export type ResolvedForecastSummary = {
  forecast: Forecast;
  forecaster: Forecaster;
  market: Market;
};
