const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(url: string, init?: RequestInit, retries = 2): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          "User-Agent": "Verity-Market-Ingestion/1.0",
          ...init?.headers
        }
      });
      if (!response.ok) {
        const message = `HTTP ${response.status} from ${new URL(url).hostname}`;
        if (TRANSIENT_STATUSES.has(response.status) && attempt < retries) {
          lastError = new Error(message);
          await delay(250 * (attempt + 1));
          continue;
        }
        throw new Error(message);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown fetch failure");
      if (attempt < retries) await delay(250 * (attempt + 1));
    }
  }
  throw lastError ?? new Error("Fetch failed.");
}
