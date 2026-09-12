import type { RawArticle } from "../types";

/**
 * WHO Global health Observatory (GHO) API source.
 * Returns epidemiological indicators for Ethiopia (ETH).
 * Translates GHO indicator data into synthetic "article" objects
 * compatible with the RawArticle interface for uniform processing.
 */
export class WhoGhoSource {
  private readonly BASE = "https://ghoapi.azureedge.net/api";

  // Key GHO indicators relevant to the app's knowledge strands
  private readonly INDICATORS: Record<string, string> = {
    // Verified working GHO codes for Ethiopia (ETH) — checked Sept 2026
    MALARIA_EST_INCIDENCE: "Malaria estimated incidence per 1,000 population at risk",
    HIV_0000000001: "Estimated number of people living with HIV",
    MDG_0000000026: "Maternal mortality ratio (per 100,000 live births)",
    MDG_0000000007: "Under-5 mortality rate (per 1,000 live births)",
    NUTRITION_WA_2: "Prevalence of stunting, height for age (< -2 SD)",
    WHS4_100: "ANC4 antenatal care coverage (4+ visits)",
    WHS4_544: "Births attended by skilled health personnel (%)",
    WSH_WATER_SAFELY_MANAGED: "Population using safely managed drinking-water services (%)",
    // TB — uses slightly different endpoint path
    TB_1: "Tuberculosis notifications (all forms)",
    // NCD indicators
    NCD_BMI_30A: "Prevalence of obesity (BMI ≥ 30) among adults",
    NCD_HYP_DIAGNOSIS_A: "Hypertension prevalence adults",
  };

  async fetchIndicators(): Promise<RawArticle[]> {
    const articles: RawArticle[] = [];

    for (const [code, description] of Object.entries(this.INDICATORS)) {
      try {
        const url = `${this.BASE}/${code}?$filter=SpatialDim eq 'ETH'&$orderby=TimeDim desc&$top=5`;
        const resp = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (!resp.ok) {
          console.warn(`[WHO GHO] HTTP ${resp.status} for indicator ${code}`);
          continue;
        }

        const json = await resp.json();
        const values: Record<string, unknown>[] = json?.value ?? [];

        if (values.length === 0) continue;

        // Take the most recent value
        const latest = values[0];
        const value = (latest.NumericValue as number | null)?.toFixed(2) ?? "N/A";
        const year = latest.TimeDim as number ?? "N/A";
        const unit = (latest.Comments as string) || "";

        // Build a synthetic abstract for the extractor
        const abstract =
          `WHO Global health Observatory data for Ethiopia: ${description}. ` +
          `Latest value (${year}): ${value}${unit ? " " + unit : ""}. ` +
          `Data source: World health Organization GHO. Country: Ethiopia (ETH).`;

        articles.push({
          doi: `who-gho-${code}-ETH-${year}`,
          title: `[WHO GHO] ${description} — Ethiopia ${year}`,
          abstract,
          authors: ["World health Organization"],
          journal: "WHO Global health Observatory",
          pubDate: String(year),
          source: "who_gho",
          meshTerms: ["Ethiopia", "health Statistics", "World health Organization"],
          keywords: [code, "GHO", "indicator", "Ethiopia"],
          citationCount: 0,
        });
      } catch (err) {
        console.warn(`[WHO GHO] Error fetching ${code}:`, (err as Error).message);
      }
    }

    return articles;
  }
}
