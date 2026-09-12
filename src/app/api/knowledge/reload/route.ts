import { NextResponse } from "next/server";
import { getKnowledgeMetadata, invalidateKnowledgeSearchCache } from "@/lib/knowledge/catalog";

export async function POST() {
  invalidateKnowledgeSearchCache();
  return NextResponse.json({
    success: true,
    message: "Reloaded in-memory knowledge catalog and cleared search cache",
    strands: getKnowledgeMetadata(),
  });
}