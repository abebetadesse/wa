import type { LocationContext } from "@/lib/location/types";
import type { NumerologyProfile } from "../types";
import type { AlignmentReading } from "@/lib/hexacore/HexacoreEngine";
import type { FullDivinationResult } from "@/lib/cultural/spiritualDivinationEngine";

export type BioNarrativeStatus = "draft" | "pending_endorsement" | "endorsed" | "published";

export interface BioNarrativeConsent {
  location: boolean;
  spiritual: boolean;
  traditionalMedicine: boolean;
  bioNarrative: boolean;
  voiceIntake: boolean;
  manuscriptKnowledge: boolean;
}

export interface BioNarrativeRegionalContextSections {
  environmentalContext: string;
  nutritionalContext: string;
  commonMedicinesContext: string;
}

export interface BioNarrativeScreeningPrompt {
  prompt: string;
  category: string;
  referralAdvice: string;
}

export interface BioNarrativeSections {
  greeting: string;
  birthContextExposure: string;
  nutritionalAntinutritional: string;
  allergyAndMedicineHistory: string;
  personalityNarrative: string;
  sociologicalContext: string;
  callToAction: string;
}

export interface MotherLineageArchetype {
  archetype: string;
  archetypeAmharic: string;
  lineageTheme: string;
  culturalVirtue: string;
  ancestralResiliencePattern: string;
}

export interface BioNarrativeCalculations {
  awdeNegast: Partial<FullDivinationResult>;
  numerology: Partial<NumerologyProfile>;
  astrology: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    ethiopianZodiac: string;
    humoralDominance?: string;
  };
  hexacore: Partial<AlignmentReading>;
  motherLineage: MotherLineageArchetype;
  locationContext: LocationContext;
  currentLocationContext?: LocationContext;
}

export interface BioNarrativeReport {
  id: string;
  reportId: string;
  userId: string;
  generatedAt: string;
  status: BioNarrativeStatus;
  endorsedBy?: { role: string; name: string; date: string };
  endorsedAt?: string;
  publishedAt?: string;
  returnedWithComments?: string;
  sections: BioNarrativeSections;
  calculations?: BioNarrativeCalculations;
  regionalContextSections: BioNarrativeRegionalContextSections | null;
  screeningPrompts: BioNarrativeScreeningPrompt[];
  containsHealthContent: boolean;
  requiresHumanReview: boolean;
  hasCulturalContent: boolean;
  disclaimer: string;
  preferredLanguage?: "en" | "am";
}
