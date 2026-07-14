import { categories, forecasts, forecasters, insights, markets, probabilityHistory, protocols } from "../lib/data/seed";

console.table({
  forecasters: forecasters.length,
  protocols: protocols.length,
  categories: categories.length,
  markets: markets.length,
  forecasts: forecasts.length,
  probabilityHistory: probabilityHistory.length,
  insights: insights.length
});
