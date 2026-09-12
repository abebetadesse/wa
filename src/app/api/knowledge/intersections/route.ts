import { NextRequest, NextResponse } from "next/server";
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import { enrichStrandResultsWithPubMed } from "@/lib/knowledge/pubmedEnrichment";
import { KnowledgeStrandType, StrandFinding, UserProfile } from "@/lib/knowledge/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "fever and fatigue";
    const region = searchParams.get("region") || "Addis Ababa";
    const userProfile: UserProfile = { location: { region, altitude: 2400 } };

    const strandResults = {} as Record<KnowledgeStrandType, StrandFinding[]>;
    for (const [name, strand] of Object.entries(globalOrchestrator.strands) as [KnowledgeStrandType, typeof globalOrchestrator.strands[KnowledgeStrandType]][]) {
      strandResults[name] = await strand.query(query, userProfile);
    }

    const enrichedStrandResults = await enrichStrandResultsWithPubMed(strandResults);
    const intersections = globalOrchestrator.integrationEngine.findIntersections(enrichedStrandResults, userProfile);

    return NextResponse.json({
      success: true,
      data: {
        query,
        intersections,
        count: intersections.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Intersections API error:", error);
    return NextResponse.json({ success: false, error: "Failed to compute cross-strand intersections" }, { status: 500 });
  }
}
