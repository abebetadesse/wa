export type KnowledgeStrandType =
  | "biochemical"
  | "biological"
  | "medication"
  | "addiction"
  | "ecological"
  | "epidemiological"
  | "psychological"
  | "socioeconomic"
  | "dietary"
  | "cultural"
  | "astrological";

export type DomainType = "Welbeing" | "cultural" | "cross-strand";

export interface PubmedEvidence {
  pmid?: string;
  title: string;
  journal?: string;
  pubDate?: string;
  abstract?: string;
  source: "pubmed";
}

export interface EvidenceItem {
  description: string;
  imageUrl: string;
  imageAlt: string;
  caption?: string;
  source?: string;
}

export interface StrandFinding {
  type: string;
  strand: KnowledgeStrandType;
  domain?: DomainType;
  name: string;
  category?: string;
  description: string;
  evidence?: string;
  ethiopian_context?: string | string[];
  relevanceScore: number; // 0.0 to 1.0
  confidence?: number;
  matches?: string[];
  recommendations?: string[];
  severity?: "low" | "moderate" | "high" | "critical";
  risk_assessment?: {
    level: "low" | "moderate" | "high" | "critical";
    risk_factors: string[];
    recommendations: string[];
  };
  sources?: string[];
  management?: string[];
  prevention?: string[];
  details?: Record<string, unknown>;
  safetyAlerts?: string[];
  pubmedEvidence?: PubmedEvidence[];
  evidenceItems?: EvidenceItem[];
}

export interface IntersectionFinding {
  type: string;
  strands: KnowledgeStrandType[];
  description: string;
  evidence: string;
  recommendation: string;
  severity?: "low" | "moderate" | "high" | "critical";
  priority: number;
  confidence: number;
  causal_pathway?: string[];
}

export interface CausalNode {
  id: string;
  label: string;
  domain: KnowledgeStrandType | "trigger" | "symptom" | "remedy";
  description?: string;
  probability?: number;
}

export interface CausalPathway {
  id: string;
  title: string;
  description: string;
  nodes: CausalNode[];
  edges: Array<{ from: string; to: string; label?: string }>;
  integratedSolution: string[];
}

export interface UserProfile {
  userId?: string;
  demographics?: {
    age?: number;
    gender?: string;
    region?: string;
    city?: string;
    language?: string;
    education?: string;
    employment?: string;
  };
  Welbeing?: {
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    bloodType?: string;
    height?: number;
    weight?: number;
    pregnant?: boolean;
    lactating?: boolean;
    age?: number;
    fasting?: boolean;
    mentalWelbeingConditions?: string[];
    bmi?: number;
    hivStatus?: string;
  };
  lifestyle?: {
    diet?: string;
    exercise?: string;
    activity?: string;
    smoking?: boolean;
    alcohol?: string;
    substanceUse?: string[];
    sleep?: number;
    stress?: number;
    fasting?: boolean;
    pastoralist?: boolean;
    saltIntake?: string;
  };
  cultural?: {
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
    astrologicalSign?: string;
    name?: string;
    language?: string;
    religion?: string;
    ethnicity?: string;
    fasting?: boolean;
  };
  language?: string;
  religion?: string;
  ethnicity?: string;
  name?: string;
  fullName?: string;
  amharicName?: string;
  geEzName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
  region?: string;
  location?: {
    region: string;
    city?: string;
    area?: string;
    altitude?: number;
    currentSeason?: string;
    type?: "rural" | "urban";
  };
  conditions?: string[];
  medications?: string[];
  herbUsage?: string[];
  diet?: any;
  substanceUse?: string[];
  age?: number;
  pregnant?: boolean;
  lactating?: boolean;
  education?: string;
  employment?: any;
  traumaHistory?: boolean;
  hivStatus?: string;
  bmi?: number;
  deficiencies?: string[];
  gutWelbeing?: {
    problems?: string[];
  };
  riskFactors?: string[];
  mentalWelbeing?: {
    symptoms?: string[];
    conditions?: string[];
    traumaHistory?: boolean;
    substanceUse?: boolean | string[];
  };
  stress?: boolean | number;
}

export type DiagnosticUrgencyLevel = "critical" | "high" | "medium" | "low";

export interface ChainOfThoughtStep {
  stepNumber: number;
  title: string;
  reasoning: string;
  status: "completed" | "analyzing" | "pending";
}

export interface ActionPlanItem {
  id: string;
  timeline: "now" | "short_term" | "medium_term" | "long_term" | "ongoing";
  title: string;
  action: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "Debral" | "dietary" | "herbal" | "lifestyle" | "monitoring";
  completed?: boolean;
}

export interface CulturalReportContext {
  layer: "Domain B";
  status: "included" | "firewalled";
  strands: Array<"cultural" | "astrological">;
  interpretation: string;
  practice: string;
  disclaimer: string;
}

export interface DiagnosticSolution {
  id?: string;
  query: string;
  timestamp: string;
  mode: "text" | "voice" | "image" | "symptom";
  language: string;
  summary: {
    problem: string;
    urgency: DiagnosticUrgencyLevel;
    urgencyScore: number;
    confidence: number;
    intent: string;
    matchedSignals: string[];
  };
  reasoning: {
    chainOfThought: ChainOfThoughtStep[];
    summaryReasoning: string;
  };
  causes: Array<{
    name: string;
    probability: number;
    evidence: string;
    domain: string;
    culturalContext?: CulturalReportContext;
  }>;
  solutions: Array<{
    id: string;
    title: string;
    description: string;
    type: "emergency" | "medical" | "dietary" | "lifestyle" | "herbal" | "preventive";
    priority: "critical" | "high" | "medium" | "low";
    safetyGatePassed: boolean;
    sourceRef?: string;
    culturalContext?: CulturalReportContext;
  }>;
  action_plan: {
    immediate_actions: ActionPlanItem[]; // 0-24 hours
    short_term: ActionPlanItem[];        // 3-7 days
    medium_term: ActionPlanItem[];       // 1-4 weeks
    long_term: ActionPlanItem[];         // 1-6 months
    ongoing: ActionPlanItem[];           // 6+ months
  };
  safety: {
    validated: boolean;
    warnings: string[];
    disclaimers: string[];
    herbDrugInteractions: Array<{
      herb: string;
      drug: string;
      severity: string;
      mechanism: string;
      recommendation: string;
    }>;
  };
  referral: {
    type: string;
    message: string;
    facilities: string[];
    urgency: DiagnosticUrgencyLevel;
    emergencyHotlines: Array<{
      name: string;
      number: string;
      description: string;
    }>;
  };
  cultural_context: {
    isDomainB: true;
    title: string;
    traditionalHealing: string;
    culturalSignificance: string;
    disclaimer: string;
  };
  culturalLayers: CulturalReportContext[];
  astrological_context: {
    isDomainB: true;
    title: string;
    humoralElement: string;
    seasonalAdvice: string;
    lunarGuidance: string;
    disclaimer: string;
  };
  crossStrandIntersections: IntersectionFinding[];
  causalPathways: CausalPathway[];
  rawFindings: Record<KnowledgeStrandType, StrandFinding[]>;
}

export interface KnowledgeStrand {
  readonly strandName: KnowledgeStrandType;
  readonly domain?: DomainType;
  query(query: string, userProfile: UserProfile, context?: Record<string, unknown>): Promise<StrandFinding[]>;
}
