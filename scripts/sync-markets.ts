import { syncMarkets } from "@/lib/ingestion/sync/markets";

async function main() {
  const result = await syncMarkets();
  console.log(JSON.stringify(result, null, 2));
  if (result.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Market sync failed.");
  process.exitCode = 1;
});
