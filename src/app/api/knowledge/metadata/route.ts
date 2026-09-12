import { NextResponse } from "next/server";
import { getKnowledgeMetadata } from "@/lib/knowledge/catalog";

export async function GET() {
  return NextResponse.json(
    { success: true, strands: getKnowledgeMetadata() },
    { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } }
  );
}