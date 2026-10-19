/**
 * Database full-text search over the knowledge base and the stored literature.
 *
 *   searchLiterature        literature_findings, MATCH(title, abstract) in natural language mode
 *   searchKnowledgeStore    published knowledge_items (MATCH on the generated search_text column),
 *                           falling back to the in-memory catalogue (searchKnowledge) when the
 *                           database is unavailable or holds no matching published item
 *   attachStoredLiterature  stored literature for knowledge findings, in place of live PubMed calls
 *
 * The FULLTEXT indexes use the ngram parser (drizzle-mysql/0007_fulltext.sql), so Amharic and
 * other text without reliable word boundaries is searchable too.
 */
import { and, desc, eq, getTableName, inArray, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { knowledgeCategories, knowledgeItems, knowledgeStrands, literatureFindings } from "@/lib/db/schema";
import type { ExtractedLiteratureData } from "@/lib/literature/types";
import { KNOWLEDGE_STRANDS, isKnowledgeStrand, searchKnowledge, type KnowledgeSearchResult } from "./catalog";
import type { KnowledgeStrandType, PubmedEvidence, StrandFinding } from "./types";

const MAX_QUERY = 300;
/** Findings per strand that get stored literature attached; the rest of a catalogue is not looked up. */
const ENRICHED_PER_STRAND = 5;
const EVIDENCE_PER_FINDING = 3;

/** The search text as sent to MATCH … AGAINST: letters, digits and spaces only, length-capped. */
export function fullTextQuery(text: string): string {
  return text.normalize("NFC").replace(/[^\p{L}\p{M}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY).trim();
}

const against = (columns: SQL, query: string) => sql`MATCH(${columns}) AGAINST (${query} IN NATURAL LANGUAGE MODE)`;

// ── Literature ───────────────────────────────────────────────────────────────

export interface LiteratureHit {
  id: string;
  pmid?: string;
  doi?: string;
  title: string;
  abstract?: string;
  journal?: string;
  pubDate?: string;
  source: string;
  strand: KnowledgeStrandType;
  strandTopicMatch?: string;
  relevanceScore: number;
  citationCount?: number;
  keywords: string[];
  extractedData: ExtractedLiteratureData;
  /** MySQL's full-text score; 0 when no query text was given. */
  score: number;
}

/**
 * Active literature for a query, best match first. Without query text, the strand's most relevant
 * and most cited rows. Throws when the database cannot be reached; callers decide the fallback.
 */
export async function searchLiterature(query: string, options: { strand?: KnowledgeStrandType; limit?: number } = {}): Promise<LiteratureHit[]> {
  const text = fullTextQuery(query);
  const limit = Math.max(1, Math.min(options.limit ?? 10, 50));
  const match = text ? against(sql`${literatureFindings.title}, ${literatureFindings.abstract}`, text) : sql`0`;
  const rows = await db
    .select({
      id: literatureFindings.id,
      pmid: literatureFindings.pmid,
      doi: literatureFindings.doi,
      title: literatureFindings.title,
      abstract: literatureFindings.abstract,
      journal: literatureFindings.journal,
      pubDate: literatureFindings.pubDate,
      source: literatureFindings.source,
      strand: literatureFindings.strand,
      strandTopicMatch: literatureFindings.strandTopicMatch,
      relevanceScore: literatureFindings.relevanceScore,
      citationCount: literatureFindings.citationCount,
      keywords: literatureFindings.keywords,
      extractedData: literatureFindings.extractedData,
      score: sql<number>`${match}`.as("score"),
    })
    .from(literatureFindings)
    .where(and(
      eq(literatureFindings.isActive, 1),
      options.strand ? eq(literatureFindings.strand, options.strand) : undefined,
      text ? sql`${match} > 0` : undefined,
    ))
    // MySQL sorts NULL lowest, so DESC already puts uncited rows last.
    .orderBy(desc(sql`score`), desc(literatureFindings.relevanceScore), desc(literatureFindings.citationCount))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    pmid: row.pmid ?? undefined,
    doi: row.doi ?? undefined,
    title: row.title,
    abstract: row.abstract ?? undefined,
    journal: row.journal ?? undefined,
    pubDate: row.pubDate ?? undefined,
    source: row.source,
    strand: row.strand as KnowledgeStrandType,
    strandTopicMatch: row.strandTopicMatch ?? undefined,
    relevanceScore: row.relevanceScore ?? 0,
    citationCount: row.citationCount ?? undefined,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    extractedData: (row.extractedData ?? {}) as ExtractedLiteratureData,
    score: Number(row.score) || 0,
  }));
}

export function literatureUrl(hit: Pick<LiteratureHit, "pmid" | "doi">): string | undefined {
  if (hit.pmid && /^\d{1,10}$/.test(hit.pmid)) return `https://pubmed.ncbi.nlm.nih.gov/${hit.pmid}/`;
  if (hit.doi) return `https://doi.org/${hit.doi}`;
  return undefined;
}

function hitToEvidence(hit: LiteratureHit): PubmedEvidence {
  return {
    pmid: hit.pmid,
    doi: hit.doi,
    title: hit.title,
    journal: hit.journal,
    pubDate: hit.pubDate,
    abstract: hit.abstract,
    source: hit.source,
    url: literatureUrl(hit),
  };
}

export interface LiteratureDeps {
  search: typeof searchLiterature;
}

/**
 * Stored literature for each finding (its name and category as the search), for the strongest
 * findings of each strand. Findings further down get an empty list. When the database cannot be
 * reached every finding gets an empty list; no outside service is called.
 */
export async function attachStoredLiterature<T extends Record<string, StrandFinding[]>>(
  byStrand: T,
  deps: LiteratureDeps = { search: searchLiterature },
): Promise<T> {
  const entries = Object.entries(byStrand);
  const lookups = entries.flatMap(([strand, findings]) =>
    [...findings]
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .slice(0, ENRICHED_PER_STRAND)
      .map((finding) => ({ strand, finding })),
  );
  const found = new Map<StrandFinding, PubmedEvidence[]>();
  const lookup = async ({ strand, finding }: (typeof lookups)[number]) => {
    const query = `${finding.name} ${finding.category ?? ""}`;
    const hits = await deps.search(query, { strand: isKnowledgeStrand(strand) ? strand : undefined, limit: EVIDENCE_PER_FINDING });
    found.set(finding, hits.map(hitToEvidence));
  };

  try {
    // The first lookup doubles as an availability check, so a database outage costs one attempt.
    if (lookups[0]) await lookup(lookups[0]);
    await Promise.all(lookups.slice(1).map((entry) => lookup(entry).catch(() => undefined)));
  } catch (error) {
    console.warn("[knowledge] stored literature unavailable:", error instanceof Error ? error.message : error);
  }

  return Object.fromEntries(
    entries.map(([strand, findings]) => [strand, findings.map((finding) => ({ ...finding, pubmedEvidence: found.get(finding) ?? [] }))]),
  ) as T;
}

export async function attachStoredLiteratureToFindings(findings: StrandFinding[], deps?: LiteratureDeps): Promise<StrandFinding[]> {
  const { all } = await attachStoredLiterature({ all: findings }, deps);
  return all;
}

// ── Knowledge items ──────────────────────────────────────────────────────────

/** Published knowledge items matching the query, in the shape of the in-memory catalogue search. */
export async function searchKnowledgeItems(query: string, strands: readonly KnowledgeStrandType[] = KNOWLEDGE_STRANDS, limit = 50): Promise<KnowledgeSearchResult[]> {
  const text = fullTextQuery(query);
  if (!text || !strands.length) return [];
  // search_text is a generated column the application never writes, so it is not in the Drizzle schema.
  const searchText = sql`${sql.identifier(getTableName(knowledgeItems))}.${sql.identifier("search_text")}`;
  const match = against(searchText, text);
  const strandName = sql<string>`LOWER(${knowledgeStrands.name})`;
  const rows = await db
    .select({
      id: knowledgeItems.id,
      data: knowledgeItems.data,
      categoryId: knowledgeCategories.id,
      categoryName: knowledgeCategories.name,
      strand: strandName,
      score: sql<number>`${match}`.as("score"),
    })
    .from(knowledgeItems)
    .innerJoin(knowledgeCategories, eq(knowledgeItems.categoryId, knowledgeCategories.id))
    .innerJoin(knowledgeStrands, eq(knowledgeCategories.strandId, knowledgeStrands.id))
    .where(and(
      eq(knowledgeItems.status, "published"),
      eq(knowledgeCategories.isActive, true),
      eq(knowledgeStrands.isActive, true),
      inArray(strandName, [...strands]),
      sql`${match} > 0`,
    ))
    .orderBy(desc(sql`score`))
    .limit(Math.max(1, Math.min(limit, 200)));

  return rows.flatMap((row) => {
    if (!isKnowledgeStrand(row.strand)) return [];
    const data = row.data && typeof row.data === "object" && !Array.isArray(row.data) ? (row.data as Record<string, unknown>) : {};
    return [{ ...data, id: row.id, strand: row.strand, category: row.categoryId, category_name: row.categoryName, relevanceScore: Number(row.score) || 0 }];
  });
}

export interface KnowledgeSearchOutcome {
  /** "fulltext": published items from the database; "memory": the in-memory catalogue. */
  engine: "fulltext" | "memory";
  results: KnowledgeSearchResult[];
}

export async function searchKnowledgeStore(
  query: string,
  strands: readonly KnowledgeStrandType[] = KNOWLEDGE_STRANDS,
  deps: { fullText: typeof searchKnowledgeItems } = { fullText: searchKnowledgeItems },
): Promise<KnowledgeSearchOutcome> {
  try {
    const results = await deps.fullText(query, strands);
    if (results.length) return { engine: "fulltext", results };
  } catch (error) {
    console.warn("[knowledge] full-text search unavailable, using the in-memory catalogue:", error instanceof Error ? error.message : error);
  }
  return { engine: "memory", results: searchKnowledge(query, [...strands]) };
}
