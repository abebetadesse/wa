import { NextRequest, NextResponse } from "next/server";
import { ETHIOPIAN_MEDICINAL_PLANTS, filterMedicinalPlants, type MedicinalPlant, type PubMedEvidence } from "@/lib/knowledge/ethiopianMedicinalPlants";
import { PubMedSource } from "@/lib/literature/sources/pubmedSource";

export const dynamic = "force-dynamic";

function deriveModeOfActionFromEvidence(text: string): string {
  const lower = text.toLowerCase();
  if (/anti.*inflamm|inflammatory|cyclooxygenase|cox/.test(lower)) return "Anti-inflammatory / mediator modulation";
  if (/antimicrobial|antibacterial|antifungal|antiviral/.test(lower)) return "Antimicrobial effect";
  if (/oxidative|antioxid|free radical/.test(lower)) return "Antioxidant / oxidative stress modulation";
  if (/glycemic|glucose|insulin|diabetes/.test(lower)) return "Metabolic / glycemic signaling";
  if (/wound|healing|tissue|repair/.test(lower)) return "Tissue repair / wound-healing action";
  if (/toxicity|cytotoxic|cancer|cell cycle/.test(lower)) return "Cytotoxic or cellular growth modulation";
  if (/gastro|digestive|gut|intestinal/.test(lower)) return "Gastrointestinal action";
  return "Traditional therapeutic action inferred from the plant record and PubMed abstract context";
}

async function enrichPlantWithPubMed(plant: MedicinalPlant): Promise<MedicinalPlant> {
  const query = `${plant.scientificName} ${plant.vernacularName} ${plant.diseasesTreated.slice(0, 2).join(" ")}`;
  const source = new PubMedSource();

  try {
    const articles = await source.searchArticles(query, {
      maxResults: 3,
      dateRange: "last 10 years",
      meshTerms: plant.diseasesTreated.length ? plant.diseasesTreated.slice(0, 2) : [],
    });

    const evidence: PubMedEvidence[] = articles.slice(0, 3).map((article) => ({
      pmid: article.pmid ?? "",
      title: article.title,
      journal: article.journal,
      pubDate: article.pubDate,
      abstract: article.abstract,
      source: "pubmed",
    }));

    const actionSource = evidence.length && evidence[0].abstract ? evidence[0].abstract : plant.traditionalUse;

    return {
      ...plant,
      geographicalDistribution: plant.location ?? plant.habitat,
      modeOfAction: deriveModeOfActionFromEvidence(actionSource),
      pubmedEvidence: evidence,
      source: `${plant.source} + PubMed enrichment`,
    };
  } catch {
    return {
      ...plant,
      geographicalDistribution: plant.location ?? plant.habitat,
      modeOfAction: plant.action ?? plant.traditionalUse,
      pubmedEvidence: [],
    };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") ?? "";
  const disease = searchParams.get("disease") ?? "all";
  const enrich = searchParams.get("enrich") === "1" || searchParams.get("enrich") === "true";

  const data = filterMedicinalPlants(query, disease);
  const enriched = enrich
    ? await Promise.all(data.slice(0, 80).map((plant) => enrichPlantWithPubMed(plant)))
    : data.slice(0, 80);

  return NextResponse.json({
    success: true,
    count: enriched.length,
    total: ETHIOPIAN_MEDICINAL_PLANTS.length,
    data: enriched,
    source: "EPHI Etnobotanical Study by Wereda + optional PubMed enrichment",
  });
}
