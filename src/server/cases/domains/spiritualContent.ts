/**
 * Reflective Awde Negest report sections (Domain B: cultural, never used for safety decisions).
 *
 * Every section is written out in full from this person's reading: the arithmetic of their name,
 * the sign, circle and archetype it resolves to, the seal paired with that archetype, and a
 * blessing scroll composed for them by name. In the scroll tradition a seal or prayer is made
 * personal by the bearer's Christian (baptismal) name, so that name is used wherever one was given.
 *
 * The wording here is the platform's own. Preparation procedures from the manuscripts (what to
 * cut, mix, swallow or wear) are not reproduced; a debtera reviews everything before release.
 */
import type { FullDivinationResult } from "@/lib/cultural/spiritualDivinationEngine";
import type { TelsemSeal } from "@/lib/cultural/telsemData";
import { toEthiopianDate, toGeezNumeral } from "@/lib/profiling/astrology/ethiopianTraditions";
import type { ReportSection } from "../types";

export interface SpiritualSectionOptions {
  /** Baptismal name in Ge'ez script; the worldly name stands in when it is missing. */
  christianName?: string;
  /** The day the scroll is dated; defaults to today. */
  now?: Date;
}

// ── The bearer ───────────────────────────────────────────────────────────────

type Address = "m" | "f" | "p";

// Baptismal names announce themselves: ወልደ/ገብረ… "son/servant of", ወለተ/አመተ… "daughter/handmaid of".
const MASCULINE = ["ወልደ", "ገብረ", "ኃይለ", "ሀይለ", "ሐይለ", "ተክለ", "አምደ", "ሣህለ", "ሳህለ", "ፍቅረ"];
const FEMININE = ["ወለተ", "አመተ", "እኅተ", "ፍቅርተ"];

/** How the prayer addresses the bearer; the respectful plural is used when the name does not say. */
function addressFor(christianName: string): Address {
  const name = christianName.trim();
  if (FEMININE.some((prefix) => name.startsWith(prefix))) return "f";
  if (MASCULINE.some((prefix) => name.startsWith(prefix) && name.length > prefix.length + 1)) return "m";
  return "p";
}

const FORMS: Record<Address, { way: string; guide: string; protect: string; bless: string; heart: string; house: string; family: string; work: string; strengthen: string; bodySoul: string; going: string; faith: string; open: string }> = {
  m: { way: "መንገዱን", guide: "ምራው", protect: "ጠብቀው", bless: "ባርከው", heart: "ልቡን", house: "ቤቱን", family: "ቤተሰቡን", work: "ሥራውን", strengthen: "አጽናው", bodySoul: "ሥጋውንና ነፍሱን", going: "መውጣቱንና መግባቱን", faith: "እምነቱን", open: "ክፈትለት" },
  f: { way: "መንገዷን", guide: "ምራት", protect: "ጠብቃት", bless: "ባርካት", heart: "ልቧን", house: "ቤቷን", family: "ቤተሰቧን", work: "ሥራዋን", strengthen: "አጽናት", bodySoul: "ሥጋዋንና ነፍሷን", going: "መውጣቷንና መግባቷን", faith: "እምነቷን", open: "ክፈትላት" },
  p: { way: "መንገዳቸውን", guide: "ምራቸው", protect: "ጠብቃቸው", bless: "ባርካቸው", heart: "ልባቸውን", house: "ቤታቸውን", family: "ቤተሰባቸውን", work: "ሥራቸውን", strengthen: "አጽናቸው", bodySoul: "ሥጋቸውንና ነፍሳቸውን", going: "መውጣታቸውንና መግባታቸውን", faith: "እምነታቸውን", open: "ክፈትላቸው" },
};

interface Bearer {
  name: string;
  christianName: string;
  motherName: string;
  address: Address;
  /** "ለገብርከ ወልደ ሚካኤል", "ለአመትከ ወለተ ማርያም" or, without a baptismal name, "ለ<name>". */
  dative: string;
  /** The name the prayer speaks: the baptismal name when there is one. */
  spoken: string;
}

function bearerOf(gematria: FullDivinationResult, christianName?: string): Bearer {
  const christian = (christianName ?? "").trim();
  const address = christian ? addressFor(christian) : "p";
  const dative = !christian ? `ለ${gematria.nameGeez}` : address === "m" ? `ለገብርከ ${christian}` : address === "f" ? `ለአመትከ ${christian}` : `ለ${christian}`;
  return { name: gematria.nameGeez, christianName: christian, motherName: gematria.motherNameGeez, address, dative, spoken: christian || gematria.nameGeez };
}

// ── Vocabulary of the reading ────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  life_direction: "life direction and purpose",
  career: "work and vocation",
  relationships: "relationships and marriage",
  wellbeing: "wellbeing and vitality",
  family: "family matters",
  spiritual_growth: "spiritual growth",
  other: "the matter you brought",
};

/** The saint or order whose intercession the circle is named for. */
const CIRCLE_PATRON: Record<number, { am: string; en: string }> = {
  1: { am: "ቅዱስ ሚካኤል", en: "Saint Michael" },
  2: { am: "ቅዱስ ገብርኤል", en: "Saint Gabriel" },
  3: { am: "ቅዱስ ሩፋኤል", en: "Saint Raphael" },
  4: { am: "ቅዱስ ዑራኤል", en: "Saint Uriel" },
  5: { am: "ቅዱስ ፋኑኤል", en: "Saint Phanuel" },
  6: { am: "ቅዱስ ራጉኤል", en: "Saint Raguel" },
  7: { am: "ቅዱስ ሰራቂኤል", en: "Saint Saraqiel" },
  8: { am: "ቅዱስ ሩፋኤልና ቅድስት ማርያም", en: "Saint Raphael and Saint Mary" },
  9: { am: "ቅዱሳን ሱራፌል", en: "the holy Seraphim" },
  10: { am: "ቅዱሳን ኪሩቤል", en: "the holy Cherubim" },
  11: { am: "ቅዱሳን ሐዋርያት", en: "the holy Apostles" },
  12: { am: "ቅዱሳን ነቢያት", en: "the holy Prophets" },
  13: { am: "ቅዱሳን ሰማዕታት", en: "the holy Martyrs" },
  14: { am: "ቅዱሳን ጻድቃን", en: "the Righteous" },
  15: { am: "ቅዱስ ሩፋኤል", en: "Saint Raphael" },
  16: { am: "ቅዱስ ሚካኤል", en: "Saint Michael" },
};

/** A psalm for each family of seal, cited by the Ethiopian numbering with the common one beside it. */
const PSALM: Record<TelsemSeal["category"], { reference: string; am: string; en: string }> = {
  protection: { reference: "መዝሙር 90 (91)", am: "በልዑል መጠጊያ የሚኖር ሁሉን በሚችል አምላክ ጥላ ውስጥ ያድራል።", en: "Whoever dwells in the shelter of the Most High rests in the shadow of the Almighty." },
  healing: { reference: "መዝሙር 102 (103)", am: "ነፍሴ ሆይ፥ እግዚአብሔርን ባርኪ፥ ምስጋናውንም ሁሉ አትርሺ።", en: "Bless the Lord, my soul, and do not forget all his benefits." },
  archangels: { reference: "መዝሙር 90 (91)", am: "በመንገድህ ሁሉ ይጠብቁህ ዘንድ መላእክቱን ስለ አንተ ያዝዛቸዋል።", en: "He will command his angels concerning you, to guard you in all your ways." },
  abundance: { reference: "መዝሙር 22 (23)", am: "እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።", en: "The Lord is my shepherd; I shall not want." },
  wisdom: { reference: "መዝሙር 118 (119)", am: "ሕግህ ለእግሬ መብራት፥ ለመንገዴም ብርሃን ነው።", en: "Your word is a lamp to my feet and a light to my path." },
  harmony: { reference: "መዝሙር 132 (133)", am: "ወንድሞች በኅብረት ቢቀመጡ፥ እነሆ፥ መልካም ነው፥ እነሆም፥ ያማረ ነው።", en: "How good and pleasant it is when brothers and sisters dwell together in unity." },
};

const ELEMENT_PRACTICE: Record<string, string> = {
  Fire: "Light a single candle at dawn or dusk and sit with it for the length of one prayer; fire is the element of your reading, and tending a small flame is its quiet form.",
  Water: "Before prayer, wash your hands and face slowly with clean water; water is the element of your reading, and unhurried washing is its oldest practice.",
  Air: "Step outside at first light for ten slow breaths before speaking to anyone; air is the element of your reading, and breath is where it is felt.",
  Earth: "Walk a short distance on open ground each day, or tend one plant; earth is the element of your reading, and steadiness comes through the body.",
};

const CATEGORY_PRACTICE: Record<string, string[]> = {
  life_direction: [
    "Write down the two paths you are weighing and, under each, what you would be saying yes and no to. Read it again after three days.",
    "Ask one elder who knows you what they have seen you do well for years; direction is often already visible to others.",
  ],
  career: [
    "Name the one skill you are trusted for and one you avoid; give the second a fixed half hour each week.",
    "Before a decision about work, speak it aloud to someone with no stake in it and notice which part you hesitate over.",
  ],
  relationships: [
    "Once this week, listen to the other person for five full minutes without answering, then say back what you heard.",
    "Write what you ask of the relationship and what you bring to it, in two columns of equal length.",
  ],
  wellbeing: [
    "Keep one fixed hour for rising and for sleeping for two weeks, and note what changes.",
    "Take any concern about your body to a health professional; let prayer and reflection accompany care, not replace it.",
  ],
  family: [
    "Choose the one family matter that most needs settling and ask a respected elder to sit with those involved.",
    "Mark one shared meal a week as time without disputes, phones or business.",
  ],
  spiritual_growth: [
    "Keep one short, fixed rule of prayer for forty days rather than a long one for a week.",
    "Ask your spiritual father (የንስሐ አባት) for one reading to stay with for the season.",
  ],
  other: [
    "Put the matter into one sentence that begins “What I am really asking is…”, and keep it where you will see it.",
    "Name one person you trust enough to tell the whole of it to, and tell them.",
  ],
};

/** Manuscript wording that tells the reader to prepare, apply or consume something is not reproduced. */
const PROCEDURAL = /ብላ|ጠጣ|ቆርጠህ|ለውሰህ|ቀብተህ|ተቀባ|ታጠን|አጥን|ጽፈህ|እሰር|አንጠልጥል|ቅበር|ደግመህ|አብስለህ/u;

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th";
  return `${n}${suffix}`;
}

/** The seal's own prayer with the bearer's name in the place the manuscripts leave for it. */
function personalisedFormula(seal: TelsemSeal, bearer: Bearer): string | null {
  const formula = seal.traditionalFormulaGe?.trim();
  if (!formula || PROCEDURAL.test(formula)) return null;
  const servant = bearer.dative;
  let text = formula.replace(/ለገብር[ክከ]\s+እገሌ/gu, servant).replace(/ለገብር[ክከ](?![\p{L}])/gu, servant).replace(/እገሌ/gu, bearer.spoken);
  // A prayer with no place for a name is closed with one.
  if (!text.includes(bearer.spoken)) text = `${text.replace(/[።\s]+$/u, "")}፤ ${servant}። አሜን።`;
  return text;
}

// ── Sections ─────────────────────────────────────────────────────────────────

export function buildSpiritualSections(gematria: FullDivinationResult, category: string, options: SpiritualSectionOptions = {}): ReportSection[] {
  const name = gematria.nameGeez;
  const circle = gematria.awdeCircle;
  const zodiac = gematria.zodiac;
  const archetype = gematria.talismanic;
  const segment = gematria.awdeSegment;
  const seal = gematria.telsem;
  const guardian = gematria.guardianTelsem && gematria.guardianTelsem.id !== seal?.id ? gematria.guardianTelsem : undefined;
  const bearer = bearerOf(gematria, options.christianName);
  const forms = FORMS[bearer.address];
  const patron = CIRCLE_PATRON[circle?.number] ?? CIRCLE_PATRON[16];
  const topic = CATEGORY_LABEL[category] ?? category.replace(/_/g, " ");
  const now = options.now ?? new Date();
  const written = toEthiopianDate(now);
  const psalm = PSALM[seal?.category] ?? PSALM.protection;

  const spell = (letters: FullDivinationResult["letters"]) => letters.map((letter) => `${letter.letter} (${letter.transliteration}) = ${letter.value}`).join(" + ");
  const remainder12 = gematria.totalSum % 12;
  const remainder16 = gematria.totalSum % 16;

  const sections: ReportSection[] = [
    // 1 ── The arithmetic of the name, shown step by step.
    {
      id: "divination_summary",
      title: "Name reading",
      body: [
        `The reading begins with the letters of your name. In the Ge'ez reckoning (የፊደል ሂሳብ) every letter carries a number; the letters of ${name} add up to ${gematria.nameSubtotal}` +
          (gematria.motherNameGeez ? `, and those of your mother's name, ${gematria.motherNameGeez}, to ${gematria.motherSubtotal}. Together they make ${gematria.totalSum}.` : `. No mother's name was given, so the reading rests on your own name: ${gematria.totalSum}.`),
        `Counted round the twelve signs, ${gematria.totalSum} leaves ${remainder12 === 0 ? "no remainder, which is read as 12" : `a remainder of ${remainder12}`}; the reading therefore resolves to ${gematria.finalNumber}: ${zodiac?.name} (${zodiac?.nameAmharic}) ${zodiac?.symbol ?? ""}, a sign of ${zodiac?.element?.toLowerCase()} under ${zodiac?.rulingPlanet}.`,
        `Counted round the sixteen circles of the Awde Negest, it ${remainder16 === 0 ? "completes the round and" : `leaves ${remainder16} and`} falls in Circle ${circle?.number} — ${circle?.name} (${circle?.nameAmharic}), the ${circle?.lakeName}, whose element is ${circle?.element?.toLowerCase()} and whose meaning is given as: ${circle?.symbolism?.toLowerCase()}.`,
        bearer.christianName
          ? `Your Christian name, ${bearer.christianName}, is not part of the arithmetic. It is the name by which the seal and the blessing below are addressed, as the scroll tradition requires.`
          : "No Christian (baptismal) name was given. The seal and the blessing below are therefore addressed to your worldly name; your reviewer can add the baptismal name.",
      ].join("\n\n"),
      items: [
        `${name}: ${spell(gematria.letters)} = ${gematria.nameSubtotal}`,
        ...(gematria.motherNameGeez ? [`${gematria.motherNameGeez}: ${spell(gematria.motherLetters)} = ${gematria.motherSubtotal}`] : []),
        `Sum: ${gematria.totalSum}; by twelve: ${gematria.dividedBy12} rounds, remainder ${remainder12}; by sixteen: remainder ${remainder16}`,
        `Sign: ${zodiac?.name} (${zodiac?.nameAmharic}) — ${zodiac?.traits?.join(", ").toLowerCase()}`,
        `Circle ${circle?.number}: ${circle?.name} (${circle?.nameAmharic}) — ${circle?.lakeName}`,
        `Archetype ${archetype?.number}: ${archetype?.name} (${archetype?.nameAmharic})`,
      ],
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
        telsem: gematria.telsem,
        guardianTelsem: gematria.guardianTelsem,
      },
    },

    // 2 ── What the tradition says of that sign, circle and archetype.
    {
      id: "cultural_interpretation",
      title: "Cultural interpretation",
      body: [
        `The number ${gematria.finalNumber} carries the archetype the debtera tradition calls ${archetype?.name} (${archetype?.nameAmharic}). It stands under ${archetype?.rulingPlanet}, belongs to ${archetype?.element?.toLowerCase()}, and is given ${archetype?.dayOfWeek} as its day.`,
        `Read for ${topic}, the tradition takes this as an invitation rather than a verdict: ${segment?.prediction} Its counsel is to ${segment?.recommendation?.charAt(0).toLowerCase()}${segment?.recommendation?.slice(1)}`,
        `The sign ${zodiac?.name} adds the qualities it is known for — ${zodiac?.traits?.join(", ").toLowerCase()} — and the circle of ${circle?.name} sets them in the ${circle?.lakeName}: ${circle?.symbolism?.toLowerCase()}. Where the sign's ${zodiac?.element?.toLowerCase()} meets the circle's ${circle?.element?.toLowerCase()}, the reading speaks of ${zodiac?.element === circle?.element ? "one quality reinforced, to be used with measure" : "two qualities to be held in balance"}.`,
        "All of this is offered for reflection. It describes how a tradition reads a name; it does not predict events, and it is not medical, legal or financial guidance.",
      ].join("\n\n"),
      items: [
        `Day: ${archetype?.dayOfWeek} (${archetype?.rulingPlanet})`,
        `Colours: ${archetype?.colors?.join(", ")}`,
        `Stones: ${archetype?.gemstones?.join(", ")}`,
        `Plants named beside this archetype: ${archetype?.herbs?.join(", ")} — recorded as heritage, not as something to take`,
        `Theme of the reading: ${segment?.topic}`,
      ],
      locked: true,
      cultural: true,
    },

    // 3 ── Practices that follow from the reading and from what the person asked about.
    {
      id: "practical_guidance",
      title: "Reflective practices",
      body: `These practices are chosen for ${topic} and for the element and day of your reading. None of them asks you to take, burn or wear anything; they are ways of paying attention.`,
      items: [
        ELEMENT_PRACTICE[archetype?.element ?? ""] ?? "Begin the morning with a few quiet minutes to set one intention before speaking to anyone.",
        `Keep ${archetype?.dayOfWeek}, the day of your archetype, for the one thing you most tend to postpone.`,
        ...(CATEGORY_PRACTICE[category] ?? CATEGORY_PRACTICE.other),
        `The tradition's own suggestion for this reading: ${segment?.spiritualPractice}`,
        `Keep a short weekly note about ${topic} — what you asked, what shifted, what you did — and bring it to your next conversation with your reviewer.`,
      ],
      locked: true,
      cultural: true,
    },

    // 4 ── A way of keeping the blessing.
    {
      id: "recommended_ritual",
      title: "Suggested blessing",
      body: [
        `On a quiet ${archetype?.dayOfWeek} evening, set a clean place, light a little frankincense (ዕጣን) if that is your custom, and read ${psalm.reference}: “${psalm.en}”`,
        `Then read the blessing scroll at the end of this report aloud, slowly, with your name as it is written there. Under the patronage of ${patron.en}, to whom Circle ${circle?.number} is given, close with the Lord's Prayer (አቡነ ዘበሰማያት).`,
        "Keep the space calm and unhurried. If you have a spiritual father (የንስሐ አባት), tell him about this reading and follow his guidance where it differs.",
      ].join("\n\n"),
      items: [
        `Day and hour: ${archetype?.dayOfWeek}, at dusk`,
        `Reading: ${psalm.reference} — ${psalm.am}`,
        `Patron of your circle: ${patron.am} (${patron.en})`,
        "To have at hand: a clean white cloth or gabi, clean water or ጸበል, frankincense (ዕጣን) if you use it",
      ],
      locked: true,
      cultural: true,
    },

    // 5 ── The seal, described in full and addressed to the bearer.
    {
      id: "sacred_telsem",
      title: `Sacred Telsem (ጠልሰም): ${seal?.nameAm ?? "የበረከት ጠልሰም"}`,
      body: [
        `${seal?.nameGe ?? "ጠልሰም"} — ${seal?.nameEn ?? "Sacred Talisman"}. This is the seal the tradition pairs with ${archetype?.name}, the archetype your name resolves to; it belongs to the family of ${seal?.categoryLabelEn?.toLowerCase() ?? "blessing"} seals (${seal?.categoryLabelAm ?? "በረከት"}).`,
        `Source: ${seal?.sourceManuscript ?? "the historical parchment scroll tradition"}${seal?.sourcePage ? `, page ${seal.sourcePage}` : ""}. ${seal?.spiritualMeaning ?? ""}`,
        `A seal is not complete until it carries a name. In the scroll tradition that name is the bearer's Christian name, written as “your servant” before God: here it reads ${bearer.dative}${bearer.motherName ? `, with the mother's name, ${bearer.motherName}, beneath it` : ""}.` +
          (bearer.christianName ? "" : " No Christian name was given, so the worldly name stands in its place for now."),
        "What follows describes the design and gives its prayer. It is presented as heritage and as a focus for reflection. The manuscripts' instructions for preparing or wearing a seal are not reproduced here; that belongs to a debtera, in person.",
        seal?.culturalDisclaimer ?? "",
      ].filter(Boolean).join("\n\n"),
      items: [
        `ቅርጸ ጠልሰም (Design): ${seal?.sacredGeometryDescription ?? ""}`,
        `ስም (Name band): ዝንቱ ጠልሰም ${bearer.dative}${bearer.motherName ? ` — የ${bearer.motherName} ልጅ` : ""}።`,
        ...(seal && personalisedFormula(seal, bearer)
          ? [`የጸሎት ቃል (Prayer of the seal): ${personalisedFormula(seal, bearer)}`]
          : ["የጸሎት ቃል (Prayer of the seal): the manuscript gives a preparation at this point, which is not reproduced; its sense is given in the next line."]),
        `Meaning of the prayer: ${seal?.traditionalFormulaEn ?? ""}`,
        `How it is read for you: for ${topic}, a seal of ${seal?.categoryLabelEn?.toLowerCase() ?? "blessing"} asks what in this matter needs ${seal?.category === "protection" ? "a boundary" : seal?.category === "healing" ? "mending" : seal?.category === "wisdom" ? "understanding" : seal?.category === "abundance" ? "to be trusted to grow" : seal?.category === "harmony" ? "reconciling" : "courage and a clear conscience"}, and what is already protected.`,
        `Colours of the inks: ${archetype?.colors?.join(", ")}; stones named with it: ${archetype?.gemstones?.join(", ")}`,
        `Day: ${archetype?.dayOfWeek}, under ${archetype?.rulingPlanet}; element: ${archetype?.element}`,
        `ባህላዊ ገቢር (Materials the tradition names): ${seal?.ritualMaterials?.join(", ") ?? ""} — listed as heritage, not as instructions`,
        ...(guardian
          ? [`Guardian seal of Circle ${circle?.number}: ${guardian.nameAm} (${guardian.nameEn}) — ${guardian.spiritualMeaning}`]
          : [`Circle ${circle?.number} is guarded by this same seal: your sign and your circle agree.`]),
      ],
      locked: true,
      cultural: true,
      data: {
        telsem: gematria.telsem,
        guardianTelsem: gematria.guardianTelsem,
        christianName: bearer.christianName || undefined,
      },
    },

    // 6 ── The blessing scroll, composed for the bearer.
    {
      id: "healing_scroll",
      title: `Blessing scroll for ${bearer.christianName ? `${bearer.christianName} (${name})` : name}`,
      body: [
        `This scroll was composed for you on ${written.formatted} (${written.monthName} ${written.day}, ${written.year} in the Ethiopian calendar). It follows the order of a traditional scroll: the invocation, the naming of the bearer, the petition for ${topic}, the protection of ${patron.en}, the blessing of the ${ordinal(circle?.number ?? 1)} circle, a psalm, and the sealing.`,
        "In English: In the name of the Father, the Son and the Holy Spirit, one God. " +
          `This blessing is written for ${bearer.christianName ? `your servant ${bearer.christianName}, known in the world as ${name}` : name}${bearer.motherName ? `, child of ${bearer.motherName}` : ""}. ` +
          `${PETITION[category]?.en ?? PETITION.other.en} ` +
          `By the intercession and guard of ${patron.en}, keep them from every harm, from the malice of an enemy and from hindrance on the road; bless their going out and their coming in. ` +
          `By the blessing of the ${ordinal(circle?.number ?? 1)} circle of the Awde Negest — ${circle?.name}, the ${circle?.lakeName} — grant your peace. ` +
          `${psalm.en} May this prayer be for ${bearer.spoken}, in the name of the Father, the Son and the Holy Spirit, for ever and ever. Amen.`,
        "It is a prayer of blessing, to be read and kept. It makes no promise of an outcome and takes the place of no care, counsel or sacrament.",
      ].join("\n\n"),
      items: [
        "መክፈቻ (Invocation): በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ፤ አሜን።",
        `ስም (The bearer): ይህ የበረከት ጽሑፍ ${bearer.dative} የተዘጋጀ ነው፤ የዓለም ስም፦ ${name}${bearer.motherName ? `፤ የእናት ስም፦ ${bearer.motherName}` : ""}።`,
        `ልመና (Petition): ${(PETITION[category] ?? PETITION.other).am(forms)}`,
        `ጥበቃ (Protection): በ${patron.am} አማላጅነትና ጥበቃ፥ ከክፉ ነገር ሁሉ፥ ከጠላት ተንኮልና ከመንገድ እክል ${forms.protect}፤ ${forms.going} ባርክ።`,
        `በረከተ አውድ (Blessing of the circle): በአውደ ነገሥት ${toGeezNumeral(circle?.number ?? 1)}ኛው አውድ — ${circle?.nameAmharic ?? ""} — በረከት፥ ለ${bearer.spoken} ሰላምህን ስጥ፤ ${forms.bless}።`,
        `መዝሙር (Psalm, ${psalm.reference}): ${psalm.am}`,
        `ማኅተም (Sealing): ይህ ጸሎት ${bearer.dative} ይሁን፤ በአብ በወልድ በመንፈስ ቅዱስ ስም፤ ለዓለመ ዓለም አሜን።`,
        `ተጻፈ (Written): ${written.formatted}`,
      ],
      locked: true,
      cultural: true,
      data: {
        patron: patron.am,
        telsem: gematria.telsem,
        christianName: bearer.christianName || undefined,
        writtenOn: now.toISOString().slice(0, 10),
      },
    },
  ];

  return sections;
}

/** The petition of the scroll for each kind of question, in Amharic for the bearer and in English. */
const PETITION: Record<string, { am: (forms: (typeof FORMS)[Address]) => string; en: string }> = {
  life_direction: {
    am: (f) => `አቤቱ የብርሃን አምላክ ሆይ፥ ${f.way} በብርሃንህ አቅና፤ የሚገባውን በር ${f.open}፥ የማይገባውንም ዝጋ፤ በጥበብና በማስተዋል ${f.guide}።`,
    en: "O God of light, make their way straight in your light; open the door that is right and close the one that is not; guide them with wisdom and understanding.",
  },
  career: {
    am: (f) => `አቤቱ የበረከት አምላክ ሆይ፥ ${f.work} ባርክ፤ የእጅን ሥራ አቅና፤ በቅንነትና በትጋት ${f.strengthen}፤ የዕለት እንጀራንም አታሳጣ።`,
    en: "O God of blessing, bless their work and prosper the labour of their hands; strengthen them in honesty and diligence, and do not withhold their daily bread.",
  },
  relationships: {
    am: (f) => `አቤቱ የፍቅርና የሰላም አምላክ ሆይ፥ ${f.heart} በፍቅርና በትዕግሥት ሙላ፤ ከሚወዷቸው ጋር ሰላምንና መተማመንን አኑር፤ ቂምንና ቁጣን አርቅ።`,
    en: "O God of love and peace, fill their heart with love and patience; set peace and trust between them and those they love; put resentment and anger far away.",
  },
  wellbeing: {
    am: (f) => `አቤቱ የምሕረት አምላክ ሆይ፥ ${f.bodySoul} በምሕረትህ ጠብቅ፤ ድካምን በብርታት፥ ጭንቀትንም በሰላም ለውጥ፤ ሐኪሞችንና የሚንከባከቡትን እጆች ባርክ።`,
    en: "O God of mercy, keep their body and soul in your mercy; turn weariness into strength and anxiety into peace; bless the physicians and the hands that care for them.",
  },
  family: {
    am: (f) => `አቤቱ የአባቶቻችን አምላክ ሆይ፥ ${f.house} እና ${f.family} ባርክ፤ ፍቅርንና መከባበርን በመካከላቸው አጽና፤ ልጆችንና ሽማግሌዎችን ጠብቅ።`,
    en: "O God of our fathers, bless their house and their family; make love and respect firm among them; watch over the children and the elders.",
  },
  spiritual_growth: {
    am: (f) => `አቤቱ የቅዱሳን አምላክ ሆይ፥ ${f.faith} አጽና፤ ${f.heart} ለቃልህ ክፈት፤ በጸሎት፥ በትሕትናና በምስጋና መኖርን ስጥ።`,
    en: "O God of the saints, make their faith firm; open their heart to your word; grant them a life of prayer, humility and thanksgiving.",
  },
  other: {
    am: (f) => `አቤቱ መሐሪ አምላክ ሆይ፥ በልብ ያለውን ልመና አንተ ታውቃለህ፤ እንደ ፈቃድህ ${f.guide}፤ ${f.protect}፤ ${f.bless}።`,
    en: "O merciful God, you know the petition that is in the heart; guide them according to your will, guard them and bless them.",
  },
};
