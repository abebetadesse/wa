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
  assert.ok(PLATFORM_DISCLAIMERS.wellbeing.length > 20);
});

test("Chart is cast from the person's own birth data", async (t) => {
  const { bodyLongitude, julianDay, chartAngles, julianDayFromLocal, solarDay } = await import("../lib/profiling/astrology/ephemeris.ts");
  const { resolveBirthPlace } = await import("../lib/profiling/astrology/places.ts");
  const { calculateCelestialPositions } = await import("../lib/profiling/astrology/chartCalculator.ts");
  const { calculateTransits } = await import("../lib/profiling/astrology/personalSky.ts");
  const { calculatePersonalDayAlignment, getVedicDignity } = await import("../lib/profiling/astrology/vedicAstrologyEngine.ts");
  const { buildPersonalProfile } = await import("../lib/profiling/synthesis/profileBuilder.ts");

  const near = (actual, expected, tolerance, label) => {
    const gap = Math.abs(((actual - expected + 540) % 360) - 180);
    assert.ok(gap <= tolerance, `${label}: expected ~${expected}°, got ${actual.toFixed(2)}°`);
  };

  await t.test("planet positions match published ephemeris values", () => {
    // 1 January 2000, 00:00 UT.
    const jd = julianDay(2000, 1, 1, 0);
    near(bodyLongitude("Sun", jd), 279.86, 0.05, "Sun");
    near(bodyLongitude("Moon", jd), 217.29, 0.1, "Moon");
    near(bodyLongitude("Mercury", jd), 271.1, 0.3, "Mercury");
    near(bodyLongitude("Venus", jd), 240.97, 0.3, "Venus");
    near(bodyLongitude("Mars", jd), 327.58, 0.3, "Mars");
    near(bodyLongitude("Jupiter", jd), 25.23, 0.3, "Jupiter");
    near(bodyLongitude("Saturn", jd), 40.4, 0.3, "Saturn");
    // Meeus, Astronomical Algorithms, example 47.a.
    near(bodyLongitude("Moon", 2448724.5), 133.16, 0.02, "Moon (Meeus)");
  });

  await t.test("the Ascendant depends on the birth place and the clock time is local", () => {
    const addis = calculateCelestialPositions("1990-03-10", "06:30", "Addis Ababa");
    const jijiga = calculateCelestialPositions("1990-03-10", "06:30", "Jijiga");
    const later = calculateCelestialPositions("1990-03-10", "12:30", "Addis Ababa");
    const asc = (chart) => chart.planets.find((p) => p.planet === "Ascendant").totalLongitude;
    assert.notEqual(asc(addis).toFixed(1), asc(jijiga).toFixed(1), "four degrees of longitude move the Ascendant");
    assert.notEqual(addis.ascendant.sign, later.ascendant.sign, "six hours later a different sign is rising");
    // Just after sunrise the Sun is close to the Ascendant, in the 1st or 12th house.
    assert.ok([1, 12].includes(addis.planets.find((p) => p.planet === "Sun").house));
    // 06:30 East Africa Time is 03:30 UT.
    near(chartAngles(julianDayFromLocal("1990-03-10", "06:30", 3), 9.03, 38.74).ascendant, asc(addis), 0.01, "local time");
  });

  await t.test("free-text birth places resolve, and unknown ones are reported", () => {
    assert.equal(resolveBirthPlace("Bole, Addis Ababa").city, "Addis Ababa");
    assert.equal(resolveBirthPlace("ጅማ").city, "Jimma");
    assert.equal(resolveBirthPlace("gonder, amhara").city, "Gondar");
    assert.equal(resolveBirthPlace("Addis Zemen").city, "Addis Zemen");
    assert.equal(resolveBirthPlace("Wollo").city, "Wollo");
    const unknown = resolveBirthPlace("Atlantis");
    assert.equal(unknown.matched, false);
    assert.equal(unknown.city, "Addis Ababa");
    assert.equal(calculateCelestialPositions("1990-03-10", "06:30", "Atlantis").place.matched, false);
  });

  await t.test("sunrise and sunset are computed for the place", () => {
    const addis = solarDay("2026-06-21", 9.03, 38.74, 3);
    const axum = solarDay("2026-06-21", 14.13, 38.72, 3);
    assert.ok(addis.sunrise > 5.8 && addis.sunrise < 6.4, `Addis June sunrise ${addis.sunrise}`);
    assert.ok(axum.dayLengthHours > addis.dayLengthHours, "the June day is longer further north");
  });

  await t.test("transits are measured against the natal chart, with real dates", () => {
    const natal = calculateCelestialPositions("1985-06-15", "14:30", "Addis Ababa");
    const when = new Date("2026-10-07T09:00:00Z");
    const transits = calculateTransits(natal.planets, when, 8);
    assert.ok(transits.length > 0);
    for (const transit of transits) {
      const target = natal.planets.find((p) => p.planet === transit.targetPlanetOrPoint);
      assert.ok(transit.orb <= 3, "within orb");
      assert.ok(transit.wellbeingForecast.includes(`${target.degree.toFixed(1)}° ${target.sign}`), "names the natal degree it touches");
      assert.ok(transit.peakDate >= "2025-01-01" && transit.peakDate <= "2029-01-01");
    }
    // A different chart on the same day gets a different list.
    const other = calculateCelestialPositions("1996-03-21", "10:00", "Jimma");
    const headline = (list) => list.map((item) => item.headline).join("|");
    assert.notEqual(headline(calculateTransits(other.planets, when, 8)), headline(transits));
  });

  await t.test("Vedic dignities and karakas come from the placements", () => {
    assert.equal(getVedicDignity("Sun", "Aries"), "Exalted");
    assert.equal(getVedicDignity("Sun", "Libra"), "Debilitated");
    assert.equal(getVedicDignity("Mars", "Scorpio"), "Own Sign");
    assert.equal(getVedicDignity("Saturn", "Leo"), "Enemy");
    const chart = calculateVedicChart("1985-06-15", "14:30", "Addis Ababa");
    const karakas = chart.d1Placements.map((p) => p.karaka).filter((k) => k !== "—");
    assert.equal(karakas.length, 7);
    assert.equal(new Set(karakas).size, 7, "each of the seven karakas is held by one planet");
    assert.equal(chart.d1Placements.find((p) => p.planet === "Ascendant").house, 1);
    assert.equal(chart.d9Placements.placements.find((p) => p.planet === "Ascendant").house, 1);
    assert.equal(chart.lunarNodes.length, 2);
  });

  await t.test("mahadashas run on without gaps and carry dated antardashas", () => {
    const dashas = calculateVimshottariDasha("1985-06-15", 45, "14:30");
    for (let i = 1; i < dashas.length; i++) assert.equal(dashas[i].startDate, dashas[i - 1].endDate);
    assert.equal(dashas[0].startDate, "1985-06-15");
    const current = dashas.find((d) => d.isCurrent);
    assert.equal(current.subPeriods.filter((sub) => sub.isCurrent).length, 1);
    assert.equal(current.subPeriods[0].planet, current.planet, "the first antardasha belongs to the mahadasha lord");
  });

  await t.test("the Panchang reports the place it was computed for", () => {
    const panchang = calculatePanchang("2026-10-07", "Mekelle");
    assert.equal(panchang.location.city, "Mekelle");
    assert.equal(panchang.vaar.dayOfWeek, "Wednesday");
    assert.match(panchang.sunrise, /^\d{1,2}:\d{2} AM EAT$/);
    assert.match(panchang.rahuKalam, /–/);
  });

  await t.test("today's reading depends on the person's birth star", () => {
    const when = new Date("2026-10-07T09:00:00Z");
    const first = calculatePersonalDayAlignment({ moonSiderealLongitude: 38, ascendantTropicalLongitude: 127 }, when);
    const second = calculatePersonalDayAlignment({ moonSiderealLongitude: 200, ascendantTropicalLongitude: 10 }, when);
    assert.equal(first.moonToday.nakshatra, second.moonToday.nakshatra, "the same Moon in the sky");
    assert.notEqual(first.taraBala.count, second.taraBala.count);
    assert.notEqual(first.moonToday.natalHouse, second.moonToday.natalHouse);
  });

  await t.test("the synthesis cites the person's own placements", () => {
    const one = buildPersonalProfile({ fullName: "Tigist Mulugeta", birthDate: "1985-06-15", birthTime: "14:30", birthPlace: "Gondar" });
    const two = buildPersonalProfile({ fullName: "Chaltu Tolessa", birthDate: "1996-03-21", birthTime: "10:00", birthPlace: "Jimma" });
    assert.ok(one.synthesis.enduringStrengths[0].includes(`Sun in ${one.astrology.sunSign}`));
    assert.ok(one.synthesis.primarywellbeingRisks.some((line) => line.includes(`${one.astrology.risingSign} rising`)));
    assert.notDeepEqual(one.synthesis.enduringStrengths, two.synthesis.enduringStrengths);
    assert.equal(one.synthesis.seasonalPatterns.filter((season) => season.isCurrent).length, 1);
    assert.equal(one.astrology.castFor.city, "Gondar");

    // Without a birth time the reading says so and does not lean on the Ascendant.
    const untimed = buildPersonalProfile({ fullName: "Dawit Haile", birthDate: "1992-10-24", birthPlace: "Gondar" });
    assert.equal(untimed.astrology.birthTimeAssumed, true);
    assert.ok(!untimed.synthesis.enduringStrengths.some((line) => line.includes("rising")));
  });
});
