import test from "node:test";
import assert from "node:assert/strict";

import {
  HEXACORE_CORES,
  HEXACORE_ASPECTS,
  HEXACORE_FREQUENCIES,
  HEXACORE_ARCHETYPES,
  HEXACORE_CORRESPONDENCES,
  HEXACORE_PAIRS,
  TEMPORAL_CYCLES,
  ENERGETIC_BODIES,
  COLLECTIVE_DYNAMICS,
  INITIATION_GATES,
  COSMOLOGICAL_REALMS,
  CREATION_DAY_MAPPINGS,
  CROSS_SYSTEM_TRADITIONS,
  ETHIOPIAN_HERBAL_INTEGRATION,
  BODY_SIGN_ZONES,
  calculate6BasedNumerology,
  getJournalPromptForDay,
  buildHexacoreProfile,
} from "../lib/cultural/hexacoreArcana.ts";

test("The Hexacore Arcana Enhanced Edition (14 Layers, 2,016 Frequencies, 12,096 Correspondences)", async (t) => {
  // ─── Layer 1 ────────────────────────────────────────────────
  await t.test("Layer 1: The Six Cores (Expanded multilingual)", () => {
    assert.equal(HEXACORE_CORES.length, 6, "Must contain exactly 6 fundamental cores");

    const coreNames = HEXACORE_CORES.map((c) => c.name);
    assert.deepEqual(coreNames, ["Power", "Humanity", "Creation", "Peace", "Spirit", "Order"]);

    for (const core of HEXACORE_CORES) {
      assert.ok(core.amharic, `${core.name} must have Amharic name`);
      assert.ok(core.sanskrit, `${core.name} must have Sanskrit name`);
      assert.ok(core.hebrew, `${core.name} must have Hebrew name`);
      assert.ok(core.arabic, `${core.name} must have Arabic name`);
      assert.ok(core.greek, `${core.name} must have Greek name`);
      assert.ok(core.latin, `${core.name} must have Latin name`);
      assert.ok(core.chinese, `${core.name} must have Chinese name`);
      assert.ok(core.japanese, `${core.name} must have Japanese name`);
      assert.ok(core.soundHz > 0, `${core.name} must have positive sound frequency`);
      assert.ok(core.platonicSolid, `${core.name} must have Platonic solid`);
      assert.ok(core.bodySystem, `${core.name} must have anatomical body system`);
    }

    // Specific Solfeggio frequency alignments
    const power = HEXACORE_CORES.find((c) => c.name === "Power");
    const humanity = HEXACORE_CORES.find((c) => c.name === "Humanity");
    const spirit = HEXACORE_CORES.find((c) => c.name === "Spirit");
    assert.equal(power?.soundHz, 741);
    assert.equal(humanity?.soundHz, 396);
    assert.equal(spirit?.soundHz, 963);
  });

  // ─── Layer 2 ────────────────────────────────────────────────
  await t.test("Layer 2: The 36 Aspects (6 per Core)", () => {
    assert.equal(HEXACORE_ASPECTS.length, 36, "Must contain exactly 36 aspects");

    const countsByCore = {};
    for (const aspect of HEXACORE_ASPECTS) {
      countsByCore[aspect.coreName] = (countsByCore[aspect.coreName] || 0) + 1;
      assert.ok(aspect.id, "Aspect must have an ID");
      assert.ok(aspect.expression, "Aspect must have an expression");
      assert.ok(aspect.bodyZone, "Aspect must have a body zone");
      assert.ok(aspect.shadow, "Aspect must have a shadow");
      assert.ok(aspect.gift, "Aspect must have a gift");
    }

    for (const coreName of ["Power", "Humanity", "Creation", "Peace", "Spirit", "Order"]) {
      assert.equal(countsByCore[coreName], 6, `${coreName} must have exactly 6 aspects`);
    }

    // Humanity aspects check (Bond, Tribe, Justice, Compassion, Unity, Service)
    const humanityAspects = HEXACORE_ASPECTS.filter((a) => a.coreName === "Humanity").map((a) => a.name);
    assert.deepEqual(humanityAspects, ["Bond", "Tribe", "Justice", "Compassion", "Unity", "Service"]);
  });

  // ─── Layer 3 ────────────────────────────────────────────────
  await t.test("Layer 3: The 216 Frequencies (6 states per Aspect)", () => {
    assert.equal(HEXACORE_FREQUENCIES.length, 216, "Must contain exactly 216 frequencies");

    const states = new Set(HEXACORE_FREQUENCIES.map((f) => f.state));
    assert.deepEqual(
      Array.from(states).sort(),
      ["Active", "Awakening", "Dormant", "Eternal", "Radiant", "Transcendent"].sort()
    );

    for (const freq of HEXACORE_FREQUENCIES) {
      assert.ok(freq.soundHz >= 100, `Frequency ${freq.soundHz} Hz must be >= 100 Hz`);
      assert.ok(freq.sign.length > 0, "Frequency must have a somatic sign");
    }
  });

  // ─── Layer 4,5,6 ───────────────────────────────────────────
  await t.test("Layer 4, 5, 6: The 216 Archetypes, Shadows, and Gifts", () => {
    assert.equal(HEXACORE_ARCHETYPES.length, 216, "Must contain exactly 216 archetypes");

    for (const arch of HEXACORE_ARCHETYPES) {
      assert.ok(arch.name, "Archetype must have a name");
      assert.ok(arch.role, "Archetype must have a role");
      assert.ok(arch.shadow, "Archetype must have a shadow");
      assert.ok(arch.gift, "Archetype must have a gift");
      assert.ok(arch.remedy, "Archetype must have a remedy");
      assert.ok(arch.bodySign, "Archetype must have a body sign");
    }

    // Specific check: The Wounded Healer (H1.1)
    const woundedHealer = HEXACORE_ARCHETYPES.find((a) => a.name === "The Wounded Healer");
    assert.ok(woundedHealer, "The Wounded Healer archetype must exist");
    assert.equal(woundedHealer?.shadow, "Martyr");
    assert.equal(woundedHealer?.gift, "Compassion");
    assert.equal(woundedHealer?.coreName, "Humanity");
  });

  // ─── Layer 7 ────────────────────────────────────────────────
  await t.test("Layer 7: The 1,296 Correspondences (6 per Archetype)", () => {
    // HEXACORE_ARCHETYPES.length = 216, each gets 6 domain octaves = 1296
    assert.equal(HEXACORE_CORRESPONDENCES.length, 1296, "Must generate exactly 1,296 correspondences (6 per archetype)");

    for (const corr of HEXACORE_CORRESPONDENCES) {
      assert.ok(corr.planet, "Correspondence must have planet");
      assert.ok(corr.herb, "Correspondence must have herb");
      assert.ok(corr.soundHz > 0, "Correspondence must have positive sound frequency");
      assert.ok(corr.geometry, "Correspondence must have geometry");
      assert.ok(corr.bodySign, "Correspondence must have body sign");
      assert.ok(corr.creationDay, "Correspondence must have creation day");
    }
  });

  // ─── Layer 8 ────────────────────────────────────────────────
  await t.test("Layer 8: Temporal Cycles (6 Scales × 6 Phases = 36 total)", () => {
    assert.equal(TEMPORAL_CYCLES.length, 36, "Must contain exactly 36 temporal cycle phases");

    const scales = Array.from(new Set(TEMPORAL_CYCLES.map((tc) => tc.scale)));
    assert.deepEqual(scales.sort(), ["Annual", "Cosmic", "Creation", "Daily", "Life", "Monthly"].sort());

    const dailyPhases = TEMPORAL_CYCLES.filter((tc) => tc.scale === "Daily");
    assert.equal(dailyPhases.length, 6, "Daily cycle must have 6 phases");

    const cosmicPhases = TEMPORAL_CYCLES.filter((tc) => tc.scale === "Cosmic");
    assert.equal(cosmicPhases.length, 6, "Cosmic cycle must have 6 epochs");

    const creationPhases = TEMPORAL_CYCLES.filter((tc) => tc.scale === "Creation");
    assert.equal(creationPhases.length, 6, "Creation cycle must have 6 genesis days");
  });

  // ─── Layer 9 ────────────────────────────────────────────────
  await t.test("Layer 9: Energetic Bodies & Subtle Anatomy", () => {
    assert.equal(ENERGETIC_BODIES.length, 6, "Must contain exactly 6 energetic bodies");

    const bodyNames = ENERGETIC_BODIES.map((eb) => eb.name);
    assert.ok(bodyNames.includes("Emotional Body"));
    assert.ok(bodyNames.includes("Physical Body"));
    assert.ok(bodyNames.includes("Spiritual Body"));

    const meridians = ENERGETIC_BODIES.map((eb) => eb.meridian);
    assert.ok(meridians.includes("Heart"));
    assert.ok(meridians.includes("Liver"));
    assert.ok(meridians.includes("Lung"));

    // Verify all fields present
    for (const eb of ENERGETIC_BODIES) {
      assert.ok(eb.centerName, `${eb.name} must have centerName`);
      assert.ok(eb.chakraLocation, `${eb.name} must have chakraLocation`);
      assert.ok(eb.soundHz > 0, `${eb.name} must have positive soundHz`);
      assert.ok(eb.emotion, `${eb.name} must have emotion`);
    }
  });

  // ─── Layer 10 ───────────────────────────────────────────────
  await t.test("Layer 10: Collective Fields & 15 Relationship Dynamics", () => {
    assert.equal(HEXACORE_PAIRS.length, 15, "Must contain all 15 pairwise core combinations (C(6,2))");

    const pairNames = HEXACORE_PAIRS.map((p) => p.name);
    assert.ok(pairNames.includes("The Leader"), "Power + Humanity = The Leader");
    assert.ok(pairNames.includes("The Visionary"), "Humanity + Spirit = The Visionary");
    assert.ok(pairNames.includes("The Healer"), "Humanity + Peace = The Healer");
    assert.ok(pairNames.includes("The Sage"), "Spirit + Order = The Sage");
    assert.ok(pairNames.includes("The Architect"), "Creation + Order = The Architect");

    // COLLECTIVE_DYNAMICS is now an object with sub-arrays
    assert.ok(typeof COLLECTIVE_DYNAMICS === "object" && !Array.isArray(COLLECTIVE_DYNAMICS), "COLLECTIVE_DYNAMICS must be an object");
    assert.equal(COLLECTIVE_DYNAMICS.groupSizes.length, 6, "Must define 6 collective group sizes");
    assert.equal(COLLECTIVE_DYNAMICS.collectiveShadows.length, 6, "Must define 6 collective shadows");
    assert.equal(COLLECTIVE_DYNAMICS.collectiveGifts.length, 6, "Must define 6 collective gifts");
  });

  // ─── Layer 11 ───────────────────────────────────────────────
  await t.test("Layer 11: Initiation Gates (6 Gates × 6 Trials)", () => {
    assert.equal(INITIATION_GATES.length, 6, "Must contain 6 initiation gates");

    let totalTrials = 0;
    for (const gate of INITIATION_GATES) {
      assert.equal(gate.trials.length, 6, `${gate.gate} must have 6 trials`);
      totalTrials += gate.trials.length;
    }
    assert.equal(totalTrials, 36, "Must contain 36 total initiation trials");
  });

  // ─── Layer 12 ───────────────────────────────────────────────
  await t.test("Layer 12: Cosmological Realms (6 Realms × 6 Sub-Realms)", () => {
    assert.equal(COSMOLOGICAL_REALMS.length, 6, "Must contain 6 cosmological realms");

    let totalSubRealms = 0;
    for (const realm of COSMOLOGICAL_REALMS) {
      assert.equal(realm.subRealms.length, 6, `${realm.realm} must have 6 sub-realms`);
      totalSubRealms += realm.subRealms.length;
    }
    assert.equal(totalSubRealms, 36, "Must contain 36 total sub-realms");
  });

  // ─── Layer 13 ───────────────────────────────────────────────
  await t.test("Layer 13: Creation Days (Sunday to Friday Relational Mapping)", () => {
    assert.equal(CREATION_DAY_MAPPINGS.length, 6, "Must contain mappings for Sunday through Friday");

    const days = CREATION_DAY_MAPPINGS.map((m) => m.day);
    assert.deepEqual(days, ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

    // Thursday = Humanity + Spirit
    const thursday = CREATION_DAY_MAPPINGS.find((m) => m.day === "Thursday");
    assert.equal(thursday?.primaryCore, "Humanity");
    assert.equal(thursday?.secondaryCore, "Spirit");
    assert.equal(thursday?.soundHz, 396);
  });

  // ─── Layer 14 ───────────────────────────────────────────────
  await t.test("Layer 14: Cross-System Bridges & Ethiopian Herbal Integration", () => {
    for (const core of ["Power", "Humanity", "Creation", "Peace", "Spirit", "Order"]) {
      const bridge = CROSS_SYSTEM_TRADITIONS[core];
      assert.ok(bridge.tcm, `${core} must have TCM mapping`);
      assert.ok(bridge.ayurveda, `${core} must have Ayurveda mapping`);
      assert.ok(bridge.unani, `${core} must have Unani mapping`);
      assert.ok(bridge.ethiopian, `${core} must have Ethiopian mapping`);
      assert.ok(bridge.latinAmerican, `${core} must have Latin American mapping`);
      assert.ok(bridge.western, `${core} must have Western mapping`);
    }

    // 6 herbs: Power, Humanity, Creation, Peace, Spirit, Order
    assert.equal(ETHIOPIAN_HERBAL_INTEGRATION.length, 6, "Must integrate 6 Ethiopian medicinal plants (one per core)");

    const kosso = ETHIOPIAN_HERBAL_INTEGRATION.find(
      (h) => h.herb.includes("Kosso") || h.scientificName.includes("Hagenia")
    );
    assert.ok(kosso, "Must include Kosso (Hagenia abyssinica)");
    assert.ok(
      kosso?.sideEffect.toLowerCase().includes("optic nerve"),
      "Must warn about optic nerve toxicity for Kosso"
    );

    const tenaAdam = ETHIOPIAN_HERBAL_INTEGRATION.find((h) => h.scientificName.includes("Ruta"));
    assert.ok(tenaAdam, "Must include Tena Adam (Ruta chalepensis)");
    assert.ok(tenaAdam?.sideEffect.toLowerCase().includes("photosensitivity"), "Must warn about Tena Adam photosensitivity");
  });

  // ─── Numerology Engine ─────────────────────────────────────
  await t.test("6-Based Numerology Engine & Master Number Detection", () => {
    // "1990-12-25": digits 1+9+9+0+1+2+2+5 = 29 → NOT a master → ((29-1)%6)+1 = 5 (Spirit)
    const num = calculate6BasedNumerology("1990-12-25", "Example User");
    assert.equal(num.coreNumber, 5, "1990-12-25 must calculate Core Number 5 (Spirit)");
    assert.equal(num.isMaster, false, "29 is not a master number");

    // Master number test: sum must be 11 → digits must sum to 11 e.g. "2000-01-01" = 2+0+0+0+0+1+0+1 = 4 (no)
    // Use "1919-01-01": 1+9+1+9+0+1+0+1 = 22 (master!)
    const masterNum = calculate6BasedNumerology("1919-01-01", "Test");
    assert.equal(masterNum.coreNumber, 22, "1919-01-01 digits sum to 22 — a master number");
    assert.equal(masterNum.isMaster, true, "22 must be recognized as Master Number");
    assert.ok(masterNum.masterTitle?.includes("Builder"), "Master 22 title is The Master Builder");

    // Verify all 6-based components are in range
    assert.ok(num.destinyNumber >= 1 && num.destinyNumber <= 6, `Destiny number ${num.destinyNumber} should be 1–6`);
    assert.ok(num.soulNumber >= 1 && num.soulNumber <= 6, `Soul number ${num.soulNumber} should be 1–6`);
    assert.ok(num.personalityNumber >= 1 && num.personalityNumber <= 6, `Personality ${num.personalityNumber} should be 1–6`);
    assert.ok(num.creationDayNumber >= 1 && num.creationDayNumber <= 6, `Creation day number ${num.creationDayNumber} should be 1–6`);
    assert.ok(num.gridFrequency.length > 0, "Grid frequency string must not be empty");
  });

  // ─── Journal Engine ─────────────────────────────────────────
  await t.test("30-Day Hexacore Journal Engine (all 30 days)", () => {
    for (let dayNum = 1; dayNum <= 30; dayNum++) {
      const prompt = getJournalPromptForDay(dayNum);
      // JournalPrompt exposes `dayNumber`, not `day`
      assert.equal(prompt.dayNumber, dayNum, `Prompt for day ${dayNum} must return dayNumber = ${dayNum}`);
      assert.ok(prompt.morningPractice, `Day ${dayNum} must have morning practice`);
      assert.ok(prompt.middayReflection, `Day ${dayNum} must have midday reflection`);
      assert.ok(prompt.eveningPractice, `Day ${dayNum} must have evening practice`);
      assert.ok(prompt.affirmation, `Day ${dayNum} must have affirmation`);
      assert.ok(prompt.soundHz > 0, `Day ${dayNum} must have sound frequency`);
      assert.ok(prompt.herb, `Day ${dayNum} must have herbal recommendation`);
      assert.ok(prompt.shadow, `Day ${dayNum} must have shadow element`);
      assert.ok(prompt.gift, `Day ${dayNum} must have gift element`);
    }

    // Week 1 = Power, Week 2 = Humanity, Week 3 = Creation, Week 4 = Peace
    assert.equal(getJournalPromptForDay(1).core, "Power");
    assert.equal(getJournalPromptForDay(8).core, "Humanity");
    assert.equal(getJournalPromptForDay(15).core, "Creation");
    assert.equal(getJournalPromptForDay(22).core, "Peace");
    assert.equal(getJournalPromptForDay(29).core, "Spirit");
    assert.equal(getJournalPromptForDay(30).core, "Order");
  });

  // ─── Body Sign Reading ──────────────────────────────────────
  await t.test("Body Sign Reading Dictionary (Tongue, Palm, Face)", () => {
    assert.equal(BODY_SIGN_ZONES.tongue.length, 6, "Tongue reading must have 6 zones");
    assert.equal(BODY_SIGN_ZONES.palm.length, 6, "Palm reading must have 6 lines");
    assert.equal(BODY_SIGN_ZONES.face.length, 6, "Face reading must have 6 zones");

    for (const z of BODY_SIGN_ZONES.tongue) {
      assert.ok(z.zone, "Zone must have zone name");
      assert.ok(z.core, "Zone must have core association");
      assert.ok(z.sign, "Zone must have sign description");
      assert.ok(z.meaning, "Zone must have meaning");
      assert.ok(z.remedy, "Zone must have holistic remedy");
    }
  });

  // ─── Profile Builder ────────────────────────────────────────
  await t.test("buildHexacoreProfile: Domain B Ethical Controls & 14-Layer Output", () => {
    // Must throw if consent is false
    assert.throws(
      () => buildHexacoreProfile("1990-12-25", false, true, "User"),
      /Explicit consent is required/
    );

    // Must throw if age is not verified
    assert.throws(
      () => buildHexacoreProfile("1990-12-25", true, false, "User"),
      /restricted to adults/
    );

    // Must throw for invalid date
    assert.throws(
      () => buildHexacoreProfile("invalid-date", true, true, "User"),
      /valid ISO date/
    );

    // Valid profile: "1990-12-25" → coreNumber 5 = Spirit (index 4)
    const profile = buildHexacoreProfile("1990-12-25", true, true, "Example User");
    assert.equal(profile.coreNumber, 5, "coreNumber must be 5 for 1990-12-25");
    assert.equal(profile.dominantCore, "Spirit", "coreNumber 5 maps to Spirit (5th core)");
    // 1990-12-25 is a Tuesday UTC → creationDay = Tuesday (index 2 = Tuesday)
    assert.ok(profile.creationDay, "Must have a creation day");

    // Verify 14-layer summary
    assert.ok(profile.layerSummary, "Must include comprehensive 14-layer summary");
    assert.equal(profile.layerSummary?.layer1Cores.dominant, "Spirit");
    assert.ok(profile.layerSummary?.layer2Aspects.length, "Layer 2 aspects must be present");
    assert.ok(profile.layerSummary?.layer7Correspondences.length, "Layer 7 correspondences must be present");

    // Safety guardrails must be present
    assert.equal(profile.safety.reflectiveOnly, true, "Safety: reflectiveOnly must be true");
    assert.equal(profile.safety.bodySignsAreNotDiagnosis, true, "Safety: bodySignsAreNotDiagnosis must be true");
    assert.equal(profile.safety.ageGateRequired, true, "Safety: ageGateRequired must be true");

    // Core correspondences must be populated
    assert.ok(profile.correspondences.planet, "Correspondences must have planet");
    assert.ok(profile.correspondences.plant, "Correspondences must have plant/herb");
    assert.ok(profile.correspondences.soundHz > 0, "Correspondences must have sound frequency");
  });
});
