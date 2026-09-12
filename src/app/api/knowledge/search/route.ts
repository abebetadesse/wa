import { NextRequest, NextResponse } from "next/server";
import { KNOWLEDGE_STRANDS, isKnowledgeStrand, searchKnowledge } from "@/lib/knowledge/catalog";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json({ success: false, error: 'Missing "query" field in request body' }, { status: 400 });
    }

    const requestedStrands = Array.isArray(body.strands) ? body.strands : KNOWLEDGE_STRANDS;
    if (requestedStrands.some((strand: unknown) => !isKnowledgeStrand(strand))) {
      return NextResponse.json({ success: false, error: "Invalid strand in request" }, { status: 400 });
    }

    const allResults = searchKnowledge(query, requestedStrands);
    const limit = typeof body.limit === "number" && body.limit >= 0 ? Math.floor(body.limit) : 10;
    return NextResponse.json({
      success: true,
      query,
      results: allResults.slice(0, limit),
      total: allResults.length,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
  }
}