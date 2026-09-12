import { BiochemicalKnowledgeStrand } from "./strands/biochemicalStrand";
import { BiologicalKnowledgeStrand } from "./strands/biologicalStrand";
import { MedicationKnowledgeStrand } from "./strands/medicationStrand";
import { AddictionKnowledgeStrand } from "./strands/addictionStrand";
import { EcologicalKnowledgeStrand } from "./strands/ecologicalStrand";
import { EpidemiologicalKnowledgeStrand } from "./strands/epidemiologicalStrand";
import { PsychologicalKnowledgeStrand } from "./strands/psychologicalStrand";
import { SocioEconomicKnowledgeStrand } from "./strands/socioeconomicStrand";
import { DietaryKnowledgeStrand } from "./strands/dietaryStrand";
import { CulturalKnowledgeStrand } from "./strands/culturalStrand";
import { AstrologicalKnowledgeStrand } from "./strands/astrologicalStrand";
import { CrossStrandIntegrationEngine } from "./crossStrandIntegration";
import { AIReasoningEngine } from "./ai/reasoningEngine";
import {
  DiagnosticSolution,
  DiagnosticUrgencyLevel,
  IntersectionFinding,
  KnowledgeStrand,
  KnowledgeStrandType,
  StrandFinding,
  UserProfile,
} from "./types";

interface CacheEntry {
  timestamp: number;
  data: {
    strandResults: Record<KnowledgeStrandType, StrandFinding[]>;
    intersections: IntersectionFinding[];
    solution: DiagnosticSolution;
  };
}

export class KnowledgeRetrievalOrchestrator {
  readonly strands: Record<KnowledgeStrandType, KnowledgeStrand>;
  readonly integrationEngine: CrossStrandIntegrationEngine;
  readonly reasoningEngine: AIReasoningEngine;
  private cache = new Map<string, CacheEntry>();
  private cacheTTL = 3600000; // 1 hour

  constructor() {
    this.strands = {
      biochemical: new BiochemicalKnowledgeStrand(),
      biological: new BiologicalKnowledgeStrand(),
      medication: new MedicationKnowledgeStrand(),
      addiction: new AddictionKnowledgeStrand(),
      ecological: new EcologicalKnowledgeStrand(),
      epidemiological: new EpidemiologicalKnowledgeStrand(),
      psychological: new PsychologicalKnowledgeStrand(),
      socioeconomic: new SocioEconomicKnowledgeStrand(),
      dietary: new DietaryKnowledgeStrand(),
      cultural: new CulturalKnowledgeStrand(),
      astrological: new AstrologicalKnowledgeStrand(),
    };
    this.integrationEngine = new CrossStrandIntegrationEngine();
    this.reasoningEngine = new AIReasoningEngine();
  }

  async retrieveAll(
    query: string,
    mode: "text" | "voice" | "image" | "symptom",
    language: string,
    userProfile: UserProfile,
    intent: string,
    urgency: {
      level: DiagnosticUrgencyLevel;
      score: number;
      action: string;
      recommendation: string;
      matchedSignals: string[];
    }
  ): Promise<{
    strandResults: Record<KnowledgeStrandType, StrandFinding[]>;
    intersections: IntersectionFinding[];
    solution: DiagnosticSolution;
    fromCache: boolean;
  }> {
    const cacheKey = this.generateCacheKey(query, userProfile);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return {
        ...cached.data,
        fromCache: true,
      };
    }

    // Dispatch parallel query across all 11 strands
    const strandEntries = Object.entries(this.strands) as [KnowledgeStrandType, KnowledgeStrand][];
    const strandPromises = strandEntries.map(async ([name, strand]) => {
      try {
        const findings = await strand.query(query, userProfile);
        return { strand: name, findings };
      } catch (err) {
        console.error(`Error querying strand ${name}:`, err);
        return { strand: name, findings: [] as StrandFinding[] };
      }
    });

    const settled = await Promise.allSettled(strandPromises);
    const strandResults = {} as Record<KnowledgeStrandType, StrandFinding[]>;

    for (const res of settled) {
      if (res.status === "fulfilled") {
        strandResults[res.value.strand] = res.value.findings;
      }
    }

    // Guarantee all keys exist
    for (const key of Object.keys(this.strands) as KnowledgeStrandType[]) {
      if (!strandResults[key]) strandResults[key] = [];
    }

    // Run Cross-Strand Integration
    const intersections = this.integrationEngine.findIntersections(strandResults, userProfile);

    // Run AI Reasoning & Solution Synthesis
    const solution = this.reasoningEngine.synthesizeSolution({
      query,
      mode,
      language,
      userProfile,
      strandResults,
      intersections,
      intent,
      urgency,
    });

    const payload = { strandResults, intersections, solution };

    // Cache results
    this.cache.set(cacheKey, {
      timestamp: Date.now(),
      data: payload,
    });

    return {
      ...payload,
      fromCache: false,
    };
  }

  private generateCacheKey(query: string, userProfile: UserProfile): string {
    const profileFingerprint = {
      userId: userProfile.userId || "anon",
      age: userProfile.age ?? userProfile.demographics?.age ?? null,
      gender: userProfile.demographics?.gender || null,
      region: userProfile.location?.region || userProfile.demographics?.region || "highlands",
      altitude: userProfile.location?.altitude ?? null,
      medications: [...(userProfile.medications || userProfile.health?.medications || [])].map(String).sort(),
      conditions: [...(userProfile.conditions || userProfile.health?.conditions || [])].map(String).sort(),
      allergies: [...(userProfile.health?.allergies || [])].map(String).sort(),
      diet: userProfile.diet || userProfile.lifestyle?.diet || null,
      substanceUse: [...(userProfile.substanceUse || userProfile.lifestyle?.substanceUse || [])].map(String).sort(),
      pregnant: userProfile.pregnant ?? userProfile.health?.pregnant ?? false,
    };
    return `${query.toLowerCase().trim()}__${JSON.stringify(profileFingerprint)}`;
  }
}

// Global singleton orchestrator
export const globalOrchestrator = new KnowledgeRetrievalOrchestrator();
