import { KnowledgeStrandType } from "@/lib/knowledge/types";
import { CASE_STRAND_FILTERS } from "./strandRouting";

export type QuestionType = "text" | "textarea" | "select" | "checkbox" | "radio" | "number" | "date" | "email" | "phone";
export type CaseStep = "common" | "specialized" | "processing" | "reportReview" | "causeRefinement" | "solution" | "solutionReview";
export type Operator = "equals" | "contains" | "greaterThan" | "lessThan";
export type DomainLayer = "A" | "B";
type ReportCulturalContext = { layer: "Domain B"; status: "included" | "firewalled"; strands: string[]; interpretation: string; practice: string; disclaimer: string };

export type Mapping = { entityType: string; entityName: string; weight: number; when?: unknown };
export type Dependency = { fieldId: string; operator: Operator; value: string | number | boolean };
export type Question = {
  id: string; fieldId: string; questionSetId: string; text: string; type: QuestionType; required: boolean;
  options?: string[]; order: number; section: "common" | "specialized"; dependsOn?: Dependency; knowledgeMappings?: Mapping[];
};
export type SpecializedPath = { id: string; trigger: Dependency; questionSetId: string };
export type CaseDefinition = {
  id: string; name: string; description: string; icon: string; isActive: boolean; order: number;
  commonQuestionSetId: string; specializedQuestionSets: SpecializedPath[]; knowledgeStrandFilters: KnowledgeStrandType[];
  domainLayers: DomainLayer[]; interests: string[];
};
export type Cause = { id: string; description: string; confidence: number; evidence: string[]; category: string; isSelected: boolean; relatedCauses: string[]; culturalContext?: ReportCulturalContext };
export type Solution = {
  id: string; title: string; section: "immediate" | "shortTerm" | "longTerm" | "preventive" | "holistic";
  description: string; steps: string[]; confidence: number; basedOnCauses: string[]; knowledgeReferences: string[]; interestMatch?: string;
  culturalContext?: { layer: "Domain B"; status: "included" | "firewalled"; strands: string[]; interpretation: string; practice: string; disclaimer: string };
};
export type CaseSession = {
  id: string; caseId: string; userId?: string; answers: Record<string, unknown>; activeSpecializedPath?: string;
  currentStep: CaseStep; causes: Cause[]; solutions: Solution[]; reportConfirmed: boolean; selectedSolutionIds: string[];
  workflowContext?: WorkflowContext; profileSynthesis?: CaseProfileSynthesis;
  createdAt: string; lastUpdated: string;
};

type DomainConfig = Omit<CaseDefinition, "commonQuestionSetId" | "specializedQuestionSets"> & {
  challengeOptions: string[];
  specificQuestions: Question[];
};

const domainConfigs: DomainConfig[] = [
  {
    id: "wellbeing", name: "wellbeing", icon: "✚", order: 1, isActive: true,
    description: "Organize symptoms, nutrition, medication context, and safe next steps.",
    knowledgeStrandFilters: CASE_STRAND_FILTERS.wellbeing, domainLayers: ["A", "B"],
    interests: ["symptom understanding", "nutrition and recovery", "traditional safety", "mind-body rhythm"],
    challengeOptions: ["Symptoms or a new concern", "Energy, nutrition, or recovery", "Medication or herb safety", "Stress, sleep, or body rhythm"],
    specificQuestions: [
      { id: "wellbeing-age", fieldId: "age", questionSetId: "wellbeing-specific", text: "How old are you?", type: "number", required: true, order: 1, section: "specialized" },
      { id: "wellbeing-region", fieldId: "region", questionSetId: "wellbeing-specific", text: "Where are you currently living?", type: "select", options: ["Addis Ababa", "Amhara Highlands", "Oromia", "Tigray", "Sidama", "Afar Lowlands", "Other"], required: true, order: 2, section: "specialized" },
      { id: "wellbeing-detail", fieldId: "detail", questionSetId: "wellbeing-specific", text: "Describe the concern, including timing and what makes it better or worse.", type: "textarea", required: true, order: 3, section: "specialized" },
      { id: "wellbeing-medicines", fieldId: "medications", questionSetId: "wellbeing-specific", text: "List medicines, supplements, or herbs currently in use.", type: "text", required: false, order: 4, section: "specialized" },
      { id: "wellbeing-interest", fieldId: "selectedInterest", questionSetId: "wellbeing-specific", text: "Which area should shape the recommendations?", type: "select", options: ["symptom understanding", "nutrition and recovery", "traditional safety", "mind-body rhythm"], required: true, order: 5, section: "specialized" },
      { id: "wellbeing-reflection", fieldId: "reflectionLens", questionSetId: "wellbeing-specific", text: "Would you like a cultural reflection layer included?", type: "select", options: ["No, keep it scientific", "Yes, include Domain B reflection"], required: true, order: 6, section: "specialized" },
    ],
  },
  {
    id: "peace", name: "Peace", icon: "☼", order: 2, isActive: true,
    description: "Create a steadier path through stress, conflict, safety, and restoration.", knowledgeStrandFilters: CASE_STRAND_FILTERS.peace, domainLayers: ["A", "B"], interests: ["calm and grounding", "conflict navigation", "sleep and restoration", "spiritual reflection"],
    challengeOptions: ["Stress or overwhelm", "Conflict or lack of safety", "Sleep and restoration", "Grief or emotional transition"],
    specificQuestions: [
      { id: "peace-detail", fieldId: "detail", questionSetId: "peace-specific", text: "What situation is disturbing your sense of peace?", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "peace-support", fieldId: "support", questionSetId: "peace-specific", text: "What support is available to you right now?", type: "text", required: true, order: 2, section: "specialized" },
      { id: "peace-interest", fieldId: "selectedInterest", questionSetId: "peace-specific", text: "Which outcome matters most?", type: "select", options: ["calm and grounding", "conflict navigation", "sleep and restoration", "spiritual reflection"], required: true, order: 3, section: "specialized" },
      { id: "peace-reflection", fieldId: "reflectionLens", questionSetId: "peace-specific", text: "Include a cultural or community reflection lens?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
  {
    id: "power", name: "Power", icon: "◇", order: 3, isActive: true,
    description: "Turn personal agency, boundaries, and energy into practical action.", knowledgeStrandFilters: CASE_STRAND_FILTERS.power, domainLayers: ["A", "B"], interests: ["confidence and agency", "boundaries", "energy and habits", "leadership"],
    challengeOptions: ["Low agency or confidence", "Boundaries and decision fatigue", "Energy and habit change", "Leadership or responsibility"],
    specificQuestions: [
      { id: "power-detail", fieldId: "detail", questionSetId: "power-specific", text: "Where do you want more agency or influence?", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "power-barrier", fieldId: "barrier", questionSetId: "power-specific", text: "What is the main barrier?", type: "text", required: true, order: 2, section: "specialized" },
      { id: "power-interest", fieldId: "selectedInterest", questionSetId: "power-specific", text: "Which outcome should lead the plan?", type: "select", options: ["confidence and agency", "boundaries", "energy and habits", "leadership"], required: true, order: 3, section: "specialized" },
      { id: "power-reflection", fieldId: "reflectionLens", questionSetId: "power-specific", text: "Add a cultural values reflection?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
  {
    id: "money", name: "Money", icon: "◈", order: 4, isActive: true,
    description: "Clarify financial pressure, resources, and the next workable move.", knowledgeStrandFilters: CASE_STRAND_FILTERS.money, domainLayers: ["A", "B"], interests: ["stability", "debt or obligations", "income growth", "resource planning"],
    challengeOptions: ["Unstable income", "Debt or obligations", "Household pressure", "Planning and saving"],
    specificQuestions: [
      { id: "money-detail", fieldId: "detail", questionSetId: "money-specific", text: "Describe the financial situation you want to change.", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "money-horizon", fieldId: "horizon", questionSetId: "money-specific", text: "What time horizon feels most useful?", type: "select", options: ["This week", "This month", "This year"], required: true, order: 2, section: "specialized" },
      { id: "money-interest", fieldId: "selectedInterest", questionSetId: "money-specific", text: "Which outcome should lead the plan?", type: "select", options: ["stability", "debt or obligations", "income growth", "resource planning"], required: true, order: 3, section: "specialized" },
      { id: "money-reflection", fieldId: "reflectionLens", questionSetId: "money-specific", text: "Include community and cultural resource reflection?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
  {
    id: "career", name: "Career", icon: "↗", order: 5, isActive: true,
    description: "Move from uncertainty to a focused, sustainable professional direction.", knowledgeStrandFilters: CASE_STRAND_FILTERS.career, domainLayers: ["A", "B"], interests: ["career direction", "job search", "skill building", "sustainable work"],
    challengeOptions: ["Choosing a direction", "Finding work", "Skill or study decisions", "Burnout or work fit"],
    specificQuestions: [
      { id: "career-detail", fieldId: "detail", questionSetId: "career-specific", text: "What work or career change are you considering?", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "career-stage", fieldId: "stage", questionSetId: "career-specific", text: "Where are you in the process?", type: "select", options: ["Exploring", "Preparing", "Applying", "Changing direction"], required: true, order: 2, section: "specialized" },
      { id: "career-interest", fieldId: "selectedInterest", questionSetId: "career-specific", text: "Which outcome should lead the plan?", type: "select", options: ["career direction", "job search", "skill building", "sustainable work"], required: true, order: 3, section: "specialized" },
      { id: "career-reflection", fieldId: "reflectionLens", questionSetId: "career-specific", text: "Include identity, values, and cultural reflection?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
  {
    id: "relationships", name: "Relationships & Family", icon: "❤", order: 6, isActive: true,
    description: "Navigate conflict, domestic safety, family roles, and communication with a trauma-aware lens.", knowledgeStrandFilters: CASE_STRAND_FILTERS.relationships, domainLayers: ["A", "B"], interests: ["communication", "boundaries", "family harmony", "safety planning"],
    challengeOptions: ["Communication breakdown", "Family or partner conflict", "Domestic stress or unsafe dynamics", "Parenting or kinship tension"],
    specificQuestions: [
      { id: "relationships-detail", fieldId: "detail", questionSetId: "relationships-specific", text: "What is happening in the relationship or family dynamic you want help with?", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "relationships-safety", fieldId: "safety", questionSetId: "relationships-specific", text: "Do you currently feel physically safe or threatened?", type: "select", options: ["Yes, I feel safe", "I feel unsafe or threatened", "Prefer not to say"], required: true, order: 2, section: "specialized" },
      { id: "relationships-interest", fieldId: "selectedInterest", questionSetId: "relationships-specific", text: "Which goal matters most right now?", type: "select", options: ["communication", "boundaries", "family harmony", "safety planning"], required: true, order: 3, section: "specialized" },
      { id: "relationships-reflection", fieldId: "reflectionLens", questionSetId: "relationships-specific", text: "Would you like a cultural or family-values reflection layer?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
  {
    id: "spiritual", name: "Spiritual & Life Direction", icon: "✦", order: 7, isActive: true,
    description: "Explore purpose, ritual, numerology, and life direction while keeping mental-wellbeing safety clear and separate.", knowledgeStrandFilters: CASE_STRAND_FILTERS.spiritual, domainLayers: ["A", "B"], interests: ["purpose", "faith and rituals", "life path", "inner clarity"],
    challengeOptions: ["Life direction uncertainty", "Faith and meaning", "Decision-making or transitions", "Spiritual practice and routine"],
    specificQuestions: [
      { id: "spiritual-detail", fieldId: "detail", questionSetId: "spiritual-specific", text: "What life question or spiritual uncertainty do you want to understand more clearly?", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "spiritual-context", fieldId: "context", questionSetId: "spiritual-specific", text: "What spiritual or cultural tradition feels most relevant to you?", type: "select", options: ["Christian", "Muslim", "Orthodox", "Traditional Ethiopian practice", "Numerology / Awde Negest", "No specific tradition"], required: true, order: 2, section: "specialized" },
      { id: "spiritual-interest", fieldId: "selectedInterest", questionSetId: "spiritual-specific", text: "Which outcome matters most?", type: "select", options: ["purpose", "faith and rituals", "life path", "inner clarity"], required: true, order: 3, section: "specialized" },
      { id: "spiritual-reflection", fieldId: "reflectionLens", questionSetId: "spiritual-specific", text: "Include a cultural reflection layer or keep it strictly practical?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
  {
    id: "legal", name: "Legal & Dispute", icon: "⚖", order: 8, isActive: true,
    description: "Handle tenancy, contractual, family, and dispute questions with legal-safety screening before any written advice.", knowledgeStrandFilters: CASE_STRAND_FILTERS.legal, domainLayers: ["A", "B"], interests: ["rights and obligations", "contract review", "dispute strategy", "urgency planning"],
    challengeOptions: ["Housing or tenancy dispute", "Contract or obligation concern", "Family or inheritance issue", "I need a clear next step"],
    specificQuestions: [
      { id: "legal-detail", fieldId: "detail", questionSetId: "legal-specific", text: "Briefly describe the dispute or legal matter you need guidance on.", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "legal-deadline", fieldId: "deadline", questionSetId: "legal-specific", text: "Is there a court date, eviction notice, or deadline in the next 30 days?", type: "select", options: ["No", "Yes, within 30 days", "Yes, within 7 days", "Prefer not to say"], required: true, order: 2, section: "specialized" },
      { id: "legal-interest", fieldId: "selectedInterest", questionSetId: "legal-specific", text: "What kind of guidance feels most useful?", type: "select", options: ["rights and obligations", "contract review", "dispute strategy", "urgency planning"], required: true, order: 3, section: "specialized" },
      { id: "legal-reflection", fieldId: "reflectionLens", questionSetId: "legal-specific", text: "Would you like a cultural mediation perspective included separately from legal information?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
  {
    id: "social", name: "Social", icon: "◎", order: 9, isActive: true,
    description: "Understand connection, belonging, family patterns, and support.", knowledgeStrandFilters: CASE_STRAND_FILTERS.social, domainLayers: ["A", "B"], interests: ["belonging", "family connection", "friendship", "community support"],
    challengeOptions: ["Isolation or loneliness", "Family or relationship tension", "Building friendships", "Community belonging"],
    specificQuestions: [
      { id: "social-detail", fieldId: "detail", questionSetId: "social-specific", text: "Describe the relationship or community situation.", type: "textarea", required: true, order: 1, section: "specialized" },
      { id: "social-support", fieldId: "support", questionSetId: "social-specific", text: "Who can be part of your support network?", type: "text", required: true, order: 2, section: "specialized" },
      { id: "social-interest", fieldId: "selectedInterest", questionSetId: "social-specific", text: "Which outcome should lead the plan?", type: "select", options: ["belonging", "family connection", "friendship", "community support"], required: true, order: 3, section: "specialized" },
      { id: "social-reflection", fieldId: "reflectionLens", questionSetId: "social-specific", text: "Include cultural and community traditions as reflection?", type: "select", options: ["No", "Yes"], required: true, order: 4, section: "specialized" },
    ],
  },
];

const questions: Question[] = domainConfigs.flatMap((config) => [
  { id: `${config.id}-challenge`, fieldId: "challenge", questionSetId: `${config.id}-common`, text: `Which common ${config.name.toLowerCase()} challenge best describes your situation?`, type: "select", options: config.challengeOptions, required: true, order: 1, section: "common" as const },
  ...config.specificQuestions,
]);
const cases: CaseDefinition[] = domainConfigs.map((config) => ({
  id: config.id, name: config.name, description: config.description, icon: config.icon, isActive: config.isActive, order: config.order,
  commonQuestionSetId: `${config.id}-common`, specializedQuestionSets: [{ id: `${config.id}-specific`, trigger: { fieldId: "challenge", operator: "contains", value: "" }, questionSetId: `${config.id}-specific` }],
  knowledgeStrandFilters: config.knowledgeStrandFilters, domainLayers: config.domainLayers, interests: config.interests,
}));
const sessions = new Map<string, CaseSession>();

export function listCases() { return cases.filter((item) => item.isActive).sort((a, b) => a.order - b.order); }
export function getCase(caseId: string) { return cases.find((item) => item.id === caseId && item.isActive); }
export function getQuestions(questionSetId: string) { return questions.filter((item) => item.questionSetId === questionSetId).sort((a, b) => a.order - b.order); }
export function matches(value: unknown, dependency: Dependency) {
  if (value === undefined || value === null) return false;
  const left = Array.isArray(value) ? value.join(",").toLowerCase() : String(value).toLowerCase();
  const right = String(dependency.value).toLowerCase();
  if (dependency.operator === "contains") return right === "" || left.includes(right);
  if (dependency.operator === "greaterThan") return Number(value) > Number(dependency.value);
  if (dependency.operator === "lessThan") return Number(value) < Number(dependency.value);
  return left === right;
}
export function visibleQuestions(questionSetId: string, answers: Record<string, unknown>) { return getQuestions(questionSetId).filter((question) => !question.dependsOn || matches(answers[question.dependsOn.fieldId], question.dependsOn)); }
export function startSession(caseId: string, userId?: string) {
  const now = new Date().toISOString();
  const session: CaseSession = { id: crypto.randomUUID(), caseId, userId, answers: {}, currentStep: "common", causes: [], solutions: [], reportConfirmed: false, selectedSolutionIds: [], createdAt: now, lastUpdated: now };
  sessions.set(session.id, session); return session;
}
export function getSession(sessionId: string) { return sessions.get(sessionId); }
export function restoreSession(session: CaseSession) { sessions.set(session.id, session); return session; }
export function saveAnswers(sessionId: string, answers: Record<string, unknown>) {
  const session = sessions.get(sessionId); if (!session) return undefined;
  session.answers = { ...session.answers, ...answers }; session.currentStep = session.answers.challenge ? "specialized" : "common"; session.lastUpdated = new Date().toISOString(); return session;
}
export function getNextQuestions(sessionId: string) {
  const session = sessions.get(sessionId); if (!session) return undefined;
  const selectedCase = getCase(session.caseId); if (!selectedCase) return undefined;
  const setId = session.currentStep === "specialized" ? `${selectedCase.id}-specific` : selectedCase.commonQuestionSetId;
  return { step: session.currentStep, questions: visibleQuestions(setId, session.answers) };
}
function buildDetailedFallbackCauses(session: CaseSession, selectedCase: CaseDefinition, challenge: string, interest: string, reflection: boolean): Cause[] {
  const baseContext: ReportCulturalContext = {
    layer: "Domain B",
    status: reflection ? "included" : "firewalled",
    strands: ["cultural", "astrological", "socioeconomic"],
    interpretation: "Cultural and community context is available as a reflective layer. Strengths: Reliability, Patience, Discipline, Persistence. Weaknesses: Rigidity, Pessimism, Isolation, Stubbornness. wellbeing focus: Bone wellbeing, Joint mobility, Digestive regularity, Skin moisture.",
    practice: "Use cultural and astrological findings only as an optional reflective perspective, separate from scientific reasoning.",
    disclaimer: "Domain B remains educational and reflective only. It never changes urgency, diagnosis, medication safety, or emergency decisions.",
  };

  const dhebtaContext: ReportCulturalContext = {
    layer: "Domain B",
    status: reflection ? "included" : "firewalled",
    strands: ["cultural", "astrological"],
    interpretation: "Däbtära healing scrolls and celestial botanical inscriptions are best read as a reflective tradition for emotional steadiness, ritual timing, and psychosomatic support, not as a substitute for evidence-based scientific care.",
    practice: "Use cultural and astrological findings only as an optional reflective perspective, separate from scientific reasoning.",
    disclaimer: "This layer supports meaning-making and self-regulation; it does not replace medical evaluation or safe treatment decisions.",
  };

  const incomeContext: ReportCulturalContext = {
    layer: "Domain B",
    status: reflection ? "included" : "firewalled",
    strands: ["socioeconomic", "community"],
    interpretation: "Income inequality and wealth distribution materially affect food security, healthcare access, social stress, and long-term recovery. Uneven resource distribution often magnifies fatigue, delayed care, and household instability.",
    practice: "Use community, household, and economic context as a practical support lens rather than a financial plan. Consider resource mapping, support networks, and affordable care pathways.",
    disclaimer: "This is contextual guidance for planning and support, not legal, financial, or investment advice.",
  };

  return [
    {
      id: `${selectedCase.id}-afere-finding`,
      description: "AFERE (አፈሬ - EARTH / MELANCHOLIC)",
      confidence: 0.88,
      evidence: [
        "Grounded, stable, and slow-moving temperamental profile with a strong tendency toward structure, endurance, and practical persistence.",
        "The pattern suggests careful pacing, disciplined routines, and attention to bone wellbeing, joint mobility, digestive regularity, and skin moisture.",
        "It may reflect emotional heaviness, rigidity, and isolation when stress is prolonged or unresolved.",
      ],
      category: "cultural",
      isSelected: true,
      relatedCauses: [],
      culturalContext: baseContext,
    },
    {
      id: `${selectedCase.id}-dabtara-finding`,
      description: "DÄBTÄRA HEALING SCROLL & CELESTIAL BOTANICAL INSCRIPTION",
      confidence: 0.82,
      evidence: [
        "This reflective layer points to ritual timing, botanicals, and symbolic healing practices that support calm, emotional regulation, and a steadier daily rhythm.",
        "In traditional Ethiopian practice, this is interpreted as a way to restore inner balance, reduce stress, and re-center bodily and spiritual steadiness.",
        "The note should be used as a contextual perspective rather than a diagnostic substitute.",
      ],
      category: "cultural",
      isSelected: true,
      relatedCauses: [],
      culturalContext: dhebtaContext,
    },
    {
      id: `${selectedCase.id}-income-inequality-finding`,
      description: "INCOME INEQUALITY & WEALTH DISTRIBUTION",
      confidence: 0.8,
      evidence: [
        "This pattern points to a meaningful pressure from uneven access to money, food, transportation, and healthcare services.",
        "When resources are limited, stress rises, routines break down, and people may delay care or struggle to maintain prevention-focused habits.",
        "It is important to treat this as a contextual risk factor rather than a personal failure or diagnosis.",
      ],
      category: "socioeconomic",
      isSelected: true,
      relatedCauses: [],
      culturalContext: incomeContext,
    },
    {
      id: `${selectedCase.id}-selected-challenge`,
      description: `${challenge} is the primary pattern selected for this case.`,
      confidence: 0.88,
      evidence: ["Selected common challenge", String(session.answers.detail || "Specific case details")],
      category: selectedCase.id,
      isSelected: true,
      relatedCauses: [],
    },
    {
      id: `${selectedCase.id}-context`,
      description: `Your stated goal of ${interest} shapes which next steps are most useful.`,
      confidence: 0.82,
      evidence: ["Selected interest", String(session.answers.barrier || session.answers.support || session.answers.horizon || "Personal context")],
      category: "preference",
      isSelected: true,
      relatedCauses: [],
    },
  ];
}

function buildDetailedFallbackSolutions(session: CaseSession, selectedCase: CaseDefinition, interest: string): Solution[] {
  const groundingContext: ReportCulturalContext = {
    layer: "Domain B",
    status: "included",
    strands: ["cultural", "astrological"],
    interpretation: "The grounded pattern suggests a stronger need for steadiness, lower chaos, and practical rhythm than for rapid change.",
    practice: "Use cultural and astrological findings only as an optional reflective perspective, separate from scientific reasoning.",
    disclaimer: "Reflective guidance should not override tested medical advice or urgent safety needs.",
  };

  const ritualContext: ReportCulturalContext = {
    layer: "Domain B",
    status: "included",
    strands: ["cultural", "astrological"],
    interpretation: "This tradition offers emotional grounding and meaning, especially when stress feels heavy or isolating.",
    practice: "Use cultural and astrological findings only as an optional reflective perspective, separate from scientific reasoning.",
    disclaimer: "The ritual layer is not a scientific treatment plan and must remain separate from urgent care decisions.",
  };

  const resourceContext: ReportCulturalContext = {
    layer: "Domain B",
    status: "included",
    strands: ["socioeconomic", "community"],
    interpretation: "Economic context can shape access, stress, choices, and resilience. Support planning is more effective when it is concrete and community-aware.",
    practice: "Use community, household, and economic context as a practical support lens rather than a financial plan.",
    disclaimer: "This is contextual guidance, not legal, financial, or investment advice.",
  };

  return [
    {
      id: `${selectedCase.id}-grounding-plan`,
      title: "Grounding and physiological support",
      section: "immediate",
      description: "Reduce overload and restore rhythm with a simple daily plan focused on hydration, movement, and predictable meals or rest windows.",
      steps: [
        "Set a consistent wake, meal, and sleep pattern for the next 7 days.",
        "Prioritize gentle movement, hydration, and regular digestion to support bone, joint, and skin resilience.",
        "Track triggers that worsen stress, fatigue, or stiffness so patterns become clearer.",
      ],
      confidence: 0.86,
      basedOnCauses: [`${selectedCase.id}-afere-finding`],
      knowledgeReferences: ["earth-constitution", "cultural-wellbeing-context"],
      interestMatch: interest,
      culturalContext: groundingContext,
    },
    {
      id: `${selectedCase.id}-cultural-reflection-plan`,
      title: "Reflective cultural support",
      section: "shortTerm",
      description: "Use ritual, community support, and self-reflection as a separate layer to reduce emotional strain without substituting scientific care.",
      steps: [
        "Create a quiet morning or evening routine with prayer, breathing, or a short reflective practice.",
        "Limit reliance on symbolic practices as a substitute for medical evaluation if symptoms worsen or remain unexplained.",
        "Invite a trusted family member, elder, or counselor into the process for accountability and support.",
      ],
      confidence: 0.81,
      basedOnCauses: [`${selectedCase.id}-dabtara-finding`],
      knowledgeReferences: ["dabtara-scroll", "community-reflection"],
      interestMatch: interest,
      culturalContext: ritualContext,
    },
    {
      id: `${selectedCase.id}-resource-plan`,
      title: "Resource and support planning",
      section: "holistic",
      description: "Address the practical stressors connected to income pressure, access gaps, and household stability before expecting lasting change.",
      steps: [
        "Map immediate essentials: food, transport, medication access, and basic household support.",
        "Prioritize one affordable step that reduces strain this week rather than a large overhaul.",
        "Use community support, local programs, or trusted networks to reduce isolation and improve continuity of care.",
      ],
      confidence: 0.8,
      basedOnCauses: [`${selectedCase.id}-income-inequality-finding`],
      knowledgeReferences: ["socioeconomic-context", "care-access"],
      interestMatch: interest,
      culturalContext: resourceContext,
    },
  ];
}

function buildProfileSynthesisFromSession(session: CaseSession): CaseProfileSynthesis | undefined {
  const rawName = String(session.answers.fullName || session.answers.name || session.answers.clientName || "").trim();
  const rawMotherName = String(session.answers.motherName || session.answers.mother || "").trim();
  const rawBirthDate = String(session.answers.birthDate || session.answers.dateOfBirth || "").trim();
  const rawBirthPlace = String(session.answers.birthPlace || session.answers.location || session.answers.region || "Addis Ababa").trim();
  const rawBirthTime = String(session.answers.birthTime || "12:00").trim();
  const latitude = Number(session.answers.latitude ?? 9.03);
  const longitude = Number(session.answers.longitude ?? 38.74);
  const altitudeMeters = Number(session.answers.altitudeMeters ?? 2400);

  if (!rawName && !rawBirthDate && !rawBirthPlace) return undefined;

  const fallbackName = rawName || "Case Client";
  const fallbackBirthDate = rawBirthDate || "1990-01-15";
  const fallbackBirthPlace = rawBirthPlace || "Addis Ababa";
  const profile = buildPersonalProfile({
    fullName: fallbackName,
    birthDate: fallbackBirthDate,
    birthTime: rawBirthTime || "12:00",
    birthPlace: fallbackBirthPlace,
    preferredLanguage: "en",
  });

  const chart: CaseProfileChartPoint[] = [
    {
      key: "vitality",
      label: "Vitality",
      value: profile.synthesis.vitalityScore,
      description: `Vitality index across the astrologic, numerologic, and seasonal layers for ${fallbackName}.`,
    },
    {
      key: "lifePath",
      label: "Life path",
      value: profile.numerology.lifePath.number,
      description: `Life Path ${profile.numerology.lifePath.number} summary: ${profile.numerology.lifePath.archetype}.`,
    },
    {
      key: "dominantHumor",
      label: "Humoral dominance",
      value: { esat: 1, afere: 2, nifas: 3, may: 4 }[profile.synthesis.humoralDominance] ?? 1,
      description: `Humoral balance resolves to ${profile.synthesis.humoralDominance}.`,
    },
    {
      key: "sunSign",
      label: "Sun sign",
      value: profile.astrology.planetaryPositions.find((planet) => planet.planet === "Sun")?.house ?? 1,
      description: `${profile.astrology.sunSign} sun sign based on natal placement.`,
    },
  ];

  const summary = `${fallbackName}${rawMotherName ? `, child of ${rawMotherName}` : ""}, born ${fallbackBirthDate}${fallbackBirthPlace ? ` in ${fallbackBirthPlace}` : ""}, shows a ${profile.synthesis.humoralDominance} dominant balancing pattern with a life path ${profile.numerology.lifePath.number} orientation and a vitality score of ${profile.synthesis.vitalityScore}.`;

  return {
    identity: {
      name: fallbackName,
      motherName: rawMotherName || undefined,
      birthDate: fallbackBirthDate,
      birthTime: rawBirthTime || "12:00",
    },
    geography: {
      city: fallbackBirthPlace,
      region: profile.astrology.birthLocation || fallbackBirthPlace,
      latitude: Number.isFinite(latitude) ? latitude : (profile.astrology.coordinates.latitude ?? 9.03),
      longitude: Number.isFinite(longitude) ? longitude : (profile.astrology.coordinates.longitude ?? 38.74),
      altitudeMeters: Number.isFinite(altitudeMeters) ? altitudeMeters : 2400,
    },
    chart,
    summary,
  };
}

export function processSession(sessionId: string) {
  const session = sessions.get(sessionId); if (!session) return undefined;
  const selectedCase = getCase(session.caseId); if (!selectedCase) return undefined;
  const interest = String(session.answers.selectedInterest || selectedCase.interests[0]);
  const challenge = String(session.answers.challenge || "your selected challenge");
  const reflection = String(session.answers.reflectionLens || "").toLowerCase().includes("yes");
  const query = [challenge, session.answers.detail, session.answers.medications, session.answers.barrier, session.answers.support].filter(Boolean).join(" ");
  session.workflowContext = buildWorkflowContext(selectedCase.id, query, reflection);
  session.profileSynthesis = buildProfileSynthesisFromSession(session);
  const diagnosticAssessment = session.answers.diagnosticAssessment as {
    causes?: Array<{ name: string; probability: number; evidence: string; domain: string; culturalContext?: ReportCulturalContext }>;
    solutions?: Array<{ id: string; title: string; description: string; priority?: string; sourceRef?: string; culturalContext?: ReportCulturalContext }>;
  } | undefined;
  if (diagnosticAssessment?.causes?.length) {
    session.causes = diagnosticAssessment.causes.map((cause, index) => ({
      id: `${selectedCase.id}-diagnostic-cause-${index + 1}`,
      description: cause.name,
      confidence: cause.probability / 100,
      evidence: [cause.evidence, `Diagnostic strand: ${cause.domain}`],
      category: cause.domain,
      isSelected: true,
      relatedCauses: [],
      culturalContext: cause.culturalContext,
    }));
  } else {
    session.causes = buildDetailedFallbackCauses(session, selectedCase, challenge, interest, reflection);
    if (session.workflowContext.safety.level === "critical") {
      session.causes.unshift({ id: `${selectedCase.id}-safety`, description: "The case includes a potential emergency signal requiring immediate in-person care.", confidence: 1, evidence: session.workflowContext.safety.matchedSignals, category: "safety", isSelected: true, relatedCauses: [] });
    }
  }
  if (diagnosticAssessment?.solutions?.length) {
    session.solutions = diagnosticAssessment.solutions.map((solution, index) => ({
      id: solution.id || `${selectedCase.id}-diagnostic-solution-${index + 1}`,
      title: solution.title,
      section: solution.priority === "critical" || solution.priority === "high" ? "immediate" : "shortTerm",
      description: solution.description,
      steps: [solution.sourceRef || "Review with a qualified professional"],
      confidence: 0.8,
      basedOnCauses: session.causes.map((cause) => cause.id),
      knowledgeReferences: ["11-strand diagnostic synthesis"],
      culturalContext: solution.culturalContext,
    }));
  } else {
    session.solutions = buildDetailedFallbackSolutions(session, selectedCase, interest);
  }
  session.currentStep = "reportReview"; session.lastUpdated = new Date().toISOString(); return session;
}
export function confirmReport(sessionId: string, confirmed: boolean) {
  const session = sessions.get(sessionId); if (!session) return undefined;
  session.reportConfirmed = confirmed; session.currentStep = confirmed ? "causeRefinement" : "specialized"; session.lastUpdated = new Date().toISOString(); return session;
}
function buildSolutions(session: CaseSession): Solution[] {
  const selectedCase = getCase(session.caseId); if (!selectedCase) return [];
  const interest = String(session.answers.selectedInterest || selectedCase.interests[0]);
  const detail = String(session.answers.detail || "your stated situation");
  const reflection = (session.workflowContext?.domainB.length || 0) > 0;
  const layer = reflection ? " Include the requested Domain B reflection as a separate values and cultural perspective." : "";
  const refs = session.workflowContext?.queried || selectedCase.knowledgeStrandFilters;
  return [
    { id: `${selectedCase.id}-immediate`, title: `First move for ${interest}`, section: "immediate", description: `Start with one small, observable action connected to ${detail}.${layer}`, steps: ["Choose one action you can complete within 24 hours", "Write down what changed and what support you need"], confidence: 0.86, basedOnCauses: session.causes.filter((cause) => cause.isSelected).map((cause) => cause.id), knowledgeReferences: refs, interestMatch: interest },
    { id: `${selectedCase.id}-short-term`, title: `Build a ${interest} plan`, section: "shortTerm", description: `Use a seven-day experiment to test the most practical path for ${interest}.`, steps: ["Set one measurable weekly target", "Review the result with a trusted person or qualified professional where appropriate"], confidence: 0.8, basedOnCauses: session.causes.filter((cause) => cause.isSelected).map((cause) => cause.id), knowledgeReferences: refs, interestMatch: interest },
    { id: `${selectedCase.id}-holistic`, title: "Holistic reflection and support", section: "holistic", description: `Connect the plan to your relationships, environment, routines, and values.${layer}`, steps: ["Name the people, place, or practice that supports this goal", "Revisit the plan after new information or changing circumstances"], confidence: 0.74, basedOnCauses: session.causes.filter((cause) => cause.isSelected).map((cause) => cause.id), knowledgeReferences: [...refs, "cultural"], interestMatch: interest },
  ];
}
export function refineCauses(sessionId: string, selectedCauseIds: string[]) {
  const session = sessions.get(sessionId); if (!session) return undefined;
  session.causes = session.causes.map((cause) => ({ ...cause, isSelected: selectedCauseIds.includes(cause.id) })); session.currentStep = "solution"; session.solutions = buildSolutions(session); session.lastUpdated = new Date().toISOString(); return session;
}
export function decideSolutions(sessionId: string, selectedSolutionIds: string[]) {
  const session = sessions.get(sessionId); if (!session) return undefined;
  session.selectedSolutionIds = selectedSolutionIds; session.currentStep = "solutionReview"; session.lastUpdated = new Date().toISOString(); return session;
}
import { buildWorkflowContext } from "./integration";
import type { WorkflowContext } from "./integration";
import { buildPersonalProfile } from "@/lib/profiling/synthesis/profileBuilder";

export type CaseProfileChartPoint = {
  key: string;
  label: string;
  value: number;
  description: string;
};

export type CaseProfileSynthesis = {
  identity: {
    name: string;
    motherName?: string;
    birthDate?: string;
    birthTime?: string;
  };
  geography: {
    city: string;
    region?: string;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
  };
  chart: CaseProfileChartPoint[];
  summary: string;
};
