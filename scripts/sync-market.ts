import { syncMarket } from "@/lib/ingestion/sync/markets";

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: npm run sync:market -- <provider-market-id>");
    process.exit(1);
  }

  const result = await syncMarket(id);
  console.log(JSON.stringify(result, null, 2));
  if (result.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Market sync failed.");
  process.exitCode = 1;
});
