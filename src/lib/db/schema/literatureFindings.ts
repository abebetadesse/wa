import { pgTable, text, timestamp, integer, real, jsonb, uuid } from "drizzle-orm/pg-core";
import type { ExtractedLiteratureData } from "@/lib/literature/types";

/**
 * Literature Findings Table
 *
 * Stores structured findings fetched from PubMed, Europe PMC, WHO GHO, OpenAlex, etc.
 * Each row represents one article mapped to one knowledge strand.
 * A single article may have multiple rows if it maps to multiple strands.
 */
export const literatureFindings = pgTable("literature_findings", {
  id: uuid("id").primaryKey().defaultRandom(),

  // ── Source metadata ──────────────────────────────────────────────────────────
  pmid: text("pmid"),                              // PubMed ID (may be null for non-PubMed sources)
  doi: text("doi"),                               // Digital Object Identifier
  title: text("title").notNull(),
  abstract: text("abstract"),
  authors: jsonb("authors").$type<string[]>(),
  journal: text("journal"),
  pubDate: text("pub_date"),                      // YYYY or YYYY-MM
  source: text("source").notNull(),               // "pubmed" | "europepmc" | "who_gho" | "openalex" | "gbd_ihme"

  // ── Strand mapping ───────────────────────────────────────────────────────────
  strand: text("strand").notNull(),               // KnowledgeStrandType
  strandTopicMatch: text("strand_topic_match"),   // Comma-separated matched keywords
  relevanceScore: real("relevance_score"),        // 0.0–1.0 normalised overlap score

  // ── Extracted findings (dependent variables per strand) ──────────────────────
  extractedData: jsonb("extracted_data").$type<ExtractedLiteratureData>(),

  // ── Processing metadata ──────────────────────────────────────────────────────
  fetchedAt: timestamp("fetched_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  isActive: integer("is_active").default(1),      // 1 = active, 0 = superseded/archived

  // ── Bibliographic enrichment ────────────────────────────────────────────────
  meshTerms: jsonb("mesh_terms").$type<string[]>(),
  keywords: jsonb("keywords").$type<string[]>(),
  citationCount: integer("citation_count"),
});

/**
 * Fetch sync log — tracks each run of the literature fetcher.
 */
export const literatureSyncLog = pgTable("literature_sync_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  articlesFound: integer("articles_found").default(0),
  newArticles: integer("new_articles").default(0),
  updatedArticles: integer("updated_articles").default(0),
  errors: jsonb("errors").$type<string[]>(),
  byStrand: jsonb("by_strand").$type<Record<string, { found: number; new: number }>>(),
  bySource: jsonb("by_source").$type<Record<string, { found: number; errors: number }>>(),
  triggeredBy: text("triggered_by").default("cron"), // "cron" | "manual"
});
