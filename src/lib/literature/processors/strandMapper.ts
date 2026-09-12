import type { RawArticle } from "../types";
import type { KnowledgeStrandType } from "@/lib/knowledge/types";
import { STRAND_KEYWORD_BANKS } from "../strandSearchConfigs";

/**
 * Maps a raw article to one or more knowledge strands based on keyword overlap.
 *
 * Scoring:
 *   - Title keyword match:    × 3 weight
 *   - Abstract keyword match: × 1 weight
 *   - MeSH term match:        × 2 weight
 *
 * Returns all strands with a normalised score > 0.25.
 */
export function mapArticleToStrands(
  article: RawArticle,
  searchedStrand: KnowledgeStrandType
): Array<{ strand: KnowledgeStrandType; score: number; topicMatch: string }> {
  const titleLow = article.title.toLowerCase();
  const abstractLow = article.abstract.toLowerCase();
  const meshLow = article.meshTerms.map((m) => m.toLowerCase());
  const keywordsLow = article.keywords.map((k) => k.toLowerCase());

  const results: Array<{ strand: KnowledgeStrandType; score: number; topicMatch: string }> = [];

  for (const [strand, keywords] of Object.entries(STRAND_KEYWORD_BANKS)) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const kw of keywords) {
      const kwLow = kw.toLowerCase();
      if (titleLow.includes(kwLow)) {
        score += 3;
        matchedKeywords.push(kw);
      } else if (abstractLow.includes(kwLow)) {
        score += 1;
        matchedKeywords.push(kw);
      }
      if (meshLow.some((m) => m.includes(kwLow))) {
        score += 2;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
      if (keywordsLow.some((k) => k.includes(kwLow))) {
        score += 1;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
    }

    // Max possible score = 3 * keywords.length (all in title) — normalise
    const maxScore = Math.max(keywords.length * 3, 1);
    const normalised = Math.min(score / maxScore, 1.0);

    if (normalised > 0.25) {
      results.push({
        strand: strand as KnowledgeStrandType,
        score: parseFloat(normalised.toFixed(3)),
        topicMatch: matchedKeywords.slice(0, 5).join(", "),
      });
    }
  }

  // Always include the strand we searched under (with at least 0.3 baseline)
  const alreadyIncluded = results.find((r) => r.strand === searchedStrand);
  if (!alreadyIncluded) {
    results.push({
      strand: searchedStrand,
      score: 0.3,
      topicMatch: `searched_under:${searchedStrand}`,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Deduplicate a list of raw articles by PMID, then by DOI.
 * Earlier items (higher priority sources) win.
 */
export function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const seenPmid = new Set<string>();
  const seenDoi = new Set<string>();
  const result: RawArticle[] = [];

  for (const a of articles) {
    if (a.pmid && seenPmid.has(a.pmid)) continue;
    if (a.doi && seenDoi.has(a.doi)) continue;
    if (a.pmid) seenPmid.add(a.pmid);
    if (a.doi) seenDoi.add(a.doi);
    result.push(a);
  }

  return result;
}
