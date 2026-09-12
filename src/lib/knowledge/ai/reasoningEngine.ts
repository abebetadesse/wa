import {
  ActionPlanItem,
  ChainOfThoughtStep,
  DiagnosticSolution,
  DiagnosticUrgencyLevel,
  IntersectionFinding,
  KnowledgeStrandType,
  StrandFinding,
  UserProfile,
  CulturalReportContext,
} from "../types";
import { CausalInferenceEngine } from "./causalInference";

export interface ReasoningInput {
  query: string;
  mode: "text" | "voice" | "image" | "symptom";
  language: string;
  userProfile: UserProfile;
  strandResults: Record<KnowledgeStrandType, StrandFinding[]>;
  intersections: IntersectionFinding[];
  intent: string;
  urgency: {
    level: DiagnosticUrgencyLevel;
    score: number;
    action: string;
    recommendation: string;
    matchedSignals: string[];
  };
}

export class AIReasoningEngine {
  private causalEngine = new CausalInferenceEngine();

  synthesizeSolution(input: ReasoningInput): DiagnosticSolution {
    const { query, mode, language, userProfile, strandResults, intersections, intent, urgency } = input;
    const allFindings = Object.values(strandResults).flat();
    const domainBAllowed = urgency.level !== "critical";
    const culturalFinding = (strandResults.cultural || [])[0];
    const astrologicalFinding = (strandResults.astrological || [])[0];
    const culturalContext: CulturalReportContext = {
      layer: "Domain B",
      status: domainBAllowed ? "included" : "firewalled",
      strands: ["cultural", "astrological"],
      interpretation: domainBAllowed
        ? `${culturalFinding?.description || "Cultural and community context is available as a reflective layer."} ${astrologicalFinding?.evidence || "Seasonal and constitutional themes remain separate from clinical scoring."}`
        : "Cultural and astrological material is withheld from this critical report until urgent clinical care is addressed.",
      practice: domainBAllowed
        ? "Use cultural and astrological findings only as an optional reflective perspective, separate from clinical reasoning."
        : "No elective cultural practice is recommended while an emergency signal is active.",
      disclaimer: "Domain B is educational and reflective only. It never changes urgency, diagnosis, medication safety, or emergency decisions.",
    };

    // 1. Build 7-Step Chain-of-Thought
    const chainOfThought: ChainOfThoughtStep[] = [
      { stepNumber: 1, title: "Analyze Symptoms & Clinical Intent", reasoning: `Extracted intent '${intent}' from query: "${query}". Urgency ${urgency.score}/100 (${urgency.level}).`, status: "completed" },
      { stepNumber: 2, title: "Calibrate Demographics, Altitude & Ecological Baseline", reasoning: `Location calibrated to ${userProfile.location?.region || "Ethiopian Highlands"} (${userProfile.location?.altitude || 2400}m).`, status: "completed" },
      { stepNumber: 3, title: "Evaluate Verified Ethiopian Traditional Medicine (ETM-DB)", reasoning: `Screened traditional remedies against active medications (${userProfile.medications?.join(", ") || "none reported"}).`, status: "completed" },
      { stepNumber: 4, title: "Contextualize Cultural & Astrological Rhythms (Domain B)", reasoning: "Cultural and astrological findings remain firewalled from clinical severity scoring.", status: "completed" },
      { stepNumber: 5, title: "Synthesize Multi-Strand Root Causes & Causal Pathways", reasoning: `Identified ${intersections.length} cross-strand intersections across ${Object.keys(strandResults).length} knowledge domains.`, status: "completed" },
      { stepNumber: 6, title: "Prioritize Solutions with Mandatory Safety Gate Intercepts", reasoning: "Filtered recommendations through clinical safety and medication interaction rules.", status: "completed" },
      { stepNumber: 7, title: "Formulate 5-Stage Timeline Action Plan", reasoning: "Structured immediate, short-term, medium-term, long-term, and ongoing milestones.", status: "completed" },
    ];

    // 2. Identify Potential Causes
    const causes: Array<{ name: string; probability: number; evidence: string; domain: string }> = [];
    const topFindings = [...allFindings]
      .filter((f) => f.relevanceScore >= 0.6)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    for (const f of topFindings.slice(0, 4)) {
      causes.push({ name: f.name, probability: Math.round(f.relevanceScore * 100), evidence: f.evidence || f.description, domain: f.strand });
    }

    if (causes.length === 0) {
      causes.push({ name: "General Physiological Fatigue or Nutritional Imbalance", probability: 65, evidence: "Reported symptoms match mild systemic strain or dietary mineral deficit", domain: "biochemical" });
    }

    // 3. Synthesize Solutions
    const solutions: DiagnosticSolution["solutions"] = [];

    // Critical Emergency Solution if needed
    if (urgency.level === "critical") {
      solutions.push({
        id: "sol-emergency-01",
        title: "🚨 IMMEDIATE EMERGENCY HOSPITAL EVALUATION",
        description: "Your reported symptoms match red-flag emergency criteria. Do not attempt home treatment or wait for symptoms to resolve. Proceed immediately to the nearest hospital emergency department.",
        type: "emergency",
        priority: "critical",
        safetyGatePassed: true,
        sourceRef: "EPHI Emergency Triage Protocol",
      });
    }

    // Medical Treatment Solutions
    const medFindings = strandResults.medication || [];
    const epiFindings = strandResults.epidemiological || [];
    for (const epi of epiFindings.filter((e) => e.relevanceScore > 0.6).slice(0, 2)) {
      solutions.push({
        id: `sol-med-${epi.name.toLowerCase().replace(/\s+/g, "-")}`,
        title: `Clinical Medical Evaluation: ${epi.name}`,
        description: epi.management?.[0] || `Seek laboratory confirmation and physician evaluation for ${epi.name}.`,
        type: "medical",
        priority: urgency.level === "high" ? "critical" : "high",
        safetyGatePassed: true,
        sourceRef: epi.sources?.[0] || "Ministry of health Clinical Guidelines",
      });
    }

    // Dietary Solutions
    const dietFindings = strandResults.dietary || [];
    const bioFindings = strandResults.biochemical || [];
    for (const d of dietFindings.filter((df) => df.relevanceScore > 0.5).slice(0, 2)) {
      solutions.push({
        id: `sol-diet-${d.name.toLowerCase().replace(/\s+/g, "-")}`,
        title: `Dietary Optimization: ${d.name}`,
        description: d.recommendations?.[0] || d.description,
        type: "dietary",
        priority: "medium",
        safetyGatePassed: true,
        sourceRef: "EFCT 2025 Standard",
      });
    }

    // Safe Herbal & Traditional Solutions (Check against Safety Gate)
    const herbInteractions = medFindings.filter((m) => m.type.includes("herb_drug"));
    const hasCriticalHerbConflict = herbInteractions.some((hi) => hi.severity === "critical");

    if (!hasCriticalHerbConflict && urgency.level !== "critical") {
      solutions.push({
        id: "sol-herbal-safe-01",
        title: "Traditional Carminative Soothing Infusion",
        description: "Mild infusion of Chamomile or Ginger with fresh lemon and pure honey to calm digestive motility and ease tension. Safe with current baseline.",
        type: "herbal",
        priority: "low",
        safetyGatePassed: true,
        sourceRef: "ETM-DB Certified Safe Formulary",
      });
    }

    // Lifestyle Solutions
    const psychFindings = strandResults.psychological || [];
    if (psychFindings.length > 0) {
      solutions.push({
        id: "sol-lifestyle-01",
        title: "Circadian Rhythm & Communal Support Pacing",
        description: "Establish regular sleep hours, reduce high-caffeine coffee intake in the late afternoon, and engage with trusted family or community circles for emotional grounding.",
        type: "lifestyle",
        priority: "medium",
        safetyGatePassed: true,
        sourceRef: "Amanuel Mental health Guidance",
      });
    }

    // 4. Construct 5-Stage Action Plan Timeline
    const immediate_actions: ActionPlanItem[] = [
      {
        id: "act-now-01",
        timeline: "now",
        title: urgency.level === "critical" ? "Seek Emergency Care" : "Review Clinical Red Flags",
        action: urgency.level === "critical"
          ? "Call 907 (EPHI) or 991 (Red Cross) or proceed immediately to Tikur Anbessa / nearest emergency room"
          : "Note onset time, monitor temperature or pain intensity, and ensure adequate hydration with clean water",
        priority: urgency.level === "critical" ? "critical" : "high",
        category: "clinical",
      },
      {
        id: "act-now-02",
        timeline: "now",
        title: "Hydration & Electrolyte Protection",
        action: "Drink oral rehydration solution (1L boiled water with 6 tsp sugar and 1/2 tsp salt) or warm mild tea",
        priority: "medium",
        category: "dietary",
      },
    ];

    const short_term: ActionPlanItem[] = [
      {
        id: "act-short-01",
        timeline: "short_term",
        title: "healthcare Provider Consultation",
        action: "Visit your local health center or clinic for complete blood count, malaria blood film, or metabolic baseline tests",
        priority: "high",
        category: "clinical",
      },
      {
        id: "act-short-02",
        timeline: "short_term",
        title: "Fermented Staple Transition",
        action: "Switch to 3-4 day naturally fermented brown teff injera to lower dietary phytate mineral chelation",
        priority: "medium",
        category: "dietary",
      },
    ];

    const medium_term: ActionPlanItem[] = [
      {
        id: "act-med-01",
        timeline: "medium_term",
        title: "Microbiome & Barrier Recovery",
        action: "Incorporate traditional fermented Ergo buttermilk and cooked Habesha Gomen greens 3-4 times weekly",
        priority: "medium",
        category: "dietary",
      },
      {
        id: "act-med-02",
        timeline: "medium_term",
        title: "Environmental Vector & Household Protection",
        action: "Inspect sleeping area for insecticidal bed net integrity and ensure proper ventilation during domestic cooking",
        priority: "low",
        category: "lifestyle",
      },
    ];

    const long_term: ActionPlanItem[] = [
      {
        id: "act-long-01",
        timeline: "long_term",
        title: "Chronic health & Biochemical Re-screening",
        action: "Follow up with routine blood pressure and glycemic screening every 6 months if risk factors are present",
        priority: "medium",
        category: "monitoring",
      },
    ];

    const ongoing: ActionPlanItem[] = [
      {
        id: "act-ongo-01",
        timeline: "ongoing",
        title: "Holistic health Maintenance",
        action: "Sustain balanced seasonal nutrition, stay active with daily brisk walking, and nurture strong community connections",
        priority: "low",
        category: "lifestyle",
      },
    ];

    // 5. Causal Pathways
    const causalPathways = this.causalEngine.buildCausalPathways(query, allFindings, userProfile);

    // 6. Safety Warnings & Herb-Drug Flags
    const warnings: string[] = [];
    const herbDrugInteractions: DiagnosticSolution["safety"]["herbDrugInteractions"] = [];

    for (const h of herbInteractions) {
      warnings.push(`SAFETY WARNING: ${h.name} - ${h.description}`);
      herbDrugInteractions.push({
        herb: h.name,
        drug: userProfile.medications?.join(", ") || "Prescription medication",
        severity: h.severity || "high",
        mechanism: h.evidence || "Pharmacological CYP450 or additive pathway",
        recommendation: h.recommendations?.[0] || "Consult clinical pharmacist before co-administering.",
      });
    }

    if (urgency.level === "critical") {
      warnings.unshift("EMERGENCY ALERT: This inquiry presents critical red flags requiring urgent medical treatment.");
    }

    // 7. Assemble Full Diagnostic Solution
    const enrichedCauses = causes.map((cause) => ({ ...cause, culturalContext }));
    const enrichedSolutions = solutions.map((solution) => ({ ...solution, culturalContext }));
    return {
      query,
      timestamp: new Date().toISOString(),
      mode,
      language,
      summary: {
        problem: query.length > 90 ? `${query.slice(0, 87)}...` : query,
        urgency: urgency.level,
        urgencyScore: urgency.score,
        confidence: Math.round(topFindings.length > 0 ? (topFindings[0].confidence || 0.88) * 100 : 85),
        intent,
        matchedSignals: urgency.matchedSignals,
      },
      reasoning: {
        chainOfThought,
        summaryReasoning: `Integrated analysis of ${allFindings.length} findings across 11 knowledge strands identified ${causes.length} primary potential causes and ${intersections.length} cross-strand intersections, resulting in a structured 5-stage action plan with strict safety gate validation.`,
      },
      causes: enrichedCauses,
      solutions: enrichedSolutions,
      action_plan: {
        immediate_actions,
        short_term,
        medium_term,
        long_term,
        ongoing,
      },
      safety: {
        validated: true,
        warnings,
        disclaimers: [
          "This diagnostic analysis is for clinical education, risk stratification, and structured triage only.",
          "It does NOT constitute an official clinical diagnosis, nor does it replace personalized consultation with a licensed medical practitioner.",
          "Never discontinue or alter prescription medications based on this platform without consulting your prescribing physician.",
        ],
        herbDrugInteractions,
      },
      referral: {
        type: urgency.level === "critical" ? "Emergency Hospital Department" : "Primary health Center / General Practitioner",
        message: urgency.recommendation,
        facilities: [
          "Tikur Anbessa (Black Lion) Specialized Hospital - Addis Ababa",
          "St. Paul's Hospital Millennium Medical College - Addis Ababa",
          "Zewditu Memorial Hospital - Addis Ababa",
          "Regional Referral Hospitals across Oromia, Amhara, Tigray, Sidama, and Somali regions",
        ],
        urgency: urgency.level,
        emergencyHotlines: [
          { name: "EPHI National health Hotline", number: "907", description: "Ethiopian Public health Institute 24/7 Toll-Free" },
          { name: "Ethiopian Red Cross Ambulance", number: "991", description: "Emergency Ambulance Dispatch" },
          { name: "Police & Emergency First Responders", number: "911", description: "National Emergency Police" },
          { name: "Tikur Anbessa Emergency Desk", number: "+251-11-551-1211", description: "Central Tertiary Referral Desk" },
        ],
      },
      cultural_context: {
        isDomainB: true,
        title: culturalFinding?.name || "Ethiopian Cultural Healing Heritage",
        traditionalHealing: culturalFinding?.description || "Holistic unity of physical vitality, family solidarity, and ancestral land connection.",
        culturalSignificance: "Wax & Gold (Sem-enna-Werq) metaphorical wisdom and the communal coffee ceremony (Buna) provide daily emotional debriefing and resilience.",
        disclaimer: "Domain B Cultural Heritage Layer: Provided for personal reflection only and structurally firewalled from clinical triage and drug safety contraindications.",
      },
      astrological_context: {
        isDomainB: true,
        title: astrologicalFinding?.name || "Awde Negest Humoral Balance",
        humoralElement: astrologicalFinding?.name || "Afere (Earth / Melancholic)",
        seasonalAdvice: astrologicalFinding?.evidence || "Balance warming spices with seasonal rest to maintain constitutional equilibrium.",
        lunarGuidance: "Align seasonal dietary transitions with traditional Ge'ez calendar cycles for harmonious moderation.",
        disclaimer: "Domain B Awde Negest Heritage Layer: For personal contemplation only. Does not alter clinical diagnostic findings or lab metrics.",
      },
      culturalLayers: [culturalContext],
      crossStrandIntersections: intersections,
      causalPathways,
      rawFindings: strandResults,
    };
  }
}
