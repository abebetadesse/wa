import type { RawArticle } from "../types";

/**
 * Europe PMC REST API source.
 * Free, no API key required. Rate limit: ~10 req/sec.
 */
export class EuropePmcSource {
  private readonly BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

  async searchArticles(
    query: string,
    options: { maxResults?: number; dateRange?: string }
  ): Promise<RawArticle[]> {
    const { maxResults = 50, dateRange = "last 3 years" } = options;
    const years = parseInt(dateRange.match(/(\d+)/)?.[1] ?? "3", 10);
    const minYear = new Date().getFullYear() - years;

    // Europe PMC query syntax
    const fullQuery = encodeURIComponent(
      `(${query}) AND ABSTRACT:"Ethiopia" AND PUB_YEAR:[${minYear} TO *] AND LANG:eng`
    );

    const url =
      `${this.BASE}?query=${fullQuery}` +
      `&resultType=core&format=json&pageSize=${Math.min(maxResults, 100)}` +
      `&sort=CITED desc`;

    const resp = await fetch(url, {
      headers: { "User-Agent": "EthioWellnessPlatform/3.0 (abebetadesse33@gmail.com)" },
    });

    if (!resp.ok) {
      console.warn(`[EuropePMC] HTTP ${resp.status} for query: ${query}`);
      return [];
    }

    const json = await resp.json();
    const results = json?.resultList?.result ?? [];

    return results
      .map((r: Record<string, unknown>) => this.mapToArticle(r))
      .filter((a: RawArticle | null): a is RawArticle => a !== null);
  }

  private mapToArticle(r: Record<string, unknown>): RawArticle | null {
    const title = (r.title as string) || "";
    const abstract = (r.abstractText as string) || "";
    if (!title || abstract.length < 50) return null;

    // Authors
    const authorList = (r as Record<string, unknown>).authorList as { author?: { fullName?: string }[] } | undefined;
    const authors = (authorList?.author ?? []).map((a) => a.fullName ?? "");

    // MeSH terms
    const meshList = (r.meshHeadingList as { meshHeading?: { descriptorName?: string }[] } | undefined)?.meshHeading ?? [];
    const meshTerms = meshList.map((m) => m.descriptorName ?? "").filter(Boolean);

    // Keywords
    const kwList = (r.keywordList as { keyword?: string[] } | undefined)?.keyword ?? [];
    const keywords = kwList.filter((k): k is string => typeof k === "string");

    // Citation count
    const citationCount = typeof r.citedByCount === "number" ? r.citedByCount : undefined;

    return {
      pmid: (r.pmid as string) || undefined,
      doi: (r.doi as string) || undefined,
      title,
      abstract,
      authors,
      journal: (r.journalTitle as string) || (r.source as string) || "",
      pubDate: String(r.pubYear ?? new Date().getFullYear()),
      source: "europepmc",
      meshTerms,
      keywords,
      citationCount,
      fullTextUrl: (r.fullTextUrlList as { fullTextUrl?: { url?: string }[] } | undefined)
        ?.fullTextUrl?.[0]?.url,
    };
  }
}
