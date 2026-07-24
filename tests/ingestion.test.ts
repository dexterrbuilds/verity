import assert from "node:assert/strict";
import test from "node:test";
import { normalizeHistoryPoint, normalizeOutcome, normalizeStatus, toProbabilityPercent } from "@/lib/ingestion/normalize/market";
import { slugify } from "@/lib/ingestion/normalize/slug";
import { addCounts, countUpsertIntent, emptyCounts } from "@/lib/ingestion/sync/counts";

test("slug generation is lowercase and stable", () => {
  assert.equal(slugify("Will SOL hit $250 by Q4?"), "will-sol-hit-250-by-q4");
  assert.equal(slugify("  Multiple --- Separators "), "multiple-separators");
});

test("probability normalization accepts decimals and percentages", () => {
  assert.equal(toProbabilityPercent(0.63), 63);
  assert.equal(toProbabilityPercent("64.5"), 64.5);
});

test("probability normalization rejects invalid values", () => {
  assert.throws(() => toProbabilityPercent(101), RangeError);
  assert.throws(() => toProbabilityPercent("nope"), TypeError);
});

test("status normalization separates active, resolved, and cancelled markets", () => {
  assert.equal(normalizeStatus({ active: true, closed: false, resolvedOutcome: null }), "active");
  assert.equal(normalizeStatus({ closed: true, resolvedOutcome: "yes" }), "resolved");
  assert.equal(normalizeStatus({ closed: true, resolvedOutcome: null }), "cancelled");
  assert.equal(normalizeStatus({ archived: true, resolvedOutcome: "yes" }), "cancelled");
});

test("outcome normalization maps common yes/no provider values", () => {
  assert.equal(normalizeOutcome("YES"), "yes");
  assert.equal(normalizeOutcome("false"), "no");
  assert.equal(normalizeOutcome("unknown"), null);
});

test("history normalization converts probability and timestamp", () => {
  const point = normalizeHistoryPoint({
    provider: "polymarket",
    providerMarketId: "123",
    probability: 0.42,
    recordedAt: "2026-07-23T12:00:00Z"
  });
  assert.equal(point.probability, 42);
  assert.equal(point.recordedAt, "2026-07-23T12:00:00.000Z");
});

test("duplicate upsert intent counts inserts, updates, and skips", () => {
  assert.deepEqual(countUpsertIntent(new Set(["a"]), ["a", "b", "b", ""]), {
    inserted: 1,
    updated: 1,
    skipped: 2,
    failed: 0
  });
});

test("provider failure counts can be accumulated independently", () => {
  assert.deepEqual(addCounts(emptyCounts(), { inserted: 0, updated: 0, skipped: 0, failed: 1 }), {
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 1
  });
});
