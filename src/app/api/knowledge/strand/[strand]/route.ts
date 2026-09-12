import { NextRequest, NextResponse } from "next/server";
import { isKnowledgeStrand, knowledgeCatalog, searchKnowledge } from "@/lib/knowledge/catalog";
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import { enrichFindingsWithPubMed } from "@/lib/knowledge/pubmedEnrichment";
import { KnowledgeStrandType, UserProfile } from "@/lib/knowledge/types";

interface RouteParams {
  params: Promise<{ strand: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { strand } = await params;
    const { searchParams } = new URL(request.url);
    const queryParam = searchParams.get("query");
    const category = searchParams.get("category");
    const query = queryParam || "general";
    const region = searchParams.get("region") || "Addis Ababa";
    const altitude = Number(searchParams.get("altitude")) || 2400;

    if (isKnowledgeStrand(strand) && knowledgeCatalog[strand].categories.length > 0) {
      const document = knowledgeCatalog[strand];
      if (category) {
        const categoryData = document.categories.find((item) => item.id === category);
        if (!categoryData) {
          return NextResponse.json(
            { success: false, error: `Category not found: ${category} in ${strand} strand` },
            { status: 404 }
          );
        }
        if (!queryParam) {
          return NextResponse.json(
            { success: true, strand, data: categoryData },
            { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } }
          );
        }
      }

      const results = searchKnowledge(query, [strand]).filter(
        (item) => !category || item.category === category
      );
      return NextResponse.json(
        { success: true, strand, query: queryParam, results, count: results.length },
        { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } }
      );
    }

    const strandInstance = globalOrchestrator.strands[strand as KnowledgeStrandType];
    if (!strandInstance) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown knowledge strand: '${strand}'. Valid strands: ${Object.keys(globalOrchestrator.strands).join(", ")}`,
        },
        { status: 404 }
      );
    }

    const mockProfile: UserProfile = {
      location: { region, altitude },
    };

    const findings = await strandInstance.query(query, mockProfile);
    const enrichedFindings = await enrichFindingsWithPubMed(findings);

    return NextResponse.json({
      success: true,
      data: {
        strand,
        query,
        findings: enrichedFindings,
        count: enrichedFindings.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Knowledge strand query error:", error);
    return NextResponse.json({ success: false, error: "Failed to query knowledge strand" }, { status: 500 });
  }
}
