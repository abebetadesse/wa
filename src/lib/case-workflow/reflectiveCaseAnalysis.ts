import { AstrologicalKnowledgeStrand } from "@/lib/knowledge/strands/astrologicalStrand";
import { CulturalKnowledgeStrand } from "@/lib/knowledge/strands/culturalStrand";
import type { DiagnosticSolution, KnowledgeStrandType, StrandFinding, UserProfile } from "@/lib/knowledge/types";

export type ReflectiveCaseDomain = "money" | "career" | "legal";

const SCIENTIFIC_OR_PRESCRIPTIVE = /medical|health|disease|clinical|diagnos|treatment|medication|nutrition|dietary|scientific|investment|capital allocation|contract signing|risk mitigation|financial advice|career advice|legal advice|court litigation/i;

export interface ReflectiveFinding {
  strand: Extract<KnowledgeStrandType, "cultural" | "astrological">;
  title: string;
  reflection: string;
  culturalContext: string;
}

export function buildReflectiveDiagnosticSolution({
  originalQuery,
  mode,
  language,
  domain,
  findings,
  urgency,
  intent,
}: {
  originalQuery: string;
  mode: DiagnosticSolution["mode"];
  language: string;
  domain: ReflectiveCaseDomain;
  findings: ReflectiveFinding[];
  urgency: {
    level: DiagnosticSolution["summary"]["urgency"];
    score: number;
    matchedSignals: string[];
  };
  intent: string;
}): DiagnosticSolution {
  const label = domain === "money"
    ? "Money and community"
    : domain === "legal"
      ? "Customary dispute reconciliation (ሽምግልና)"
      : "Career and vocation";
  const disclaimer = "This is optional spiritual and cultural reflection, not legal, financial, career, scientific, or predictive advice.";
  const culturalLayers = findings.map((finding) => ({
    layer: "Domain B" as const,
    status: "included" as const,
    strands: [finding.strand],
    interpretation: finding.reflection,
    practice: "Consider only as a reflection prompt, according to your own beliefs and preferences.",
    disclaimer,
  }));
  const rawFindings: DiagnosticSolution["rawFindings"] = {
    biochemical: [],
    biological: [],
    medication: [],
    addiction: [],
    ecological: [],
    epidemiological: [],
    psychological: [],
    socioeconomic: [],
    dietary: [],
    cultural: [],
    astrological: [],
  };
  for (const finding of findings) {
    rawFindings[finding.strand].push({
      type: "cultural_reflection",
      strand: finding.strand,
      domain: "cultural",
      name: finding.title,
      description: finding.reflection,
      ethiopian_context: finding.culturalContext,
      relevanceScore: 0.5,
      confidence: 0.5,
      severity: "low",
      category: "Domain B",
    });
  }
  return {
    query: originalQuery,
    timestamp: new Date().toISOString(),
    mode,
    language,
    summary: {
      problem: originalQuery.length > 90 ? `${originalQuery.slice(0, 87)}...` : originalQuery,
      urgency: urgency.level,
      urgencyScore: urgency.score,
      confidence: 0,
      intent,
      matchedSignals: urgency.matchedSignals,
    },
    reasoning: {
      chainOfThought: [],
      summaryReasoning: "Only cultural and astrological knowledge was queried for this reflection-only case.",
    },
    causes: [],
    solutions: [],
    action_plan: { immediate_actions: [], short_term: [], medium_term: [], long_term: [], ongoing: [] },
    safety: {
      validated: true,
      warnings: urgency.matchedSignals.length
        ? ["Safety screening flagged this description; existing safety and crisis support remains separate from this reflection."]
        : [],
      disclaimers: [disclaimer, "This response does not replace existing safety or crisis support."],
      herbDrugInteractions: [],
    },
    referral: {
      type: "none",
      message: "This reflection does not make referrals or provide practical financial or career instructions.",
      facilities: [],
      urgency: urgency.level,
      emergencyHotlines: [],
    },
    cultural_context: {
      isDomainB: true,
      title: `${label}: cultural and spiritual reflection`,
      traditionalHealing: "",
      culturalSignificance: findings.map((finding) => finding.reflection).join(" ") || "No matching cultural or spiritual reflection was found.",
      disclaimer,
    },
    culturalLayers,
    astrological_context: {
      isDomainB: true,
      title: "Astrological and spiritual context",
      humoralElement: "",
      seasonalAdvice: "",
      lunarGuidance: "",
      disclaimer,
    },
    crossStrandIntersections: [],
    causalPathways: [],
    rawFindings,
  };
}

export async function retrieveReflectiveCaseFindings(
  domain: ReflectiveCaseDomain,
  query: string,
): Promise<ReflectiveFinding[]> {
  const topic = domain === "money"
    ? "Iqub Equb community reciprocity identity and cultural reflection"
    : domain === "legal"
      ? "customary dispute resolution shemgelna peacemaking community harmony reconciliation"
      : "vocation meaningful work career purpose leadership and cultural reflection";
  const culturalQuery = `${topic} ${query}`;
  const astrologicalQuery = `Awude Negast Ge'ez circle ${topic} ${query}`;
  const profile: UserProfile = {};
  const [culturalFindings, astrologicalFindings] = await Promise.all([
    new CulturalKnowledgeStrand().query(culturalQuery, profile),
    new AstrologicalKnowledgeStrand().query(astrologicalQuery, profile),
  ]);

  const candidates = [...culturalFindings, ...astrologicalFindings]
    .filter((finding) => {
      if (domain === "money") return /\b(iqub|equb)\b/i.test(finding.name);
      if (domain === "legal") return /dispute|shemgelna|reconciliation|peacemaking|harmony|elder|customary/i.test(`${finding.name} ${finding.description}`);
      return /vocation|career|work and communal values|awude negest|ge'ez/i.test(finding.name);
    })
    .filter((finding) => !SCIENTIFIC_OR_PRESCRIPTIVE.test(`${finding.name} ${finding.description}`));

  return candidates.map((finding) => ({
    strand: finding.strand as ReflectiveFinding["strand"],
    title: finding.name,
    reflection: finding.description,
    culturalContext: Array.isArray(finding.ethiopian_context)
      ? finding.ethiopian_context.join(" ")
      : finding.ethiopian_context || "Meanings and practices vary across communities and personal traditions.",
  }));
}
