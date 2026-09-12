import { NextResponse } from "next/server";
import { KNOWLEDGE_STRANDS, knowledgeCatalog } from "@/lib/knowledge/catalog";

export async function GET() {
  return NextResponse.json({
    success: true,
    strands: KNOWLEDGE_STRANDS,
    total_categories: KNOWLEDGE_STRANDS.reduce(
      (sum, strand) => sum + knowledgeCatalog[strand].categories.length,
      0
    ),
    data: knowledgeCatalog,
  }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}