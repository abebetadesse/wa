import { KnowledgeStrandType } from "./types";

export const KNOWLEDGE_STRANDS: KnowledgeStrandType[] = [
  "biochemical",
  "biological",
  "medication",
  "addiction",
  "ecological",
  "epidemiological",
  "psychological",
  "socioeconomic",
  "dietary",
  "cultural",
  "astrological",
];

export interface KnowledgeCategory {
  id: string;
  name?: string;
  description?: string;
  use_cases?: string[];
  data: Record<string, unknown>[];
}

export interface KnowledgeDocument {
  strand: KnowledgeStrandType;
  version?: string;
  description?: string;
  categories: KnowledgeCategory[];
  [key: string]: unknown;
}

export interface KnowledgeLoadSummary {
  strands: KnowledgeStrandType[];
  categories: number;
  items: number;
}

export interface KnowledgeSearchResult extends Record<string, unknown> {
  strand: KnowledgeStrandType;
  category: string;
  category_name: string | undefined;
  relevanceScore: number;
}

interface SearchCacheEntry {
  expiresAt: number;
  results: KnowledgeSearchResult[];
}

const emptyCatalog = (): Record<KnowledgeStrandType, KnowledgeDocument> =>
  Object.fromEntries(
    KNOWLEDGE_STRANDS.map((strand) => [strand, { strand, categories: [] }])
  ) as unknown as Record<KnowledgeStrandType, KnowledgeDocument>;

const culturalV3Seed: KnowledgeDocument = {
  strand: "cultural",
  version: "3.0.0",
  description: "Comprehensive Ethiopian cultural wellbeing knowledge - traditional healing, naming, festivals, diaspora, identity, and cultural practices",
  cultural_philosophy: "Ethiopian wellbeing integrates physical, spiritual, social, and environmental wellbeing through community connection and traditional wisdom.",
  categories: [
    {
      id: "traditional_healing_practices",
      name: "Traditional Healing Practices",
      description: "Healer classifications, regional traditions, and healing rituals",
      use_cases: ["Understanding traditional healing", "Integrating with modern medicine", "Respecting cultural wellbeing practices"],
      data: [
        { name: "Healer classifications", description: "Dabtera, Wogesha, Zar practitioners, and herbalists serve distinct cultural healing roles.", types: ["Dabtera", "Wogesha", "Zar practitioner", "Herbalist"], ethiopian_context: "Traditional healers remain important healthcare resources in many rural communities." },
        { name: "Regional healing traditions", description: "Northern, southern, and pastoralist communities maintain distinct healing practices and sites.", regions: ["Northern Ethiopia", "Southern Ethiopia", "Pastoralist regions"], practices: ["Holy water healing", "Sacred forest healing", "Mobile herbal practice", "Community rituals"] },
        { name: "Supplied manuscript references", description: "User-supplied Ethiopian manuscripts can provide cultural and historical context after provenance, OCR, rights, and cultural review.", sources: ["Mets'hafe Fewus", "Mets'hafe Gitsaw", "Mets'hafe Asmat"], indexStatus: "OCR completed for scanned sources; summaries require cultural review.", integration: "Domain B reference only; keep separate from clinical evidence and do not expose unreviewed operational instructions." },
        { name: "Traditional healing rituals", description: "Community ceremonies such as Zar, Tsebel, and Waaqeffanna rituals provide spiritual and psychosocial support.", rituals: ["Zar ceremony", "Tsebel holy-water healing", "Waaqeffanna healing rituals"] }
      ]
    },
    {
      id: "naming_traditions",
      name: "Naming Traditions",
      description: "Ethiopian naming ceremonies, meanings, and cultural significance",
      use_cases: ["Understanding personal identity", "Cultural wellbeing insights", "Personalized wellbeing recommendations"],
      data: [
        { name: "Naming ceremonies", description: "Borana Oromo, Ethiopian Orthodox, and Islamic naming traditions connect identity, family, faith, and community support.", ceremonies: ["Moggaatii", "Ethiopian Orthodox naming", "Islamic Aqiqah"], wellbeing_implications: ["Extended breastfeeding support", "Community support", "Religious protection"] },
        { name: "Name meanings and wellbeing", description: "Names such as Tigist, Desta, Tsehay, and Endale carry meanings that can support identity-sensitive counseling.", examples: ["Tigist - patience", "Desta - joy", "Tsehay - sun", "Endale - recovery"], wellbeing_application: "Use names respectfully as identity context, never as a scientific determinant." }
      ]
    },
    {
      id: "ethiopian_festivals",
      name: "Ethiopian Festivals & wellbeing",
      description: "Major festivals, traditional foods, community wellbeing, and seasonal wellbeing",
      use_cases: ["Seasonal wellbeing planning", "Festival food guidance", "Community wellbeing promotion"],
      data: [
        { name: "Festival wellbeing planning", description: "Enkutatash, Timkat, Fasika, Meskel, and Irreecha bring food, fasting transitions, travel, gatherings, and physical activity.", festivals: ["Enkutatash", "Timkat", "Fasika", "Meskel", "Irreecha"], wellbeing_advice: ["Moderate portions", "Hydrate", "Break extended fasts gradually", "Limit smoke and alcohol exposure", "Rest after exertion"] }
      ]
    },
    {
      id: "ethiopian_diaspora_wellbeing",
      name: "Ethiopian Diaspora wellbeing",
      description: "Migration, acculturation, wellbeing behaviors, and cultural wellbeing preservation",
      use_cases: ["Diaspora wellbeing counseling", "Acculturation support", "Cultural wellbeing preservation"],
      data: [
        { name: "Diaspora wellbeing challenges", description: "Dietary acculturation, identity stress, language barriers, and healthcare access can affect Ethiopian diaspora communities.", challenges: ["Dietary acculturation", "Intergenerational conflict", "Discrimination stress", "Language and insurance barriers"], protective_factors: ["Community connection", "Family support", "Cultural preservation"] }
      ]
    },
    {
      id: "cultural_identity_mental_wellbeing",
      name: "Cultural Identity & Mental Health",
      description: "Identity, community belonging, resilience, and culturally adapted mental health support",
      use_cases: ["Mental Health counseling", "Identity-based support", "Community resilience"],
      data: [
        { name: "Identity and wellbeing", description: "Ethnic, religious, linguistic, family, and community belonging can provide resilience while transitions and stigma can create stress.", components: ["Ethnic identity", "Religious identity", "Community belonging", "Language preservation"], supports: ["Community groups", "Faith communities", "Traditional elders", "Culturally adapted counseling"] }
      ]
    },
    {
      id: "ethiopian_food_culture",
      name: "Ethiopian Food Culture",
      description: "Communal eating, gursha, coffee ceremony, and traditional preparation",
      use_cases: ["Cultural food guidance", "Communal eating promotion", "healthy eating habits"],
      data: [
        { name: "Communal eating and food preparation", description: "Gursha, shared plates, injera fermentation, and coffee ceremonies connect nutrition with hospitality and social wellbeing.", practices: ["Gursha", "Group eating", "Coffee ceremony", "Injera fermentation", "Coffee roasting"], wellbeing_benefits: ["Social connection", "Mindful eating", "Fermentation benefits", "Community bonding"] }
      ]
    },
    {
      id: "cultural_healing_spaces",
      name: "Cultural Healing Spaces",
      description: "Churches, sacred forests, waterfalls, springs, and traditional healer sites",
      use_cases: ["Cultural wellbeing tourism", "Healing site referral", "Holistic wellbeing planning"],
      data: [
        { name: "Sacred and community healing spaces", description: "Churches, monasteries, holy water sites, forests, waterfalls, and healer homes hold cultural significance for healing and reflection.", spaces: ["Ethiopian Orthodox churches", "Sacred forests and waterfalls", "Traditional healer sites"], safety_note: "Cultural spaces complement, but do not replace, urgent medical assessment or prescribed treatment." }
      ]
    },
    {
      id: "traditional_medicine_system",
      name: "Traditional Ethiopian Medicine System",
      description: "Spiritual, herbal, physical, and psychosocial medicine with intergenerational knowledge transmission",
      use_cases: ["Traditional medicine integration", "Healer training understanding", "wellbeing policy planning"],
      data: [
        { name: "Traditional medicine classification", description: "Ethiopian traditional medicine includes spiritual, herbal, physical, and psychosocial practices.", classifications: ["Spiritual medicine", "Herbal medicine", "Physical medicine", "Psychosocial medicine"], training: ["Apprenticeship", "Family inheritance", "Spiritual calling"] }
      ]
    },
    {
      id: "cultural_wellbeing_beliefs",
      name: "Cultural Wellbeing Beliefs",
      description: "Traditional beliefs about wellbeing, illness, hot-cold balance, and wellbeing-seeking behavior",
      use_cases: ["Cultural competence", "wellbeing communication", "Trust building"],
      data: [
        { name: "wellbeing beliefs and care seeking", description: "People may combine self-treatment, family consultation, traditional healers, faith practices, and modern healthcare depending on symptoms and access.", beliefs: ["Spiritual causes of illness", "Hot-cold balance", "Blood and vitality"], care_pathways: ["Self-treatment", "Family consultation", "Traditional healer", "Modern healthcare"], recommendation: "Respect cultural pathways while clearly directing emergencies and safety-critical care to qualified practitioners." }
      ]
    },
    {
      id: "cultural_wellbeing_integration",
      name: "Cultural Wellbeing Integration",
      description: "Referral, collaboration, and culturally competent integration with modern medicine",
      use_cases: ["wellbeing policy", "healthcare delivery", "Community wellbeing programs"],
      data: [
        { name: "Integration models", description: "Referral systems, collaborative practice, and cultural competence can connect traditional community trust with modern scientific services.", models: ["Referral system", "Collaborative practice", "Cultural competence"], safeguards: ["Medication reconciliation", "Emergency referral", "Evidence-aware counseling", "Respectful communication"] }
      ]
    }
  ]
};

const globalKey = "__ethioWellnessKnowledgeCatalog";
const searchCacheKey = "__ethioWellnessKnowledgeSearchCache";
const globalState = globalThis as typeof globalThis & {
  [globalKey]?: Record<KnowledgeStrandType, KnowledgeDocument>;
  [searchCacheKey]?: Map<string, SearchCacheEntry>;
};

export const knowledgeCatalog =
  globalState[globalKey] || (globalState[globalKey] = emptyCatalog());
if (knowledgeCatalog.cultural.categories.length === 0) {
  knowledgeCatalog.cultural = culturalV3Seed;
}
const searchCache =
  globalState[searchCacheKey] || (globalState[searchCacheKey] = new Map());

export function isKnowledgeStrand(value: unknown): value is KnowledgeStrandType {
  return typeof value === "string" && KNOWLEDGE_STRANDS.includes(value as KnowledgeStrandType);
}

export function validateKnowledgeDocument(value: unknown): KnowledgeDocument {
  if (!value || typeof value !== "object") {
    throw new Error("Knowledge data must be an object");
  }

  const document = value as Partial<KnowledgeDocument>;
  if (!isKnowledgeStrand(document.strand)) {
    throw new Error(`Invalid strand. Valid strands: ${KNOWLEDGE_STRANDS.join(", ")}`);
  }
  if (!Array.isArray(document.categories)) {
    throw new Error('Invalid data: "categories" must be an array');
  }
  if (typeof document.version !== "string" || document.version.trim() === "") {
    throw new Error('Invalid data: "version" must be a non-empty string');
  }

  const categoryIds = new Set<string>();
  const categories = document.categories.map((category, index) => {
    if (!category || typeof category !== "object" || typeof category.id !== "string") {
      throw new Error(`Invalid category at index ${index}: missing string "id"`);
    }
    if (categoryIds.has(category.id)) {
      throw new Error(`Duplicate category id: "${category.id}"`);
    }
    categoryIds.add(category.id);
    if (!category.name || !category.description) {
      throw new Error(`Invalid category "${category.id}": name and description are required`);
    }
    if (!Array.isArray(category.data) || category.data.length === 0) {
      throw new Error(`Invalid category "${category.id}": "data" must be an array`);
    }
    return {
      ...category,
      data: category.data.filter(
        (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object"
      ),
    };
  });

  return { ...document, strand: document.strand, categories } as KnowledgeDocument;
}

export function storeKnowledgeDocument(value: unknown): KnowledgeDocument {
  const document = validateKnowledgeDocument(value);
  knowledgeCatalog[document.strand] = document;
  invalidateKnowledgeSearchCache();
  return document;
}

export function storeKnowledgeDocuments(values: unknown[]): KnowledgeLoadSummary {
  const documents = values.map(validateKnowledgeDocument);
  const strands = new Set<KnowledgeStrandType>();

  for (const document of documents) {
    if (strands.has(document.strand)) {
      throw new Error(`Duplicate strand in batch: "${document.strand}"`);
    }
    strands.add(document.strand);
  }

  for (const document of documents) {
    knowledgeCatalog[document.strand] = document;
  }
  invalidateKnowledgeSearchCache();

  return {
    strands: [...strands],
    categories: documents.reduce((sum, document) => sum + document.categories.length, 0),
    items: documents.reduce(
      (sum, document) => sum + document.categories.reduce((categorySum, category) => categorySum + category.data.length, 0),
      0
    ),
  };
}

export function invalidateKnowledgeSearchCache() {
  searchCache.clear();
}

export function getKnowledgeMetadata() {
  return Object.fromEntries(
    KNOWLEDGE_STRANDS.map((strand) => {
      const document = knowledgeCatalog[strand];
      return [strand, {
        name: document.strand || strand,
        version: document.version || "1.0.0",
        description: document.description || "",
        categories: document.categories.length,
        total_items: document.categories.reduce((sum, category) => sum + category.data.length, 0),
      }];
    })
  );
}

export function searchKnowledge(query: string, strands = KNOWLEDGE_STRANDS): KnowledgeSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${normalizedQuery}::${strands.join(",")}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.results;

  if (searchCache.size > 512) {
    const now = Date.now();
    for (const [key, entry] of searchCache) {
      if (entry.expiresAt <= now) searchCache.delete(key);
    }
    if (searchCache.size > 512) searchCache.delete(searchCache.keys().next().value as string);
  }

  const results = strands.flatMap((strand) => {
    const document = knowledgeCatalog[strand];
    if (!document) return [];

    return document.categories.flatMap((category) =>
      category.data
        .map((item) => {
          const name = typeof item.name === "string" ? item.name.toLowerCase() : "";
          const description = typeof item.description === "string" ? item.description.toLowerCase() : "";
          const serialized = JSON.stringify(item).toLowerCase();
          let relevanceScore = 0;
          if (name === normalizedQuery) relevanceScore += 10;
          else if (name.includes(normalizedQuery)) relevanceScore += 5;
          if (description === normalizedQuery) relevanceScore += 7;
          else if (description.includes(normalizedQuery)) relevanceScore += 3;
          if (serialized.includes(normalizedQuery)) relevanceScore += 2;
          return relevanceScore > 0 ? {
            strand,
            category: category.id,
            category_name: category.name,
            relevanceScore,
            ...item,
          } : null;
        })
        .filter((item): item is KnowledgeSearchResult => item !== null)
    );
  });

  results.sort((left, right) => right.relevanceScore - left.relevanceScore);
  searchCache.set(cacheKey, { expiresAt: Date.now() + 300_000, results });
  return results;
}