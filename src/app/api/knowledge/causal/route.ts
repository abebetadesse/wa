import { NextRequest, NextResponse } from "next/server";
import { CausalInferenceEngine } from "@/lib/knowledge/ai/causalInference";
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import { enrichStrandResultsWithPubMed } from "@/lib/knowledge/pubmedEnrichment";
import { KnowledgeStrandType, StrandFinding, UserProfile } from "@/lib/knowledge/types";

const causalEngine = new CausalInferenceEngine();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) return false;
  if (value.location === undefined) return true;
  if (!isRecord(value.location) || typeof value.location.region !== "string") return false;
  return value.location.altitude === undefined ||
    (typeof value.location.altitude === "number" && Number.isFinite(value.location.altitude));
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Request body must be valid JSON." }, { status: 400 });
    }
    if (!isRecord(body)) {
      return NextResponse.json({ success: false, error: "Request body must be a JSON object." }, { status: 400 });
    }
    const rawQuery = body.query;
    if (typeof rawQuery !== "string" || !rawQuery.trim() || rawQuery.length > 1000) {
      return NextResponse.json({ success: false, error: "A query between 1 and 1000 characters is required." }, { status: 400 });
    }
    const query = rawQuery.trim();
    if (body.userProfile !== undefined && !isUserProfile(body.userProfile)) {
      return NextResponse.json({ success: false, error: "userProfile must be an object with a valid location." }, { status: 400 });
    }
    const userProfile: UserProfile = body.userProfile === undefined
      ? { location: { region: "Addis Ababa", altitude: 2400 } }
      : body.userProfile;

    const strandResults = Object.fromEntries(await Promise.all(
      (Object.entries(globalOrchestrator.strands) as [KnowledgeStrandType, typeof globalOrchestrator.strands[KnowledgeStrandType]][])
        .map(async ([name, strand]) => [name, await strand.query(query, userProfile)] as const)
    )) as Record<KnowledgeStrandType, StrandFinding[]>;

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
