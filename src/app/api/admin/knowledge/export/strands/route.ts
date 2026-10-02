import { NextResponse } from "next/server";
import { SYSTEM_KNOWLEDGE_STRANDS, exportStrandsToJson, exportStrandsToCsv } from "@/lib/hexacore/HexacoreVisionEngine";
import { db } from "@/lib/db";
import { knowledgeStrands, knowledgeCategories } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "json";

    // Attempt to merge with any custom DB strands if available
    let dbStrands: any[] = [];
    try {
      dbStrands = await db.select().from(knowledgeStrands);
    } catch {
      // Graceful fallback if DB is unseeded/offline
    }

    if (format === "csv") {
      const csvData = exportStrandsToCsv();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="available-strands-export.csv"',
        },
      });
    }

    // Default JSON
    const mergedStrands = SYSTEM_KNOWLEDGE_STRANDS.map((sys) => {
      const matchedDb = dbStrands.find((d) => d.name.toLowerCase() === sys.name.toLowerCase());
      return {
        ...sys,
        dbId: matchedDb ? matchedDb.id : undefined,
        persistedInDb: Boolean(matchedDb),
      };
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      endpoint: "http://localhost:5500/admin/knowledge",
      totalStrands: SYSTEM_KNOWLEDGE_STRANDS.length,
      domains: {
        domainA_Scientific: SYSTEM_KNOWLEDGE_STRANDS.filter((s) => s.domain === "A").length,
        domainB_Cultural: SYSTEM_KNOWLEDGE_STRANDS.filter((s) => s.domain === "B").length,
      },
      strands: mergedStrands,
    };

    if (url.searchParams.get("download") === "true") {
      return new NextResponse(JSON.stringify(exportPayload, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="available-strands-export.json"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: exportPayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export strands." },
      { status: 500 }
    );
  }
}
