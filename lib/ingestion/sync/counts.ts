import type { SyncCounts } from "@/lib/ingestion/types";

export function emptyCounts(): SyncCounts {
  return { inserted: 0, updated: 0, skipped: 0, failed: 0 };
}

export function addCounts(left: SyncCounts, right: SyncCounts): SyncCounts {
  return {
    inserted: left.inserted + right.inserted,
    updated: left.updated + right.updated,
    skipped: left.skipped + right.skipped,
    failed: left.failed + right.failed
  };
}

export function countUpsertIntent(existingKeys: Set<string>, incomingKeys: string[]): SyncCounts {
  const counts = emptyCounts();
  const seen = new Set<string>();
  for (const key of incomingKeys) {
    if (!key || seen.has(key)) {
      counts.skipped += 1;
      continue;
    }
    seen.add(key);
    if (existingKeys.has(key)) counts.updated += 1;
    else counts.inserted += 1;
  }
  return counts;
}
