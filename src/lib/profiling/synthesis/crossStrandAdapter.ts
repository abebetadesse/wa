import { IntegratedPersonalProfile } from "../types";
import { StrandFinding } from "@/lib/knowledge/types";

/**
 * Translates an Integrated Personal Profile into StrandFindings that can feed into
 * the platform's multi-strand retrieval and diagnostic reasoning engines.
 */
export function profileToStrandFindings(profile: IntegratedPersonalProfile): StrandFinding[] {
  const findings: StrandFinding[] = [];

  // Astrological Strand Finding
  findings.push({
    type: "astrological_profile_synthesis",
    strand: "astrological",
    name: `Constitutional Awde Negest: ${profile.astrology.ethiopianZodiacSign.geezName}`,
    description: `Sun in ${profile.astrology.sunSign}, Moon in ${profile.astrology.moonSign}, Ascendant in ${profile.astrology.risingSign}. Dominant Humor: ${profile.synthesis.humoralDominance.toUpperCase()}.`,
    evidence: `Astrological health analysis mapped to ${profile.astrology.planetaryPositions[0]?.healthAssociations.organs.join(", ")}. Däbtära healing scroll guidance: ${profile.astrology.dabtaraPrescriptions[0]?.title}.`,
    ethiopian_context: [
      `Awde Negest Constellation: ${profile.astrology.ethiopianZodiacSign.englishName} (${profile.astrology.ethiopianZodiacSign.dateRange})`,
      `Holy Water Auspicious Timing: ${profile.astrology.tsebelTiming.recommendedSpring} on ${profile.astrology.tsebelTiming.auspiciousDaysOfWeek.join(", ")}`,
    ],
    relevanceScore: 0.85,
    confidence: 0.9,
    recommendations: profile.synthesis.recommendations.mindBodyLifestyle,
    details: {
      isDomainB: true,
      vitalityScore: profile.synthesis.vitalityScore,
      humoralDominance: profile.synthesis.humoralDominance,
    },
    sources: ["Awde Negest Ge'ez Classical Astronomy", "Ethiopian Parchment Medical Manuscripts"],
  });

  // Cultural / Naming Strand Finding
  findings.push({
    type: "naming_cultural_identity",
    strand: "cultural",
    name: `Name Identity: ${profile.naming.givenNameProfile.name} (${profile.naming.givenNameProfile.meaning})`,
    description: profile.naming.overallNameIdentitySynergy.identityNarrative,
    evidence: `Linguistic origin: ${profile.naming.givenNameProfile.language}. health-identity correlation: ${profile.naming.givenNameProfile.healthIdentityCorrelation.psychosomaticTendency}.`,
    ethiopian_context: [
      `Cultural Context: ${profile.naming.givenNameProfile.culturalContext}`,
      `Balancing Virtue: ${profile.naming.givenNameProfile.healthIdentityCorrelation.balancingVirtue}`,
    ],
    relevanceScore: 0.82,
    confidence: 0.92,
    recommendations: [
      `Counteract somatic stress by cultivating '${profile.naming.givenNameProfile.healthIdentityCorrelation.balancingVirtue}'.`,
      ...profile.synthesis.recommendations.culturalTraditionsIntegration,
    ],
    details: {
      isDomainB: true,
      destinyNumber: profile.naming.givenNameProfile.numerologicalValues.destiny,
    },
    sources: ["Ethiopian Onomastics & Anthroponymy Archive", "Abushakir Ge'ez Fidel Numerals"],
  });

  // Dietary Strand Finding
  findings.push({
    type: "humoral_dietary_guidance",
    strand: "dietary",
    name: `Humoral Dietary Strategy for ${profile.synthesis.humoralDominance.toUpperCase()}`,
    description: profile.synthesis.recommendations.dietary.therapeuticPrinciples.join(" "),
    evidence: `Favored traditional foods: ${profile.synthesis.recommendations.dietary.favoredEthiopianFoods.join(", ")}. Foods to moderate: ${profile.synthesis.recommendations.dietary.foodsToModerate.join(", ")}.`,
    ethiopian_context: [
      "Aligned with authentic Ethiopian Food Composition Table (EFCT 2025) nutrient profiles.",
      "Traditional fermentation practices (Teff fermentation, Kocho pits) tailored to humoral metabolic rhythm.",
    ],
    relevanceScore: 0.88,
    confidence: 0.94,
    recommendations: profile.synthesis.recommendations.dietary.favoredEthiopianFoods,
    details: {
      isDomainB: false,
    },
    sources: ["EFCT 2025 (Ethiopian Food Composition Table)", "Traditional Ethiopian Dietary Customs"],
  });

  return findings;
}
