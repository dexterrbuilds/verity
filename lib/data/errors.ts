import { logger } from "@/lib/logger";

export class DataAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataAccessError";
  }
}

export function throwDataError(context: string, error: { message?: string } | null | undefined): never {
  logger.error("supabase_read_failed", {
    context,
    message: error?.message ?? null
  });
  throw new DataAccessError(`${context}${error?.message ? `: ${error.message}` : ""}`);
}
