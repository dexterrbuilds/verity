import { NextRequest, NextResponse } from "next/server";
import { syncMarkets } from "@/lib/ingestion/sync/markets";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.SYNC_SECRET;
  if (!secret || secret.length < 24) return false;
  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const token = bearer || request.nextUrl.searchParams.get("token") || "";
  return token === secret;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    logger.warn("market_sync_unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const result = await syncMarkets();
  return NextResponse.json(result, {
    status: result.failed > 0 ? 207 : 200,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
