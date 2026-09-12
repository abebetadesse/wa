import { NextRequest, NextResponse } from "next/server";
import { getLiteratureFetcher, getLiteratureForStrand } from "@/lib/literature/literatureFetcher";
import { db } from "@/lib/db";
import { literatureFindings, literatureSyncLog } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { KnowledgeStrandType } from "@/lib/knowledge/types";

// ─── POST /api/literature/sync — Manual trigger ───────────────────────────────
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sync-secret");
  const expectedSecret = process.env.LITERATURE_SYNC_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: "LITERATURE_SYNC_SECRET not configured" }, { status: 500 });
  }
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let strands: KnowledgeStrandType[] | undefined;
  try {
    const body = await req.json();
    strands = body?.strands;
  } catch {
    // No body — fetches all strands
  }

  console.log("[API] Manual literature sync triggered", { strands });

  // Fire-and-forget — respond immediately with 202 Accepted
  const fetcher = getLiteratureFetcher();
  fetcher.triggerManual(strands).catch((err) =>
    console.error("[API] Literature sync error:", err)
  );

  return NextResponse.json(
    { success: true, message: "Literature sync started in background", strands: strands ?? "all" },
    { status: 202 }
  );
}

// ─── GET /api/literature/sync — Status & latest findings ─────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const strand = searchParams.get("strand") as KnowledgeStrandType | null;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
  const offset = (page - 1) * limit;
  const enrichKeywords = searchParams.get("keywords");

  // ── Enrichment mode: ?strand=X&keywords=malaria,fever ──────────────────────
  if (strand && enrichKeywords) {
    const keywords = enrichKeywords.split(",").map((k) => k.trim());
    const enrichments = await getLiteratureForStrand(strand, keywords);
    return NextResponse.json({ strand, keywords, enrichments });
  }

  try {
    // Last 5 sync runs
    const recentSyncs = await db
      .select()
      .from(literatureSyncLog)
      .orderBy(desc(literatureSyncLog.startedAt))
      .limit(5);

    // Article counts by strand
    const strandCounts = await db
      .select({
        strand: literatureFindings.strand,
        count: sql<number>`count(*)::int`,
        avgRelevance: sql<number>`round(avg(relevance_score)::numeric, 3)`,
      })
      .from(literatureFindings)
      .where(eq(literatureFindings.isActive, 1))
      .groupBy(literatureFindings.strand)
      .orderBy(sql`count(*) DESC`);

    // Newest articles — optionally filtered by strand
    const baseConditions = strand
      ? and(eq(literatureFindings.strand, strand), eq(literatureFindings.isActive, 1))
      : eq(literatureFindings.isActive, 1);

    const newest = await db
      .select({
        id: literatureFindings.id,
        pmid: literatureFindings.pmid,
        doi: literatureFindings.doi,
        title: literatureFindings.title,
        journal: literatureFindings.journal,
        pubDate: literatureFindings.pubDate,
        strand: literatureFindings.strand,
        source: literatureFindings.source,
        relevanceScore: literatureFindings.relevanceScore,
        citationCount: literatureFindings.citationCount,
        fetchedAt: literatureFindings.fetchedAt,
        extractedData: literatureFindings.extractedData,
        keywords: literatureFindings.keywords,
      })
      .from(literatureFindings)
      .where(baseConditions)
      .orderBy(desc(literatureFindings.fetchedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      status: "ok",
      lastSync: recentSyncs[0] ?? null,
      recentSyncs,
      strandCounts,
      totalArticles: strandCounts.reduce((s, r) => s + r.count, 0),
      articles: newest,
      pagination: { page, limit, strand },
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        hint: "Run `npm run db:push` to create the literature_findings table",
      },
      { status: 500 }
    );
  }
}
