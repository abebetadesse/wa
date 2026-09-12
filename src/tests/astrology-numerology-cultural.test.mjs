import test from "node:test";
import assert from "node:assert/strict";

// Import calculation engines
import { calculateDanMillmanLifePath } from "../lib/profiling/numerology/danMillmanNumerology.ts";
import {
  calculateChaldeanNumerology,
  calculatePersonalCycles,
  buildMultiSystemNumerologyProfile,
} from "../lib/profiling/numerology/multiSystemNumerology.ts";
import {
  calculateLahiriAyanamsha,
  tropicalToSidereal,
  getNakshatraFromSidereal,
  getNavamshaSign,
  calculateVedicChart,
  calculateVimshottariDasha,
  calculatePanchang,
  generatePrashnaKundli,
} from "../lib/profiling/astrology/vedicAstrologyEngine.ts";
import {
  AWUDE_CIRCLES,
  AWUDE_NEGEST_60_CATEGORIES,
  calculateAwudeNegestReading,
  calculateFidelWeight,
  getDabtaraWisdom,
} from "../lib/cultural/awudeNegestEngine.ts";
import {
  getOrCreateChatSession,
  processAIChatMessage,
} from "../lib/profiling/chat/aiChatEngine.ts";
import { analyzeCompatibility } from "../lib/profiling/compatibility/compatibilityEngine.ts";
import { PLATFORM_DISCLAIMERS } from "../lib/profiling/extendedTypes.ts";

test("Vedic & Western Astrology Engine", async (t) => {
  await t.test("Calculates Lahiri Ayanamsha with astronomical precision", () => {
    const ayanamsha2000 = calculateLahiriAyanamsha("2000-01-01");
    assert.ok(ayanamsha2000 >= 23.8 && ayanamsha2000 <= 23.9, `Ayanamsha at 2000 should be ~23.85°, got ${ayanamsha2000}`);

    const ayanamsha2026 = calculateLahiriAyanamsha("2026-09-08");
    assert.ok(ayanamsha2026 > ayanamsha2000, "Ayanamsha precesses forward over time");
  });

  await t.test("Accurately identifies 27 Nakshatras and Padas (1-4)", () => {
    // 0° Sidereal = Ashwini Pada 1
    const ashwini = getNakshatraFromSidereal(0.5);
    assert.equal(ashwini.name, "Ashwini");
    assert.equal(ashwini.rulingPlanet, "Ketu");
    assert.equal(ashwini.pada, 1);

    // ~40° Sidereal = Rohini
    const rohini = getNakshatraFromSidereal(45);
    assert.equal(rohini.name, "Rohini");
    assert.equal(rohini.rulingPlanet, "Moon");
  });

  await t.test("Generates D1 Rashi and D9 Navamsha Divisional Charts", () => {
    const chart = calculateVedicChart("1985-06-15", "14:30", "Addis Ababa");
    assert.equal(chart.d1Placements.length, 12, "Includes Sun through Pluto plus Ascendant and Midheaven");
    assert.equal(chart.d9Placements.chartCode, "D9");
    assert.equal(chart.d9Placements.placements.length, 12);
    assert.ok(chart.divisionalChartCatalog.length >= 12, "Catalogs D1 through D60");
  });

  await t.test("Calculates Vimshottari Dasha 120-year cycle", () => {
    const dashas = calculateVimshottariDasha("1985-06-15", 45); // Moon in Rohini (Moon lord)
    assert.ok(dashas.length >= 9, "Should generate 9 planetary cycles");
    assert.equal(dashas[0].planet, "Moon", "First dasha lord should match Moon Nakshatra ruler");
    const hasCurrent = dashas.some((d) => d.isCurrent);
    assert.ok(hasCurrent, "One period should be active for current era");
  });

  await t.test("Computes traditional 5-limb Panchang", () => {
    const panchang = calculatePanchang("2026-09-08", "Addis Ababa");
    assert.ok(panchang.tithi.number >= 1 && panchang.tithi.number <= 30);
    assert.ok(panchang.nakshatra.name.length > 0);
    assert.ok(panchang.yoga.name.length > 0);
    assert.ok(panchang.karana.name.length > 0);
    assert.ok(panchang.vaar.ethiopianName.length > 0);
  });

  await t.test("Casts Prashna Kundli (Horary) with GPS coordinates", () => {
    const prashna = generatePrashnaKundli("Will my business expansion succeed in Gondar?", "Gondar", 12.6, 37.46);
    assert.equal(prashna.karyaBhava, 10, "Business questions map to 10th Bhava");
    assert.ok(prashna.confidenceScore >= 50 && prashna.confidenceScore <= 100);
    assert.ok(prashna.outcomePrediction.length > 20);
  });
});

test("Dan Millman Unreduced & Multi-System Numerology", async (t) => {
  await t.test("Calculates Dan Millman unreduced Life Path without intermediate reduction", () => {
    // 1985-06-15: 1+9+8+5+0+6+1+5 = 35 -> 3+5 = 8 => "35/8"
    const lp1 = calculateDanMillmanLifePath("1985-06-15");
    assert.equal(lp1.unreducedNumber, "35/8");
    assert.equal(lp1.primaryNumber, 8);
    assert.ok(lp1.corePurpose.length > 10);
    assert.ok(lp1.innateGifts.length > 0);

    // 1987-08-25: 1+9+8+7+0+8+2+5 = 40 -> 4+0 = 4 => "40/4"
    const lp2 = calculateDanMillmanLifePath("1987-08-25");
    assert.equal(lp2.unreducedNumber, "40/4");
    assert.equal(lp2.primaryNumber, 4);
  });

  await t.test("Calculates Chaldean numerology vibration (omitting 9 from alphabet)", () => {
    const chaldean = calculateChaldeanNumerology("Tigist Mulugeta", "1985-06-15");
    assert.ok(chaldean.nameVibrationNumber >= 1 && chaldean.nameVibrationNumber <= 9);
    assert.ok(chaldean.luckyDays.length > 0);
    assert.ok(chaldean.harmoniousGems.length > 0);
  });

  await t.test("Computes Personal Day, Personal Year and Numi daily affirmations", () => {
    const cycles = calculatePersonalCycles("1985-06-15", "2026-09-08");
    assert.ok(cycles.personalDay >= 1 && cycles.personalDay <= 9);
    assert.ok(cycles.personalYear >= 1 && cycles.personalYear <= 9);
    assert.ok(cycles.houseColor.startsWith("#"));
    assert.ok(cycles.dailyAffirmation.length > 10);
    assert.ok(cycles.journalPrompt.length > 10);
  });

  await t.test("Builds complete multi-system profile integrating Ge'ez gematria", () => {
    const full = buildMultiSystemNumerologyProfile("Tigist Mulugeta", "1985-06-15", "ትዕግሥት");
    assert.ok(full.pythagorean.lifePath > 0);
    assert.ok(full.chaldean.nameVibrationNumber > 0);
    assert.ok(full.danMillman.unreducedNumber.length > 0);
    assert.ok(full.geezGematria.totalWeight > 0);
  });
});

test("Ethiopian AwudeNegest 16 Circles & Däbtära Traditions", async (t) => {
  await t.test("Initializes all 16 magic circles with 16 day/night sections each", () => {
    assert.equal(AWUDE_CIRCLES.length, 16, "Must have exactly 16 circular tables");
    for (const circle of AWUDE_CIRCLES) {
      assert.equal(circle.sections.length, 16, `Circle #${circle.id} must have 16 day/night sections`);
      assert.ok(circle.guardianAngel.length > 0);
      assert.ok(circle.geezTitle.length > 0);
    }
  });

  await t.test("Recognizes all 60 prediction categories", () => {
    assert.equal(AWUDE_NEGEST_60_CATEGORIES.length, 60, "Must contain all 60 traditional categories");
    const marriage = AWUDE_NEGEST_60_CATEGORIES.find((c) => c.id === "marriage");
    assert.ok(marriage && marriage.am.length > 0);
  });

  await t.test("Calculates Ge'ez letter numerical weights and modulo 16 circle", () => {
    // ሀ=1, ለ=2, መ=4
    const weight = calculateFidelWeight("ሀለ");
    assert.equal(weight, 3);

    const reading = calculateAwudeNegestReading({
      name: "ትዕግሥት",
      category: "marriage",
    });
    assert.ok(reading.circle.number >= 1 && reading.circle.number <= 16);
    assert.ok(reading.prediction.prophecy.length > 20);
    assert.ok(reading.prediction.traditionalProverb.length > 5);

    const readingWithMother = calculateAwudeNegestReading({
      name: "ትዕግሥት",
      motherName: "ማርያም",
      category: "marriage",
    });
    assert.equal(readingWithMother.calculatedValues.motherValue, calculateFidelWeight("ማርያም"));
    assert.ok(readingWithMother.calculatedValues.segment >= 1 && readingWithMother.calculatedValues.segment <= 16);
    assert.notEqual(readingWithMother.calculatedValues.total, reading.calculatedValues.total);
  });

  await t.test("Retrieves Däbtära healing scroll manuscript prescriptions", () => {
    const wisdom = getDabtaraWisdom("illness");
    assert.ok(wisdom.healingScrollPrescription.herbalAllies.includes("Tena Adam (Ruta chalepensis)"));
    assert.ok(wisdom.healingScrollPrescription.protectivePrayerGeez.length > 10);
  });
});

test("Context-Aware AI Chat Engine", async (t) => {
  await t.test("Creates session grounded in exact calculations", async () => {
    const session = getOrCreateChatSession("test_user_1", {
      fullName: "Tigist Mulugeta",
      sunSign: "Gemini",
      danMillmanLifePath: "35/8",
      awudeCircleNumber: 1,
    });
    assert.equal(session.userContext.danMillmanLifePath, "35/8");
    assert.equal(session.userContext.awudeCircleNumber, 1);
  });

  await t.test("Responds with exact grounded calculations rather than vague text", async () => {
    const session = getOrCreateChatSession("test_user_2", {
      fullName: "Dawit Haile",
      danMillmanLifePath: "28/10",
      awudeCircleNumber: 3,
    });
    const { assistantMessage } = await processAIChatMessage(session.sessionId, "What is my Dan Millman Life Path?");
    assert.ok(assistantMessage.content.includes("28/10"), "Response must mention exact life path");
    assert.ok(assistantMessage.content.includes("Disclaimer"), "Must include disclaimer compliance");
  });
});

test("Multi-Dimensional Compatibility Engine", async (t) => {
  await t.test("Evaluates relationships with The Pattern 6 bond categories", () => {
    const report = analyzeCompatibility(
      { name: "Tigist Mulugeta", birthDate: "1985-06-15" },
      { name: "Dawit Haile", birthDate: "1992-10-24" }
    );

    assert.ok(report.scores.astrological >= 0 && report.scores.astrological <= 100);
    assert.ok(report.scores.numerological >= 0 && report.scores.numerological <= 100);
    assert.ok(report.scores.awudeNegest >= 0 && report.scores.awudeNegest <= 100);
    assert.ok(report.scores.overall >= 0 && report.scores.overall <= 100);

    const validBonds = ["soulmate", "extraordinary", "powerful", "meaningful", "complex", "growth"];
    assert.ok(validBonds.includes(report.bondCategory), `Bond category must be one of the 6 Pattern bonds, got ${report.bondCategory}`);
    assert.ok(report.synastryHighlights.length >= 3);
  });

  await t.test("Supports CUE Astrology brand/company founding date mode", () => {
    const report = analyzeCompatibility(
      { name: "Tigist Mulugeta", birthDate: "1985-06-15" },
      { name: "Ethiopian Airlines", birthDate: "1945-12-21", isBrandOrCompany: true }
    );
    assert.ok(report.profile2.isBrandOrCompany, "Identifies brand/company mode");
    const brandHighlight = report.synastryHighlights.find((h) => h.title.includes("CUE Mode"));
    assert.ok(brandHighlight, "Generates corporate founding date resonance highlight");
  });
});

test("Compliance Disclaimers", () => {
  assert.ok(PLATFORM_DISCLAIMERS.astrology.length > 20);
  assert.ok(PLATFORM_DISCLAIMERS.numerology.length > 20);
  assert.ok(PLATFORM_DISCLAIMERS.awudeNegest.length > 20);
  assert.ok(PLATFORM_DISCLAIMERS.aiChat.length > 20);
  assert.ok(PLATFORM_DISCLAIMERS.compatibility.length > 20);
  assert.ok(PLATFORM_DISCLAIMERS.health.length > 20);
});
