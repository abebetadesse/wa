import { NextResponse } from "next/server";
import { isBionicConfigured } from "@/lib/ai/bionicGPT";
import { createTrustSnapshot } from "@/lib/platform/enhancementCatalog";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: createTrustSnapshot({ aiConfigured: isBionicConfigured() }),
  }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
