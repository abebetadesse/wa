import { EthiopianNameRecord, NameAnalysisReport } from "../types";
import { findEthiopianNameRecord, ETHIOPIAN_NAMES_DATABASE } from "./nameDatabase";
import { parseEthiopianName } from "./nameParser";
import { calculateDestiny, calculateSoulUrge, calculatePersonality } from "../numerology/numberCalculator";

export function analyzeNameIdentity(rawFullName: string): NameAnalysisReport {
  const parsed = parseEthiopianName(rawFullName);

  // Look up given name
  let givenRecord = findEthiopianNameRecord(parsed.givenName);

  // Fallback generation if not explicitly in database
  if (!givenRecord) {
    const dest = calculateDestiny(parsed.givenName);
    const soul = calculateSoulUrge(parsed.givenName);
    const pers = calculatePersonality(parsed.givenName);

    givenRecord = {
      name: parsed.givenName,
      geezFidel: parsed.isGeezScript ? parsed.givenName : undefined,
      language: "Other",
      meaning: "Traditional Ethiopian name embodying noble ancestry, blessing, and purposeful identity",
      gender: "unisex",
      originEtymology: "Rooted in classical Ethiopian Semitic or Cushitic naming heritage.",
      culturalContext: "Passed down through family lineage as a bearer of ancestral memory and communal prayer.",
      numerologicalValues: { destiny: dest, soulUrge: soul, personality: pers },
      wellbeingIdentityCorrelation: {
        selfPerceptionTheme: "Dignified personal identity balancing ancestral heritage with individual life purpose.",
        emotionalExpressionStyle: "Thoughtful and resilient; seeks alignment between personal action and family values.",
        psychosomaticTendency: "Pushes through temporary physical stress; benefits from conscious somatic unwinding.",
        balancingVirtue: "Daily mindfulness, adequate hydration, and grounding with traditional whole grains.",
      },
    };
  }

  // Look up father name if present
  let fatherRecord: EthiopianNameRecord | undefined = undefined;
  if (parsed.fatherName) {
    fatherRecord = findEthiopianNameRecord(parsed.fatherName);
    if (!fatherRecord) {
      fatherRecord = {
        name: parsed.fatherName,
        geezFidel: parsed.isGeezScript ? parsed.fatherName : undefined,
        language: "Other",
        meaning: "Patronymic pillar carrying family dignity and intergenerational protection",
        gender: "male",
        originEtymology: "Traditional patronymic lineage bearer.",
        culturalContext: "Represents the structural foundation and ancestral line supporting the client.",
        numerologicalValues: {
          destiny: calculateDestiny(parsed.fatherName),
          soulUrge: calculateSoulUrge(parsed.fatherName),
          personality: calculatePersonality(parsed.fatherName),
        },
        wellbeingIdentityCorrelation: {
          selfPerceptionTheme: "Anchored in paternal continuity and social responsibility.",
          emotionalExpressionStyle: "Steadfast, protective, and measured.",
          psychosomaticTendency: "Carries ancestral expectations in postural biomechanics.",
          balancingVirtue: "Honoring ancestry while cultivating personal physical autonomy.",
        },
      };
    }
  }

  // Build overall name identity synergy
  const identityNarrative = `The name '${givenRecord.name}' carries the cultural resonance of '${givenRecord.meaning}'${fatherRecord ? ` supported by the paternal foundation of '${fatherRecord.name}' (${fatherRecord.meaning})` : ""
    }. In Ethiopian holistic philosophy, the name is not merely a label, but a living psychological intention that guides daily behavioral choices, emotional coping mechanisms, and self-care boundaries.`;

  const wellbeingBehaviorInfluence = `With a name rooted in '${givenRecord.meaning}', the client tends to embody '${givenRecord.wellbeingIdentityCorrelation.selfPerceptionTheme}'. When under wellbeing stress, they instinctively manifest '${givenRecord.wellbeingIdentityCorrelation.emotionalExpressionStyle}'.`;

  const mindBodyResilience = `Cultivating the virtue of '${givenRecord.wellbeingIdentityCorrelation.balancingVirtue}' will directly counteract the somatic vulnerability of '${givenRecord.wellbeingIdentityCorrelation.psychosomaticTendency}', reinforcing the autonomic nervous system and restoring digestive balance.`;

  return {
    rawInputName: rawFullName,
    parsedComponents: {
      givenName: parsed.givenName,
      fatherName: parsed.fatherName,
      grandfatherName: parsed.grandfatherName,
    },
    givenNameProfile: givenRecord,
    familyLineageProfile: fatherRecord,
    overallNameIdentitySynergy: {
      identityNarrative,
      wellbeingBehaviorInfluence,
      mindBodyResilience,
    },
  };
}
