import { NextResponse } from "next/server";
import {
  buildHexacoreProfile,
  HEXACORE_CORES,
  HEXACORE_ASPECTS,
  HEXACORE_FREQUENCIES,
  HEXACORE_ARCHETYPES,
  HEXACORE_CORRESPONDENCES,
  HEXACORE_PAIRS,
  CREATION_DAY_MAPPINGS,
  TEMPORAL_CYCLES,
  ENERGETIC_BODIES,
  INITIATION_GATES,
  COSMOLOGICAL_REALMS,
  CROSS_SYSTEM_TRADITIONS,
  ETHIOPIAN_HERBAL_INTEGRATION,
  BODY_SIGN_ZONES,
  calculate6BasedNumerology,
  getJournalPromptForDay,
} from "@/lib/cultural/hexacoreArcana";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const layerParam = url.searchParams.get("layer");
  const dayParam = url.searchParams.get("day");
  const dateParam = url.searchParams.get("date");
  const bodySignParam = url.searchParams.get("bodySigns");
  const herbsParam = url.searchParams.get("herbs");
  const numerologyParam = url.searchParams.get("numerology");
  const birthDate = url.searchParams.get("birthDate");
  const name = url.searchParams.get("name") || "Seeker";
  const consent = url.searchParams.get("consent") === "true";
  const ageVerified = url.searchParams.get("ageVerified") === "true";

  // 1. Specific 30-Day Journal Prompt Lookup
  if (dayParam || dateParam) {
    let dayNum = 1;
    if (dayParam) {
      dayNum = Math.min(30, Math.max(1, parseInt(dayParam, 10) || 1));
    } else if (dateParam) {
      const parsed = new Date(`${dateParam}T00:00:00Z`);
      if (!Number.isNaN(parsed.getTime())) {
        dayNum = (parsed.getUTCDate() % 30) || 30;
      }
    }
    const prompt = getJournalPromptForDay(dayNum);
    return NextResponse.json({
      success: true,
      day: dayNum,
      prompt,
      disclaimer: "Reflective journaling only; not scientific psychotherapy or behavioral prescription.",
    });
  }

  // 2. Specific Layer Lookup (1 to 14 or layer name)
  if (layerParam) {
    const layer = layerParam.toLowerCase();
    switch (layer) {
      case "1":
      case "cores":
        return NextResponse.json({ success: true, layer: 1, name: "Cores", elementsCount: HEXACORE_CORES.length, data: HEXACORE_CORES });
      case "2":
      case "aspects":
        return NextResponse.json({ success: true, layer: 2, name: "Aspects", elementsCount: HEXACORE_ASPECTS.length, data: HEXACORE_ASPECTS });
      case "3":
      case "frequencies":
        return NextResponse.json({ success: true, layer: 3, name: "Frequencies", elementsCount: HEXACORE_FREQUENCIES.length, data: HEXACORE_FREQUENCIES });
      case "4":
      case "archetypes":
        return NextResponse.json({ success: true, layer: 4, name: "Archetypes", elementsCount: HEXACORE_ARCHETYPES.length, data: HEXACORE_ARCHETYPES });
      case "5":
      case "shadows":
        return NextResponse.json({
          success: true,
          layer: 5,
          name: "Shadows",
          elementsCount: HEXACORE_ARCHETYPES.length,
          data: HEXACORE_ARCHETYPES.map((a) => ({ id: a.id, name: a.shadow, archetype: a.name, core: a.coreName, bodySign: a.bodySign })),
        });
      case "6":
      case "gifts":
        return NextResponse.json({
          success: true,
          layer: 6,
          name: "Gifts",
          elementsCount: HEXACORE_ARCHETYPES.length,
          data: HEXACORE_ARCHETYPES.map((a) => ({ id: a.id, name: a.gift, archetype: a.name, core: a.coreName, bodySign: a.bodySign })),
        });
      case "7":
      case "correspondences":
        return NextResponse.json({
          success: true,
          layer: 7,
          name: "Correspondences",
          elementsCount: HEXACORE_CORRESPONDENCES.length,
          data: HEXACORE_CORRESPONDENCES,
        });
      case "8":
      case "temporal":
      case "temporal-cycles":
        return NextResponse.json({ success: true, layer: 8, name: "Temporal Cycles", elementsCount: TEMPORAL_CYCLES.length, data: TEMPORAL_CYCLES });
      case "9":
      case "energetic":
      case "energetic-bodies":
        return NextResponse.json({ success: true, layer: 9, name: "Energetic Bodies", elementsCount: ENERGETIC_BODIES.length, data: ENERGETIC_BODIES });
      case "10":
      case "collective":
      case "collective-fields":
        return NextResponse.json({ success: true, layer: 10, name: "Collective Fields", pairsCount: HEXACORE_PAIRS.length, data: HEXACORE_PAIRS });
      case "11":
      case "initiation":
      case "initiation-gates":
        return NextResponse.json({ success: true, layer: 11, name: "Initiation Gates", elementsCount: INITIATION_GATES.length, data: INITIATION_GATES });
      case "12":
      case "cosmology":
      case "cosmological-realms":
        return NextResponse.json({ success: true, layer: 12, name: "Cosmological Realms", elementsCount: COSMOLOGICAL_REALMS.length, data: COSMOLOGICAL_REALMS });
      case "13":
      case "creation-days":
        return NextResponse.json({ success: true, layer: 13, name: "Creation Days", elementsCount: CREATION_DAY_MAPPINGS.length, data: CREATION_DAY_MAPPINGS });
      case "14":
      case "cross-system":
      case "cross-system-bridges":
        return NextResponse.json({ success: true, layer: 14, name: "Cross-System Bridges", data: CROSS_SYSTEM_TRADITIONS });
      default:
        return NextResponse.json({ success: false, error: `Unknown layer '${layerParam}'. Valid values: 1-14 or layer name.` }, { status: 400 });
    }
  }

  // 3. Body Sign Reading Zones
  if (bodySignParam === "true") {
    return NextResponse.json({
      success: true,
      bodySignZones: BODY_SIGN_ZONES,
      disclaimer: "Body sign reflection is traditional observational symbolism only, NOT a scientific diagnosis, etiology, or pathology.",
    });
  }

  // 4. Ethiopian Herbal Integration
  if (herbsParam === "true") {
    return NextResponse.json({
      success: true,
      herbs: ETHIOPIAN_HERBAL_INTEGRATION,
      safetyWarning: "Herbal correspondence is strictly botanical and cultural documentation. Always consult a licensed scientific practitioner or pharmacologist before internal consumption.",
    });
  }

  // 5. 6-Based Numerology Calculator
  if (numerologyParam === "true" && birthDate) {
    try {
      const numerology = calculate6BasedNumerology(birthDate, name);
      return NextResponse.json({ success: true, numerology });
    } catch (err) {
      return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Calculation failed" }, { status: 400 });
    }
  }

  // 6. Complete Profile Calculation
  if (birthDate) {
    try {
      const profile = buildHexacoreProfile(birthDate, consent, ageVerified, name);
      return NextResponse.json({
        success: true,
        profile,
        disclaimer: "Reflective cultural content only. Body signs are not diagnoses. Do not use herbs or frequencies as treatment. Age and consent controls are required.",
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : "Unable to build Hexacore profile." },
        { status: 400 }
      );
    }
  }

  // 7. System Overview (All 14 Layers Metadata)
  return NextResponse.json({
    success: true,
    system: "The Hexacore Arcana: Enhanced Edition",
    edition: "14-Layer, 2,016-Frequency, 12,096-Correspondence System",
    layersSummary: [
      { layer: 1, name: "Cores", count: 6, function: "Fundamental archetypes" },
      { layer: 2, name: "Aspects", count: 36, function: "Sub-expressions (6 per core)" },
      { layer: 3, name: "Frequencies", count: 216, function: "Vibrational tones (6 per aspect)" },
      { layer: 4, name: "Archetypes", count: 216, function: "Named energies (6 per aspect)" },
      { layer: 5, name: "Shadows", count: 216, function: "Wounded expressions" },
      { layer: 6, name: "Gifts", count: 216, function: "Empowered expressions" },
      { layer: 7, name: "Correspondences", count: 1296, function: "Cross-domain links (6 per archetype)" },
      { layer: 8, name: "Temporal Cycles", count: 36, function: "Time mapping (6 scales × 6 phases)" },
      { layer: 9, name: "Energetic Bodies", count: 36, function: "Subtle anatomy (6 bodies × 6 centers)" },
      { layer: 10, name: "Collective Fields", count: 36, function: "Social mapping (6 group sizes × 6 dynamics)" },
      { layer: 11, name: "Initiation Gates", count: 36, function: "Spiritual progression (6 gates × 6 trials)" },
      { layer: 12, name: "Cosmological Realms", count: 36, function: "Mythic structure (6 realms × 6 sub-realms)" },
      { layer: 13, name: "Creation Days", count: 36, function: "Temporal-spiritual map (6 days × 6 relational meanings)" },
      { layer: 14, name: "Cross-System Bridges", count: 36, function: "Cultural integration (6 traditions × 6 correspondences)" },
    ],
    totalUniqueStates: 46656,
    cores: HEXACORE_CORES,
    aspects: HEXACORE_ASPECTS,
    frequencies: HEXACORE_FREQUENCIES,
    pairs: HEXACORE_PAIRS,
    creationDays: CREATION_DAY_MAPPINGS,
    herbsCount: ETHIOPIAN_HERBAL_INTEGRATION.length,
    disclaimer: "Reflective cultural content only; not medical, psychological, spiritual-authority, or predictive fact.",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      birthDate?: string;
      name?: string;
      consent?: boolean;
      ageVerified?: boolean;
      day?: number;
      zone?: string;
      sign?: string;
    };

    if (body.action === "journal" && body.day) {
      const prompt = getJournalPromptForDay(body.day);
      return NextResponse.json({ success: true, day: body.day, prompt });
    }

    if (body.action === "numerology" && body.birthDate) {
      const numerology = calculate6BasedNumerology(body.birthDate, body.name || "Seeker");
      return NextResponse.json({ success: true, numerology });
    }

    if (!body.birthDate) {
      return NextResponse.json({ success: false, error: "birthDate is required." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      profile: buildHexacoreProfile(body.birthDate, body.consent === true, body.ageVerified === true, body.name || "Seeker"),
      disclaimer: "Reflective cultural content only. Body signs are not diagnoses. Do not use herbs or frequencies as treatment.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to build Hexacore profile." },
      { status: 400 }
    );
  }
}
