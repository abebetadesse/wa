import { NextRequest, NextResponse } from "next/server";
import { CausalInferenceEngine } from "@/lib/knowledge/ai/causalInference";
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import { enrichStrandResultsWithPubMed } from "@/lib/knowledge/pubmedEnrichment";
import { KnowledgeStrandType, StrandFinding, UserProfile } from "@/lib/knowledge/types";

const causalEngine = new CausalInferenceEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body.query === "string" ? body.query.trim() : "malaria fever";
    const userProfile: UserProfile = body.userProfile || { location: { region: "Addis Ababa", altitude: 2400 } };

    const strandResults = {} as Record<KnowledgeStrandType, StrandFinding[]>;
    for (const [name, strand] of Object.entries(globalOrchestrator.strands) as [KnowledgeStrandType, typeof globalOrchestrator.strands[KnowledgeStrandType]][]) {
      strandResults[name] = await strand.query(query, userProfile);
    }

    const enrichedStrandResults = await enrichStrandResultsWithPubMed(strandResults);
    const allFindings = Object.values(enrichedStrandResults).flat();
    const pathways = causalEngine.buildCausalPathways(query, allFindings, userProfile);

    return NextResponse.json({
      success: true,
      data: {
        query,
        pathways,
        count: pathways.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Causal pathway API error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate causal pathways" }, { status: 500 });
  }
}
