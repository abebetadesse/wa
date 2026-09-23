/** Reflective Awde Negest report sections (Domain B: cultural, never used for safety decisions). */
import type { FullDivinationResult } from "@/lib/cultural/spiritualDivinationEngine";
import type { ReportSection } from "../types";

export function buildSpiritualSections(gematria: FullDivinationResult, category: string): ReportSection[] {
  const name = gematria.nameGeez;
  const circle = gematria.awdeCircle;
  const patron = circle?.number === 8 ? "ቅዱስ ሩፋኤልና ቅድስት ማርያም" : "ቅዱስ ሚካኤል";

  return [
    {
      id: "divination_summary",
      title: "Name reading",
      body:
        `The letters of ${name} sum to ${gematria.totalSum}, which resolves to ${gematria.finalNumber}. ` +
        `In the Awde Negest this corresponds to ${gematria.zodiac?.name} (${gematria.zodiac?.nameAmharic}), ` +
        `Circle ${circle?.number} — ${circle?.name} (${circle?.nameAmharic}), segment ${gematria.awdeSegment?.number}.`,
      locked: false,
      cultural: true,
      data: {
        totalSum: gematria.totalSum,
        dividedBy12: gematria.dividedBy12,
        finalNumber: gematria.finalNumber,
        zodiac: gematria.zodiac,
        awdeCircle: circle,
        awdeSegment: gematria.awdeSegment,
        talismanic: gematria.talismanic,
      },
    },
    {
      id: "cultural_interpretation",
      title: "Cultural interpretation",
      body:
        `In the debtera tradition, a reading that resolves to the ${gematria.talismanic?.name ?? "given"} archetype` +
        `${gematria.talismanic?.rulingPlanet ? ` under ${gematria.talismanic.rulingPlanet}` : ""} is read as an invitation ` +
        "to step out of repetition and to clarify one's boundaries and commitments. It is offered for reflection, not prediction.",
      locked: true,
      cultural: true,
    },
    {
      id: "practical_guidance",
      title: "Reflective practices",
      items: [
        "Begin the morning with a few quiet minutes to set one intention before speaking to anyone.",
        "Name one obligation or conversation you have been postponing, and address it with care this week.",
        `Keep a short weekly journal about ${category.replace(/_/g, " ")} and what has shifted.`,
      ],
      locked: true,
      cultural: true,
    },
    {
      id: "recommended_ritual",
      title: "Suggested blessing",
      body: "Light frankincense (ዕጣን) on a quiet evening and read the prayer or psalm of the day, reflecting on renewal. Keep the space calm and unhurried.",
      items: ["Frankincense (ዕጣን)", "A sprig of tena adam or koseret", "Clean water or ጸበል", "A clean white cloth or gabi"],
      locked: true,
      cultural: true,
    },
    {
      id: "healing_scroll",
      title: `Blessing scroll for ${name}`,
      items: [
        `በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ፤ ጸሎት ለ${name}።`,
        `ኦ አምላከ ጻድቃን፣ በበረከተ ${circle?.nameAmharic ?? ""} አውደ ነገሥት፣ የ${name}ን ጎዳና በብርሃንህ ምራ።`,
        "ፈውስ ወሰላም ለሥጋ ወለመንፈስ፤ ከአእምሮ ጭንቀትና ከመንገድ እክል ሰላም አውርድ።",
      ],
      locked: true,
      cultural: true,
      data: { patron },
    },
  ];
}
