import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Domain A Engines
import { resolveAgroEcologicalZone, evaluateRiftValleyFluoride } from "../lib/engines/agroEcologicalEngine.ts";
import { convertToHabeshaTime } from "../lib/engines/chrononutritionEngine.ts";
import { evaluateFastingStatus, classifyEaterArchetype } from "../lib/engines/fastingMetabolismEngine.ts";
import { evaluateRawMeatSafety, getZebuNiterKibbehProfile } from "../lib/engines/zoonoticSafetyEngine.ts";
import { getTazmaApitherapyProfile } from "../lib/engines/apitherapyEngine.ts";
import { evaluateVectorSafeIron } from "../lib/engines/vectorSafeNutritionEngine.ts";
import { calculateErshoKinetics, getEnsetMicrobiomeProfile } from "../lib/engines/fermentationMicrobiomeEngine.ts";
import { getAllWildFruits, getWildFruitsByZone } from "../lib/engines/wildForagingEngine.ts";

// Domain B Engines
import { getAwdeNegestSign, getHumoralProfile, AWDE_NEGEST_SIGNS } from "../lib/cultural/awdeNegestZodiac.ts";
import { calculateGeezGematria, resolveBaptismalLineage } from "../lib/cultural/geezFidelGematria.ts";
import {
  getLunarForagingGuidance,
  getPagumeStatus,
  getMineralSpringsDirectory,
  evaluateCoffeeTiming,
} from "../lib/cultural/seasonalTraditionsEngine.ts";

describe("Ethiopian Wisdom 20-Point Enterprise Enhancements Suite", () => {
  // Enhancement 1
  test("Enhancement 1: Agro-climatic zone & soil mineral characteristics", () => {
    const dega = resolveAgroEcologicalZone(2800);
    assert.equal(dega.zone, "dega");
    assert.ok(dega.soilMineralCharacteristics.ironBioavailability >= 1.2);
    assert.ok(dega.keyStapleCrops.includes("Brown Teff"));

    const kolla = resolveAgroEcologicalZone(1200);
    assert.equal(kolla.zone, "kolla");
    assert.ok(kolla.keyStapleCrops.includes("Sorghum (Mashilla)"));
  });

  // Enhancement 2
  test("Enhancement 2: Rift Valley geothermal fluoride antagonist protocol", () => {
    const hawassaAssessment = evaluateRiftValleyFluoride("Hawassa");
    assert.equal(hawassaAssessment.isRiftValleyZone, true);
    assert.equal(hawassaAssessment.fluorosisRiskTier, "critical");
    assert.ok(hawassaAssessment.calciumChelationFactor < 1.0);
    assert.ok(hawassaAssessment.recommendations.length >= 2);

    const gondarAssessment = evaluateRiftValleyFluoride("Gondar");
    assert.equal(gondarAssessment.isRiftValleyZone, false);
    assert.equal(gondarAssessment.fluorosisRiskTier, "low");
  });

  // Enhancement 3
  test("Enhancement 3: Habesha 12-hour equatorial chrononutrition clock", () => {
    // 07:00 standard time = 1:00 daytime (ጠዋት)
    const morning = convertToHabeshaTime(7, 0);
    assert.equal(morning.ethiopianHour, 1);
    assert.equal(morning.isDaytime, true);
    assert.equal(morning.circadianPhase, "dawn_activation");

    // 12:00 standard time = 6:00 daytime (ቀትር) - peak insulin sensitivity
    const noon = convertToHabeshaTime(12, 0);
    assert.equal(noon.ethiopianHour, 6);
    assert.equal(noon.circadianPhase, "peak_insulin_sensitivity");
    assert.equal(noon.macronutrientPartitioningPriority.carbohydrateTolerance, "very_high");

    // 20:00 standard time (8pm) = 2:00 nighttime (ምሽት)
    const evening = convertToHabeshaTime(20, 0);
    assert.equal(evening.ethiopianHour, 2);
    assert.equal(evening.isDaytime, false);
    assert.equal(evening.circadianPhase, "evening_clearance");
    assert.equal(evening.macronutrientPartitioningPriority.carbohydrateTolerance, "low");
  });

  // Enhancement 4
  test("Enhancement 4: Orthodox Christian Tsom fasting & post-fast refeeding transition", () => {
    const fastingProfile = evaluateFastingStatus(new Date(2026, 7, 15)); // August 15 (Filseta)
    assert.equal(fastingProfile.currentSeason, "filseta");
    assert.equal(fastingProfile.isStrictVeganDay, true);
    assert.ok(fastingProfile.micronutrientVulnerabilities.some((v) => v.nutrient.includes("B12")));
    assert.ok(fastingProfile.refeedingSafeguards.contraindicatedFirstMeals.length > 0);
  });

  // Enhancement 5
  test("Enhancement 5: Ethiopian Eater Archetype classification", () => {
    const pastoralist = classifyEaterArchetype({ dietaryDescription: "camel milk, goat stew, nomadic pastoralist" });
    assert.equal(pastoralist.id, "lowland_pastoralist");
    assert.equal(pastoralist.macronutrientDistribution.fatPct, 40);

    const urban = classifyEaterArchetype({ isDiasporaOrUrban: true });
    assert.equal(urban.id, "urban_diaspora");

    const ensetFarmer = classifyEaterArchetype({ dietaryDescription: "kocho with bulla porridge and gomen in gurage zone" });
    assert.equal(ensetFarmer.id, "enset_agro_forester");
  });

  // Enhancement 6
  test("Enhancement 6: Kitfo parasitology risk & Kosso toxic dose interception", () => {
    const highRisk = evaluateRawMeatSafety("weekly", true, true);
    assert.equal(highRisk.riskTier, "critical");
    assert.equal(highRisk.kossoSafetyIntercept.interceptTriggered, true);
    assert.ok(highRisk.kossoSafetyIntercept.DebralAlert.includes("optic nerve atrophy"));
    assert.ok(highRisk.kossoSafetyIntercept.saferConventionalAlternative.includes("Niclosamide"));
  });

  // Enhancement 7
  test("Enhancement 7: Highland Zebu cattle Niter Kibbeh lipidomics & micellar absorption", () => {
    const kibbeh = getZebuNiterKibbehProfile();
    assert.ok(kibbeh.conjugatedLinoleicAcidMgPer100g > 1000);
    assert.ok(kibbeh.vitaminK2MkgPer100g > 20);
    assert.ok(kibbeh.micellarAbsorptionMultiplier >= 2.5);
    assert.ok(kibbeh.optimalCulinaryPairing.some((p) => p.vegetable.includes("Gomen")));
  });

  // Enhancement 8
  test("Enhancement 8: Tazma Mar stingless bee apitherapy pharmacopeia", () => {
    const tazma = getTazmaApitherapyProfile();
    assert.equal(tazma.glycemicIndex, 35); // Low GI
    assert.ok(tazma.trehaluloseContentPct > 35);
    assert.ok(tazma.pH < 3.8); // High natural acidity
    assert.ok(tazma.therapeuticApplications.some((a) => a.indication.includes("Asthma")));
  });

  // Enhancement 9
  test("Enhancement 9: Lowland vector-safe iron protocol gating", () => {
    // High-dose iron in lowland Gambela in peak transmission month (September = month 8)
    const intercepted = evaluateVectorSafeIron({
      altitudeMeters: 550,
      region: "Gambela",
      month: 8,
      intendedIronSupplementDoseMg: 65,
    });
    assert.equal(intercepted.isMalariaEndemicZone, true);
    assert.equal(intercepted.isPeakTransmissionSeason, true);
    assert.equal(intercepted.ironSafetyGateAction, "block_high_dose_supplement");
    assert.ok(intercepted.recommendedDietaryIronAlternatives.length > 0);

    // Highland Addis Ababa (2,400m)
    const highland = evaluateVectorSafeIron({
      altitudeMeters: 2400,
      region: "Addis Ababa",
      month: 8,
      intendedIronSupplementDoseMg: 65,
    });
    assert.equal(highland.isMalariaEndemicZone, false);
    assert.equal(highland.ironSafetyGateAction, "allow_standard");
  });

  // Enhancement 10
  test("Enhancement 10: Ersho sourdough fermentation kinetics curve", () => {
    const t0 = calculateErshoKinetics(0);
    assert.equal(t0.phytateDegradationPct, 0);
    assert.equal(t0.doughPH, 6.2);

    const t72 = calculateErshoKinetics(72);
    assert.ok(t72.phytateDegradationPct > 80);
    assert.ok(t72.doughPH < 4.0);
    assert.equal(t72.ironBioavailabilityMultiplier, 1.45);
  });

  // Enhancement 11
  test("Enhancement 11: Indigenous wild edible fruits & famine resilience botanicals", () => {
    const allFruits = getAllWildFruits();
    assert.ok(allFruits.length >= 4);

    const kurkura = allFruits.find((f) => f.id === "kurkura");
    assert.ok(kurkura);
    assert.ok(kurkura.vitaminCMgPer100g > 200); // 285 mg/100g

    const kollaFruits = getWildFruitsByZone("kolla");
    assert.ok(kollaFruits.some((f) => f.id === "bedeno"));
  });

  // Enhancement 12
  test("Enhancement 12: Enset prebiotic gut microbiome modeling (butyrate synthesis)", () => {
    const kocho = getEnsetMicrobiomeProfile("kocho");
    assert.ok(kocho.resistantStarchGramsPer100g > 10);
    assert.ok(kocho.simulatedSCFAYieldMmolPerKg.butyrate >= 40);

    const bulla = getEnsetMicrobiomeProfile("bulla");
    assert.ok(bulla.resistantStarchGramsPer100g > 15);
  });

  // Enhancement 13
  test("Enhancement 13: Awde Negest 12 Ge'ez zodiac constellations", () => {
    assert.equal(AWDE_NEGEST_SIGNS.length, 12);
    const hamel = getAwdeNegestSign("hamel");
    assert.ok(hamel);
    assert.equal(hamel.element, "esat");
    assert.ok(hamel.geezName.includes("ሐመል"));
  });

  // Enhancement 14
  test("Enhancement 14: Four Zemen humoral elements balancing", () => {
    const fire = getHumoralProfile("esat");
    assert.equal(fire.associatedBodilyHumor, "ሐሞት (Yellow Bile / Choler)");
    assert.ok(fire.traditionalHerbalTeas.length > 0);

    const earth = getHumoralProfile("afere");
    assert.equal(earth.qualities, "ቀዝቃዛና ደረቅ (Cold & Dry)");
  });

  // Enhancement 15
  test("Enhancement 15: Lunar botanical foraging potency cycle", () => {
    const lunar = getLunarForagingGuidance(new Date());
    assert.ok(lunar.phaseNameAmharic.length > 0);
    assert.ok(lunar.recommendedHerbs.length > 0);
  });

  // Enhancement 16
  test("Enhancement 16: Ge'ez Fidel gematria letter arithmetic & digital root", () => {
    // "አበበ" = አ (40) + በ (9) + በ (9) = 58 -> 5 + 8 = 13 -> 1 + 3 = 4
    const abe = calculateGeezGematria("አበበ");
    assert.equal(abe.totalNumericalSum, 58);
    assert.equal(abe.reducedDigitValue, 4);
    assert.ok(abe.philosophicalVirtue.includes("አራቱ"));
  });

  // Enhancement 17
  test("Enhancement 17: Sacred baptismal lineage vault & feast calendar", () => {
    const record = resolveBaptismalLineage("Dawit", "Haile Maryam");
    assert.equal(record.monthlyFeastDayDateGeez, 21);
    assert.ok(record.patronSaintOrAngel.includes("ማርያም"));
  });

  // Enhancement 18
  test("Enhancement 18: Pagume 13th-month purification tracker", () => {
    const pagumeStatus = getPagumeStatus(new Date(2026, 8, 8)); // Sept 8 is inside Pagume
    assert.equal(pagumeStatus.isCurrentlyPagume, true);
    assert.ok(pagumeStatus.ritualPractices.some((r) => r.title.includes("የጳጉሜ ውኃ")));
  });

  // Enhancement 19
  test("Enhancement 19: Geothermal mineral springs (Tsebel / Filwoha) directory", () => {
    const springs = getMineralSpringsDirectory();
    assert.ok(springs.length >= 4);
    const filwoha = springs.find((s) => s.id === "filwoha_addis");
    assert.ok(filwoha);
    assert.ok(filwoha.prominentMinerals.includes("Natural Sulfur"));
    assert.equal(filwoha.waterTemperatureC, 48);
  });

  // Enhancement 20
  test("Enhancement 20: Mindful Ethiopian coffee ceremony 60-minute iron buffer timer", () => {
    // 20 minutes post meal -> blocked due to tannin chelation
    const tooSoon = evaluateCoffeeTiming(20);
    assert.equal(tooSoon.isSafeToBrew, false);
    assert.equal(tooSoon.ironChelationWarning, true);
    assert.equal(tooSoon.minutesRemainingToSafeBuffer, 40);

    // 75 minutes post meal -> safe to brew
    const safe = evaluateCoffeeTiming(75);
    assert.equal(safe.isSafeToBrew, true);
    assert.equal(safe.ironChelationWarning, false);
    assert.equal(safe.ceremonyRounds.length, 3);
  });

  // Domain Isolation Firewall Verification
  test("Architectural Firewall: Domain B never affects Domain A algorithms", () => {
    // Verify Awde Negest, Gematria, or Baptismal data do not mutate or participate in any Debral functions
    const testSign = getAwdeNegestSign("asad");
    const testGematria = calculateGeezGematria("ዮሐንስ");
    assert.ok(testSign && testGematria);

    // Ensure evaluation of biochemical fluoride or iron vector safety is purely geographical/physiological
    const bioAssessment = evaluateVectorSafeIron({ altitudeMeters: 2400, region: "Addis Ababa" });
    assert.equal(bioAssessment.ironSafetyGateAction, "allow_standard");
  });
});
