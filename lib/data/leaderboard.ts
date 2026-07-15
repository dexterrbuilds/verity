import { getDataSet, getMetrics } from "@/lib/data/source";

export async function getLeaderboard(domain = "overall") {
  const data = await getDataSet();
  const rows = getMetrics(data).sort((a, b) => {
    if (domain === "overall") return a.rank - b.rank;
    const label = data.categories.find((category) => category.slug === domain)?.name ?? "Overall";
    return (b.categoryAccuracy[label] ?? 0) - (a.categoryAccuracy[label] ?? 0);
  });
  return { data, rows };
}
