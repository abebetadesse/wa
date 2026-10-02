import {
  buildHexacoreProfile,
  calculate6BasedNumerology,
  CREATION_DAY_MAPPINGS,
  INITIATION_GATES,
  COSMOLOGICAL_REALMS,
  CROSS_SYSTEM_TRADITIONS,
  type CreationDay,
} from "@/lib/cultural/hexacoreArcana";
import { HexacoreEngine, type Core } from "@/lib/hexacore/HexacoreEngine";
import {
  HEXACORE_COMMERCIAL_REMEDIES,
  getCommercialRemediesForCore,
  type HexacoreRemedyOffering,
} from "./HexacoreRemedyBridge";

export interface HexacoreDossierInput {
  clientName: string;
  motherName?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string;
  birthLocation?: string;
  focusQuestion?: string;
  languagePreference?: "en" | "am";
  notes?: string;
}

export interface HexacoreDossierReport {
  reference: string;
  generatedAt: string;
  client: HexacoreDossierInput;
  coreNumber: number;
  coreLetter: Core;
  dominantCore: string;
  dominantCoreAm: string;
  secondaryCore: string;
  tertiaryCore: string;
  dormantCore: string;
  coreRadar: Record<Core, number>;
  masterArchetype: string;
  masterArchetypeAm: string;
  creationDayAnchor: {
    day: string;
    dayAm: string;
    element: string;
    elementAm: string;
    theme: string;
    themeAm: string;
  };
  solfeggioHz: number;
  solfeggioTitle: string;
  solfeggioDescription: string;
  initiationGate: {
    gate: string;
    gateAm: string;
    trial: string;
    trialAm: string;
    reward: string;
    level: string;
  };
  energeticBody: {
    body: string;
    center: string;
    meridian: string;
    soundHz: number;
  };
  cosmologicalRealm: {
    realm: string;
    ruler: string;
    age: string;
    heaven: string;
  };
  layerSummary: Record<string, unknown>;
  botanicalPrescriptions: HexacoreRemedyOffering[];
  dailyPractices: Array<{
    practiceId: string;
    name: string;
    type: string;
    durationMin: number;
    soundHz?: number;
    instruction: string;
  }>;
  biorhythm: {
    season: string;
    seasonGuidance: string;
    lifeStage: string;
    dayOfWeek: string;
  };
  safetyNotice: {
    reflectiveOnly: boolean;
    disclaimerEn: string;
    disclaimerAm: string;
  };
}

const CORE_NAMES_EN_TO_AM: Record<string, string> = {
  Power: "ኃይል (Power / እሳት)",
  Humanity: "ሰውነት (Humanity / ማኅበር)",
  Creation: "ፍጥረት (Creation / ምድር)",
  Peace: "ዕርቅ (Peace / ባሕር)",
  Spirit: "መንፈስ (Spirit / አየር)",
  Order: "ሥርዓት (Order / ሰማይ)",
};

const CORE_NAME_TO_LETTER: Record<string, Core> = {
  Power: "P",
  Humanity: "H",
  Creation: "C",
  Peace: "E",
  Spirit: "S",
  Order: "O",
};

const DAY_MAP_AM: Record<string, { dayAm: string; elementAm: string; themeAm: string }> = {
  Sunday: { dayAm: "እሑድ", elementAm: "ብርሃን (Light)", themeAm: "መለኮታዊ ብርሃንና ንጋት" },
  Monday: { dayAm: "ሰኞ", elementAm: "ውሃና ጠፈር (Firmament)", themeAm: "ስፋትና የጠፈር ጥልቀት" },
  Tuesday: { dayAm: "ማክሰኞ", elementAm: "ዕፅዋትና ዘር (Flora & Seed)", themeAm: "ምድራዊ ፍሬና ማበብ" },
  Wednesday: { dayAm: "ረቡዕ", elementAm: "ፀሐይና ከዋክብት (Luminaries)", themeAm: "የጊዜ ሰዓታትና አቅጣጫ" },
  Thursday: { dayAm: "ሐሙስ", elementAm: "ሕያዋን ፍጥረታት (Creatures)", themeAm: "የውቅያኖስና የአየር እንቅስቃሴ" },
  Friday: { dayAm: "ዓርብ", elementAm: "የሰው ልጅና ማረፊያ (Soul of Man)", themeAm: "የማስተዋልና የሰውነት ክብር" },
  Saturday: { dayAm: "ቅዳሜ", elementAm: "ዕረፍትና ሰንበት (Sabbath Rest)", themeAm: "ፍጹም ዕረፍትና ማሰላሰል" },
};

const INITIATION_GATES_AM: Record<string, { gateAm: string; trialAm: string }> = {
  Power: { gateAm: "የኃይልና የመንጻት ደጅ", trialAm: "ከቁጣና ከግል ፍላጎት የመንጻት ፈተና" },
  Humanity: { gateAm: "የድልድይና የርኅራኄ ደጅ", trialAm: "ጠላትን ይቅር የማለትና የመቀበል ጥረት" },
  Creation: { gateAm: "የዘርና የመታደስ ደጅ", trialAm: "ከጥፋት በኋላ አዲስ ነገር የመፍጠር ትዕግሥት" },
  Peace: { gateAm: "የዝምታና የዕርቅ ደጅ", trialAm: "በውዝግብ መካከል ውስጣዊ ሰላምን የመጠበቅ ፈተና" },
  Spirit: { gateAm: "የጥበብና የጠፈር ደጅ", trialAm: "ከቁሳዊ ዓለም ባሻገር ያለውን እውነት የማየት ጥረት" },
  Order: { gateAm: "የፍትሕና የሥርዓት ደጅ", trialAm: "በራስ ፍላጎት ሳይሆን በፍትሕ የመመራት ታማኝነት" },
};

/**
 * Synthesizes the full 14-layer Natal Hexacore Dossier for a client.
 */
export function generateHexacoreDossier(input: HexacoreDossierInput): HexacoreDossierReport {
  const reference = `HEX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const now = new Date();

  // 1. Build 14-layer profile
  const profile = buildHexacoreProfile(input.birthDate, true, true, input.clientName);

  // 2. Numerology calculation
  const numerology = calculate6BasedNumerology(input.birthDate, input.clientName);

  // 3. Compute Engine seasonal & frequency reading
  const dominantLetter = CORE_NAME_TO_LETTER[profile.dominantCore] || "P";
  const secondaryLetter = CORE_NAME_TO_LETTER[profile.secondaryCore] || "H";
  const tertiaryLetter = CORE_NAME_TO_LETTER[profile.tertiaryCore] || "C";
  const dormantLetter = CORE_NAME_TO_LETTER[profile.dormantCore] || "O";

  // Synthesize realistic 6-Core Radar frequencies
  const coreRadar: Record<Core, number> = {
    P: 45,
    H: 45,
    C: 45,
    E: 45,
    S: 45,
    O: 45,
  };
  coreRadar[dominantLetter] = 92;
  coreRadar[secondaryLetter] = 78;
  coreRadar[tertiaryLetter] = 64;
  coreRadar[dormantLetter] = 28;

  const engineReading = HexacoreEngine.compute({
    user: {
      dateOfBirth: input.birthDate,
      frequencies: coreRadar,
    },
    now,
  });

  // 4. Resolve commercial botanical prescriptions
  const prescriptions = getCommercialRemediesForCore(
    profile.dominantCore as "Power" | "Humanity" | "Creation" | "Peace" | "Spirit" | "Order"
  );
  // Add 1 complementary remedy from secondary core
  const secondaryPrescriptions = getCommercialRemediesForCore(
    profile.secondaryCore as "Power" | "Humanity" | "Creation" | "Peace" | "Spirit" | "Order"
  );
  if (secondaryPrescriptions.length > 0 && !prescriptions.find((p) => p.sku === secondaryPrescriptions[0].sku)) {
    prescriptions.push(secondaryPrescriptions[0]);
  }

  const creationDayOrder: CreationDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"];
  const birthDateObj = new Date(`${input.birthDate}T00:00:00Z`);
  const dayName = creationDayOrder[birthDateObj.getUTCDay()] || "Thursday";
  const dayMapping = CREATION_DAY_MAPPINGS.find((m) => m.day === dayName) ?? CREATION_DAY_MAPPINGS[4];
  const dayAmData = DAY_MAP_AM[dayName] || { dayAm: dayName, elementAm: "ብርሃን", themeAm: "ጥንተ ተፈጥሮ" };

  const gateData = INITIATION_GATES.find((g) => g.core === profile.dominantCore) || INITIATION_GATES[0];
  const gateAmData = INITIATION_GATES_AM[profile.dominantCore] || {
    gateAm: "የጥበብ ደጅ",
    trialAm: "የልብ ንጽሕናን የመጠበቅ ፈተና",
  };

  const realmData = COSMOLOGICAL_REALMS.find((r) => r.core === profile.dominantCore) || COSMOLOGICAL_REALMS[0];

  return {
    reference,
    generatedAt: now.toISOString(),
    client: {
      ...input,
      motherName: input.motherName || "የተፈጠረች እናት",
    },
    coreNumber: numerology.coreNumber,
    coreLetter: dominantLetter,
    dominantCore: profile.dominantCore,
    dominantCoreAm: CORE_NAMES_EN_TO_AM[profile.dominantCore] || profile.dominantCore,
    secondaryCore: profile.secondaryCore,
    tertiaryCore: profile.tertiaryCore,
    dormantCore: profile.dormantCore,
    coreRadar,
    masterArchetype: profile.archetype,
    masterArchetypeAm: `${numerology.masterTitle || "ጠቢብ"} (${profile.archetype})`,
    creationDayAnchor: {
      day: dayName,
      dayAm: dayAmData.dayAm,
      element: dayMapping.creationAct,
      elementAm: dayAmData.elementAm,
      theme: dayMapping.relationalMeaning,
      themeAm: dayAmData.themeAm,
    },
    solfeggioHz: profile.correspondences.soundHz,
    solfeggioTitle: `${profile.correspondences.soundHz} Hz Sacred Solfeggio Tone`,
    solfeggioDescription: `Acoustic frequency tuned to restore equilibrium to the ${profile.dominantCore} center, clearing energetic stagnation and aligning bio-rhythms.`,
    initiationGate: {
      gate: gateData.gate,
      gateAm: gateAmData.gateAm,
      trial: gateData.trials[0] || "Integrity of will",
      trialAm: gateAmData.trialAm,
      reward: profile.dominantCore === "Power" ? "Courage & Right Action" : "Harmonic Wisdom",
      level: "Adept Novitiate",
    },
    energeticBody: {
      body: `${profile.dominantCore} Subtle Auric Field`,
      center: `${profile.dominantCore} Heart / Solar Axis`,
      meridian: `${profile.dominantCore} Harmonic Pathway`,
      soundHz: profile.correspondences.soundHz,
    },
    cosmologicalRealm: {
      realm: realmData.realm,
      ruler: realmData.ruler,
      age: "Age of Harmony & Balance",
      heaven: "Fourth Spherical Heaven",
    },
    layerSummary: (profile.layerSummary ?? {}) as Record<string, unknown>,
    botanicalPrescriptions: prescriptions,
    dailyPractices: engineReading.todaysPractices,
    biorhythm: {
      season: engineReading.temporal.season,
      seasonGuidance: engineReading.temporal.seasonGuidance,
      lifeStage: engineReading.temporal.lifeStage,
      dayOfWeek: engineReading.temporal.dayOfWeek,
    },
    safetyNotice: {
      reflectiveOnly: true,
      disclaimerEn:
        "This dossier is rooted in Ethiopian traditional cosmology (Awde Negast) and cultural reflection. It is intended for self-inquiry, historical appreciation, and mindfulness. It is not a biomedical diagnosis, psychotherapy, or medical prescription.",
      disclaimerAm:
        "ይህ ሰነድ በኢትዮጵያ ባህላዊ የአውደ ነገሥት ፍልስፍና እና ባህላዊ አስተውሎት ላይ የተመሠረተ ነው። ለመንፈሳዊ ንቃት፣ ለራስ ምርመራና ለማሰላሰል የሚረዳ ሲሆን የሕክምና ወይም የስነ-ልቦና ምርመራና ማዘዣ አይደለም።",
    },
  };
}

/**
 * Generates an executive, print-ready HTML/CSS layout with Ethiopian Gold & Obsidian luxury aesthetics.
 */
export function renderDossierHtml(dossier: HexacoreDossierReport, options: { lang?: "en" | "am" } = {}): string {
  const isAm = options.lang === "am" || dossier.client.languagePreference === "am";

  const prescriptionsHtml = dossier.botanicalPrescriptions
    .map(
      (p) => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div>
          <span style="display: inline-block; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; background: rgba(212,175,55,0.1); padding: 2px 8px; border-radius: 9999px;">
            ${isAm ? p.coreAm : p.core}
          </span>
          <h4 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 15px; font-weight: 700;">
            ${isAm ? p.productTitleAm : p.productTitleEn}
          </h4>
          <span style="font-size: 11px; color: #94A3B8; font-style: italic;">
            ${p.scientificName} · ${p.preparationType}
          </span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 16px; font-weight: 800; color: #10B981;">${p.priceEtb} ETB</span>
          <span style="display: block; font-size: 11px; color: #64748B;">($${p.priceUsd} USD)</span>
        </div>
      </div>
      <p style="margin: 6px 0; font-size: 12px; line-height: 1.5; color: #CBD5E1;">
        ${isAm ? p.therapeuticSynergyAm : p.therapeuticSynergyEn}
      </p>
      <div style="margin-top: 8px; font-size: 11px; color: #D97706; background: rgba(217,119,6,0.08); padding: 6px 10px; border-radius: 6px;">
        <strong>${isAm ? "ጥንቃቄ:" : "Caution:"}</strong> ${isAm ? p.safetyCautionAm : p.safetyCautionEn}
      </div>
      <div style="margin-top: 6px; font-size: 10px; color: #64748B; text-align: right;">
        ${isAm ? "የተረጋገጠ አዘጋጅ:" : "Verified Provider:"} <strong>${p.vendor.nameEn} (${p.vendor.region})</strong>
      </div>
    </div>
  `
    )
    .join("");

  const practicesHtml = dossier.dailyPractices
    .map(
      (pr) => `
    <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #D4AF37; padding: 10px 14px; margin-bottom: 8px; border-radius: 0 8px 8px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="color: #FFFFFF; font-size: 13px;">${pr.name}</strong>
        <span style="font-size: 11px; color: #D4AF37; background: rgba(212,175,55,0.1); padding: 2px 6px; border-radius: 4px;">
          ${pr.durationMin} min ${pr.soundHz ? `· ${pr.soundHz} Hz` : ""}
        </span>
      </div>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">${pr.instruction}</p>
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="${isAm ? "am" : "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hexacore Natal Dossier - ${dossier.client.clientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Noto+Sans+Ethiopic:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm 12mm 15mm 12mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 24px;
      background-color: #0B0F19;
      color: #E2E8F0;
      font-family: 'Inter', 'Noto Sans Ethiopic', sans-serif;
      font-size: 13px;
      line-height: 1.6;
    }
    .dossier-card {
      max-width: 840px;
      margin: 0 auto;
      background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.08), transparent 40%), #0D1322;
      border: 1px solid rgba(212, 175, 55, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 20px;
      padding: 36px;
      position: relative;
    }
    .gold-header {
      font-family: 'Cinzel', 'Noto Sans Ethiopic', serif;
      color: #D4AF37;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .gold-accent {
      color: #D4AF37;
    }
    .badge-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .metric-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 14px;
      text-align: center;
    }
    .radar-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }
    .radar-fill {
      height: 100%;
      background: linear-gradient(90deg, #D4AF37, #10B981);
      border-radius: 4px;
    }
    @media print {
      body {
        background-color: #FFFFFF;
        color: #0F172A;
        padding: 0;
      }
      .dossier-card {
        border: none;
        box-shadow: none;
        padding: 0;
        background: #FFFFFF;
      }
      .metric-box {
        border-color: #CBD5E1;
        background: #F8FAFC;
        color: #0F172A;
      }
      .gold-header, .gold-accent {
        color: #854D0E !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="dossier-card">
    <!-- Header / Brand Seal -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <span class="gold-header" style="font-size: 11px; font-weight: 700;">Awde Negast · 14-Layer Ethiopian Traditional Arcana</span>
        <h1 class="gold-header" style="font-size: 26px; margin: 4px 0 0 0; color: #FFFFFF;">
          ${isAm ? "የሄክሳኮር የተሟላ የልደት ሰነድ" : "Hexacore Natal Dossier"}
        </h1>
        <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 12px;">
          ${isAm ? "የተከበረ የማንነት፣ የዘመንና የዕፅዋት ቅኝት" : "Exclusive 14-Layer Relational Blueprint & Botanical Prescription"}
        </p>
      </div>
      <div style="text-align: right;">
        <span class="badge-pill" style="background: rgba(212,175,55,0.15); border: 1px solid #D4AF37; color: #D4AF37;">
          ${dossier.reference}
        </span>
        <div style="font-size: 11px; color: #64748B; margin-top: 4px;">
          ${new Date(dossier.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </div>
      </div>
    </div>

    <!-- Client Bio Details -->
    <div class="grid-3" style="margin-bottom: 20px;">
      <div class="metric-box">
        <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">${isAm ? "የባለቤቱ ስም" : "Seeker Name"}</span>
        <div style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${dossier.client.clientName}</div>
      </div>
      <div class="metric-box">
        <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">${isAm ? "የእናት ስም" : "Mother's Lineage"}</span>
        <div style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${dossier.client.motherName || "የተፈጠረች እናት"}</div>
      </div>
      <div class="metric-box">
        <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">${isAm ? "የትውልድ ቀን" : "Natal Horizon"}</span>
        <div style="font-size: 15px; font-weight: 700; color: #D4AF37; margin-top: 2px;">${dossier.client.birthDate}</div>
      </div>
    </div>

    <!-- Core Archetype & 6-Based Numerology Spotlight -->
    <div style="background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(16,185,129,0.06)); border: 1px solid rgba(212,175,55,0.4); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #D4AF37; letter-spacing: 0.1em;">
            ${isAm ? "ዋናው የሕይወት ቅኝት" : "Primary Relational Core & Archetype"}
          </span>
          <h2 style="margin: 2px 0 0 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">
            ${isAm ? dossier.dominantCoreAm : dossier.dominantCore} · ${isAm ? dossier.masterArchetypeAm : dossier.masterArchetype}
          </h2>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #CBD5E1;">
            ${isAm ? "የፍጥረት ቀን መልህቅ:" : "Creation-Day Anchor:"} <strong>${isAm ? dossier.creationDayAnchor.dayAm : dossier.creationDayAnchor.day} (${isAm ? dossier.creationDayAnchor.elementAm : dossier.creationDayAnchor.element})</strong> · ${isAm ? dossier.creationDayAnchor.themeAm : dossier.creationDayAnchor.theme}
          </p>
        </div>
        <div style="text-align: right; background: rgba(0,0,0,0.3); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 10px 18px;">
          <span style="font-size: 10px; color: #D4AF37; text-transform: uppercase; font-weight: bold;">6-Based Core Number</span>
          <div style="font-size: 28px; font-weight: 900; color: #FFFFFF;">#${dossier.coreNumber}</div>
        </div>
      </div>
    </div>

    <!-- 6-Core Radar Spectrum -->
    <div style="margin-bottom: 24px;">
      <h3 class="gold-header" style="font-size: 13px; margin-bottom: 12px;">
        ${isAm ? "የስድስቱ ማዕከላት ሚዛን (6-Core Energetic Spectrum)" : "6-Core Energetic Resonance Spectrum"}
      </h3>
      <div class="grid-2">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Power (ኃይል / እሳት)</span>
            <strong style="color: #FF6347;">${dossier.coreRadar.P}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${dossier.coreRadar.P}%; background: #FF6347;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Humanity (ሰውነት / ማኅበር)</span>
            <strong style="color: #4169E1;">${dossier.coreRadar.H}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${dossier.coreRadar.H}%; background: #4169E1;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Creation (ፍጥረት / ምድር)</span>
            <strong style="color: #32CD32;">${dossier.coreRadar.C}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${dossier.coreRadar.C}%; background: #32CD32;"></div></div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Peace (ዕርቅ / ባሕር)</span>
            <strong style="color: #DAA520;">${dossier.coreRadar.E}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${dossier.coreRadar.E}%; background: #DAA520;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Spirit (መንፈስ / አየር)</span>
            <strong style="color: #9370DB;">${dossier.coreRadar.S}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${dossier.coreRadar.S}%; background: #9370DB;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Order (ሥርዓት / ሰማይ)</span>
            <strong style="color: #00CED1;">${dossier.coreRadar.O}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${dossier.coreRadar.O}%; background: #00CED1;"></div></div>
        </div>
      </div>
    </div>

    <!-- Initiation Gate & Acoustic Key -->
    <div class="grid-2" style="margin-bottom: 24px;">
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
        <span class="gold-accent" style="font-size: 10px; font-weight: bold; text-transform: uppercase;">
          ${isAm ? "የመነሻ ፈተናና ደጅ (Layer 11)" : "Initiation Trial & Gate"}
        </span>
        <h4 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 14px;">
          ${isAm ? dossier.initiationGate.gateAm : dossier.initiationGate.gate}
        </h4>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #94A3B8;">
          <strong>${isAm ? "ፈተና:" : "Trial:"}</strong> ${isAm ? dossier.initiationGate.trialAm : dossier.initiationGate.trial}
        </p>
        <div style="margin-top: 8px; font-size: 11px; color: #10B981;">
          <strong>${isAm ? "ፍሬ:" : "Reward:"}</strong> ${dossier.initiationGate.reward}
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
        <span class="gold-accent" style="font-size: 10px; font-weight: bold; text-transform: uppercase;">
          ${isAm ? "የድምፅ ቅኝት (Acoustic Solfeggio)" : "Harmonic Solfeggio Frequency"}
        </span>
        <h4 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 14px;">
          ${dossier.solfeggioTitle}
        </h4>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #94A3B8;">
          ${dossier.solfeggioDescription}
        </p>
        <div style="margin-top: 8px; font-size: 11px; color: #60A5FA;">
          ${isAm ? "የወቅቱ መመሪያ:" : "Seasonal Guidance:"} ${dossier.biorhythm.seasonGuidance}
        </div>
      </div>
    </div>

    <!-- Daily Alignment Practices -->
    <div style="margin-bottom: 24px;">
      <h3 class="gold-header" style="font-size: 13px; margin-bottom: 12px;">
        ${isAm ? "የዕለት ተግባርና ማሰላሰል" : "Prescribed Daily Alignment Practices"}
      </h3>
      ${practicesHtml}
    </div>

    <!-- Certified Botanical Pharmacopeia Cross-Sell -->
    <div style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 class="gold-header" style="font-size: 13px; margin: 0;">
          ${isAm ? "የተረጋገጡ የባህል መድኃኒትና ዕፅዋት ቀመሮች" : "Certified Botanical Correspondence Formulations"}
        </h3>
        <span style="font-size: 11px; color: #10B981; font-weight: 600;">
          ${isAm ? "ከታመኑ የባህል ፈዋሾች የተዘጋጁ" : "Ethically Sourced & Verified"}
        </span>
      </div>
      ${prescriptionsHtml}
    </div>

    <!-- Ethical Guardrail & Non-Diagnostic Disclaimer -->
    <div style="border-top: 1px solid rgba(212,175,55,0.25); padding-top: 16px; font-size: 11px; line-height: 1.6; color: #94A3B8;">
      <strong style="color: #D4AF37;">${isAm ? "ባህላዊና ስነ-ምግባራዊ ማሳሰቢያ:" : "Ethical Boundary & Disclaimer:"}</strong>
      ${isAm ? dossier.safetyNotice.disclaimerAm : dossier.safetyNotice.disclaimerEn}
      <div style="margin-top: 8px; font-size: 10px; color: #64748B;">
        Generated by Ethiopian Wisdom & Wellness Platform · Hexacore Arcana Commercial Engine · Ref: ${dossier.reference}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
