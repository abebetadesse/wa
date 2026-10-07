import { resolveLocation } from "@/lib/location";
import type { LocationContext } from "@/lib/location/types";
import { buildNumerologyProfile } from "../numerology/numberCalculator";
import { buildAstrologicalProfile } from "../astrology/chartCalculator";
import { analyzeNameIdentity } from "../naming/culturalAnalyzer";
import { HexacoreEngine } from "@/lib/hexacore/HexacoreEngine";
import { calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";
import { analyzeMotherNameLineage } from "./motherLineageAnalyzer";
import type {
  BioNarrativeReport,
  BioNarrativeSections,
  BioNarrativeCalculations,
  BioNarrativeConsent,
  BioNarrativeRegionalContextSections,
  BioNarrativeScreeningPrompt,
  BioNarrativeStatus,
} from "./types";

export interface GenerateBioNarrativeInput {
  userId: string;
  primaryName: string;
  birthDate: string; // YYYY-MM-DD (Gregorian)
  birthTime?: string; // HH:mm
  birthLocation: string; // Region or town
  currentLocation?: string;
  motherName: string;
  consent?: Partial<BioNarrativeConsent>;
  preferredLanguage?: "en" | "am";
  status?: BioNarrativeStatus;
}

const MANDATORY_DISCLAIMER_EN =
  "This overview is a reflective tool based on cultural, geographical, and computational inputs. It is not a medical, psychological, or spiritual diagnosis.";

const MANDATORY_DISCLAIMER_AM =
  "ይህ የግል የሕይወትና የደኅንነት ማጠቃለያ በባህላዊ፣ መልክዓ-ምድራዊ እና ስሌታዊ መረጃዎች ላይ የተመሠረተ የማንጸባረቂያ መሣሪያ ነው። የሕክምና፣ የሥነ-ልቦና ወይም የመንፈሳዊ ምርመራ (ዲያግኖሲስ) አይደለም።";

export async function generateBioNarrativeReport(
  input: GenerateBioNarrativeInput
): Promise<BioNarrativeReport> {
  const isAm = input.preferredLanguage === "am";
  const consent = {
    location: false,
    spiritual: false,
    traditionalMedicine: false,
    bioNarrative: false,
    voiceIntake: false,
    manuscriptKnowledge: false,
    identityContext: false,
    ...input.consent,
  };
  if (!consent.bioNarrative) {
    throw new Error("Bio-narrative generation requires explicit consent.");
  }
  if (!consent.location) {
    throw new Error("Location context requires explicit location consent.");
  }

  // Step 1: Resolve birth location and current location contexts
  const birthLocationContext: LocationContext = await resolveLocation({
    region: input.birthLocation,
    source: "manual",
  });

  let currentLocationContext: LocationContext | undefined = undefined;
  if (input.currentLocation && input.currentLocation !== input.birthLocation) {
    try {
      currentLocationContext = await resolveLocation({
        region: input.currentLocation,
        source: "manual",
      });
    } catch {
      currentLocationContext = undefined;
    }
  }

  // Step 2 & 3: Exposure, Endemic, and Medicines Analysis
  const birthRegion = birthLocationContext.admin.region;
  const agroEco = birthLocationContext.agroEcological;
  const altitudeBand = birthLocationContext.altitudeBand;
  const endemic = birthLocationContext.endemicDiseases || [];
  const staples = birthLocationContext.foodAvailability?.staples || ["Teff", "Wheat", "Pulses"];

  let sections: BioNarrativeSections = {
    greeting: isAm ? "የባህላዊ እና መንፈሳዊ ነጸብራቅ ለማየት ፈቃድ አልተሰጠም።" : "Cultural and spiritual reflection was not requested.",
    birthContextExposure: "",
    nutritionalAntinutritional: "",
    allergyAndMedicineHistory: "",
    personalityNarrative: "",
    sociologicalContext: "",
    callToAction: "",
  };
  let calculations: BioNarrativeCalculations | undefined;

  if (consent.spiritual) {
    const numerology = buildNumerologyProfile(input.primaryName, input.birthDate);
    const astrology = buildAstrologicalProfile(
      input.birthDate,
      input.birthTime || "12:00",
      birthRegion || "Addis Ababa"
    );
    const naming = analyzeNameIdentity(input.primaryName);
    const divination = calculateFullDivination(input.primaryName, input.motherName);
    const hexacore = HexacoreEngine.compute({ user: { dateOfBirth: input.birthDate } });
    const motherLineage = analyzeMotherNameLineage(input.motherName, input.birthLocation);
    const culturalSections = isAm
      ? generateSectionsAmharic({ name: input.primaryName, birthRegion, agroEco, altitudeBand, endemic, staples, numerology, astrology, naming, divination, hexacore, motherLineage })
      : generateSectionsEnglish({ name: input.primaryName, birthRegion, agroEco, altitudeBand, endemic, staples, numerology, astrology, naming, divination, hexacore, motherLineage });

    sections = {
      ...culturalSections,
      birthContextExposure: "",
      nutritionalAntinutritional: "",
      allergyAndMedicineHistory: "",
    };
    const zodiac = astrology.ethiopianZodiacSign as { nameAmharic?: string; name?: string } | undefined;
    calculations = {
      awdeNegast: {
        totalSum: divination.totalSum,
        finalNumber: divination.finalNumber,
        zodiac: divination.zodiac,
        awdeCircle: divination.awdeCircle,
        awdeSegment: divination.awdeSegment,
        talismanic: divination.talismanic,
        telsem: divination.telsem,
      },
      numerology: {
        lifePath: numerology.lifePath,
        destiny: numerology.destiny,
        soulUrge: numerology.soulUrge,
        personality: numerology.personality,
        somaticwellbeingSummary: numerology.somaticwellbeingSummary,
      },
      astrology: {
        sunSign: astrology.sunSign || "Aries",
        moonSign: astrology.moonSign || "Taurus",
        risingSign: astrology.risingSign || "Aries",
        ethiopianZodiac: zodiac?.nameAmharic || zodiac?.name || "ሐመል",
        humoralDominance: astrology.dominantHumor,
      },
      hexacore,
      motherLineage,
      locationContext: birthLocationContext,
      currentLocationContext,
    };
  }

  const regionalContextSections: BioNarrativeRegionalContextSections | null = consent.traditionalMedicine
    ? buildRegionalContextSections(birthLocationContext, isAm)
    : null;
  const screeningPrompts: BioNarrativeScreeningPrompt[] = consent.traditionalMedicine
    ? [{
        prompt: "Is there a health concern you would like to discuss with a qualified healthcare professional?",
        category: "general",
        referralAdvice: "This question is not a screening result or diagnosis.",
      }]
    : [];
  const containsHealthContent = Boolean(regionalContextSections || screeningPrompts.length);

  const reportId = `biorpt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  return {
    id: reportId,
    reportId,
    userId: input.userId,
    generatedAt: new Date().toISOString(),
    status: input.status || "pending_endorsement",
    sections,
    ...(calculations ? { calculations } : {}),
    regionalContextSections,
    screeningPrompts,
    containsHealthContent,
    requiresHumanReview: containsHealthContent,
    hasCulturalContent: consent.spiritual,
    disclaimer: isAm ? MANDATORY_DISCLAIMER_AM : MANDATORY_DISCLAIMER_EN,
    preferredLanguage: input.preferredLanguage || "en",
  };
}

function buildRegionalContextSections(
  context: LocationContext,
  isAm: boolean,
): BioNarrativeRegionalContextSections {
  const region = context.admin.region || "the selected birth region";
  const diseases = context.endemicDiseases ?? [];
  const staples = context.foodAvailability?.staples ?? [];
  const altitude = context.altitudeBand || "unavailable";
  return {
    environmentalContext: isAm
      ? `${region} በ${altitude} የከፍታ ምድብ ውስጥ ይመደባል። ${diseases.length ? `የአካባቢ የሕዝብ ጤና ማጣቀሻዎች ${diseases.join("፣ ")} ይጠቅሳሉ።` : "የአካባቢ የሕዝብ ጤና መረጃ አልተመዘገበም።"} ይህ የሕዝብ ደረጃ መረጃ ስለ ግለሰብ ጤና ወይም ተጋላጭነት ግምት አይሰጥም.`
      : `Regional context for ${region}: this area is classified in the ${altitude} altitude band. ${diseases.length ? `Regional public-health references list ${diseases.join(", ")}.` : "No regional public-health conditions are recorded."} This population-level context does not indicate an individual's health or exposure.`,
    nutritionalContext: isAm
      ? `በአካባቢው የተመዘገቡ ዋና ምግቦች ${staples.slice(0, 4).join("፣ ") || "አልተገኙም"} ናቸው። ይህ የአካባቢ መረጃ እንጂ የግል አመጋገብ ወይም የጤና ግምት አይደለም።`
      : `Regional records list ${staples.slice(0, 4).join(", ") || "no staple foods"} as foods associated with this area. This is not a description of the user's diet or nutritional status.`,
    commonMedicinesContext: "",
  };
}

// ─── ENGLISH NARRATIVE GENERATOR ─────────────────────────────────────────────

interface GeneratorParams {
  name: string;
  birthRegion: string;
  agroEco: string;
  altitudeBand: string;
  endemic: string[];
  staples: string[];
  numerology: ReturnType<typeof buildNumerologyProfile>;
  astrology: ReturnType<typeof buildAstrologicalProfile>;
  naming: ReturnType<typeof analyzeNameIdentity>;
  divination: ReturnType<typeof calculateFullDivination>;
  hexacore: ReturnType<typeof HexacoreEngine.compute>;
  motherLineage: ReturnType<typeof analyzeMotherNameLineage>;
}

function generateSectionsEnglish(p: GeneratorParams): BioNarrativeSections {
  const sunSign = p.astrology.sunSign || "Aries";
  const moonSign = p.astrology.moonSign || "Taurus";
  const rising = p.astrology.risingSign || "Aries";
  const primaryCore = p.hexacore.activeCores.primary;

  const coreNames: Record<string, { title: string; gift: string; shadow: string }> = {
    P: { title: "Vital Power (ኃይል)", gift: "direct initiation and decisive energy", shadow: "impatience and physical burnout" },
    H: { title: "Living Heart (ልብ)", gift: "relational resonance and deep compassion", shadow: "over-absorbing others' emotional strain" },
    C: { title: "Creation & Craft (ፍጥረት)", gift: "bringing abstract visions into tangible structure", shadow: "rigidity and excessive perfectionism" },
    E: { title: "Essential Peace (ሰላም)", gift: "tranquil stillness and grounded equilibrium", shadow: "passive withdrawal in moments of friction" },
    S: { title: "Spirit & Breath (መንፈስ)", gift: "intuitive clarity and visionary perspective", shadow: "disconnection from daily bodily grounding" },
    O: { title: "Sacred Order (ሥርዓት)", gift: "architectural stability and rhythmic consistency", shadow: "resistance to sudden, necessary change" },
  };
  const coreMeta = coreNames[primaryCore] || coreNames.E;

  const altitudeText = p.altitudeBand === ">3200" || p.altitudeBand === "2300-3200"
    ? ` The location data classifies this area in a highland altitude band (${p.altitudeBand}m).`
    : p.altitudeBand === "<1500"
      ? " The location data classifies this area in a lowland altitude band (below 1500m)."
      : ` The location data classifies this area in the ${p.altitudeBand}m altitude band.`;
  const regionalConditions = p.endemic.length > 0
    ? ` Regional public-health references list ${p.endemic.join(", ")}; this is population-level context and does not indicate anything about an individual's health or past exposure.`
    : " No regional condition data is available in this profile.";
  const staple = p.staples[0] || "Teff";
  const regionalDiet = ` Foods recorded as regional staples include ${p.staples.slice(0, 4).join(", ") || staple}. These are descriptions of regional food patterns, not a record of your diet or nutritional status.`;

  return {
    greeting: `Welcome, ${p.name}. This personal bio-narrative is a bespoke reflection woven from the land of your birth, the ancestral lineages that precede you, the celestial alignments of your arrival, and your unique energetic core.`,
    birthContextExposure: `Regional context for ${p.birthRegion} (${p.agroEco} agro-ecological zone):${altitudeText}${regionalConditions}`,
    nutritionalAntinutritional: regionalDiet,
    allergyAndMedicineHistory: "This report does not infer personal medicine use, allergies, exposure, or symptoms from a person's region or family lineage.",
    personalityNarrative: `Cultural and spiritual reflection, not an evidence-based assessment: your profile maps to the Ethiopian zodiac of ${(p.astrology.ethiopianZodiacSign as { nameAmharic?: string; name?: string })?.nameAmharic || (p.astrology.ethiopianZodiacSign as { nameAmharic?: string; name?: string })?.name || "ሐመል"}, a ${sunSign} Sun, ${moonSign} Moon, and ${rising} Ascendant. In the classical Awde-Negast (አውደ ነገሥት) calculation, your name balances into the sacred circle of ${p.divination.awdeCircle.nameAmharic} (${p.divination.awdeCircle.name}), known as the ${p.divination.awdeCircle.lakeName}, which tradition associates with ${p.divination.awdeCircle.symbolism}.

Numerologically, your Life Path ${p.numerology.lifePath.number} (${p.numerology.lifePath.archetype}) is associated with ${(p.numerology.lifePath.wellbeingPatterns.strengths[0] || "growth and purpose").toLowerCase()}, while your Destiny ${p.numerology.destiny.number} is associated with ${(p.numerology.destiny.wellbeingPatterns.strengths[0] || "building meaningful connections").toLowerCase()}. In the Hexacore architecture, your primary resonant core is ${coreMeta.title}, endowing you with the gift of ${coreMeta.gift}, while offering the growth edge of navigating ${coreMeta.shadow}.

Your name '${p.name}' carries the cultural imprint of ${p.naming.givenNameProfile.meaning || "purpose and dignified ancestry"}. Through your maternal lineage, the ancestral archetype of ${p.motherLineage.archetype} (${p.motherLineage.archetypeAmharic}) traces an enduring family thread of ${(p.motherLineage.lineageTheme || "resilience and wisdom").toLowerCase()}.`,
    sociologicalContext: `The community context of ${p.birthRegion} includes traditions such as mutual assistance (Iddir, Equb, Mahber), spiritual calendar observances, and collective counsel. These are regional cultural references, not assumptions about your own beliefs or experience.`,
    callToAction: "Cultural reflection and evidence-informed guidance are different kinds of information and are presented separately. A specific health concern should be discussed with a qualified healthcare professional.",
  };
}

// ─── AMHARIC NARRATIVE GENERATOR ─────────────────────────────────────────────

function generateSectionsAmharic(p: GeneratorParams): BioNarrativeSections {
  const sunSign = p.astrology.sunSign || "Aries";
  const ethiopianZodiacName = (p.astrology.ethiopianZodiacSign as { nameAmharic?: string })?.nameAmharic ||
    "ሐመል";
  const primaryCore = p.hexacore.activeCores.primary;

  const coreNamesAm: Record<string, { title: string; gift: string }> = {
    P: { title: "የሕይወት ኃይል (Power)", gift: "የውሳኔ ጽናትና ፈጣን ተግባራዊ እንቅስቃሴ" },
    H: { title: "የልብ ርኅራኄ (Heart)", gift: "ጥልቅ ስሜታዊ ግንኙነትና አጋርነት" },
    C: { title: "የፈጠራ ጥበብ (Creation)", gift: "ሀሳብን ወደ ተጨባጭ ተግባር የመለወጥ ብቃት" },
    E: { title: "ውስጣዊ ሰላም (Peace)", gift: "የረጋ ሚዛናዊነትና የመንፈስ ጸጥታ" },
    S: { title: "መንፈሳዊ ንቃት (Spirit)", gift: "የጠለቀ ራዕይና ረቂቅ ግንዛቤ" },
    O: { title: "ሥርዓትና መዋቅር (Order)", gift: "የጸና መዋቅራዊ ጽናትና ዘላቂ ምት" },
  };
  const coreAm = coreNamesAm[primaryCore] || coreNamesAm.E;

  return {
    greeting: `እንኳን ደህና መጡ ${p.name}። ይህ የግል የሕይወትና የደኅንነት ማጠቃለያ የተዘጋጀው በተወለዱበት መልክዓ-ምድር፣ በአባቶችና እናቶች ትውፊት፣ በሰማያዊ ከዋክብት አሰላለፍ እና በግል የሕይወት ኃይልዎ ስሌት ላይ ተመሥርቶ ነው።`,
    birthContextExposure: `የ${p.birthRegion} (${p.agroEco}) አካባቢ ከፍታ መረጃ በ${p.altitudeBand} ምድብ ውስጥ ይመደባል። ${p.endemic.length > 0 ? `በአካባቢው የሕዝብ ጤና መረጃ ${p.endemic.join("፣ ")} ይጠቅሳል። ` : "ለአካባቢው የበሽታ መረጃ አልተገኘም። "}ይህ የአካባቢ ደረጃ መረጃ ስለ ግለሰብ ጤና ወይም የቀድሞ ተጋላጭነት ግምት አይሰጥም።`,
    nutritionalAntinutritional: `በአካባቢው እንደ ዋና ምግብ የተመዘገቡት ${p.staples.slice(0, 4).join("፣ ") || "ጤፍ"} ናቸው። ይህ የአካባቢውን የምግብ ልማድ ይገልጻል እንጂ የእርስዎን የግል አመጋገብ ወይም የንጥረ ምግብ ሁኔታ አይደለም።`,
    allergyAndMedicineHistory: "ከአካባቢ ወይም ከቤተሰብ መረጃ በመነሳት የግል መድኃኒት አጠቃቀም፣ አለርጂ፣ ተጋላጭነት ወይም ምልክት ግምት አንሰጥም።",
    personalityNarrative: `በኢትዮጵያ ባህላዊ የከዋክብት ስሌት መሠረት የተወለዱበት ምልክት ${ethiopianZodiacName} ሲሆን በፀሐይ መቆሚያ ደግሞ ${sunSign} ነው። በአውደ ነገሥት ስሌት ስምዎ በክበበ ${p.divination.awdeCircle.nameAmharic} ውስጥ ያረፈ ሲሆን ይህም ${p.divination.awdeCircle.symbolism} ያመለክታል።

በቁጥር ስሌት የሕይወት ጎዳና ቁጥርዎ ${p.numerology.lifePath.number} (${p.numerology.lifePath.archetype}) ሲሆን፣ በሄክሳኮር የተፈጥሮ ሚዛን ዋነኛው ኃይልዎ ${coreAm.title} ነው። ይህም ${coreAm.gift} ያጎናጽፍዎታል።

ስምዎ '${p.name}' ${p.naming.givenNameProfile.meaning || "የክብርና የመልካም ተስፋ"} ትርጉም የያዘ ሲሆን፣ በእናትዎ በኩል የሚተላለፈው የማኅፀን ትውፊት ${p.motherLineage.archetypeAmharic} በመሆን የጽናትና የትውልድ በረከት ተምሳሌት ነው።`,
    sociologicalContext: `በ${p.birthRegion} አካባቢ የዕድር፣ ዕቁብ፣ ማኅበርና የጋራ መረዳዳት ባህሎች ይገኛሉ። ይህ የአካባቢ ባህላዊ መግለጫ እንጂ ስለ እርስዎ እምነት ወይም የግል ተሞክሮ ግምት አይደለም።`,
    callToAction: `ይህ ማጠቃለያ ማንነትዎ የተገነባበትን መልክዓ-ምድራዊ፣ ባህላዊና ሰማያዊ አሻራ ያሳያል። ማንኛውንም የተለየ የጤና፣ የስሜት ወይም የሕይወት ጥያቄ ለመመርመር ደብተራ ሁሌም ከጎንዎ ነው። ዝግጁ በሚሆኑበት ጊዜ የጉዳይ ማመልከቻ (Case) በመክፈት ጥልቅ ትንተና ማግኘት ይችላሉ።`,
  };
}
