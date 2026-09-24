import type { RawArticle } from "../types";
import { getNcbiRateLimiter } from "../tokenBucketRateLimiter";


/**
 * PubMed E-utilities source.
 *
 * API key is read from PUBMED_api (already in .env) or NCBI_API_KEY.
 * With key: 10 req/sec; without: 3 req/sec.
 */
export class PubMedSource {
  private readonly BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  private readonly API_KEY = process.env.PUBMED_api || process.env.NCBI_API_KEY || "";
  private readonly BATCH_SIZE = 50; // efetch max

  private async get(url: string): Promise<Response> {
    // Pillar 3 P11: Token-bucket rate limiting instead of fixed sleep
    await getNcbiRateLimiter().throttle();
    const sep = url.includes("?") ? "&" : "?";
    const keySuffix = this.API_KEY ? `${sep}api_key=${this.API_KEY}` : "";
    const response = await fetch(`${url}${keySuffix}`, {
      headers: { "User-Agent": "EthioWellnessPlatform/3.0 (abebetadesse33@gmail.com)" },
    });
    if (!response.ok) {
      throw new Error(`PubMed HTTP ${response.status} for ${url}`);
    }
    return response;
  }

  /**
   * Build a PubMed date filter from a human dateRange string.
   * e.g. "last 3 years" → "&mindate=2023&maxdate=2026&datetype=pdat"
   */
  private buildDateFilter(dateRange: string): string {
    const years = parseInt(dateRange.match(/(\d+)\s*year/i)?.[1] ?? "3", 10);
    const maxYear = new Date().getFullYear();
    const minYear = maxYear - years;
    return `&mindate=${minYear}&maxdate=${maxYear}&datetype=pdat`;
  }

  async searchArticles(
    query: string,
    options: { maxResults?: number; dateRange?: string; meshTerms?: string[] }
  ): Promise<RawArticle[]> {
    const { maxResults = 100, dateRange = "last 3 years", meshTerms = [] } = options;

    // Build the query: core topic + MeSH terms + Ethiopia filter + lang filter
    const meshPart = meshTerms.length
      ? " AND " + meshTerms.map((m) => `"${m}"`).join(" AND ")
      : "";
    const fullQuery = encodeURIComponent(
      `(${query})${meshPart} AND Ethiopia[Title/Abstract] AND English[Language]`
    );

    // ── Step 1: esearch → get PMIDs ──
    const dateFilter = this.buildDateFilter(dateRange);
    const searchUrl =
      `${this.BASE}/esearch.fcgi?db=pubmed&retmode=json&usehistory=y` +
      `&retmax=${maxResults}&term=${fullQuery}${dateFilter}`;

    const searchResp = await this.get(searchUrl);
    const searchJson = await searchResp.json();
    const pmids: string[] = searchJson?.esearchresult?.idlist ?? [];

    if (pmids.length === 0) return [];

    // ── Step 2: efetch in batches of BATCH_SIZE → get abstracts as JSON ──
    const articles: RawArticle[] = [];
    for (let i = 0; i < pmids.length; i += this.BATCH_SIZE) {
      const batch = pmids.slice(i, i + this.BATCH_SIZE);
      const fetchUrl =
        `${this.BASE}/efetch.fcgi?db=pubmed&retmode=xml&rettype=abstract` +
        `&id=${batch.join(",")}`;
      const fetchResp = await this.get(fetchUrl);
      const xml = await fetchResp.text();
      const parsed = this.parseXmlArticles(xml);
      articles.push(...parsed);
      // Token-bucket handles inter-batch pacing automatically
    }

    return articles;
  }

  /**
   * Minimal XML parser for PubMed efetch XML.
   * Extracts the fields we need without a full XML library dependency.
   */
  private parseXmlArticles(xml: string): RawArticle[] {
    const articles: RawArticle[] = [];
    const articleBlocks = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) ?? [];

    for (const block of articleBlocks) {
      try {
        const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] ?? "";
        const title = this.extractText(block, "ArticleTitle");
        const abstractRaw = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g) ?? [];
        const abstract = abstractRaw
          .map((t) => t.replace(/<[^>]+>/g, "").trim())
          .join(" ");
        const journal = this.extractText(block, "Title") || this.extractText(block, "ISOAbbreviation");
        const year = block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1];
        const month = block.match(/<PubDate>[\s\S]*?<Month>([A-Za-z\d]+)<\/Month>/)?.[1] ?? "01";
        const pubDate = `${year ?? "2024"}-${month}`;
        const doi = block.match(/EIdType="doi">([^<]+)<\/ArticleId>/)?.[1];

        const authorBlocks = block.match(/<Author[^>]*>[\s\S]*?<\/Author>/g) ?? [];
        const authors = authorBlocks.map((a) => {
          const last = this.extractText(a, "LastName");
          const fore = this.extractText(a, "ForeName");
          return [last, fore].filter(Boolean).join(" ");
        });

        const meshBlocks = block.match(/<MeshHeading>[\s\S]*?<\/MeshHeading>/g) ?? [];
        const meshTerms = meshBlocks.map((m) => {
          return this.extractText(m, "DescriptorName");
        }).filter(Boolean);

        const kwBlocks = block.match(/<Keyword[^>]*>([^<]+)<\/Keyword>/g) ?? [];
        const keywords = kwBlocks.map((k) => k.replace(/<[^>]+>/g, "").trim());

        if (title && abstract.length > 50) {
          articles.push({
            pmid,
            doi,
            title,
            abstract,
            authors,
            journal,
            pubDate,
            source: "pubmed",
            meshTerms,
            keywords,
          });
        }
      } catch {
        // Skip malformed articles
      }
    }

    return articles;
  }

  private extractText(xml: string, tag: string): string {
    return xml.match(new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`))?.[1]?.trim() ?? "";
  }
}
