import type { RawArticle } from "../types";

/**
 * OpenAlex Academic Graph API source.
 * Free, no API key required.
 * Used for: high-citation landmark papers, open-access full text, topic discovery.
 */
export class OpenAlexSource {
  private readonly BASE = "https://api.openalex.org/works";
  private readonly POLITE_EMAIL = "abebetadesse33@gmail.com";

  async searchArticles(
    query: string,
    options: { maxResults?: number; dateRange?: string; minCitations?: number }
  ): Promise<RawArticle[]> {
    const { maxResults = 30, dateRange = "last 3 years", minCitations = 5 } = options;
    const years = parseInt(dateRange.match(/(\d+)/)?.[1] ?? "3", 10);
    const minYear = new Date().getFullYear() - years;

    // Use only supported filter fields to avoid HTTP 400
    const url =
      `${this.BASE}?search=${encodeURIComponent(query + " Ethiopia")}` +
      `&filter=publication_year:>${minYear - 1},cited_by_count:>${Math.max(minCitations - 1, 0)}` +
      `&per-page=${Math.min(maxResults, 50)}` +
      `&select=id,title,abstract_inverted_index,doi,authorships,primary_location,publication_year,cited_by_count,keywords,concepts` +
      `&sort=cited_by_count:desc` +
      `&mailto=${this.POLITE_EMAIL}`;

    const resp = await fetch(url, {
      headers: { "User-Agent": `EthioWellnessPlatform/3.0 (${this.POLITE_EMAIL})` },
    });

    if (!resp.ok) {
      console.warn(`[OpenAlex] HTTP ${resp.status} for query: ${query}`);
      return [];
    }

    const json = await resp.json();
    const results: Record<string, unknown>[] = json?.results ?? [];

    return results
      .map((r) => this.mapToArticle(r))
      .filter((a): a is RawArticle => a !== null);
  }

  private mapToArticle(r: Record<string, unknown>): RawArticle | null {
    const title = (r.title as string) || "";
    if (!title) return null;

    // Reconstruct abstract from inverted index
    const invertedIdx = r.abstract_inverted_index as Record<string, number[]> | null;
    let abstract = "";
    if (invertedIdx) {
      const words: { word: string; pos: number }[] = [];
      for (const [word, positions] of Object.entries(invertedIdx)) {
        for (const pos of positions) {
          words.push({ word, pos });
        }
      }
      abstract = words
        .sort((a, b) => a.pos - b.pos)
        .map((w) => w.word)
        .join(" ");
    }

    if (abstract.length < 50) return null;

    // Authors
    const authorships = r.authorships as { author?: { display_name?: string } }[] | undefined;
    const authors = (authorships ?? []).map((a) => a.author?.display_name ?? "").filter(Boolean);

    // Journal (API v2 uses primary_location, not host_venue)
    const primaryLoc = r.primary_location as { source?: { display_name?: string } } | null;
    const journal = primaryLoc?.source?.display_name ?? "OpenAlex";

    // Keywords / concepts
    const concepts = r.concepts as { display_name?: string; score?: number }[] | undefined;
    const keywords = (concepts ?? [])
      .filter((c) => (c.score ?? 0) > 0.3)
      .map((c) => c.display_name ?? "")
      .filter(Boolean);

    // DOI
    const doiUrl = r.doi as string | undefined;
    const doi = doiUrl ? doiUrl.replace("https://doi.org/", "") : undefined;

    return {
      doi,
      title,
      abstract,
      authors,
      journal,
      pubDate: String(r.publication_year ?? new Date().getFullYear()),
      source: "openalex",
      meshTerms: [],
      keywords,
      citationCount: typeof r.cited_by_count === "number" ? r.cited_by_count : undefined,
    };
  }
}
