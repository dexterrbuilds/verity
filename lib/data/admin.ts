import { getDataSet, getInsights, platformStats } from "@/lib/data/source";

export async function getAdminData() {
  const data = await getDataSet();
  return {
    ...data,
    insights: await getInsights(),
    stats: platformStats(data)
  };
}
