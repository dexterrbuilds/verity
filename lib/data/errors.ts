export class DataAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataAccessError";
  }
}

export function throwDataError(context: string, error: { message?: string } | null | undefined): never {
  throw new DataAccessError(`${context}${error?.message ? `: ${error.message}` : ""}`);
}
