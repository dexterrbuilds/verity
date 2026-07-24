import type { ForecastPosition, ResolutionStatus } from "@/types";

export type ExternalCategory = {
  id: string;
  name: string;
  slug?: string;
};

export type ExternalMarketStatus = ResolutionStatus;

export type ExternalMarket = {
  provider: string;
  providerMarketId: string;
  title: string;
  slug: string;
  category?: ExternalCategory;
  description?: string;
  sourceUrl?: string;
  imageUrl?: string;
  tags: string[];
  endDate?: string;
  probability: number;
  liquidity?: number;
  volume?: number;
  status: ExternalMarketStatus;
  resolutionOutcome: ForecastPosition | null;
  resolutionRules?: string;
  lastSyncedAt: string;
  history?: ExternalProbabilityPoint[];
};

export type ExternalProbabilityPoint = {
  provider: string;
  providerMarketId: string;
  probability: number;
  recordedAt: string;
};

export type MarketProvider = {
  id: string;
  name: string;
  fetchMarkets(): Promise<ExternalMarket[]>;
  fetchMarket(id: string): Promise<ExternalMarket>;
  fetchCategories(): Promise<ExternalCategory[]>;
  supportsHistory: boolean;
  supportsResolution: boolean;
};

export type SyncCounts = {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
};

export type ProviderSyncResult = SyncCounts & {
  provider: string;
  errors: string[];
};

export type SyncResult = SyncCounts & {
  providers: ProviderSyncResult[];
};
