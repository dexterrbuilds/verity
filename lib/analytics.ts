type AnalyticsEvent =
  | "market_viewed"
  | "forecaster_viewed"
  | "leaderboard_filtered"
  | "market_searched"
  | "forecaster_searched"
  | "source_market_clicked";

export function trackEvent(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) {
  if (process.env.NODE_ENV === "development") {
    console.info("[verity analytics]", event, properties);
  }
}
