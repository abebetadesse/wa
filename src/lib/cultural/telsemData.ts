/**
 * Complete Ethiopian Telsem (ጠልሰም) Sacred Talismanic Repository
 * 
 * Incorporates authentic historical talismanic seals, geometric diagrams,
 * and prayer formulas preserved in classical Ethiopian parchment scrolls (የብራና ክታብ),
 * Mets'hafe Asmat (መጽሐፈ አስማት.pdf), and Awde Negest (አውደ ነገሥት).
 *
 * Domain B Cultural Heritage Reference: Historical, artistic, and reflective preservation.
 */

export type TelsemCategory =
  | "protection"   // ጥበቃ ወማዕሠር
  | "healing"      // ፈውስ ወመፍትሔ
  | "archangels"   // ድርሳነ ሊቃነ መላእክት
  | "abundance"    // ሀብት ወገበያ
  | "wisdom"       // ትምህርት ወክስተተ ንባብ
  | "harmony";     // መስተፋቅር ወዕርቅ

export interface TelsemSeal {
  id: string;
  nameGe: string;
  nameAm: string;
  nameEn: string;
  category: TelsemCategory;
  categoryLabelAm: string;
  categoryLabelEn: string;
  sourceManuscript: string;
  sourcePage?: number;
  sourceImage?: string;       // Extracted high-res historical plate from manuscript
  manuscriptPageImage?: string; // Full manuscript page scan
  sacredGeometryDescription: string;
  spiritualMeaning: string;
  traditionalFormulaGe: string;
  traditionalFormulaEn: string;
  ritualMaterials: string[];
  associatedArchetypeNumber: number; // Links to TALISMANIC_CHARACTERS (1 to 12)
  associatedArchetypeName: string;
  awdeCircleMatch?: number;          // Links to AWDE_NEGEST_CIRCLES (1 to 16)
  vectorGeometryType:
    | "protective_cross_shield"
    | "dual_binding_grid"
    | "master_exorcism_matrix"
    | "radiating_banishment_mahteb"
    | "sador_cross_eye_shield"
    | "panoramic_crown_eyes"
    | "michael_solar_blade"
    | "gabriel_annunciation_squares"
    | "raphael_healing_star"
    | "raguel_solar_fortress"
    | "uriel_flaming_chalice"
    | "phanuel_fiery_wheel"
    | "all_seeing_diamond_eyes"
    | "solomon_octagram"
    | "solomon_net_lattice"
    | "winged_cherub"
    | "meskel_endless_knot"
    | "four_living_creatures"
    | "scholars_illuminated_scroll"
    | "concentric_harmony_rings"
    | "cornucopia_vessel"
    | "uncoiling_release_spiral";
  culturalDisclaimer: string;
}

export const ETHIOPIAN_TELSEM_COLLECTION: TelsemSeal[] = [
  // ─── 1. Primary Manuscript Seals from መጽሐፈ አስማት ────────────────
  {
    id: "telsem-medfe-memelesha",
    nameGe: "ጠልሰመ መፍትሔ መድፌ ወጊ",
    nameAm: "የመድፌ ወጊና የተንኮል መመለሻ ጠልሰም",
    nameEn: "Seal for Reversing Piercing Ills & Malice",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወመከታ",
    categoryLabelEn: "Spiritual Protection",
    sourceManuscript: "መጽሐፈ አስማት (Mets'hafe Asmat)",
    sourcePage: 5,
    sourceImage: "/telsem/telsem_p5_1.png",
    manuscriptPageImage: "/telsem/pages/asmat_page_5.png",
    sacredGeometryDescription: "Braided cruciform shield with four diagonal anchor nodes, inscribed directly underneath Psalm 1 (ብፁዕ ብእሲ), designed to deflect occult piercing needles and subtle hostility.",
    spiritualMeaning: "In traditional debtera iconography, this seal represents the tree planted by rivers of water that cannot wither. It mirrors psychic intrusion back into equilibrium.",
    traditionalFormulaGe: "ብፁዕ ብእሲ ዘኢሖረ በምክረ ረሲዓን... በኃይለ ዝንቱ ቃለ ዳዊት አድህነኒ አምላክየ እምፀር ቀታሊ ሊተ ለገብርክ እገሌ።",
    traditionalFormulaEn: "Blessed is the one who walks not in the counsel of the wicked... By the power of this Davidic psalm, deliver me from destructive adversaries.",
    ritualMaterials: ["Parchment (ብራና)", "Red and black iron-gall ink (ቀይና ጥቁር ቀለም)", "Frankincense (ዕጣን)"],
    associatedArchetypeNumber: 3,
    associatedArchetypeName: "The Warrior Defender",
    awdeCircleMatch: 3,
    vectorGeometryType: "protective_cross_shield",
    culturalDisclaimer: "Domain B historical manuscript art. Preserved for educational and reflective cultural study; never replaces licensed safety or healthcare.",
  },
  {
    id: "telsem-maesere-aganint-1",
    nameGe: "ጠልሰመ ማዕሠረ አጋንንት ዘመሸምሸሞ",
    nameAm: "የአጋንንት ማሠሪያ ጠልሰም",
    nameEn: "Talisman of Spirit Binding & Revelation",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወማዕሠር",
    categoryLabelEn: "Boundary Sealing",
    sourceManuscript: "መጽሐፈ አስማት (Mets'hafe Asmat)",
    sourcePage: 6,
    sourceImage: "/telsem/telsem_p6_1.png",
    manuscriptPageImage: "/telsem/pages/asmat_page_6.png",
    sacredGeometryDescription: "Orthogonal dual grid with 8 perimeter guardian nodes and interlocking quadrants constructed to bind spirits of discord and unveil hidden malice.",
    spiritualMeaning: "Embodies the debtera doctrine of spiritual containment: disorienting negative energies by trapping them in non-linear geometric mazes so the human soul remains unburdened.",
    traditionalFormulaGe: "በዝንቱ አስማቲከ ያተመሹር ያያመክመቹር ለቅልም ሐቅስም... በዋህድ ተዋህድ ተአሰር አንተ ባርያ ዘሸምሸሞ... አድህን እምጋኔን ሊተ ለገብርክ።",
    traditionalFormulaEn: "By these sacred words be bound into single unity, spirit of discord... deliver your servant from shadow oppression.",
    ritualMaterials: ["Pure parchment or paper", "Sulfur powder (ድኝ) for symbolic fumigation", "Iron-gall ink"],
    associatedArchetypeNumber: 7,
    associatedArchetypeName: "The Hermit Sage",
    awdeCircleMatch: 7,
    vectorGeometryType: "dual_binding_grid",
    culturalDisclaimer: "Historical esoteric text. Not intended for self-treatment or superstitious fear.",
  },
  {
    id: "telsem-mesteme-aganint-master",
    nameGe: "ጠልሰመ ማዕሠሮሙ ለሠይጣናት ወመስተአግዝ",
    nameAm: "የአጋንንት ማውገዣና መግቻ ታላቁ ጠልሰም",
    nameEn: "The Master Subduing & Exorcism Matrix",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወማዕሠር",
    categoryLabelEn: "Supreme Guarding",
    sourceManuscript: "መጽሐፈ አስማት (Mets'hafe Asmat)",
    sourcePage: 11,
    sourceImage: "/telsem/telsem_p11_1.png",
    manuscriptPageImage: "/telsem/pages/asmat_page_11.png",
    sacredGeometryDescription: "An expansive rectangular talismanic matrix featuring multiple sacred containment cells, dual angelic guardian eyes, and a linear sealing bar across its zenith.",
    spiritualMeaning: "Regarded as the master talisman of Mets'hafe Asmat for subduing night terrors, ancestral distress, and heavy melancholia.",
    traditionalFormulaGe: "በስመ አብ ወወልድ ወመንፈስ ቅዱስ ፩ አምላክ አሜን ማዕሠሮሙ ለሠይጣናት ወመስተአግዝ ወመስጥም... በስመ ሀዩም ቀዩም ቅዱስ በዘ አስማት አሠሮሙ አጋንንት ፀዋጋን።",
    traditionalFormulaEn: "In the name of the Father, Son, and Holy Spirit: the binding of shadows and subduing of spiritual afflictions through the Holy and Ever-Living Name.",
    ritualMaterials: ["Goat-hide vellum (የፍየል ብራና)", "Cinnabar red ink (ቀይ ቀለም)", "Kosheshla root powder (የኮሸሽላ ስር)"],
    associatedArchetypeNumber: 1,
    associatedArchetypeName: "The Sovereign",
    awdeCircleMatch: 1,
    vectorGeometryType: "master_exorcism_matrix",
    culturalDisclaimer: "Preserved as historical ethnographic liturgy. Seek licensed mental health support for psychological distress.",
  },
  {
    id: "telsem-aganint-mawereja",
    nameGe: "ጠልሰመ ማውገዣ ወማዕሠረ አጋንንት",
    nameAm: "የአጋንንት ማሠሪያ እና ማውገዣ ጠልሰም",
    nameEn: "Complete Banishment Amulet & Neck Mahteb",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወማዕሠር",
    categoryLabelEn: "Protective Amulet",
    sourceManuscript: "መጽሐፈ አስማት (Mets'hafe Asmat)",
    sourcePage: 13,
    sourceImage: "/telsem/telsem_p13_1.png",
    manuscriptPageImage: "/telsem/pages/asmat_page_13.png",
    sacredGeometryDescription: "A tall, multi-tiered talismanic stele with paired geometric eyes, a central lattice spine, and radiating boundary rays creating an impenetrable aura.",
    spiritualMeaning: "Designed to be worn as an amulet case around the neck (እንደ ማህተብ). Its presence reminds the seeker of their divine protection.",
    traditionalFormulaGe: "የአጋንንት ማሠሪያ እና ማውገዣ ጠልሰም፤ አሰራሩ ይህን በንፁህ ወረቀት በኤፍራን ቀለም ፅፈህ የልግጣ ፯ ፍሬ ጨምረህ ጽሑፉን ደግመህ በአንገትህ እንደ ማህተብ አድርገው።",
    traditionalFormulaEn: "Talisman for binding and banishing discord: written on pure parchment with saffron ink, accompanied by 7 seeds, and worn at the neck as a shield.",
    ritualMaterials: ["Clean white parchment", "Saffron/Ephran ink (ኤፍራን ቀለም)", "7 Ligta seeds (የልግጣ ፯ ፍሬ)"],
    associatedArchetypeNumber: 5,
    associatedArchetypeName: "The High Priest",
    awdeCircleMatch: 5,
    vectorGeometryType: "radiating_banishment_mahteb",
    culturalDisclaimer: "Ethno-spiritual artifact description. Non-clinical.",
  },
  {
    id: "telsem-buda-ayne-tila",
    nameGe: "ጠልሰመ መስጥመ ቡዳ ወአይነ ጥላ (ሳዶር አላዶር)",
    nameAm: "የቡዳና የአይነ ጥላ መፍትሔ ጠልሰም",
    nameEn: "The Sador Alador Evil Eye & Buda Neutralizer",
    category: "healing",
    categoryLabelAm: "ፈውስ ወመፍትሔ",
    categoryLabelEn: "Spiritual Healing",
    sourceManuscript: "መጽሐፈ አስማት (Mets'hafe Asmat)",
    sourcePage: 16,
    sourceImage: "/telsem/telsem_p16_1.png",
    manuscriptPageImage: "/telsem/pages/asmat_page_16.png",
    sacredGeometryDescription: "The sacred cruciform pentagram invoking the 5 wounds of Christ (ሳዶር፣ አላዶር፣ ዳናት፣ አዴራ፣ ሮዳስ) framed by concentric radiating eyes to break the evil eye (ዓይነ ሰብእ).",
    spiritualMeaning: "The classical remedy for 'shadow eye' (ዓይነ ጥላ) — feelings of sudden exhaustion, panic when looking into crowds, or persistent dread.",
    traditionalFormulaGe: "በስመ አብ ወወልድ ወመንፈስ ቅዱስ ፩ አምላክ ጸሎት በእንተ መስጥመ ቡዳ... ሳዶር አላዶር ዳናት አዴራ ሮዳስ አማኑኤል ብርስባሔል... አድህነኒ እምማዕሠረ ሰይጣን።",
    traditionalFormulaEn: "In the name of the Trinity, prayer against the ocular affliction... Sador, Alador, Danat, Adera, Rodas, Emmanuel: deliver me from the snares of discord.",
    ritualMaterials: ["White garlic (ነጭ ሽንኩርት)", "Tena Adam (ጤና አዳም)", "Hareg Resa (ያረግሬሳ)", "Lemon (ሎሚ)", "Embuay leaf"],
    associatedArchetypeNumber: 8,
    associatedArchetypeName: "The Renovator",
    awdeCircleMatch: 8,
    vectorGeometryType: "sador_cross_eye_shield",
    culturalDisclaimer: "Do not inhale dangerous fumes or substitute botanical rituals for licensed medical diagnosis.",
  },
  {
    id: "telsem-aqabe-rees",
    nameGe: "ጠልሰመ አቃቤ ርዕስ ወዘውደ ጥበቃ",
    nameAm: "የአቃቤ ርዕስ ጠልሰም",
    nameEn: "Guardian of the Crown & Cognitive Sanctuary",
    category: "healing",
    categoryLabelAm: "ፈውስ ወመፍትሔ",
    categoryLabelEn: "Mental Clarity & Peace",
    sourceManuscript: "መጽሐፈ አስማት (Mets'hafe Asmat)",
    sourcePage: 17,
    sourceImage: "/telsem/telsem_p17_1.png",
    manuscriptPageImage: "/telsem/pages/asmat_page_17.png",
    sacredGeometryDescription: "Horizontal panoramic band of nine protective guardian eyes and protective nodes designed to crown the forehead and shield cognitive faculties from nightmares.",
    spiritualMeaning: "Dedicated to individuals burdened with migraine-like psychic fatigue, intrusive rumination, and troubled dreams. Guards the gate of the mind.",
    traditionalFormulaGe: "በስመ አብ ወወልድ ወመንፈስ ቅዱስ ፩ አምላክ ጸሎት በእንተ አቃቤ ርዕስ ቂጁን መቂጁን መጁን መጅመጁን... አጥናዮስ ጰፐርኤል... አድህነኒ ወተአቅበኒ እምኩል እርኩሳን አጋንንት ወእኩያነ ሰብእ።",
    traditionalFormulaEn: "Prayer for the Guardian of the Crown: by these secret holy names, preserve my mind and shield me from every distressing thought and malevolence.",
    ritualMaterials: ["Lishalish seeds (የሊሻሊሽ ፍሬ)", "Sewn leather amulet pouch (ቆዳ ክታብ)", "Morning water blessing"],
    associatedArchetypeNumber: 10,
    associatedArchetypeName: "The Visionary",
    awdeCircleMatch: 10,
    vectorGeometryType: "panoramic_crown_eyes",
    culturalDisclaimer: "Neurological, psychiatric, or physical symptoms must be evaluated by licensed medical doctors.",
  },

  // ─── 2. The 7 Archangels of Dirsan be-Gebir (Pages 23-24) ────────
  {
    id: "telsem-dirsan-mikael",
    nameGe: "ጠልሰመ ድርሳነ ሚካኤል ሊቀ መላእክት",
    nameAm: "የቅዱስ ሚካኤል ድርሳን ጠልሰም",
    nameEn: "Archangel Michael's Seal of Nobility & Triumph",
    category: "archangels",
    categoryLabelAm: "ድርሳነ ሊቃነ መላእክት",
    categoryLabelEn: "Archangelic Order",
    sourceManuscript: "መጽሐፈ አስማት (Page 23) & Gondar Royal Scrolls",
    sacredGeometryDescription: "Archangel holding the blazing sword of justice with outstretched wings bordered by 12 solar rays and golden interlaced crosses.",
    spiritualMeaning: "Invoked for moral courage, stepping into leadership without fear, and standing upright amidst community disputes.",
    traditionalFormulaGe: "ለድርሳነ ሚካኤል ዕፀ ፀሐይን በእሑድ ሌሊት ቆርጠህ በማር ለውሰህ ድርሳኑን ደግመህ ብላ በሰው ዘንድ ልዕልናን ታገኛለህ።",
    traditionalFormulaEn: "Through Saint Michael's intercession and sacred Sunday morning meditation, you receive honor, moral fortitude, and high standing among peers.",
    ritualMaterials: ["Pure wild honey (ማር)", "Morning sun prayer (የፀሐይ ጸሎት)", "White candle"],
    associatedArchetypeNumber: 1,
    associatedArchetypeName: "The Sovereign",
    awdeCircleMatch: 1,
    vectorGeometryType: "michael_solar_blade",
    culturalDisclaimer: "Spiritual practice for self-reflection and confidence.",
  },
  {
    id: "telsem-dirsan-gabriel",
    nameGe: "ጠልሰመ ድርሳነ ገብርኤል አብሳሪ",
    nameAm: "የቅዱስ ገብርኤል ድርሳን ጠልሰም",
    nameEn: "Archangel Gabriel's Seal of Joyous News & Harmony",
    category: "archangels",
    categoryLabelAm: "ድርሳነ ሊቃነ መላእክት",
    categoryLabelEn: "Archangelic Order",
    sourceManuscript: "መጽሐፈ አስማት (Page 23)",
    sacredGeometryDescription: "Twin intermeshed protective squares enclosing the horn of joyous tidings and the floral blossom of new beginnings.",
    spiritualMeaning: "Guards relationships, marital peace, and the welcoming of children. Promotes kindness and removes chronic bitterness between partners.",
    traditionalFormulaGe: "ለድርሳነ ገብርኤል የአሜራ ስር ከርቤ ጥንጁት ከድርሳኑ ጋር ደግመህ አብረህ ሰፍተህ ያዝ ትዳርህን ይባርክልሃል፤ ያልወለደች መካንም ብትማፀነው ትወልዳለች።",
    traditionalFormulaEn: "Through Saint Gabriel's blessing: brings warmth to home and marriage, dissolving estrangement and heralding glad tidings.",
    ritualMaterials: ["Myrrh (ከርቤ)", "Tenjut leaves (ጥንጁት)", "Olive oil"],
    associatedArchetypeNumber: 2,
    associatedArchetypeName: "The Peacemaker",
    awdeCircleMatch: 2,
    vectorGeometryType: "gabriel_annunciation_squares",
    culturalDisclaimer: "Cultural spiritual prayer; for reproductive health seek obstetric/medical care.",
  },
  {
    id: "telsem-dirsan-rufael",
    nameGe: "ጠልሰመ ድርሳነ ሩፋኤል ፈዋሽ",
    nameAm: "የቅዱስ ሩፋኤል ድርሳን ጠልሰም",
    nameEn: "Archangel Raphael's Seal of Restoration & Intellect",
    category: "archangels",
    categoryLabelAm: "ድርሳነ ሊቃነ መላእክት",
    categoryLabelEn: "Archangelic Order",
    sourceManuscript: "መጽሐፈ አስማት (Page 23)",
    sacredGeometryDescription: "The healing four-pointed star of peace crowned with cherubic eyes and the flowing vessels of rejuvenating water.",
    spiritualMeaning: "Preserves travellers, restores convalescents to strength, and opens the intellectual receptivity of children and learners.",
    traditionalFormulaGe: "ለድርሳነ ሩፋኤል የልመጭ ተቀጽላ ይዘህ ድርሳኑን ድገም ደዌህም ይፈወሳል ልጅህም ትምህርት ይገለጽለታል።",
    traditionalFormulaEn: "Through Saint Raphael: sickness is dispelled, clarity is bestowed upon studies, and weary spirits find gentle solace.",
    ritualMaterials: ["Lemeche sprig (ልመጭ)", "Clean mountain water or Tsabel (ጸበል)", "Rue"],
    associatedArchetypeNumber: 4,
    associatedArchetypeName: "The Scribe & Healer",
    awdeCircleMatch: 4,
    vectorGeometryType: "raphael_healing_star",
    culturalDisclaimer: "Traditional healing prayer; never discontinue clinical treatment.",
  },
  {
    id: "telsem-dirsan-raguel",
    nameGe: "ጠልሰመ ድርሳነ ራጉኤል ብርሃነ ሰማይ",
    nameAm: "የቅዱስ ራጉኤል ድርሳን ጠልሰም",
    nameEn: "Archangel Raguel's Seal of Abundance & Radiance",
    category: "archangels",
    categoryLabelAm: "ድርሳነ ሊቃነ መላእክት",
    categoryLabelEn: "Archangelic Order",
    sourceManuscript: "መጽሐፈ አስማት (Page 23-24)",
    sacredGeometryDescription: "Solar disc enclosed within an octagonal fortress, radiating beams of grain, light, and royal presence.",
    spiritualMeaning: "Draws sustained abundance, agricultural favor, ethical trade success, and a dignified aura that wins favor from elders.",
    traditionalFormulaGe: "ለድርሳነ ራጉኤል የዱባ ፍሬ ቆልተህ ወቅጠህ ድርሳኑን ደግመህ... ሀብት ሲሳይ ይመራልሃል እህልም ይበረክትልሃል ግርማ ሞገስንም ያለብስሃል።",
    traditionalFormulaEn: "Through Saint Raguel's invocation: livelihood is guided to your doorway, harvest is blessed, and radiant grace clothes your presence.",
    ritualMaterials: ["Pumpkin seed essence (የዱባ ፍሬ)", "Clean spring barley", "Amber incense"],
    associatedArchetypeNumber: 10,
    associatedArchetypeName: "The Visionary",
    awdeCircleMatch: 10,
    vectorGeometryType: "raguel_solar_fortress",
    culturalDisclaimer: "Reflective cultural contemplation.",
  },
  {
    id: "telsem-dirsan-urael",
    nameGe: "ጠልሰመ ድርሳነ ዑራኤል እሳተ መለኮት",
    nameAm: "የቅዱስ ዑራኤል ድርሳን ጠልሰም",
    nameEn: "Archangel Uriel's Seal of Divine Wisdom & Eloquence",
    category: "archangels",
    categoryLabelAm: "ድርሳነ ሊቃነ መላእክት",
    categoryLabelEn: "Archangelic Order",
    sourceManuscript: "መጽሐፈ አስማት (Page 24)",
    sacredGeometryDescription: "The chalice of heavenly knowledge filled with divine fire, encircled by blooming petals of the mystical rose (ጽጌረዳ) and radiant rays.",
    spiritualMeaning: "Enkindles deep eloquence, inner beauty, intellectual breakthrough, and creative inspiration in speech and art.",
    traditionalFormulaGe: "ለድርሳነ ዑራኤል የጽጌረዳ አበባ የቀጠጥና አበባ ሰብስበህ ድርሳኑን ደግመህ በሜሮን አርገህ ተቀባ ውበትን ያላብስሃል ሳቢነትም ጭምር።",
    traditionalFormulaEn: "Through Saint Uriel: inner beauty and spiritual charisma shine through your countenance, granting clarity and magnetic eloquence.",
    ritualMaterials: ["Rose petals (ጽጌረዳ አበባ)", "Qetetna blossom (ቀጠጥና)", "Anointing olive oil"],
    associatedArchetypeNumber: 11,
    associatedArchetypeName: "The Bridge-Builder",
    awdeCircleMatch: 11,
    vectorGeometryType: "uriel_flaming_chalice",
    culturalDisclaimer: "Reflective aesthetic tradition.",
  },
  {
    id: "telsem-dirsan-saqwael",
    nameGe: "ጠልሰመ ድርሳነ ሳቁኤል ወፈኑኤል",
    nameAm: "የቅዱስ ሳቁኤልና ፈኑኤል ድርሳን ጠልሰም",
    nameEn: "Archangels Saqwael & Phanuel's Breaker of Obstacles",
    category: "archangels",
    categoryLabelAm: "ድርሳነ ሊቃነ መላእክት",
    categoryLabelEn: "Archangelic Order",
    sourceManuscript: "መጽሐፈ አስማት (Page 24)",
    sacredGeometryDescription: "The fiery rotating wheel and sword of Phanuel scattering shadowed entities and cleaving open blocked pathways.",
    spiritualMeaning: "Dissolves stubborn deadlocks, breaks through prolonged periods of career or life stagnation, and disperses envious adversaries.",
    traditionalFormulaGe: "ለድርሳነ ሳቁኤል ዝንጅብል ቁንዶ በርበሬ ነጭ ሽንኩርት አድርገህ ድርሳኑን ደግመህ ብላ መሰናክልህን ገርጋሪህን ይመታልሃል ችግርህን ያስወግድልሃል።",
    traditionalFormulaEn: "Through Saint Saqwael and Phanuel: obstacles in your path are cleared away, stubborn resistance is dissolved, and your way is reopened.",
    ritualMaterials: ["Ginger (ዝንጅብል)", "Black pepper (ቁንዶ በርበሬ)", "Garlic (ነጭ ሽንኩርት)"],
    associatedArchetypeNumber: 12,
    associatedArchetypeName: "The Mystic Navigator",
    awdeCircleMatch: 12,
    vectorGeometryType: "phanuel_fiery_wheel",
    culturalDisclaimer: "Non-prescriptive ethno-medicinal reference.",
  },

  // ─── 3. Classical Ethiopian Scroll Geometries (የብራና ክታብ ቅርጾች) ─
  {
    id: "telsem-aynet-protective-eyes",
    nameGe: "ጠልሰመ አዕይንተ ኂሩት (ዓይነት)",
    nameAm: "የዓይነ ጥላና የዓይን ጠልሰም (ዓይነት)",
    nameEn: "The All-Seeing Guardian Eyes of Metatron",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወመከታ",
    categoryLabelEn: "Ocular Talisman",
    sourceManuscript: "Classical Parchment Scrolls (የብራና ክታብ - IES / British Library Collection)",
    sacredGeometryDescription: "Two large diamond-shaped angelic eyes with checkerboard pupil framing and an interlocking knotwork border, confronting and neutralizing hostile gazes.",
    spiritualMeaning: "The quintessential motif of Ethiopian talismanic art. Placed at the head of parchment scrolls to instantly deflect the 'evil eye' (ዓይነ ሰብእ).",
    traditionalFormulaGe: "በስመ አብ ወወልድ ወመንፈስ ቅዱስ ፩ አምላክ፤ ኦ አዕይንተ ምሕረትከ አብርህ ላዕሌየ፤ በከመ አድኃንኮሙ ለዳዊት ወለሰሎሞን እምአዕይንተ ፀር ከማሁ አድኅነኒ።",
    traditionalFormulaEn: "O all-seeing eyes of divine mercy, shine upon me. As You guarded David and Solomon from envious eyes, guard my path in tranquility.",
    ritualMaterials: ["Parchment vellum", "Soot-based carbon black ink", "Cinnabar red pigment"],
    associatedArchetypeNumber: 5,
    associatedArchetypeName: "The High Priest",
    awdeCircleMatch: 9,
    vectorGeometryType: "all_seeing_diamond_eyes",
    culturalDisclaimer: "Central iconography of Ethiopian cultural heritage.",
  },
  {
    id: "telsem-mahteme-selomon",
    nameGe: "ጠልሰመ ማኅተመ ሰሎሞን ንጉሥ",
    nameAm: "ማኅተመ ሰሎሞን (የሰሎሞን ኮከብ ጠልሰም)",
    nameEn: "The 8-Pointed Star Seal of King Solomon",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወማዕሠር",
    categoryLabelEn: "Geometric Boundary",
    sourceManuscript: "አውደ ነገሥት (Awde Negest) & Mets'hafe Asmat",
    sacredGeometryDescription: "Two interlaced concentric squares forming a symmetrical octagram, centered with the solar eye and eight cardinal direction shields.",
    spiritualMeaning: "Represents the supreme boundary: harmonizing the 4 classical humors (እሳት፣ አፈር፣ ነፋስ፣ ማይ) and banishing chaotic entities.",
    traditionalFormulaGe: "በስመ ሰሎሞን ንጉሠ እስራኤል ዘተሰጥዎ ጥበብ ወማዕሠረ አጋንንት፤ በዝንቱ ማኅተም ይትዐፀው አናቅጸ ፀር ወይትረኃው አናቅጸ ሰላም።",
    traditionalFormulaEn: "In the name of Solomon, King of Israel, entrusted with wisdom: by this seal let the gates of harm be locked and the gates of peace be opened.",
    ritualMaterials: ["Iron-gall ink", "Clean parchment or fine linen", "Olive sprig"],
    associatedArchetypeNumber: 1,
    associatedArchetypeName: "The Sovereign",
    awdeCircleMatch: 16,
    vectorGeometryType: "solomon_octagram",
    culturalDisclaimer: "Classical heritage symbol.",
  },
  {
    id: "telsem-merbebe-selomon",
    nameGe: "ጠልሰመ መርበበ ሰሎሞን",
    nameAm: "መርበበ ሰሎሞን (የሰሎሞን መረብ)",
    nameEn: "The Net of Solomon Protective Mesh",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወመከታ",
    categoryLabelEn: "Etheric Armor",
    sourceManuscript: "Ethiopian Healing Scrolls (Gondar Manuscript School)",
    sacredGeometryDescription: "An intricate woven diamond grid with interlaced cross-junctions acting as a spiritual net that traps intrusive spirits before they reach the soul.",
    spiritualMeaning: "Worn over the breastplate or heart to filter negative emotional projections from crowds and ward off nocturnal oppression.",
    traditionalFormulaGe: "መርበበ ሰሎሞን ዘይሠርሮሙ ለኩሎሙ አጋንንት ፀዋጋን፤ ከመ መርበብ ዘይሰድድ ዓሣ ከማሁ ይስደድ እኩያተ መንፈስ እምላዕለ ገብርከ።",
    traditionalFormulaEn: "The Net of Solomon that catches turbulent spirits: like a net drawn through deep waters, it casts out all shadowy distress.",
    ritualMaterials: ["Fine parchment vellum", "Red vermilion ink", "Black iron ink"],
    associatedArchetypeNumber: 3,
    associatedArchetypeName: "The Warrior Defender",
    awdeCircleMatch: 6,
    vectorGeometryType: "solomon_net_lattice",
    culturalDisclaimer: "Traditional talismanic protection art.",
  },
  {
    id: "telsem-kinfe-kirub",
    nameGe: "ጠልሰመ ክንፈ ኪሩቤል ወሱራፌል",
    nameAm: "ክንፈ ኪሩቤል (የኪሩቤል ክንፍ ጠልሰም)",
    nameEn: "The Winged Cherub of Divine Presence",
    category: "archangels",
    categoryLabelAm: "ድርሳነ ሊቃነ መላእክት",
    categoryLabelEn: "Celestial Shield",
    sourceManuscript: "Lake Tana Monastery Illuminated Manuscripts",
    sacredGeometryDescription: "A multi-winged celestial seraph whose wings are embellished with all-seeing eyes, holding aloft the double-pointed sword of peace.",
    spiritualMeaning: "Invokes sanctuary and safe haven. Shields the dwelling from fire, lightning, theft, and domestic quarrels.",
    traditionalFormulaGe: "ኪሩቤል ወሱራፌል እለ ክነፊሆሙ ይመልኡ አዕይንተ፤ ቅዱስ ቅዱስ ቅዱስ እግዚአብሔር ፀባኦት ምሉዕ ሰማያተ ወምድረ ቅድሳተ ስብሐቲከ።",
    traditionalFormulaEn: "Cherubim and Seraphim whose wings are filled with eyes: Holy, Holy, Holy is the Lord of Hosts, heaven and earth are full of Your glory.",
    ritualMaterials: ["White gabi or clean cloth", "Frankincense", "Olive oil lamp"],
    associatedArchetypeNumber: 6,
    associatedArchetypeName: "The Nurturing Mother",
    awdeCircleMatch: 8,
    vectorGeometryType: "winged_cherub",
    culturalDisclaimer: "Liturgical prayer and iconography.",
  },
  {
    id: "telsem-meskel-hareg",
    nameGe: "ጠልሰመ መስቀል ዘሐረግ",
    nameAm: "የመስቀል ሐረግ ጠልሰም",
    nameEn: "Braided Ethiopian Cross of Eternal Life",
    category: "healing",
    categoryLabelAm: "ፈውስ ወመፍትሔ",
    categoryLabelEn: "Spiritual Renewal",
    sourceManuscript: "Lalibela Cross & Gondar Vellum Scrolls",
    sacredGeometryDescription: "An unending braided Ethiopian knotwork cross with four flared trinitarian lobes and spiraling leafy hareg tendrils.",
    spiritualMeaning: "Embodies life without end, resilience in suffering, and the victory of divine light over despair and disease.",
    traditionalFormulaGe: "መስቀል ብርሃነ ኩሉ ዓለም፤ መስቀል መድኃኒተ ሥጋ ወነፍስ፤ በመስቀልከ አብርህ ፍኖትየ ወፈውሶ ለልብየ።",
    traditionalFormulaEn: "The Cross is the illumination of the cosmos; the healer of body and spirit. By Your sacred cross, illuminate my way and restore my heart.",
    ritualMaterials: ["Olive wood or parchment", "Rosewater", "Tena Adam sprig"],
    associatedArchetypeNumber: 8,
    associatedArchetypeName: "The Renovator",
    awdeCircleMatch: 14,
    vectorGeometryType: "meskel_endless_knot",
    culturalDisclaimer: "Central Ethiopian spiritual symbol of renewal.",
  },
  {
    id: "telsem-arbaetu-insisa",
    nameGe: "ጠልሰመ አርባዕቱ እንስሳ መንፈሳውያን",
    nameAm: "ገጸ አርባዕቱ እንስሳ (የአራቱ እንስሳት ጠልሰም)",
    nameEn: "The Four Living Creatures / Cosmic Tetramorph",
    category: "protection",
    categoryLabelAm: "ጥበቃ ወመከታ",
    categoryLabelEn: "Cosmic Balance",
    sourceManuscript: "Book of Enoch & Debre Damo Revelation Scrolls",
    sacredGeometryDescription: "The four spiritual guardians of the celestial throne: Man (Human Wisdom), Lion (Courage), Ox (Steadfast Service), and Eagle (Vision).",
    spiritualMeaning: "Guards the four quadrants of human existence (mental, emotional, physical, spiritual). Restores fractured equilibrium.",
    traditionalFormulaGe: "አርባዕቱ እንስሳ መንፈሳውያን፡ ገጸ ሰብእ ለጥበብ፣ ገጸ አንበሳ ለኃይል፣ ገጸ ላህም ለትዕግሥት፣ ገጸ ንስር ለራዕይ፤ ይዕቀቡከ በኩሉ ፍኖትከ።",
    traditionalFormulaEn: "The four spiritual creatures: face of Man for wisdom, Lion for power, Ox for endurance, Eagle for vision; may they guard your steps in peace.",
    ritualMaterials: ["Four-corner parchment markers", "Frankincense", "Pencil or reed pen"],
    associatedArchetypeNumber: 10,
    associatedArchetypeName: "The Visionary",
    awdeCircleMatch: 15,
    vectorGeometryType: "four_living_creatures",
    culturalDisclaimer: "Enochic cosmic iconography.",
  },
  {
    id: "telsem-kistete-nibab",
    nameGe: "ጠልሰመ ክስተተ ንባብ ወጥበብ",
    nameAm: "ክስተተ ንባብና የጥበብ ጠልሰም",
    nameEn: "Key of Memory, Eloquence & Holy Learning",
    category: "wisdom",
    categoryLabelAm: "ትምህርት ወክስተተ ንባብ",
    categoryLabelEn: "Wisdom & Intellect",
    sourceManuscript: "መጽሐፈ አስማት (Page 20) & Debtera Scribes",
    sacredGeometryDescription: "An open sacred parchment book inscribed with the seven vowel orders of Ge'ez Fidel radiating inward to the central golden lamp.",
    spiritualMeaning: "Dedicated to students, scholars, teachers, and seekers. Dissolves mental blockages, improves memory retention, and inspires poetic eloquence (ቅኔ).",
    traditionalFormulaGe: "በድምድማኤል ስምከ ዘታፈልሆ ለማይ... አርኁ ልብየ ለገብርክ እገሌ፤ ለአንብቦ መጻሕፍት ወለአጽንኦ ዳዊት ወለአእምሮ ቅንይት።",
    traditionalFormulaEn: "By the secret word that quickens water into life, open the mind of Your servant for reading holy texts, retaining sacred verses, and acquiring poetic wisdom.",
    ritualMaterials: ["7 black raisins (፯ ዘቢብ)", "Black chickpea (ጥቁር ሽንብራ)", "Morning spring water"],
    associatedArchetypeNumber: 4,
    associatedArchetypeName: "The Scribe & Healer",
    awdeCircleMatch: 12,
    vectorGeometryType: "scholars_illuminated_scroll",
    culturalDisclaimer: "Traditional scholarly devotion.",
  },
  {
    id: "telsem-mestefaqir",
    nameGe: "ጠልሰመ መስተፋቅር ወሰላም",
    nameAm: "መስተፋቅርና የፍቅር ሰላም ጠልሰም",
    nameEn: "The Seal of Mutual Love, Reconciliation & Concord",
    category: "harmony",
    categoryLabelAm: "መስተፋቅር ወዕርቅ",
    categoryLabelEn: "Harmony & Concord",
    sourceManuscript: "መጽሐፈ አስማት (Page 21-22)",
    sacredGeometryDescription: "Two concentric interwoven circles enclosing the knot of goodwill and radiating eight gentle waves of reciprocal understanding.",
    spiritualMeaning: "Heals broken friendships, resolves judicial disputes with compassion, and brings tranquility between spouses and estranged relatives.",
    traditionalFormulaGe: "ቶቤል ተስንዮን ታፈቅር በልብኪ... አስተፋቅረኒ ለዳኛ ወለሕዝበ ኢትዮጵያ ወለፀርየ ወለፀላእትየ፤ አልብሰኒ ጸጋ ወግርማ ሞገስ በቅድመ ኩሉ ፍጥረት።",
    traditionalFormulaEn: "May hearts be drawn together in mutual understanding; bring concord before magistrates and neighbors, and clothe my presence in dignified favor.",
    ritualMaterials: ["Sweet basil (በሶቢላ)", "Fresh cardamom (ኮረሪማ)", "Pure honey water"],
    associatedArchetypeNumber: 2,
    associatedArchetypeName: "The Peacemaker",
    awdeCircleMatch: 2,
    vectorGeometryType: "concentric_harmony_rings",
    culturalDisclaimer: "Spiritual meditation on mutual forgiveness and love.",
  },
  {
    id: "telsem-meftehe-habt",
    nameGe: "ጠልሰመ መፍትሔ ሀብት ወበረከተ ገበያ",
    nameAm: "መፍትሔ ሀብትና የገበያ በረከት ጠልሰም",
    nameEn: "The Vessel of Sustenance & Fair Prosperity",
    category: "abundance",
    categoryLabelAm: "ሀብት ወገበያ",
    categoryLabelEn: "Livelihood Blessing",
    sourceManuscript: "መጽሐፈ አስማት (Page 18-19)",
    sacredGeometryDescription: "A central overflowing chalice bordered by wheat sheaves, solar rays, and interlocking squares of fair commercial exchange.",
    spiritualMeaning: "Blesses honest work, shields crops and trade from sudden collapse, and invites generous communal sustenance.",
    traditionalFormulaGe: "በኃይለ ዝንቱ አስማቲከ አስተጋብዕ ንዋየ እምኀበ ኩሉ ሰብዕ በእደ ገብርከ... በከመ አስተጋባዕከ ለኤርትራ ባሕር በአንቀጸ ቂፋዝ ከማሁ አብዝኅ ሲሳይየ።",
    traditionalFormulaEn: "By the blessing of divine abundance, gather sustenance into the hands of Your servant, as the waters of the Red Sea were guided into peaceful shores.",
    ritualMaterials: ["White frankincense (ነጭ ዕጣን)", "Seven grains of teff or wheat", "Clean trade ledger or purse"],
    associatedArchetypeNumber: 1,
    associatedArchetypeName: "The Sovereign",
    awdeCircleMatch: 5,
    vectorGeometryType: "cornucopia_vessel",
    culturalDisclaimer: "Ethical trade and livelihood contemplation.",
  },
  {
    id: "telsem-meftehe-seray",
    nameGe: "ጠልሰመ መፍትሔ ሥራይ ወፍታት",
    nameAm: "መፍትሔ ሥራይና የመፈታት ጠልሰም",
    nameEn: "The Knot-Breaker: Dissolution of Curses & Entanglements",
    category: "healing",
    categoryLabelAm: "ፈውስ ወመፍትሔ",
    categoryLabelEn: "Spiritual Untying",
    sourceManuscript: "መጽሐፈ አስማት (Page 3-4)",
    sacredGeometryDescription: "An uncoiling celestial spiral anchored by four cross-hilted daggers cutting through spiritual knots and releasing heavy bonds.",
    spiritualMeaning: "For individuals feeling bound by repetitive ancestral cycles, curses of stagnation, or persistent bad luck that resists ordinary effort.",
    traditionalFormulaGe: "ጸሎት በእንተ መፍትሔ ሥራይ አላከሚናይ ቸንዢያል ማዕወ... ይፍዝዎን ይፍዝዎን በኃይለ ዝንቱ አስማቲከ ፍታሕ ኩሎ ማዕሠረ ፀር እምላዕለ ገብርከ።",
    traditionalFormulaEn: "Prayer for the dissolution of sorcery and malevolent bonds: by this power, untie every knot of the adversary from Your servant.",
    ritualMaterials: ["Spring baptismal water (ጸበል)", "Rue or Koseret", "Freshly washed white garments"],
    associatedArchetypeNumber: 8,
    associatedArchetypeName: "The Renovator",
    awdeCircleMatch: 13,
    vectorGeometryType: "uncoiling_release_spiral",
    culturalDisclaimer: "Historical spiritual text for peaceful meditation.",
  },
];

// Helper functions

export function getAllTelsem(): TelsemSeal[] {
  return ETHIOPIAN_TELSEM_COLLECTION;
}

export function getTelsemById(id: string): TelsemSeal | undefined {
  return ETHIOPIAN_TELSEM_COLLECTION.find((t) => t.id === id);
}

export function getTelsemByCategory(category: TelsemCategory): TelsemSeal[] {
  return ETHIOPIAN_TELSEM_COLLECTION.filter((t) => t.category === category);
}

export function getTelsemForArchetype(archetypeNumber: number): TelsemSeal {
  const match = ETHIOPIAN_TELSEM_COLLECTION.find((t) => t.associatedArchetypeNumber === archetypeNumber);
  return match || ETHIOPIAN_TELSEM_COLLECTION[0];
}

export function getTelsemForAwdeCircle(circleNumber: number): TelsemSeal {
  const match = ETHIOPIAN_TELSEM_COLLECTION.find((t) => t.awdeCircleMatch === circleNumber);
  return match || getTelsemForArchetype((circleNumber % 12) || 1);
}

export function searchTelsem(query: string): TelsemSeal[] {
  const q = query.toLowerCase().trim();
  if (!q) return ETHIOPIAN_TELSEM_COLLECTION;
  return ETHIOPIAN_TELSEM_COLLECTION.filter(
    (t) =>
      t.nameAm.toLowerCase().includes(q) ||
      t.nameGe.toLowerCase().includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.spiritualMeaning.toLowerCase().includes(q) ||
      t.sacredGeometryDescription.toLowerCase().includes(q) ||
      t.categoryLabelAm.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
}
