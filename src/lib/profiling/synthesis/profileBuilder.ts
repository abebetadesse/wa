import {
  HumoralElement,
  IntegratedPersonalProfile,
  SeasonalwellbeingPattern,
} from "../types";
import { buildAstrologicalProfile } from "../astrology/chartCalculator";
import { buildNumerologyProfile } from "../numerology/numberCalculator";
import { analyzeNameIdentity } from "../naming/culturalAnalyzer";

export interface GenerateProfileInput {
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  birthPlace?: string;
  preferredLanguage?: string;
}

export function buildPersonalProfile(input: GenerateProfileInput): IntegratedPersonalProfile {
  const fullName = input.fullName || "Tigist Mulugeta";
  const birthDate = input.birthDate || "1990-01-15";
  const birthTime = input.birthTime || "12:00";
  const birthPlace = input.birthPlace || "Addis Ababa";
  const preferredLanguage = input.preferredLanguage || "en";

  const astro = buildAstrologicalProfile(birthDate, birthTime, birthPlace);
  const num = buildNumerologyProfile(fullName, birthDate);
  const naming = analyzeNameIdentity(fullName);

  // Compute composite Humoral Dominance
  // Blend astrological element with numerological archetype
  let finalHumor: HumoralElement = astro.dominantHumor;
  if (num.lifePath.number === 1 || num.lifePath.number === 8) {
    if (finalHumor === "may") finalHumor = "esat"; // leadership elevates metabolic heat
  } else if (num.lifePath.number === 2 || num.lifePath.number === 9) {
    if (finalHumor === "esat") finalHumor = "may"; // empathy elevates fluid cooling
  }

  // Calculate composite vitality score (60 - 95 baseline)
  let vitalityScore = 78;
  // Harmonious aspects boost vitality
  const harmoniousAspects = astro.aspects.filter((a) => a.nature === "harmonious").length;
  const challengingAspects = astro.aspects.filter((a) => a.nature === "challenging").length;
  vitalityScore += (harmoniousAspects - challengingAspects) * 2;
  if (num.lifePath.isMasterNumber) vitalityScore += 4;
  if (vitalityScore > 96) vitalityScore = 96;
  if (vitalityScore < 65) vitalityScore = 65;

  // Composite constitutional type title
  const constitutionalType = `${astro.sunSign} Sun • ${astro.ethiopianZodiacSign.geezName} • Life Path ${num.lifePath.number} (${num.lifePath.name})`;

  // Primary Wellbeing Risks synthesis
  const primarywellbeingRisks = Array.from(
    new Set([
      ...astro.planetaryPositions.find((p) => p.planet === "Sun")?.wellbeingAssociations.potentialVulnerabilities || [],
      ...num.lifePath.wellbeingPatterns.vulnerabilities,
      naming.givenNameProfile.wellbeingIdentityCorrelation.psychosomaticTendency,
    ])
  ).slice(0, 5);

  // Enduring Strengths synthesis
  const enduringStrengths = Array.from(
    new Set([
      ...astro.planetaryPositions.find((p) => p.planet === "Sun")?.wellbeingAssociations.vitalityStrengths || [],
      ...num.lifePath.wellbeingPatterns.strengths,
      naming.givenNameProfile.wellbeingIdentityCorrelation.balancingVirtue,
    ])
  ).slice(0, 5);

  // Seasonal Wellbeing Patterns (Ethiopian 4 Seasons)
  const seasonalPatterns: SeasonalwellbeingPattern[] = [
    {
      season: "Kiremt (Rainy)",
      ethiopianMonths: "Hamle & Nehase (July – August)",
      potentialVulnerabilities: [
        "Fluid retention, sluggish lymphatic drainage, and sinus congestion from continuous highland dampness.",
        "Aggravation of respiratory cold and bronchial chill.",
      ],
      dietaryAdjustments: [
        "Favor warming pungent dishes spiced with fresh Berbere, Garlic, and Kundo Berbere (black pepper).",
        "Moderate heavy Mucus-forming dairy during continuous monsoon days.",
      ],
      botanicalSupports: [
        "Damakesse (Ocimum lamiifolium) steam inhalations for clear nasal airways.",
        "Koseret (Lippia abyssinica) warm tea infusions before morning activities.",
      ],
      dailyPacing: "Brisk indoor physical movement upon waking to mobilize stagnant fluids.",
    },
    {
      season: "Bega (Dry & Sunny)",
      ethiopianMonths: "Tir, Yakatit, Magabit (January – March)",
      potentialVulnerabilities: [
        "Dryness of mucous membranes, skin desiccation, and joint stiffness from high-altitude arid winds.",
        "Cold nocturnal chills contrasting with intense solar UV daytime radiation.",
      ],
      dietaryAdjustments: [
        "Incorporate nourishing unrefined sesame oils, flaxseed (Telba) drinks, and rich bone broths or legume stews.",
        "Drink warm Atmit porridge prepared with Teff and Cardamom.",
      ],
      botanicalSupports: [
        "Tena Adam (Ruta chalepensis) digestive tea (strictly observing safety contraindications).",
        "Zingibil (Ginger) and Korerima warm tea with pure highland raw honey.",
      ],
      dailyPacing: "Evening warm sesame oil foot and knee massages before bedtime.",
    },
    {
      season: "Belg (Short Rains)",
      ethiopianMonths: "Miyazya & Ginbot (April – May)",
      potentialVulnerabilities: [
        "Fluctuating barometric pressure triggering tension headaches and seasonal allergic flares.",
        "Metabolic digestive sluggishness during atmospheric transitions.",
      ],
      dietaryAdjustments: [
        "Light easily digestible vegetable wots with sprouted lentils and high-fiber injera.",
        "Plenty of spring water infusions with fresh lemon and mint.",
      ],
      botanicalSupports: [
        "Tikur Azmud (Nigella sativa) seed powder with honey for cellular immune modulation.",
        "Tosign (Highland Thyme) infusions for digestive and respiratory cleansing.",
      ],
      dailyPacing: "Regular outdoor morning walking in the transitional highland breeze.",
    },
    {
      season: "Pagume (Renewal)",
      ethiopianMonths: "Pagume 1 – 5/6 (September 6 – 10)",
      potentialVulnerabilities: [
        "Psychosomatic fatigue at the close of the annual cycle; internal detox accumulation.",
      ],
      dietaryAdjustments: [
        "Light cleansing mono-diets: warm Teff porridge, vegetable broths, and mineral spring water.",
      ],
      botanicalSupports: [
        "Sacred spring water immersion (Tsebel) for physiological and emotional renewal.",
        "Damakesse herbal body rinse for dermal energetic reset.",
      ],
      dailyPacing: "Spiritual reflection, forgiveness rituals, and circadian sleep recalibration.",
    },
  ];

  // Actionable Recommendations
  const isFireOrAir = finalHumor === "esat" || finalHumor === "nifas";
  const dietary = {
    therapeuticPrinciples: isFireOrAir
      ? [
        "Cultivate internal cooling and hydration to temper metabolic heat and nervous restlessness.",
        "Balance piquant Berbere stews with soothing probiotic accompaniments (Ayib cottage cheese).",
        "Ensure consistent meal timing to prevent hypoglycemia-triggered irritability.",
      ]
      : [
        "Cultivate metabolic warmth and digestive stimulation to overcome cold sluggish motility.",
        "Favor warm pungent spices (Zingibil, Korerima, Black Pepper) to ignite metabolic fire.",
        "Prioritize hot, freshly prepared meals over cold or dry snacks.",
      ],
    favoredEthiopianFoods: [
      "Authentic Fermented Injera (Eragrostis tef - high prebiotic iron and zinc)",
      "Habesha Gomen (Highland collard greens rich in calcium, folate, and carotenoids)",
      "Ayib (Fresh cottage cheese providing gentle lactic acid and bioavailable peptides)",
      "Kocho (Fermented Ensete providing gut microbiome resilience and complex starch)",
      "Telba (Flaxseed drink providing anti-inflammatory alpha-linolenic omega-3)",
    ],
    foodsToModerate: isFireOrAir
      ? ["Excessive raw hot peppers (Kariya)", "Ultra-dry roasted barley snacks without tea", "Heavy liquor or excessive midday coffee"]
      : ["Heavy mucilaginous unfermented dairy", "Cold ice drinks", "Excessive deep-fried pastries"],
  };

  const herbalAdaptogens = [
    {
      herb: "Damakesse (Ocimum lamiifolium)",
      traditionalUse: "Crushed leaf steam inhalation and warm infusions for fever, respiratory ease, and cognitive clarity.",
      synergyNote: `Resonates with ${astro.sunSign} Sun and Life Path ${num.lifePath.number}, soothing tension in the cranial and chest zones.`,
      safetyPrecaution: "Generally very safe; avoid boiling leaves excessively to preserve delicate essential terpenes.",
    },
    {
      herb: "Tikur Azmud (Nigella sativa / Black Seed)",
      traditionalUse: "Ground seed with honey for metabolic modulation, immune resilience, and gastric protection.",
      synergyNote: `Stimulates cellular autophagic renewal matching ${naming.givenNameProfile.name}'s name archetype of '${naming.givenNameProfile.meaning}'.`,
      safetyPrecaution: "Safe in culinary and supplemental doses; monitor blood glucose if combining with antidiabetic medications.",
    },
    {
      herb: "Tena Adam (Ruta chalepensis)",
      traditionalUse: "Traditional sprig added to Ethiopian coffee (Buna) or tea for gastric calming and colic relief.",
      synergyNote: "Ancient Awde Negest botanical for dispersing cold abdominal cramps and stimulating peripheral circulation.",
      safetyPrecaution: "MANDATORY SAFETY WARNING: Strictly contraindicated during pregnancy (abortifacient risk) and in patients taking Warfarin (CYP interaction / bleeding risk).",
    },
    {
      herb: "Korerima (Aframomum corrorima / Ethiopian Cardamom)",
      traditionalUse: "Aromatic seed pods ground into spice blends to stimulate gastric digestive enzymes and calm nausea.",
      synergyNote: "Warming aromatic medicine that grounds restless nervous tension without provoking inflammation.",
      safetyPrecaution: "Excellent safety profile; ideal for daily culinary integration in wots and teas.",
    },
  ];

  const mindBodyLifestyle = [
    `Circadian Rhythm: Establish a fixed morning wake time aligned with highland dawn (${astro.sunSign} solar vitality).`,
    `Physical Pacing: Balance intense executive exertion (Number ${num.lifePath.number}) with daily restorative 20-minute silent walks.`,
    `Emotional Balance: Actively express emotional boundaries to counteract '${naming.givenNameProfile.wellbeingIdentityCorrelation.psychosomaticTendency}'.`,
    `Somatic Therapy: Incorporate warm oil rubs (Sesame or castor oil) into the lower back and knees during cold Bega evenings.`,
  ];

  const culturalTraditionsIntegration = [
    `Awde Negest Celestial Wisdom: Attuned to ${astro.ethiopianZodiacSign.geezName} (${astro.ethiopianZodiacSign.englishName}), cultivating temperance and seasonal mindfulness.`,
    `Däbtära Parchment Prescription: Practice the ${astro.dabtaraPrescriptions[0]?.title || "Solar Vitality Inscription"} during morning prayer or meditation.`,
    `Tsebel Mineral Spring Pilgrimage: Consider therapeutic bathing at ${astro.tsebelTiming.recommendedSpring} on auspicious ${astro.tsebelTiming.auspiciousDaysOfWeek.join(" or ")}.`,
    `Fasting Transition Care: Follow gradual hydration and nutrient-dense broth reintroduction when observing Ethiopian Orthodox fasting periods.`,
  ];

  // Cross-strand insights
  const crossStrandInsights = {
    biochemicalNotes: `Planetary placement of ${astro.planetaryPositions[0]?.planet} in ${astro.planetaryPositions[0]?.sign} correlates with ${finalHumor.toUpperCase()} metabolic activity. Cellular redox demands are supported by antioxidant-rich Habesha Gomen and fermented Teff polyphenols.`,
    psychologicalNotes: `Life Path ${num.lifePath.number} and the name '${naming.givenNameProfile.name}' foster high internal self-discipline. Psychosomatic resilience is enhanced by acknowledging emotional fatigue early rather than suppressing it into visceral organs.`,
    dietaryNotes: `Nutrient density from EFCT 2025: Fermented injera provides bioavailable zinc and iron, while flaxseed Telba counters high-altitude cutaneous dehydration.`,
    culturalNotes: `Domain B Sacred Heritage Layer: Synthesizes Awde Negest constellations, Ge'ez fidel numerical weights, and Däbtära botanical scrolls into a grounding narrative of ancestral self-awareness.`,
  };

  return {
    id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    generatedAt: new Date().toISOString(),
    userInfo: {
      fullName,
      birthDate,
      birthTime,
      birthPlace,
      preferredLanguage,
    },
    astrology: astro,
    numerology: num,
    naming,
    synthesis: {
      constitutionalType,
      humoralDominance: finalHumor,
      vitalityScore,
      primarywellbeingRisks,
      enduringStrengths,
      seasonalPatterns,
      recommendations: {
        dietary,
        herbalAdaptogens,
        mindBodyLifestyle,
        culturalTraditionsIntegration,
      },
      crossStrandInsights,
    },
  };
}
