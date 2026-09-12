import { db } from "@/lib/db";
import { literatureFindings, literatureSyncLog } from "@/lib/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import type { KnowledgeStrandType } from "@/lib/knowledge/types";
import type {
  RawArticle,
  ProcessedFinding,
  FetchCycleSummary,
  LiteratureEnrichment,
} from "./types";
import { STRAND_SEARCH_CONFIGS } from "./strandSearchConfigs";
import { PubMedSource } from "./sources/pubmedSource";
import { EuropePmcSource } from "./sources/europePmcSource";
import { WhoGhoSource } from "./sources/whoGhoSource";
import { OpenAlexSource } from "./sources/openAlexSource";
import { extractStructuredData } from "./processors/abstractExtractor";
import { mapArticleToStrands, deduplicateArticles } from "./processors/strandMapper";
import { llmBatchAugment } from "./processors/llmSummarizer";

// ─── Global singleton to prevent multiple cron registrations ─────────────────
const globalFetcher = globalThis as unknown as {
  _literatureFetcherRunning?: boolean;
};

// ─── Helper: sleep ────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * LiteratureFetcher — Main Orchestrator
 *
 * Fetches peer-reviewed literature from PubMed, Europe PMC, WHO GHO, and OpenAlex
 * for all 11 knowledge strands. Extracts structured data and upserts to PostgreSQL.
 *
 * Cron schedule: configured via LITERATURE_CRON env var (default: daily at 2 AM).
 */
export class LiteratureFetcher {
  private readonly DRY_RUN = process.env.LITERATURE_DRY_RUN === "true";
  private readonly MIN_RELEVANCE = 0.25;
  private readonly MAX_PER_TOPIC = parseInt(process.env.LITERATURE_MAX_PER_TOPIC || "50", 10);
  private readonly STALE_DAYS = parseInt(process.env.LITERATURE_STALE_DAYS || "7", 10);

  private pubmed = new PubMedSource();
  private europePmc = new EuropePmcSource();
  private whoGho = new WhoGhoSource();
  private openAlex = new OpenAlexSource();

  // ─── Public: Manual trigger ─────────────────────────────────────────────────

  async triggerManual(strands?: KnowledgeStrandType[]): Promise<FetchCycleSummary> {
    return this.runFetchCycle(strands, "manual");
  }

  // ─── Public: Start cron (called from Next.js server init or CLI) ───────────

  startCron(): void {
    if (globalFetcher._literatureFetcherRunning) {
      console.log("[LiteratureFetcher] Cron already running, skipping re-registration");
      return;
    }
    globalFetcher._literatureFetcherRunning = true;

    const schedule = process.env.LITERATURE_CRON || "0 2 * * *";
    console.log(`[LiteratureFetcher] Cron registered: ${schedule}`);

    // Dynamic import to avoid bundling node-cron in browser-side code
    import("node-cron").then(({ default: cron }) => {
      cron.schedule(schedule, () => {
        console.log("[LiteratureFetcher] Cron triggered — starting fetch cycle");
        this.runFetchCycle(undefined, "cron").catch((err) =>
          console.error("[LiteratureFetcher] Cron error:", err)
        );
      });
    });
  }

  // ─── Core fetch cycle ────────────────────────────────────────────────────────

  async runFetchCycle(
    targetStrands?: KnowledgeStrandType[],
    triggeredBy: "cron" | "manual" = "cron"
  ): Promise<FetchCycleSummary> {
    const startedAt = new Date().toISOString();
    const summary: FetchCycleSummary = {
      startedAt,
      completedAt: "",
      articlesFound: 0,
      newArticles: 0,
      updated: 0,
      errors: [],
      byStrand: {},
      bySource: {},
    };

    const strands = targetStrands ?? (Object.keys(STRAND_SEARCH_CONFIGS) as KnowledgeStrandType[]);
    console.log(`[LiteratureFetcher] Starting cycle. Strands: ${strands.join(", ")}`);

    // ── Log sync start ──
    let syncLogId: string | undefined;
    if (!this.DRY_RUN) {
      const logRows = await db
        .insert(literatureSyncLog)
        .values({
          startedAt: new Date(),
          triggeredBy,
          articlesFound: 0,
          newArticles: 0,
          updatedArticles: 0,
          errors: [],
          byStrand: {},
          bySource: {},
        })
        .returning({ id: literatureSyncLog.id });
      syncLogId = logRows[0]?.id;
    }

    for (const strand of strands) {
      const config = STRAND_SEARCH_CONFIGS[strand];
      const topics = config.topics ?? config.diseases ?? [];
      summary.byStrand[strand] = { found: 0, new: 0 };

      for (const topic of topics) {
        try {
          await sleep(200); // Be polite between topics

          const rawArticles = await this.fetchAllSources(topic, strand, config, summary);
          const deduplicated = deduplicateArticles(rawArticles);

          // ── Step 1: Map strands + regex extraction ────────────────────────
          const candidates: Array<{
            article: RawArticle;
            bestMapping: { strand: KnowledgeStrandType; score: number; topicMatch: string };
            baseExtracted: import("./types").ExtractedLiteratureData;
          }> = [];

          for (const article of deduplicated) {
            const strandMappings = mapArticleToStrands(article, strand);
            const bestMapping = strandMappings.find((m) => m.strand === strand) ?? strandMappings[0];
            if (!bestMapping || bestMapping.score < this.MIN_RELEVANCE) continue;
            const baseExtracted = extractStructuredData(article, strand);
            candidates.push({ article, bestMapping, baseExtracted });
          }

          // ── Step 2: LLM augmentation (BionicGPT → Gemini fallback) ────────
          let augmentedExtractions = candidates.map((c) => c.baseExtracted);
          if (candidates.length > 0) {
            try {
              augmentedExtractions = await llmBatchAugment(
                candidates.map((c) => ({
                  abstract: c.article.abstract,
                  strand,
                  baseExtracted: c.baseExtracted,
                })),
                2 // concurrency: 2 LLM calls at a time
              );
            } catch (llmErr) {
              console.warn(`[LiteratureFetcher] LLM augmentation skipped: ${(llmErr as Error).message}`);
            }
          }

          // ── Step 3: Upsert enriched findings ──────────────────────────────
          for (let idx = 0; idx < candidates.length; idx++) {
            try {
              const { article, bestMapping } = candidates[idx];
              const extractedData = augmentedExtractions[idx];

              const finding: Omit<ProcessedFinding, never> = {
                pmid: article.pmid,
                doi: article.doi,
                title: article.title,
                abstract: article.abstract,
                authors: article.authors,
                journal: article.journal,
                pubDate: article.pubDate,
                source: article.source,
                strand,
                strandTopicMatch: bestMapping.topicMatch,
                relevanceScore: bestMapping.score,
                extractedData,
                meshTerms: article.meshTerms,
                keywords: article.keywords,
                citationCount: article.citationCount,
              };

              summary.byStrand[strand].found++;
              summary.articlesFound++;

              if (!this.DRY_RUN) {
                const isNew = await this.upsertFinding(finding);
                if (isNew) {
                  summary.newArticles++;
                  summary.byStrand[strand].new++;
                } else {
                  summary.updated++;
                }
              } else {
                const llmSummary = extractedData.key_finding_summary
                  ? ` | LLM: "${extractedData.key_finding_summary.slice(0, 60)}..."`
                  : " | LLM: (not enriched)";
                console.log(
                  `[DRY RUN] ${article.title.slice(0, 55)}... [${strand}] score=${bestMapping.score}${llmSummary}`
                );
              }
            } catch {
              // Skip individual article errors silently
            }
          }
        } catch (topicErr) {
          const errMsg = `[${strand}] topic="${topic}": ${(topicErr as Error).message}`;
          summary.errors.push(errMsg);
          console.warn(`[LiteratureFetcher] ${errMsg}`);
        }
      }

      console.log(
        `[LiteratureFetcher] ${strand}: found=${summary.byStrand[strand].found} new=${summary.byStrand[strand].new}`
      );
    }

    // ── WHO GHO (runs once per cycle, not per strand) ──
    try {
      const ghoArticles = await this.whoGho.fetchIndicators();
      for (const article of ghoArticles) {
        const strand = this.inferStrandFromWhoIndicator(article.keywords);
        const extractedData = extractStructuredData(article, strand);
        if (!this.DRY_RUN) {
          await this.upsertFinding({
            ...article,
            strand,
            strandTopicMatch: "who_gho_indicator",
            relevanceScore: 0.85,
            extractedData,
          });
          summary.newArticles++;
        }
        summary.articlesFound++;
      }
      summary.bySource["who_gho"] = { found: ghoArticles.length, errors: 0 };
    } catch (ghoErr) {
      summary.errors.push(`WHO GHO: ${(ghoErr as Error).message}`);
      summary.bySource["who_gho"] = { found: 0, errors: 1 };
    }

    summary.completedAt = new Date().toISOString();

    // ── Update sync log ──
    if (!this.DRY_RUN && syncLogId) {
      await db
        .update(literatureSyncLog)
        .set({
          completedAt: new Date(),
          articlesFound: summary.articlesFound,
          newArticles: summary.newArticles,
          updatedArticles: summary.updated,
          errors: summary.errors,
          byStrand: summary.byStrand,
          bySource: summary.bySource,
        })
        .where(eq(literatureSyncLog.id, syncLogId));
    }

    console.log(
      `[LiteratureFetcher] Cycle done. Found=${summary.articlesFound} New=${summary.newArticles} Errors=${summary.errors.length}`
    );
    return summary;
  }

  // ─── Fetch from all sources for one topic ────────────────────────────────────

  private async fetchAllSources(
    topic: string,
    strand: KnowledgeStrandType,
    config: (typeof STRAND_SEARCH_CONFIGS)[KnowledgeStrandType],
    summary: FetchCycleSummary
  ): Promise<RawArticle[]> {
    const results = await Promise.allSettled([
      this.pubmed
        .searchArticles(topic, { maxResults: this.MAX_PER_TOPIC, dateRange: config.dateRange, meshTerms: config.meshTerms })
        .then((a) => { this.countSource(summary, "pubmed", a.length, 0); return a; })
        .catch((e) => { this.countSource(summary, "pubmed", 0, 1); throw e; }),

      this.europePmc
        .searchArticles(topic, { maxResults: Math.ceil(this.MAX_PER_TOPIC / 2), dateRange: config.dateRange })
        .then((a) => { this.countSource(summary, "europepmc", a.length, 0); return a; })
        .catch((e) => { this.countSource(summary, "europepmc", 0, 1); throw e; }),

      this.openAlex
        .searchArticles(topic, { maxResults: 20, dateRange: config.dateRange, minCitations: 3 })
        .then((a) => { this.countSource(summary, "openalex", a.length, 0); return a; })
        .catch((e) => { this.countSource(summary, "openalex", 0, 1); throw e; }),
    ]);

    const all: RawArticle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        all.push(...result.value);
      }
    }
    return all;
  }

  private countSource(
    summary: FetchCycleSummary,
    source: string,
    found: number,
    errors: number
  ) {
    if (!summary.bySource[source]) summary.bySource[source] = { found: 0, errors: 0 };
    summary.bySource[source].found += found;
    summary.bySource[source].errors += errors;
  }

  // ─── DB upsert ────────────────────────────────────────────────────────────────

  private async upsertFinding(finding: Omit<ProcessedFinding, never>): Promise<boolean> {
    // Check if already exists and is recent enough
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - this.STALE_DAYS);

    if (finding.pmid) {
      const existing = await db
        .select({ id: literatureFindings.id, fetchedAt: literatureFindings.fetchedAt })
        .from(literatureFindings)
        .where(and(eq(literatureFindings.pmid, finding.pmid), eq(literatureFindings.strand, finding.strand)))
        .limit(1);

      if (existing.length > 0) {
        const fetchedAt = existing[0].fetchedAt;
        if (fetchedAt && fetchedAt > staleThreshold) {
          return false; // Already fresh — skip
        }
        // Update stale record
        await db
          .update(literatureFindings)
          .set({
            extractedData: finding.extractedData as Record<string, unknown>,
            relevanceScore: finding.relevanceScore,
            citationCount: finding.citationCount,
            processedAt: new Date(),
            fetchedAt: new Date(),
          })
          .where(eq(literatureFindings.id, existing[0].id));
        return false;
      }
    }

    // Insert new
    await db.insert(literatureFindings).values({
      pmid: finding.pmid,
      doi: finding.doi,
      title: finding.title,
      abstract: finding.abstract,
      authors: finding.authors,
      journal: finding.journal,
      pubDate: finding.pubDate,
      source: finding.source,
      strand: finding.strand,
      strandTopicMatch: finding.strandTopicMatch,
      relevanceScore: finding.relevanceScore,
      extractedData: finding.extractedData as Record<string, unknown>,
      meshTerms: finding.meshTerms,
      keywords: finding.keywords,
      citationCount: finding.citationCount,
      fetchedAt: new Date(),
      processedAt: new Date(),
      isActive: 1,
    });

    return true;
  }

  // ─── Infer strand from WHO GHO indicator keywords ────────────────────────────

  private inferStrandFromWhoIndicator(keywords: string[]): KnowledgeStrandType {
    const kws = keywords.join(" ").toLowerCase();
    if (kws.includes("malaria") || kws.includes("tb") || kws.includes("hiv") || kws.includes("mortality"))
      return "epidemiological";
    if (kws.includes("nutrition") || kws.includes("stunting") || kws.includes("food"))
      return "dietary";
    if (kws.includes("mental") || kws.includes("suicide")) return "psychological";
    if (kws.includes("water") || kws.includes("sanitation") || kws.includes("expenditure"))
      return "socioeconomic";
    if (kws.includes("birth") || kws.includes("antenatal") || kws.includes("maternal"))
      return "epidemiological";
    return "epidemiological";
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

let _fetcher: LiteratureFetcher | null = null;

export function getLiteratureFetcher(): LiteratureFetcher {
  if (!_fetcher) _fetcher = new LiteratureFetcher();
  return _fetcher;
}

// ─── Enrichment query for strand query() methods ──────────────────────────────

/**
 * Retrieve literature enrichments for a given strand and keyword list.
 * Called from inside each strand's query() method to add live PubMed citations.
 */
export async function getLiteratureForStrand(
  strand: KnowledgeStrandType,
  topKeywords: string[],
  limit = 10
): Promise<LiteratureEnrichment[]> {
  try {
    const rows = await db
      .select({
        pmid: literatureFindings.pmid,
        doi: literatureFindings.doi,
        title: literatureFindings.title,
        journal: literatureFindings.journal,
        pubDate: literatureFindings.pubDate,
        strand: literatureFindings.strand,
        strandTopicMatch: literatureFindings.strandTopicMatch,
        relevanceScore: literatureFindings.relevanceScore,
        extractedData: literatureFindings.extractedData,
        keywords: literatureFindings.keywords,
        citationCount: literatureFindings.citationCount,
      })
      .from(literatureFindings)
      .where(and(eq(literatureFindings.strand, strand), eq(literatureFindings.isActive, 1)))
      .orderBy(sql`relevance_score DESC, citation_count DESC NULLS LAST`)
      .limit(limit * 3); // Fetch more then filter

    // Filter by keyword overlap with query terms
    const scored = rows.map((row) => {
      const kws = (row.keywords ?? []).map((k: string) => k.toLowerCase());
      const overlap = topKeywords.filter((k) => kws.some((kw) => kw.includes(k.toLowerCase())));
      return { row, overlap: overlap.length };
    });

    const filtered = scored
      .filter((s) => s.overlap > 0 || topKeywords.length === 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, limit)
      .map((s) => ({
        pmid: s.row.pmid ?? undefined,
        doi: s.row.doi ?? undefined,
        title: s.row.title,
        journal: s.row.journal ?? "",
        pubDate: s.row.pubDate ?? "",
        strand: s.row.strand as KnowledgeStrandType,
        strandTopicMatch: s.row.strandTopicMatch ?? undefined,
        relevanceScore: s.row.relevanceScore ?? 0,
        extractedData: (s.row.extractedData as import("./types").ExtractedLiteratureData) ?? {},
        keywords: (s.row.keywords as string[]) ?? [],
        citationCount: s.row.citationCount ?? undefined,
      }));

    return filtered;
  } catch {
    // Return empty if DB not available or table doesn't exist yet
    return [];
  }
}
