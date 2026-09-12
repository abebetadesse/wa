import { NextRequest, NextResponse } from "next/server";
import { storeKnowledgeDocuments } from "@/lib/knowledge/catalog";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documents = Array.isArray(body) ? body : body?.documents;

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request must contain a non-empty "documents" array' },
        { status: 400 }
      );
    }

    const summary = storeKnowledgeDocuments(documents);
    return NextResponse.json({
      success: true,
      message: `Loaded ${summary.strands.length} knowledge strands atomically`,
      ...summary,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Invalid knowledge batch" },
      { status: 400 }
    );
  }
}
