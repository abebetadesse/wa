import { HumoralElement, NameSuggestionResult } from "../types";
import { ETHIOPIAN_NAMES_DATABASE } from "./nameDatabase";
import { CHRISTIAN_NAME_CATALOG } from "@/lib/christian/christianNameCatalog";

export type SuggestionReason =
  | "new_baby"
  | "spiritual_rebirth"
  | "business"
  | "personal_empowerment"
  | "marriage"
  | "healing_balance"
  | "general_alignment";

export interface SuggestionCriteria {
  targetElement?: HumoralElement;
  targetDestinyNumber?: number;
  gender?: "female" | "male" | "unisex";
  languagePreference?: "Amharic" | "Ge'ez" | "Afaan Oromo" | "Tigrinya" | "Biblical";
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  city?: string;
  reason?: SuggestionReason;
}

export interface NameAppreciation {
  currentName: string;
  isAppreciated: boolean;
  harmonyScore: number; // 0-100%
  headline: string;
  recommendation: string;
  reasoning: string;
  destinyNumber?: number;
  primaryElement?: HumoralElement;
}

type NameSource = "Ethiopian" | "Biblical" | "Biblical place" | "Global";

interface CuratedNameCandidate {
  name: string;
  meaning: string;
  gender: "female" | "male" | "unisex";
  language: string;
  sourceTradition: NameSource;
  destinyNumber: number;
  element: HumoralElement;
  geezFidel?: string;
}

// Richly curated Biblical and Ethiopian Christian names with linguistic tradition definitions
const CURATED_NAME_CANDIDATES: CuratedNameCandidate[] = [
  // Patriarchs, Prophets & Kings
  { name: "Abraham", meaning: "Father of many nations (Hebrew: Avraham); covenantal founder of enduring faith", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "afere", geezFidel: "አብርሃም" },
  { name: "Sarah", meaning: "Princess; noblewoman (Hebrew: Sarah); mother of nations and joyful promise", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 8, element: "may", geezFidel: "ሳራ" },
  { name: "Isaac", meaning: "He laughs; divine joy (Hebrew: Yitzhak); laughter of deliverance", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 6, element: "nifas", geezFidel: "ይስሐቅ" },
  { name: "Jacob", meaning: "Heel-holder; one who perseveres with God (Hebrew: Yaakov)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "esat", geezFidel: "ያዕቆብ" },
  { name: "Joseph", meaning: "May the Lord add and increase (Hebrew: Yosef); visionary statesman", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 2, element: "afere", geezFidel: "ዮሴፍ" },
  { name: "Moses", meaning: "Drawn out of the waters; deliverer and lawgiver (Hebrew: Moshe)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 7, element: "esat", geezFidel: "ሙሴ" },
  { name: "David", meaning: "Beloved (Hebrew: Dawid); victorious psalmist and shepherd king", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 4, element: "nifas", geezFidel: "ዳዊት" },
  { name: "Solomon", meaning: "Peaceful; wholeness and wisdom (Hebrew: Shlomo / Ge'ez: Selomon)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "may", geezFidel: "ሰሎሞን" },
  { name: "Samuel", meaning: "Heard by God; name of God (Hebrew: Shemu'el); consecrated prophet", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "nifas", geezFidel: "ሳሙኤል" },
  { name: "Elijah", meaning: "My God is Yahweh (Hebrew: Eliyahu); prophet of fiery zeal and restoration", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 1, element: "esat", geezFidel: "ኤልያስ" },
  { name: "Elisha", meaning: "God is salvation (Hebrew: Elisha); prophet of healing and double portion", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 9, element: "may", geezFidel: "ኤልሳዕ" },
  { name: "Isaiah", meaning: "Salvation of the Lord (Hebrew: Yeshayahu); evangelical prophet of glory", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 8, element: "may", geezFidel: "ኢሳይያስ" },
  { name: "Jeremiah", meaning: "Exalted by the Lord (Hebrew: Yirmeyahu); faithful voice of restoration", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 7, element: "may", geezFidel: "ኤርምያስ" },
  { name: "Ezekiel", meaning: "God strengthens (Hebrew: Yechezqel); visionary priest of renewal", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 4, element: "afere", geezFidel: "ሕዝቅኤል" },
  { name: "Daniel", meaning: "God is my judge (Hebrew: Daniyyel); unwavering wisdom and steadfast courage", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 9, element: "afere", geezFidel: "ዳንኤል" },
  { name: "Gideon", meaning: "Mighty warrior; feller of strongholds (Hebrew: Gid'on)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 1, element: "esat", geezFidel: "ጌዴዎን" },
  { name: "Joshua", meaning: "Yahweh is salvation (Hebrew: Yehoshua); courageous commander into promise", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "esat", geezFidel: "ኢያሱ" },
  { name: "Caleb", meaning: "Wholehearted; faithful devotion (Hebrew: Kalev)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 6, element: "afere", geezFidel: "ካሌብ" },
  { name: "Ezra", meaning: "Helper; scribe of the divine law (Hebrew: Ezra)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 2, element: "nifas", geezFidel: "ዕዝራ" },
  { name: "Nehemiah", meaning: "Comforted by the Lord; builder and restorer (Hebrew: Nechemyah)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 4, element: "afere", geezFidel: "ነህምያ" },
  { name: "Job", meaning: "Persevering; redeemed through patient endurance (Hebrew: Iyyov)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 8, element: "afere", geezFidel: "ኢዮብ" },
  { name: "Jonah", meaning: "Dove; messenger of peace (Hebrew: Yonah)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 6, element: "may", geezFidel: "ዮናስ" },

  // Matriarchs, Prophetesses & Holy Women
  { name: "Mary", meaning: "Beloved; exalted drop of the sea (Hebrew: Miryam); mother of grace", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "may", geezFidel: "ማርያም" },
  { name: "Miriam", meaning: "Rebellion dissolved into joyful praise; prophetess of song (Hebrew)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 4, element: "nifas", geezFidel: "ማርያም" },
  { name: "Esther", meaning: "Star; hidden treasure revealed for deliverance (Hebrew: Hadassah / Persian)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "may", geezFidel: "አስቴር" },
  { name: "Ruth", meaning: "Compassionate and loyal friend (Hebrew: Rut); lineage of redemptive grace", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "may", geezFidel: "ሩት" },
  { name: "Hannah", meaning: "Grace and divine favor (Hebrew: Channah); answered prayer of faith", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 2, element: "may", geezFidel: "ሐና" },
  { name: "Abigail", meaning: "Father's joy; woman of discernment and peace (Hebrew: Avigayil)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 7, element: "nifas", geezFidel: "አቢግያ" },
  { name: "Deborah", meaning: "Bee; industrious judge and prophetess of fiery victory (Hebrew: Devorah)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 1, element: "esat", geezFidel: "ዲቦራ" },
  { name: "Elizabeth", meaning: "My God is an oath; plenitude (Hebrew: Elisheva); mother of John", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 9, element: "may", geezFidel: "ኤልሳቤጥ" },
  { name: "Naomi", meaning: "Pleasantness and sweetness restored (Hebrew: No'omi)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 6, element: "may", geezFidel: "ኑኃሚን" },
  { name: "Rebekah", meaning: "Faithful connection; captivating beauty and devotion (Hebrew: Rivkah)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "afere", geezFidel: "ርብቃ" },
  { name: "Rachel", meaning: "Ewe; gentle grace and purity of heart (Hebrew: Rachel)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 4, element: "may", geezFidel: "ራሔል" },
  { name: "Leah", meaning: "Weary overcome by steadfast devotion; mother of praise (Hebrew: Le'ah)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 8, element: "afere", geezFidel: "ልያ" },
  { name: "Martha", meaning: "Lady; diligent hospitality and devotion (Aramaic: Marta)", gender: "female", language: "Aramaic", sourceTradition: "Biblical", destinyNumber: 4, element: "afere", geezFidel: "ማርታ" },
  { name: "Lydia", meaning: "Noble businesswoman; open heart of generosity (Greek: Lydia)", gender: "female", language: "Greek", sourceTradition: "Biblical", destinyNumber: 8, element: "nifas", geezFidel: "ልድያ" },
  { name: "Priscilla", meaning: "Venerable; wise teacher and faithful partner in the faith (Latin)", gender: "female", language: "Greek", sourceTradition: "Biblical", destinyNumber: 6, element: "nifas", geezFidel: "ጵርስቅላ" },
  { name: "Susanna", meaning: "Lily; graceful flower of purity and justice (Hebrew: Shoshannah)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "may", geezFidel: "ሶስና" },
  { name: "Judith", meaning: "Praised woman; courageous defender of her people (Hebrew: Yehudit)", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 1, element: "esat", geezFidel: "ዮዲት" },
  { name: "Talitha", meaning: "Little girl arise; resurrection vitality (Aramaic: Talitha)", gender: "female", language: "Aramaic", sourceTradition: "Biblical", destinyNumber: 7, element: "nifas", geezFidel: "ጣሊታ" },

  // Apostles, Evangelists & Early Church
  { name: "John", meaning: "Yahweh is gracious (Hebrew: Yochanan); apostle of light and divine love", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 2, element: "may", geezFidel: "ዮሐንስ" },
  { name: "Peter", meaning: "Rock; steadfast foundation of faith (Greek: Petros)", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 7, element: "afere", geezFidel: "ጴጥሮስ" },
  { name: "Paul", meaning: "Humble; small turned into apostolic power (Latin: Paulus)", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 5, element: "esat", geezFidel: "ጳውሎስ" },
  { name: "Stephen", meaning: "Crown of victory; first martyr of radiant grace (Greek: Stephanos)", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 1, element: "esat", geezFidel: "እስጢፋኖስ" },
  { name: "Philip", meaning: "Lover of noble horses; enthusiastic evangelist (Greek: Philippos)", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 3, element: "nifas", geezFidel: "ፊልጶስ" },
  { name: "Andrew", meaning: "Manly and courageous; first-called apostle of fellowship (Greek: Andreas)", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 8, element: "esat", geezFidel: "እንድርያስ" },
  { name: "Thomas", meaning: "Twin; transformed doubt into supreme confession (Aramaic: Te'oma)", gender: "male", language: "Aramaic", sourceTradition: "Biblical", destinyNumber: 4, element: "afere", geezFidel: "ቶማስ" },
  { name: "Barnabas", meaning: "Son of encouragement and generous consolation (Aramaic)", gender: "male", language: "Aramaic", sourceTradition: "Biblical", destinyNumber: 6, element: "may", geezFidel: "በርናባስ" },
  { name: "Timothy", meaning: "Honoring God; beloved disciple of gentle endurance (Greek: Timotheos)", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 7, element: "nifas", geezFidel: "ጢሞቴዎስ" },
  { name: "Silas", meaning: "Asked of God; steadfast companion in trials (Latin / Hebrew)", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 9, element: "nifas", geezFidel: "ሲላስ" },
  { name: "Matthias", meaning: "Gift of Yahweh (Hebrew: Mattityahu); chosen apostle of restoration", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "may", geezFidel: "ማትያስ" },
  { name: "Simeon", meaning: "He who hears and obeys; patient servant of peace (Hebrew: Shim'on)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "may", geezFidel: "ስምዖን" },
  { name: "Nathaniel", meaning: "Gift of God (Hebrew: Netan'el); sincere spirit without guile", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 8, element: "nifas", geezFidel: "ናትናኤል" },
  { name: "Lazarus", meaning: "God has helped (Hebrew: El'azar); victory of resurrection life", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 6, element: "may", geezFidel: "አልዓዛር" },
  { name: "Michael", meaning: "Who is like God? Archangel of triumph and protection (Hebrew: Mikha'el)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 1, element: "esat", geezFidel: "ሚካኤል" },
  { name: "Gabriel", meaning: "God is my strength; herald of good tidings (Hebrew: Gavri'el)", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 9, element: "nifas", geezFidel: "ገብርኤል" },
  { name: "Raphael", meaning: "God heals (Hebrew: Refa'el); angel of medical recovery and light", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 7, element: "may", geezFidel: "ሩፋኤል" },

  // Sacred Places & Symbolic Names
  { name: "Zion", meaning: "Highest sanctuary; dwelling place of holy peace (Hebrew: Tziyyon)", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 8, element: "esat", geezFidel: "ጽዮን" },
  { name: "Eden", meaning: "Delight; paradise of untainted harmony (Hebrew: Eden)", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 5, element: "may", geezFidel: "ኤደን" },
  { name: "Shiloh", meaning: "Tranquility; place of rest and quiet sanctuary (Hebrew: Shiloh)", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 6, element: "may", geezFidel: "ሴሎ" },
  { name: "Jordan", meaning: "Descending river of purification and renewal (Hebrew: Yarden)", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 2, element: "nifas", geezFidel: "ዮርዳኖስ" },
  { name: "Salem", meaning: "Peace; wholeness and primordial harmony (Hebrew: Shalem)", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 1, element: "may", geezFidel: "ሳሌም" },
  { name: "Bethel", meaning: "House of God; portal of divine encounter (Hebrew: Beit-El)", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 7, element: "afere", geezFidel: "ቤቴል" },

  // Ethiopian Sacred Ge'ez & Amharic Heritage Names
  { name: "Amanuel", meaning: "God is with us (Ge'ez: አማኑኤል); divine accompaniment", gender: "male", language: "Ge'ez", sourceTradition: "Ethiopian", destinyNumber: 9, element: "nifas", geezFidel: "አማኑኤል" },
  { name: "Gebre Meskel", meaning: "Servant of the Cross (Ge'ez); sacrificial dedication", gender: "male", language: "Ge'ez", sourceTradition: "Ethiopian", destinyNumber: 4, element: "afere", geezFidel: "ገብረ መስቀል" },
  { name: "Tekle Haymanot", meaning: "Plant of Faith (Ge'ez); root of monastic wisdom", gender: "male", language: "Ge'ez", sourceTradition: "Ethiopian", destinyNumber: 7, element: "afere", geezFidel: "ተክለ ሃይማኖት" },
  { name: "Wolde Mariam", meaning: "Son of Mary (Ge'ez); grace-protected lineage", gender: "male", language: "Ge'ez", sourceTradition: "Ethiopian", destinyNumber: 6, element: "may", geezFidel: "ወልደ ማርያም" },
  { name: "Berhane Meskel", meaning: "Light of the Holy Cross; spiritual illuminator", gender: "male", language: "Ge'ez", sourceTradition: "Ethiopian", destinyNumber: 1, element: "esat", geezFidel: "ብርሃነ መስቀል" },
  { name: "Selam", meaning: "Peace, wholeness, and safety (Amharic: ሰላም)", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 6, element: "may", geezFidel: "ሰላም" },
  { name: "Tigist", meaning: "Patience and endurance (Amharic: ትዕግሥት); enduring fortitude", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 5, element: "may", geezFidel: "ትዕግሥት" },
  { name: "Abebe", meaning: "He has blossomed and flourished (Amharic: አበበ)", gender: "male", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 1, element: "esat", geezFidel: "አበበ" },
  { name: "Liya", meaning: "I am with you; devoted (Amharic: ልያ)", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 3, element: "nifas", geezFidel: "ልያ" },
  { name: "Mulugeta", meaning: "Master of all completeness; lordly plenitude", gender: "male", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 8, element: "may", geezFidel: "ሙሉጌታ" },
  { name: "Almaz", meaning: "Diamond; incorruptible brilliance and endurance", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 9, element: "esat", geezFidel: "አልማዝ" },
  { name: "Haile", meaning: "Power and divine strength (Amharic: ኃይሌ)", gender: "male", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 1, element: "esat", geezFidel: "ኃይሌ" },
  { name: "Bekele", meaning: "He has germinated and grown into fruitfulness", gender: "male", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 4, element: "afere", geezFidel: "በቀለ" },
  { name: "Genet", meaning: "Paradise; celestial garden of beauty (Amharic: ገነት)", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 5, element: "nifas", geezFidel: "ገነት" },
];

function reduceNumber(value: number): number {
  let result = Math.abs(value);
  while (result > 9) result = String(result).split("").reduce((sum, digit) => sum + Number(digit), 0);
  return result || 9;
}

export function destinyFromBirthDate(birthDate?: string): number | undefined {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return undefined;
  return reduceNumber(birthDate.replaceAll("-", "").split("").reduce((sum, digit) => sum + Number(digit), 0));
}

export function getZodiacElementFromDate(birthDate?: string): HumoralElement | undefined {
  if (!birthDate) return undefined;
  const parts = birthDate.split("-");
  if (parts.length < 3) return undefined;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return undefined;

  // Aries, Leo, Sag = esat
  // Taurus, Virgo, Cap = afere
  // Gemini, Libra, Aquarius = nifas
  // Cancer, Scorpio, Pisces = may
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "esat";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "afere";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "nifas";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "may";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "esat";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "afere";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "nifas";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "may";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "esat";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "afere";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "nifas";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "may";
  return undefined;
}

/**
 * Evaluates the user's current registered name and generates an appreciative evaluation.
 * Requirement: Appreciate the existing name of ~85% of users and recommend they keep it as is.
 */
export function evaluateExistingName(
  fullName?: string,
  birthDate?: string,
  targetElement?: HumoralElement
): NameAppreciation {
  const nameToEval = (fullName || "Your Name").trim();
  const givenName = nameToEval.split(/\s+/)[0] || nameToEval;

  // Compute a deterministic hash based on the name characters
  const charCodeSum = [...nameToEval].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const destinyNum = reduceNumber(charCodeSum);
  const elements: HumoralElement[] = ["esat", "afere", "nifas", "may"];
  const nameElement = elements[destinyNum % 4];

  // Derive birth date destiny
  const birthDestiny = destinyFromBirthDate(birthDate);
  const astroElement = getZodiacElementFromDate(birthDate);

  // Appreciate ~85% of user names.
  // In traditional Ethiopian & Biblical culture, a person's given name carries ancestral blessing.
  // Deterministic calculation: 85% of values receive positive affirmation (>= 85% harmony score).
  const hashVal = (charCodeSum * 31 + (birthDestiny || 7) * 17) % 100;
  const isAppreciated = hashVal < 88; // 88% of names receive high appreciation
  const harmonyScore = isAppreciated ? 85 + (hashVal % 14) : 72 + (hashVal % 12);

  const headline = isAppreciated
    ? `✨ የክብር ምስጋና • Your Given Name "${givenName}" Holds High Sacred Harmony (${harmonyScore}%)`
    : `🌿 Name Vibration Overview for "${givenName}" (${harmonyScore}% Harmony)`;

  const recommendation = isAppreciated
    ? `የተመዘገበውን ስም እንዲጠቀሙ ይመከራል (Strongly Recommended to Keep Your Current Name As Is)`
    : `Your current name is serviceable; alternative suggestions below may offer refined elemental balance.`;

  const reasoning = isAppreciated
    ? `According to Ethiopian humoral calculations, AwudeNegest circles, and Biblical numerology, your registered name "${nameToEval}" carries a deeply grounded vibration (Destiny ${destinyNum}, ${nameElement.toUpperCase()} element). It connects harmoniously with your birth coordinates. Traditional elders and sacred naming principles advise keeping and cherishing this foundational blessing. You do not need to change your name! Any alternative name below is offered purely as an honorary, baptismal, or secondary dedication.`
    : `Your registered name "${nameToEval}" vibrates with Destiny ${destinyNum}. If you feel called toward a new life chapter, baptismal renewal, or dedicated business purpose, exploring the complementary names below can bring enhanced harmony.`;

  return {
    currentName: nameToEval,
    isAppreciated,
    harmonyScore,
    headline,
    recommendation,
    reasoning,
    destinyNumber: destinyNum,
    primaryElement: nameElement,
  };
}

function buildProfileRecommendation(
  criteria: SuggestionCriteria,
  elem: HumoralElement,
  name: string,
  reason?: SuggestionReason
): string {
  const profileBase = criteria.fullName || "this client";
  const date = criteria.birthDate || "your birth date";
  const city = criteria.city || "your Ethiopian location";

  const profileMap: Record<HumoralElement, string> = {
    may: "cooling water (may) balance, fostering emotional calm, deep restoration, and restorative hydration.",
    afere: "grounded earth (afere) stability, strengthening endurance, structural focus, and sustainable daily roots.",
    esat: "energizing fire (esat) vitality, invigorating leadership, metabolic warmth, and decisive momentum.",
    nifas: "breathable air (nifas) lightness, stimulating eloquence, creative flow, and uplifting social harmony.",
  };

  const reasonMap: Record<SuggestionReason, string> = {
    new_baby: "Bestowed as a foundational blessing for health, joyful growth, and divine protection.",
    spiritual_rebirth: "Chosen as a sacred baptismal anchor for holy dedication, communion, and spiritual renewal.",
    business: "Applied for prosperity, upright leadership, commercial favor, and enduring enterprise.",
    personal_empowerment: "Invoked for courageous confidence, overcoming adversity, and inner vitality.",
    marriage: "Shared as a harmonious covenant of reciprocal peace, loyalty, and joyful union.",
    healing_balance: "Employed for psychosomatic cooling, cellular restoration, and tranquility.",
    general_alignment: "Selected for general humoral alignment with your birth coordinates.",
  };

  const reasonNote = reason ? ` Target focus: ${reasonMap[reason]}` : "";
  return `For ${profileBase}, born ${date} in ${city}, "${name}" harmonizes with ${elem.toUpperCase()} humoral rhythm (${profileMap[elem]}).${reasonNote}`;
}

export function suggestAlternativeNames(criteria: SuggestionCriteria): NameSuggestionResult[] {
  const targetDestinyNumber = criteria.targetDestinyNumber ?? destinyFromBirthDate(criteria.birthDate);
  const astroElement = getZodiacElementFromDate(criteria.birthDate);
  const effectiveTargetElement = criteria.targetElement || astroElement;

  let pool = [...ETHIOPIAN_NAMES_DATABASE];

  if (criteria.gender && criteria.gender !== "unisex") {
    pool = pool.filter((item) => item.gender === criteria.gender || item.gender === "unisex");
  }

  if (criteria.languagePreference && criteria.languagePreference !== "Biblical") {
    pool = pool.filter((item) => item.language === criteria.languagePreference);
  }

  const filteredPool = pool.length ? pool : [...ETHIOPIAN_NAMES_DATABASE];

  const elementalAffinity: Record<string, HumoralElement> = {
    Abebe: "esat",
    Bona: "esat",
    Haile: "esat",
    Caala: "esat",
    Berhane: "esat",
    Bekele: "afere",
    Obsa: "afere",
    Taye: "afere",
    Semere: "afere",
    Gebre_Meskel: "afere",
    Chaltu: "nifas",
    Dawit: "nifas",
    Hawi: "nifas",
    Genet: "nifas",
    Tariku: "nifas",
    Tigist: "may",
    Mulugeta: "may",
    Selam: "may",
    Luwam: "may",
    Wolde_Mariam: "may",
    Almaz: "may",
    Tekle_Haymanot: "may",
  };

  const results: Array<NameSuggestionResult & { score: number }> = [];
  const seen = new Set<string>();
  const maxSuggestions = 1000;

  // Reason bonus calculator
  const calculateReasonBonus = (name: string, meaning: string, elem: HumoralElement): number => {
    if (!criteria.reason) return 0;
    const lowerMeaning = meaning.toLowerCase();
    switch (criteria.reason) {
      case "new_baby":
        if (/joy|child|blossom|grace|favor|protect|peace|birth/i.test(lowerMeaning)) return 15;
        break;
      case "spiritual_rebirth":
        if (/god|yahweh|salvation|cross|holy|prophet|faith|heavens/i.test(lowerMeaning)) return 18;
        break;
      case "business":
        if (/increase|add|flourish|light|wealth|king|ruler|foundation/i.test(lowerMeaning) || elem === "afere" || elem === "esat") return 15;
        break;
      case "personal_empowerment":
        if (/warrior|strength|rock|victory|mighty|conquer|courage/i.test(lowerMeaning) || elem === "esat") return 16;
        break;
      case "marriage":
        if (/friend|beloved|peace|delight|harmony|loyalty/i.test(lowerMeaning) || elem === "may" || elem === "nifas") return 15;
        break;
      case "healing_balance":
        if (/heal|cooling|grace|rest|gentle|restore|peace/i.test(lowerMeaning) || elem === "may" || elem === "afere") return 16;
        break;
      case "general_alignment":
        return 5;
    }
    return 0;
  };

  // 1. First add curated Biblical & Christian names
  for (const candidate of CURATED_NAME_CANDIDATES) {
    if (criteria.gender && candidate.gender !== criteria.gender && candidate.gender !== "unisex") continue;
    if (criteria.languagePreference && criteria.languagePreference !== "Biblical" && candidate.language !== criteria.languagePreference) continue;

    const destinyMatch = targetDestinyNumber && candidate.destinyNumber === targetDestinyNumber ? 30 : 0;
    const genderMatch = criteria.gender ? (candidate.gender === criteria.gender || candidate.gender === "unisex" ? 15 : 0) : 8;
    const languageMatch = criteria.languagePreference ? (criteria.languagePreference === "Biblical" || candidate.language === criteria.languagePreference ? 15 : 0) : 8;
    const meaningAlignment = effectiveTargetElement && candidate.element === effectiveTargetElement ? 25 : effectiveTargetElement ? 5 : 15;
    const astroBonus = astroElement && candidate.element === astroElement ? 10 : 0;
    const reasonBonus = calculateReasonBonus(candidate.name, candidate.meaning, candidate.element);

    const score = destinyMatch + genderMatch + languageMatch + meaningAlignment + astroBonus + reasonBonus;

    seen.add(candidate.name.toLowerCase());
    results.push({
      suggestedName: candidate.name,
      geezFidel: candidate.geezFidel || "",
      language: candidate.language,
      meaning: candidate.meaning,
      sourceTradition: candidate.sourceTradition,
      score,
      scoreBreakdown: { destinyMatch, genderMatch, languageMatch, meaningAlignment },
      primaryElement: candidate.element,
      destinyNumber: candidate.destinyNumber,
      alignmentReason: `Rooted in the ${candidate.sourceTradition} tradition (${candidate.language}). Numerologically vibrates to Destiny ${candidate.destinyNumber} with ${candidate.element.toUpperCase()} elemental alignment.`,
      wellbeingHarmonizationBenefit: `Infuses ${candidate.element.toUpperCase()} harmony; cultural definition: "${candidate.meaning}".`,
      recommendation: buildProfileRecommendation(criteria, candidate.element, candidate.name, criteria.reason),
    });
  }

  // 2. Add canonical Ethiopian names database
  for (const item of filteredPool) {
    if (seen.has(item.name.toLowerCase())) continue;

    const key = item.name.replace(/\s+/g, "_");
    const elem: HumoralElement = elementalAffinity[key] || (item.numerologicalValues.destiny % 2 === 0 ? "may" : "esat");

    const destinyMatch = targetDestinyNumber && item.numerologicalValues.destiny === targetDestinyNumber ? 30 : 0;
    const genderMatch = criteria.gender && (item.gender === criteria.gender || item.gender === "unisex") ? 15 : criteria.gender ? 0 : 8;
    const languageMatch = criteria.languagePreference && item.language === criteria.languagePreference ? 15 : criteria.languagePreference ? 0 : 8;
    const meaningAlignment = effectiveTargetElement && elem === effectiveTargetElement ? 25 : effectiveTargetElement ? 5 : 15;
    const astroBonus = astroElement && elem === astroElement ? 10 : 0;
    const reasonBonus = calculateReasonBonus(item.name, item.meaning, elem);

    const score = destinyMatch + genderMatch + languageMatch + meaningAlignment + astroBonus + reasonBonus;

    let benefit = "";
    if (elem === "may") {
      benefit = "Infuses cooling hydration, emotional peace, and mucosal soothing; ideal for calming excess metabolic heat or gastric burning.";
    } else if (elem === "afere") {
      benefit = "Provides structural grounding, skeletal bone stability, and circadian endurance; counteracts restless anxiety and scattered focus.";
    } else if (elem === "esat") {
      benefit = "Ignites metabolic fire, cardiovascular vitality, and decisive leadership; overcomes sluggish lethargy and low stamina.";
    } else {
      benefit = "Stimulates cognitive lightness, vocal eloquence, and respiratory freedom; overcomes heavy stagnation and emotional withholding.";
    }

    seen.add(item.name.toLowerCase());
    results.push({
      suggestedName: item.name,
      geezFidel: item.geezFidel || "",
      language: item.language,
      meaning: item.meaning,
      sourceTradition: "Ethiopian",
      score,
      scoreBreakdown: { destinyMatch, genderMatch, languageMatch, meaningAlignment },
      primaryElement: elem,
      destinyNumber: item.numerologicalValues.destiny,
      alignmentReason: `Harmonizes with ${elem.toUpperCase()} humoral balancing, fostering a Destiny ${item.numerologicalValues.destiny} vibration of '${item.wellbeingIdentityCorrelation.balancingVirtue}'.`,
      wellbeingHarmonizationBenefit: benefit,
      recommendation: buildProfileRecommendation(criteria, elem, item.name, criteria.reason),
    });
  }

  // 3. User-provided comprehensive Christian name catalog
  if (!criteria.languagePreference || criteria.languagePreference === "Biblical") {
    for (const record of CHRISTIAN_NAME_CATALOG) {
      if (results.length >= maxSuggestions) break;
      const key = record.name.toLowerCase();
      if (seen.has(key)) continue;

      const characterTotal = [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const destinyNumber = reduceNumber(characterTotal);
      const elem: HumoralElement = (["may", "afere", "esat", "nifas"][destinyNumber % 4] as HumoralElement);

      const destinyMatch = targetDestinyNumber === destinyNumber ? 30 : 0;
      const meaningAlignment = effectiveTargetElement === elem ? 25 : effectiveTargetElement ? 5 : 15;
      const astroBonus = astroElement && elem === astroElement ? 10 : 0;
      const reasonBonus = calculateReasonBonus(record.name, record.meaning, elem);
      const score = destinyMatch + 12 + meaningAlignment + astroBonus + reasonBonus;

      seen.add(key);
      results.push({
        suggestedName: record.name,
        geezFidel: "",
        language: "Biblical",
        meaning: record.meaning,
        sourceTradition: "Biblical",
        score,
        scoreBreakdown: { destinyMatch, genderMatch: 8, languageMatch: 8, meaningAlignment },
        primaryElement: elem,
        destinyNumber,
        alignmentReason: `Biblical scriptural meaning matched to ${elem.toUpperCase()} element and Destiny ${destinyNumber} vibration.`,
        wellbeingHarmonizationBenefit: `Sacred scriptural meaning: "${record.meaning}".`,
        recommendation: buildProfileRecommendation(criteria, elem, record.name, criteria.reason),
      });
    }
  }

  return results.sort((a, b) => (b.score || 0) - (a.score || 0) || a.suggestedName.localeCompare(b.suggestedName)).slice(0, maxSuggestions);
}

export function suggestAlternativeNamesWithAppreciation(criteria: SuggestionCriteria): {
  suggestions: NameSuggestionResult[];
  appreciation: NameAppreciation;
} {
  const suggestions = suggestAlternativeNames(criteria);
  const appreciation = evaluateExistingName(criteria.fullName, criteria.birthDate, criteria.targetElement);
  return { suggestions, appreciation };
}
