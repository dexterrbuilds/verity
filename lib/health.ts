import type { DataMode } from "@/lib/data/mode";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export type HealthResult = {
  status: HealthStatus;
  mode: DataMode | "misconfigured";
  database: boolean;
  timestamp: string;
};

export async function evaluateHealth(mode: DataMode, checkDatabase?: () => Promise<boolean>): Promise<HealthResult> {
  const timestamp = new Date().toISOString();
  if (mode === "demo") {
    return { status: "healthy", mode, database: false, timestamp };
  }

  const database = checkDatabase ? await checkDatabase() : false;
  return {
    status: database ? "healthy" : "degraded",
    mode,
    database,
    timestamp
  };
}

export function unhealthyHealth(): HealthResult {
  return {
    status: "unhealthy",
    mode: "misconfigured",
    database: false,
    timestamp: new Date().toISOString()
  };
}
