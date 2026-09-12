import { NextRequest, NextResponse } from "next/server";
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import { enrichStrandResultsWithPubMed } from "@/lib/knowledge/pubmedEnrichment";
import { KnowledgeStrandType, StrandFinding, UserProfile } from "@/lib/knowledge/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const userProfile: UserProfile = body.userProfile || {};
    const requestedStrands: KnowledgeStrandType[] = Array.isArray(body.strands) ? body.strands : [];

    if (!query || query.length < 2) {
      return NextResponse.json({ success: false, error: "Query must be at least 2 characters." }, { status: 400 });
    }

    const strandNames = requestedStrands.length > 0
      ? requestedStrands
      : (Object.keys(globalOrchestrator.strands) as KnowledgeStrandType[]);

    const results: Record<string, StrandFinding[]> = {};

    await Promise.all(
      strandNames.map(async (strandName) => {
        const strand = globalOrchestrator.strands[strandName];
        if (strand) {
          try {
            results[strandName] = await strand.query(query, userProfile);
          } catch (err) {
            results[strandName] = [];
            console.error(`Error querying strand ${strandName}:`, err);
          }
        }
      })
    );

    const enrichedStrands = await enrichStrandResultsWithPubMed(results);

    return NextResponse.json({
      success: true,
      data: {
        query,
        strands: enrichedStrands,
        totalFindings: Object.values(enrichedStrands).reduce((sum, arr) => sum + arr.length, 0),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Knowledge retrieve error:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve knowledge" }, { status: 500 });
  }
}
