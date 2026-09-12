import { PubMedSource } from "@/lib/literature/sources/pubmedSource";
import type { RawArticle } from "@/lib/literature/types";
import type { StrandFinding } from "@/lib/knowledge/types";

export interface PubmedEvidence {
  pmid?: string;
  title: string;
  journal?: string;
  pubDate?: string;
  abstract?: string;
  source: "pubmed";
}

const pubmed = new PubMedSource();

function articleToEvidence(article: RawArticle): PubmedEvidence {
  return {
    pmid: article.pmid,
    title: article.title,
    journal: article.journal,
    pubDate: article.pubDate,
    abstract: article.abstract,
    source: "pubmed",
  };
}

export async function enrichFindingsWithPubMed(findings: StrandFinding[]): Promise<StrandFinding[]> {
  if (!findings.length) return findings;

  const result = await Promise.all(
    findings.map(async (finding) => {
      try {
        const query = `${finding.name} ${finding.description || finding.category || ""}`.trim();
        if (!query) {
          return { ...finding, pubmedEvidence: [] };
        }

        const articles = await pubmed.searchArticles(query, {
          maxResults: 3,
          dateRange: "last 10 years",
          meshTerms: finding.category ? [finding.category] : [],
        });

        return {
          ...finding,
          pubmedEvidence: articles.slice(0, 3).map(articleToEvidence),
        };
      } catch {
        return {
          ...finding,
          pubmedEvidence: [],
        };
      }
    })
  );

  return result;
}

export async function enrichStrandResultsWithPubMed(
  strandResults: Record<string, StrandFinding[]>
): Promise<Record<string, StrandFinding[]>> {
  const output: Record<string, StrandFinding[]> = {};
  for (const [strand, findings] of Object.entries(strandResults)) {
    output[strand] = await enrichFindingsWithPubMed(findings);
  }
  return output;
}
