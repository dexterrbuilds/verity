import { getDataSet } from "@/lib/data/source";

export async function getCatalogData() {
  const data = await getDataSet();
  return {
    categories: data.categories,
    protocols: data.protocols
  };
}
