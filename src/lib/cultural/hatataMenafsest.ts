/**
 * ሃተታ መናፍስት ወ አውደ ነገስት ከነትርጉሙ
 * Hateta Menafsest We Awde Negest Kene Tirgumu
 *
 * Commentary on Spirits and the Circle of Kings with Translation
 * Trilingual: Ge ez / Amharic / English
 * Domain B Cultural Heritage. Educational reference only. Non-diagnostic.
 */

export type SpiritClass =
  | "melaek_tsadag"
  | "melaek_gana"
  | "melaek_netseha"
  | "melaek_shetan"
  | "zar_ayana"
  | "buda_ayne"
  | "melaek_seray";

export interface SpiritCommentaryEntry {
  id: string;
  nameGe: string;
  nameAm: string;
  nameEn: string;
  spiritClass: SpiritClass;
  spiritClassLabelAm: string;
  spiritClassLabelEn: string;
  hatatDefinitionGe: string;
  hatatDefinitionAm: string;
  hatatDefinitionEn: string;
  protectiveFormulaGe: string;
  protectiveFormulaEn: string;
  counterMeasures: string[];
  signsOfManifestationAm: string[];
  awdeCircleMatch: number;
  associatedTelsemId: string;
  sourceManuscript: string;
  culturalDisclaimer: string;
}

export interface AwdeNegestChapterEntry {
  circleNumber: number;
  circleNameGe: string;
  circleNameAm: string;
  circleNameEn: string;
  guardianAngel: string;
  guardianAngelAm: string;
  chapterTextGe: string;
  chapterTextAm: string;
  chapterTextEn: string;
  prophesyForCategories: {
    categoryAm: string;
    categoryEn: string;
    outcomeGe: string;
    outcomeAm: string;
    outcomeEn: string;
  }[];
  seasonalAffinityAm: string;
  seasonalAffinityEn: string;
  dayRulingAm: string;
  nightRulingAm: string;
  amharicProverb: string;
  amharicProverbEn: string;
}

export const HATETA_MENAFSEST: SpiritCommentaryEntry[] = [
  {
    id: "melaek-mikael",
    nameGe: "ሚካኤል ሊቀ ሠራዊት",
    nameAm: "ቅዱስ ሚካኤል — ሊቀ ሠራዊት",
    nameEn: "Saint Michael — Chief of the Heavenly Host",
    spiritClass: "melaek_tsadag",
    spiritClassLabelAm: "ቅዱሳን ሊቃነ መላእክት",
    spiritClassLabelEn: "Holy Archangels",
    hatatDefinitionGe: "ሚካኤል ናሁ ሊቀ ሠራዊቱ ለእግዚአብሔር፤ ዘተሠምየ ሊቅ ዘተሰምዮ ሚካኤል ዘያቀርብ ጸሎቶሙ ለቅዱሳን ቅድመ ዓምደ ብርሃን።",
    hatatDefinitionAm: "ሚካኤል የሰማይ ሠራዊት አዛዥ ሲሆን 'ሚካኤል' ማለት 'እንደ እግዚአብሔር የሆነ' ማለት ነው። እርሱ የቅዱሳን ጸሎቶች ፊተኛ ዓምደ ብርሃን ፊት አቅርቦ ያቀርባል።",
    hatatDefinitionEn: "Michael is the Commander of the Heavenly Host. The name Michael means Who is like God. He presents the prayers of the holy ones before the Pillar of Light.",
    protectiveFormulaGe: "ኦ ሚካኤል ሊቀ ሠራዊት፤ ዘተሰይም ሊቀ ሠራዊቱ ለአብ ወወልድ ወመንፈስ ቅዱስ፤ አድህነኒ ወዕቀበኒ ዛቲ ሌሊት ወዛቲ ቀን።",
    protectiveFormulaEn: "O Michael, Prince of the Heavenly Hosts: guard and protect me this night and this day. Protect my body, my soul, and all my senses.",
    counterMeasures: [
      "ጾምና ጸሎት — Fasting and prayer on Monday and Thursday",
      "ሰም ሻማ (White candle) — lit at morning prayer",
      "ፀሐይ ጸሎት — Sunrise prayer facing east",
      "ትፋቱ (Holy water consecrated to St. Michael) blessing",
    ],
    signsOfManifestationAm: [
      "ድምፀ ሰላም — Inner voice of peace and decisive clarity",
      "ድፍረት — Sudden courage in moments of cowardice",
      "ነጭ ብርሃን — White light in dreams or upon waking",
    ],
    awdeCircleMatch: 1,
    associatedTelsemId: "telsem-dirsan-mikael",
    sourceManuscript: "ሃተታ ሊቃነ መላእክት / Debtera Scroll Tradition",
    culturalDisclaimer: "Historical Orthodox theology. Non-prescriptive spiritual reflection.",
  },
  {
    id: "melaek-gabriel",
    nameGe: "ገብርኤል ዘቅዱሳን አብሳሪ",
    nameAm: "ቅዱስ ገብርኤል — ዜናና ደስታ አምጭ",
    nameEn: "Saint Gabriel — Herald of Good Tidings",
    spiritClass: "melaek_tsadag",
    spiritClassLabelAm: "ቅዱሳን ሊቃነ መላእክት",
    spiritClassLabelEn: "Holy Archangels",
    hatatDefinitionGe: "ወገብርኤል ናሁ ዘቅዱሳን አብሳሪ ዘቅዱስ ዘፈለጠ ሰማይ ወምድር፤ ዘልዕለ ፍቅር ወሰላም ዘዓቂቤ ጽንሱ ለወልድ ዘኢይሄልፍ።",
    hatatDefinitionAm: "ቅዱስ ገብርኤል የቅዱሳን ወሬ-ሰጪ ሲሆን ሰማይን ምድርን ያሻጋሪ ፍቅርና ሰላም ዘማሪ ነው፤ ደስ ሚሉ ዜናዎች ሁሉ ይዞ ይመጣል።",
    hatatDefinitionEn: "Saint Gabriel, Herald of the Holy, spans heaven and earth through love and peace. He is the bearer of all joyful news and blessed announcements.",
    protectiveFormulaGe: "ኦ ገብርኤል ዘቅዱሳን አብሳሪ፤ ዘዓቂቤ ጽንሱ ለወልዳ ለቅድስት ድንግል ማርያም፤ አስተጋብዕ ፍቅረ ወሰላሞ ለቤትሊ ወለቤተ ሰቡ።",
    protectiveFormulaEn: "O Gabriel, Herald of the Holy: gather love and peace for my household and all who dwell therein.",
    counterMeasures: [
      "ዘይት ቅዱስ (Blessed olive oil) anointed at home threshold",
      "ዕጣን ካህን (Priestly incense) on Tuesdays",
      "ዜማ ሰሎሞን — Singing praises of Gabriel at dawn",
      "አበቡ ጽጌ (Fresh flowers) placed in prayer corner",
    ],
    signsOfManifestationAm: [
      "ደስ ሚሉ ሕልሞች — Joyful and radiant dreams",
      "ሕፃናት ሳቅ — Children laughter in the home",
      "ነጭ ርግብ — White dove appearing near dwelling",
    ],
    awdeCircleMatch: 2,
    associatedTelsemId: "telsem-dirsan-gabriel",
    sourceManuscript: "ቅዱስ ገብርኤል ምስጋና / Classical Hagiographic Texts",
    culturalDisclaimer: "Reflective spiritual prayer and folklore. Non-clinical.",
  },
  {
    id: "melaek-rufael",
    nameGe: "ሩፋኤል ፈዋሽ ዘቅዱሳን",
    nameAm: "ቅዱስ ሩፋኤል — ፈዋሽ ሊቀ መላእክት",
    nameEn: "Saint Raphael — The Divine Healer",
    spiritClass: "melaek_tsadag",
    spiritClassLabelAm: "ቅዱሳን ሊቃነ መላእክት",
    spiritClassLabelEn: "Holy Archangels",
    hatatDefinitionGe: "ሩፋኤል ዘተሰምዮ ፈዋሽ ወፊሊቃ ለዕዉራን ወቡዳ፤ ዘያቤዅ ደዌ ሥጋ ወያሳርፍ ሕማመ ነፍስ ወዘያሠርር ወሳዊ።",
    hatatDefinitionAm: "ሩፋኤል ፈዋሽ ሲሆን የዓይነ ሰብእ፣ ቡዳ፣ ደዌ ሥጋ ሕማምን ያጸዳ፤ ደዌን ያሻናል፣ ነፍስን ያጠናከራል፣ ጉዞ-ጠባቂ ነው።",
    hatatDefinitionEn: "Raphael, the Healer, cleanses evil eye afflictions and bodily sickness. He revives the weary soul and guards travellers on all journeys.",
    protectiveFormulaGe: "ኦ ሩፋኤል ፈዋሽ ወፊሊቃ ለዕዉር፤ ፈውስ ለሕሙ ልብ ወሕሙ ሥጋ ሰቲ፤ አስተጋብዕ ፀበለ ፈዋሽ ወፍቅረ ልቡናሃ ለቤተ ሰቡ ዕቁብ።",
    protectiveFormulaEn: "O Raphael, Healer of the blind: pour healing water and loving clarity upon the afflicted heart, ailing body, and all within this household.",
    counterMeasures: [
      "ጸበል — Holy water blessed in the name of St. Raphael",
      "ልመጭ (Lemeche herb) — dried and worn near chest",
      "ዝናብ ማር (Raw honey) taken with morning prayer",
      "Wednesday fast and sunrise reading of Psalm 91",
    ],
    signsOfManifestationAm: [
      "ዐሳ ሽታ ወይም ጨዋ ሽታ — Scent of healing water in prayer",
      "ሕልም ዓሣ — Fish appearing in healing dreams",
      "ሰዓት ሕመም ስሜት መሄድ — Pain dissipating during evening prayer",
    ],
    awdeCircleMatch: 3,
    associatedTelsemId: "telsem-dirsan-rufael",
    sourceManuscript: "ድርሳነ ሩፋኤል / Traditional Ethiopian Orthodox Hymnody",
    culturalDisclaimer: "Holy water and botanical prayer. Seek licensed medical care for symptoms.",
  },
  {
    id: "ganen-sham-shemo",
    nameGe: "ጋኔን ዘሸምሸሞ",
    nameAm: "ሽምሸሞ ጋኔን — የዙፋን ሕዝቅ አጋንንት",
    nameEn: "Shamshemo — Spirit of Oppressive Affliction",
    spiritClass: "melaek_gana",
    spiritClassLabelAm: "አጋንንት",
    spiritClassLabelEn: "Adversarial Spirits",
    hatatDefinitionGe: "ሸምሸሞ ናሁ ጋኔን ዘቅሉ ዘቅሩ፤ ዘያሠርር ሕዝቅ ወዘያፈቅዅ ደስዐ ወዘዐቂቦ ቤቶ ዘሰብርዋ ሰዋስዋ ወዘዳህሰሱ ዙፋን ወዘዐቂቦ ዘምቁ ነፍሳቲሁ ለናጽ።",
    hatatDefinitionAm: "ሽምሸሞ ቅርብ ፈጣን ጋኔን ሲሆን ሕዝቅን ያደሰቅሳቸዋል፣ ደስታን ያጠፋቸዋል። ለዘመናት ወደ ቤቱ ሰርጾ ሰነፍ ሕይወትን ያሰፍናል፣ ነፍስን ያሰናክላል።",
    hatatDefinitionEn: "Shamshemo is a swift nearby spirit that unsettles the neck and destroys joy. It infiltrates households over generations, fostering listlessness and disrupting the soul.",
    protectiveFormulaGe: "በዋህድ ተዋህድ ተአሰር አንተ ባርያ ዘሸምሸሞ... አድህን እምጋኔን ሊተ ለገብርክ።",
    protectiveFormulaEn: "Be bound in single unity, spirit of Shamshemo; deliver Your servant from this shadow affliction.",
    counterMeasures: [
      "ቄጠማ ወ ዕጣን — Holy grass (Qetema) and frankincense fumigation",
      "ጸሎት ወዘቃ — Reading of the Ma esere Aganint prayer 7 times",
      "ቆርቆሮ ፍሳሽ — Pouring of blessed water at home entrances",
      "Debtera amulet scroll (ክታብ) dedicated to St. Michael",
    ],
    signsOfManifestationAm: [
      "ድካምና ዝቅ ያለ ስሜት ያለ ምክንያት — Unexplained lethargy and low mood",
      "ሌሊት ሽብር — Night terrors without clear cause",
      "ቤት ውስጥ ቀጫጫ ሽቱ — Persistent odd odors in home",
      "ብዙ ጊዜ ጸብ ወ ዶፍ — Frequent quarrels and misunderstandings at home",
    ],
    awdeCircleMatch: 7,
    associatedTelsemId: "telsem-maesere-aganint-1",
    sourceManuscript: "መጽሐፈ አስማት — ጸሎት ማዕሠረ አጋንንት",
    culturalDisclaimer: "Ethno-spiritual manuscript tradition. Consult a licensed professional for mental health needs.",
  },
  {
    id: "ganen-buda",
    nameGe: "ጋኔን ቡዳ — ዓይነ ሰብእ ዘእኩይ",
    nameAm: "ቡዳ — የዓይነ ሰብ ጋኔን",
    nameEn: "Buda — Evil Eye Spirit of Envy",
    spiritClass: "buda_ayne",
    spiritClassLabelAm: "ቡዳ / ዓይነ ጥላ",
    spiritClassLabelEn: "Evil Eye and Envious Gaze",
    hatatDefinitionGe: "ቡዳ ናሁ ጋኔን ዓይነ ሰብ ዘሰሜናዊ ምርቃን ዘዐቂቦ ዘሌሊት ይሔዝ ወዘዓቂቦ ጐፈ ሕዝቅ ዘሸምሸሞ ወዘዐቂቦ ዓይነ ጥላ ዘምስሉ።",
    hatatDefinitionAm: "ቡዳ የዓይን ቅናት ጋኔን ሲሆን ሌሊት ዞሮ ይጎዳ ተብሎ ይታመናል። ዓይነ ጥላ ሕዝቅ ውስጥ የሚቀሰቅሱ ኃይሎችን ይወክላሉ።",
    hatatDefinitionEn: "Buda is the Spirit of the Envious Eye believed to prowl at night. The Ayne Tila (shadow-eye) represents forces that drain vitality through envy.",
    protectiveFormulaGe: "ሳዶር አላዶር ዳናት አዴራ ሮዳስ አማኑኤል ብርስባሔል... አድህነኒ እምቡዳ ወዓይነ ሰብ ዘሰሜናዊ ምርቃን።",
    protectiveFormulaEn: "Sador, Alador, Danat, Adera, Rodas, Emmanuel: deliver me from Buda and all envious gazes.",
    counterMeasures: [
      "ሳዶር አላዶር ጸሎት — The Sador prayer recited 3 times",
      "ነጭ ሽንኩርት ወ ሎሚ — White garlic and lemon hung at door",
      "ጤና አዳም (Tena Adam / rue) — worn or smoked",
      "ቀይ ሄሎ ክር — Red thread on wrist for children",
      "ደረቅ ሸክፍ (Dried Ensete bark) smoked before sleeping",
    ],
    signsOfManifestationAm: [
      "ሕፃናት ድፍዕ — Sudden illness in children after a visitor",
      "ምሽት ኩምሳ — Vomiting or nausea after praise from others",
      "ደስ ሚሉ ውጤቶች ዝቅ ማለት — Sudden reversal of good fortune",
      "የዓይን ሕመም ወ ደብዛ — Eye pain and blurring",
    ],
    awdeCircleMatch: 8,
    associatedTelsemId: "telsem-buda-ayne-tila",
    sourceManuscript: "መጽሐፈ አስማት — ጸሎት ቡዳ ወዓይነ ጥላ, Page 16",
    culturalDisclaimer: "Cultural folk belief. Seek licensed medical and ophthalmological care for eye complaints.",
  },
  {
    id: "ganen-seray",
    nameGe: "ሥራይ ወ ዕዳ ዘሰይጣን",
    nameAm: "ሥራይ — ቁልፍ ሳናቅ (ሰውነትን የሚያሠሩ ኃይሎች)",
    nameEn: "Seray — Spiritual Binding Curses and Ancestral Debt",
    spiritClass: "melaek_seray",
    spiritClassLabelAm: "ሥራይ ወ ዕዳ",
    spiritClassLabelEn: "Curse-Binding Forces",
    hatatDefinitionGe: "ሥራይ ናሁ ዕዳ ሰይጣናዊ ዘዐቂቦ ሰው ዘሰበረ ቃልኪዳን ወዘሸሸ ጽድቅ፤ ዕዳ ዘሐወጸ ጸሐፊ ዘቃሎ ዘሕዝቅ ሐፄ።",
    hatatDefinitionAm: "ሥራይ ቃልኪዳን ሲጣስ ወይም ሰውን ሲሠሩ ወይም ሐሰት ሲሆን ሕዝቅ ወደ ሰው ልቦ የሚቆፈር ሰይጣናዊ ዕዳ ነው። ተደጋጋሚ መሰናክሎችን ያስከትላል።",
    hatatDefinitionEn: "Seray is a spiritual binding debt that forms when oaths are broken or curses are placed. It creates recurring obstruction in a person's path.",
    protectiveFormulaGe: "ጸሎት በእንተ መፍትሔ ሥራይ... ይፍዝዎን ይፍዝዎን በኃይለ ዝንቱ አስማቲከ ፍታሕ ኩሎ ማዕሠረ ፀር እምላዕለ ገብርከ።",
    protectiveFormulaEn: "Prayer for dissolution of sorcery and malevolent bonds: by this power, untie every knot of the adversary from Your servant.",
    counterMeasures: [
      "ጸበል ቅዱስ — Holy spring water (tsebel) taken 3 days",
      "ጾምና ምሕረት — Fasting and almsgiving to release spiritual debt",
      "ካህን ቡራኬ — Priestly absolution and blessing",
      "ሕዝቅ ክርክር ፍቺ — Reconciliation with the wronged party",
      "ሩቅ ቦታ ጉዞ — Brief journey to change spiritual environment",
    ],
    signsOfManifestationAm: [
      "ሁሉ ምክሩ ይሰናከላል — All plans repeatedly fail without reason",
      "ጤና ሰሶ ያለ ጠቋሚ — Health declines without clear medical cause",
      "ፍቅር ይጠፋል — Relationships sour inexplicably",
      "ሕልም ሰንሰለት ወ ቁልፍ — Dreams of chains and locked doors",
    ],
    awdeCircleMatch: 13,
    associatedTelsemId: "telsem-meftehe-seray",
    sourceManuscript: "መጽሐፈ አስማት — ሥራይ ወ ፍታት, Pages 3-4",
    culturalDisclaimer: "Ethiopian esoteric folk tradition. Not a replacement for counseling or medical care.",
  },
  {
    id: "ayana-zar",
    nameGe: "አያና ወዘር — ጸዋዕ ዘዐቂቦ ነገደ ሰብ",
    nameAm: "አያና / ዘር — ሃይማኖታዊ ቅርስ ወ ቤተሰብ ጠባቂ ነፍስ",
    nameEn: "Ayana / Zar — Ancestral Guardian Spirits",
    spiritClass: "zar_ayana",
    spiritClassLabelAm: "ዘር / አያና — የቅርስ ጠባቂ",
    spiritClassLabelEn: "Ancestral and Nature Spirits",
    hatatDefinitionGe: "አያና ናሁ ጸዋዕ ዘሰቡ ዘዐቂቦ ነገደ ሰብ ወዘዓቢ ዝር ምስሌሁ፤ ዘኢዮኅዅ ወዘኢዮፎቅ ወዘኢዮሰምዅ ምስቡ ሰብ ዘሐጸሮ ፊቱ።",
    hatatDefinitionAm: "አያና ከቤተሰቡ ጋር የሚኖር ቅርስ ጠባቂ ሲሆን ሲሳደቡ ወይም ሲዘነጉ ብዙ ጊዜ ሕዝቅ ይሰጣቸዋል። ዞር ሲሉ ግን ጠባቂ ሆነው ያጋዝናሉ።",
    hatatDefinitionEn: "Ayana are ancestral guardian spirits linked to lineage. When neglected they can bring hardship; when honored they offer protection and guidance.",
    protectiveFormulaGe: "ኦ ጸዋዕ ዘነገደ ሰቡ፤ ወዘዓቢ ዝር ወዓቢ ቤት፤ ኑ ቅረቡ ወፍቀሩ ቤተ ሰቡ ወሕዝቡ ዘቅደስ ምሳሐ ወቡና ወጸሎት።",
    protectiveFormulaEn: "O ancestral spirit of this lineage: come, be present, love and guard this family who offer you holy meal, coffee, and prayer.",
    counterMeasures: [
      "ቡና ቄጠማ (Coffee and holy grass ceremony)",
      "ዝቡ ጉዞ — Ancestral grave site prayers and offerings",
      "ምናምን ምጽዋት — Food given to the poor in ancestor name",
      "ዛፍ ቅጠል ሞቅ — Herbal steaming rituals of Zar tradition",
    ],
    signsOfManifestationAm: [
      "ሕልም ጥንታዊ ሰዎች — Dreaming of deceased family members",
      "ሕዝቅ ዝናብ — Sudden trembling or involuntary movements",
      "ስሜት ያልሆን ድምፅ — Hearing whispered names in stillness",
    ],
    awdeCircleMatch: 15,
    associatedTelsemId: "telsem-arbaetu-insisa",
    sourceManuscript: "ሃተታ ዘር ወ አያና / Traditional Zar Healing Lore — Gondar and Welo",
    culturalDisclaimer: "Folk healing tradition. Seek licensed mental health care for psychological symptoms.",
  },
  {
    id: "melaek-netsuh",
    nameGe: "መናፍስት ንጽሐ — ዘዐቂቦ ዋርሳ ደምና ሐቅ",
    nameAm: "ንጹሕ መናፍስት — ዋርሳ ደምና ሐቅ ጠባቂዎች",
    nameEn: "Spirits of Purity — Guardians of Righteous Bloodline",
    spiritClass: "melaek_netseha",
    spiritClassLabelAm: "መናፍስት ንጽሐ",
    spiritClassLabelEn: "Spirits of Purity",
    hatatDefinitionGe: "ሐቅ ወጽድቅ ዘዐቂቦ ዋርሳ ሐቅ ዘቤተሰቡ ወዘዐቂቦ ዓቢ ቤት ዘሰብ ሐቅ ሰናይ ዘዐቂቦ ዋርሳ ሐቅ ዘሰብ ዘሐቁ ሰናይ ዐቂቦ ዋርሳ ሐቅ ዘሰብ።",
    hatatDefinitionAm: "የቤተሰብ ንጽህና ጠባቂ መናፍስት ጽድቅ ያለ ቤት ውስጥ ሰፍረው ይኖራሉ። ሐቅ ወ ጽድቅ ሲጠበቅ አቅም ያቀርባሉ።",
    hatatDefinitionEn: "The Spirits of Purity dwell in households that maintain righteousness and truth. When integrity is upheld, they bestow strength and divine favor.",
    protectiveFormulaGe: "ኦ ምኔቱ ዘሐቅ ወዓቢ ጽድቅ፤ ፍቀሩ ዋርሳ ሐቅ ዘቤተ ሰቡ ወዘዐቂቦ ዓቢ ቤት ዘቅዱስ ዋርሳ ሐቅ ዘሰብ ዘሐቁ ሰናይ።",
    protectiveFormulaEn: "O guardians of truth and righteousness: love and protect the righteous inheritance of this holy household.",
    counterMeasures: [
      "የቤት ጸሎት ሰዓት — Household morning prayer schedule",
      "ሰዓታዊ ቡና ሥርዓት — Regular coffee ceremony for household harmony",
      "ምጽዋት — Regular almsgiving to those in need",
    ],
    signsOfManifestationAm: [
      "ቤቱ ሰላም ሆናል — Unexpected peace filling the home",
      "ልጆች ሞቅ ደሰ አሉ — Children thriving and cheerful",
      "ጽጌረዳ ሽታ — Spontaneous fragrance of roses in prayer",
    ],
    awdeCircleMatch: 14,
    associatedTelsemId: "telsem-meskel-hareg",
    sourceManuscript: "ሃተታ ቅዱሳን / Classical Monastery Teaching Scrolls",
    culturalDisclaimer: "Spiritual household harmony tradition.",
  },
  {
    id: "shetan-master",
    nameGe: "ሰይጣን — ፀሊሙ ዘዐቂቦ ሰብ",
    nameAm: "ሰይጣን — ጠቅላላ ፀሊም ወ መሰናክል አምጭ",
    nameEn: "Sheytan — The Adversary and Sower of Obstacles",
    spiritClass: "melaek_shetan",
    spiritClassLabelAm: "ሰይጣናት",
    spiritClassLabelEn: "Fallen Adversarial Spirits",
    hatatDefinitionGe: "ሰይጣን ናሁ ፀሊሙ ዘዐቂቦ ሰብ ዘዓቢ ዘዐቂቦ ሰዋስዋ ወዘዐቂቦ ዝምዳ ዘሰቡ ወዘዐቂቦ ዓቢ ሰዋስዋ ወዘዐቂቦ ዓቢ ዝምዳ ዘሰቡ።",
    hatatDefinitionAm: "ሰይጣን ሰዎችን ከጽድቅ ጎዳና ለማዘንበል ሁሌ ጥሮ ይኖራል፤ ዓቢ ሰዋስዋ ሰዎችን ለሕዝቅ ለዕዳ ይፈርዳቸዋል።",
    hatatDefinitionEn: "Sheytan is the Adversary who constantly works to deflect souls from righteousness. The master of sowing obstacles and spiritual debt.",
    protectiveFormulaGe: "ወዘሥምሩ ሐዲሳን ዕቀቡ አምኃ ወዓቢ ሰዋስዋ ዘዐቂቦ ዓቢ ሰዋስዋ ወዘዐቂቦ ዓቢ ዝምዳ ዘሰቡ።",
    protectiveFormulaEn: "Guard us from the Adversary; by Your Holy Name seal every opening through which malevolence enters.",
    counterMeasures: [
      "ስሙ ጸሎት — Constant prayer with sacred names",
      "ኃይለ ምስጢር — Study and memorization of protective Psalms",
      "ጾም ወጸሎት — Weekly fasting and prostrations",
    ],
    signsOfManifestationAm: [
      "ቁጣ ወቅናት — Sudden rage and jealousy",
      "ሐሰት ዓቃፊ — Compulsive dishonesty",
      "ቅርቢ ጥፋት ፍቃድ — Desire to destroy relationships",
    ],
    awdeCircleMatch: 9,
    associatedTelsemId: "telsem-mesteme-aganint-master",
    sourceManuscript: "ሃተታ ሰይጣናት / Classical Debtera Doctrine",
    culturalDisclaimer: "Classical theological doctrine. Consult pastoral counselors and licensed therapists.",
  },
];

export const AWDE_NEGEST_CHAPTERS: AwdeNegestChapterEntry[] = [
  {
    circleNumber: 1,
    circleNameGe: "አውደ ሚካኤል",
    circleNameAm: "የሚካኤል ዙር (ዑደት)",
    circleNameEn: "Circle of Michael the Defender",
    guardianAngel: "ቅዱስ ሚካኤል",
    guardianAngelAm: "ሊቀ መላእክት ሚካኤል — ሰማዕቱ ሰራዊት",
    chapterTextGe: "ዑደቱ ዘሚካኤል ናሁ ዑደቱ ዘዐቢይ ዘሚካኤል ሊቀ ሠራዊት ዘዐቢይ ዘዐቂቦ ሰዋስዋ ወዘዐቂቦ ዓቢ ዑደቱ ዘሰቡ ዘሚካኤል ሊቀ ሠራዊት ዘዐቢይ ዘዐቂቦ ሰዋስዋ።",
    chapterTextAm: "ሚካኤል ዑደት (ዙር) ዋና ዑደት ሲሆን ሚካኤል ሊቀ ሠራዊት ሰውን ጠቅሶ ጠባቂ የሆነ ዙር ነው። ዐሦ ድፍረት፣ አጥሮ ሰዋስዋ ሆነ ዙር።",
    chapterTextEn: "The Circle of Michael is the primary circle of the Awde Negest, governed by Archangel Michael the Commander of Hosts. It governs courageous initiative, decisive action, and the breaking of spiritual stagnation.",
    prophesyForCategories: [
      {
        categoryAm: "ጋብቻና ጋብቻ ስምምነት",
        categoryEn: "Marriage and Betrothal",
        outcomeGe: "ይከውን ጋብቻሁ ወይሠናይ።",
        outcomeAm: "ጋብቻው ይሳካል እና ሰናይ ይሆናል።",
        outcomeEn: "The marriage will be achieved and shall be favorable.",
      },
      {
        categoryAm: "ሕመምና ፈውስ",
        categoryEn: "Illness and Recovery",
        outcomeGe: "ፈውስ ይሠርር ለሕሙ ወዘዓቢ ይሠናይ።",
        outcomeAm: "ሕዝቅ ይቀለልና ፈውስ ይፋጠናል።",
        outcomeEn: "The affliction will lighten and healing will accelerate.",
      },
      {
        categoryAm: "ንግድና ትርፍ",
        categoryEn: "Commerce and Trading",
        outcomeGe: "ይከውን ዕድሉ ኀዘን ወ ጽዕሩ ሰናይ።",
        outcomeAm: "ወቅቱ ጥሩ ነው — ደፍሮ ወደ ገበያ ይወጣ።",
        outcomeEn: "The timing is auspicious. Act boldly in trade; favorable returns are indicated.",
      },
    ],
    seasonalAffinityAm: "ጸደይ — ሰኔ ወ ሐምሌ ወ ነሐሴ ጸደይ ወቅት አካባቢ ሚካኤል ዙር ጠንካራ ነው።",
    seasonalAffinityEn: "Summer-early autumn (June-August). Michael s circle is strongest during bold seasonal transition.",
    dayRulingAm: "ቀን ሰዓቱ ለተግባር፣ ለስምምነቶች፣ ለፍርድ ቤት ጉዳዮች ይሰናዳ።",
    nightRulingAm: "ሌሊት ሰዓቱ ለጸሎት፣ ለቃልኪዳን ሞክሮ ለጾምና ለዝምታ ዋለ።",
    amharicProverb: "ድር ቢያብር አንበሳ ያስር",
    amharicProverbEn: "Through unified resolve and righteous coalition, even lions can be tethered.",
  },
  {
    circleNumber: 2,
    circleNameGe: "አውደ ገብርኤል",
    circleNameAm: "የገብርኤል ዙር",
    circleNameEn: "Circle of Gabriel the Herald",
    guardianAngel: "ቅዱስ ገብርኤል",
    guardianAngelAm: "ሊቀ መላእክት ገብርኤል — ዜናና ደስታ አምጭ",
    chapterTextGe: "ዑደቱ ዘገብርኤል ናሁ ዑደቱ ዘዐቢይ ዘፍቅር ወሰላም ወዘዐቢይ ዘዐቂቦ ሰዋስዋ ወዘዐቂቦ ዓቢ ዑደቱ ዘሰቡ ዘሰናይ ዘዐቢይ።",
    chapterTextAm: "ገብርኤል ዙር ፍቅርና ሰላም ዙር ነው። ሰላምና ደስታ ፣ ጋብቻ ፣ አዲስ ጅምር የሚጎለብቱ ዙር ነው።",
    chapterTextEn: "The Circle of Gabriel governs love, peaceful news, reconciliation, and new beginnings. It is the circle of betrothal, childbirth, and creative inception.",
    prophesyForCategories: [
      {
        categoryAm: "ጋብቻ",
        categoryEn: "Marriage",
        outcomeGe: "ይሠናይ ወዓቢ ፍቅር ይሠናይ።",
        outcomeAm: "ጋብቻ ይከበራል፤ ፍቅርና መዋደድ ይጎለብታሉ።",
        outcomeEn: "The marriage will be honored; love and affection shall deepen.",
      },
      {
        categoryAm: "ጽንስና ምጥ በደህና",
        categoryEn: "Pregnancy and Safe Delivery",
        outcomeGe: "ወዓቢ ዝምዳ ይሠናይ ወዓቢ ጽንስ ይሠናይ።",
        outcomeAm: "ፅንስ ይጠናከራል፤ ምጥ ደህና ይሆናል።",
        outcomeEn: "The pregnancy shall strengthen and delivery will be safe.",
      },
    ],
    seasonalAffinityAm: "ክረምት ወ ፀደይ — ዝናምና አዲስ ጅምር ዋናው ዙር ጊዜ ነው።",
    seasonalAffinityEn: "Rainy season through spring — primary time of new beginnings and Gabriel s strongest influence.",
    dayRulingAm: "ቀን — ለደስ ሚሉ ሥራዎችና ስምምነቶች ልዩ ዕለት።",
    nightRulingAm: "ሌሊት — ለፍቅርና ለዕርቅ ዝርዝሮች ልዩ ጊዜ፤ ለጸሎት ሚስጥር።",
    amharicProverb: "ከመናገር ደጋግሞ ማዳመጥ",
    amharicProverbEn: "Wisdom in love and peace means listening deeply before speaking.",
  },
  {
    circleNumber: 3,
    circleNameGe: "አውደ ሩፋኤል",
    circleNameAm: "የሩፋኤል ዙር",
    circleNameEn: "Circle of Raphael the Healer",
    guardianAngel: "ቅዱስ ሩፋኤል",
    guardianAngelAm: "ሊቀ መላእክት ሩፋኤል — ፈዋሽ ወጉዞ ጠባቂ",
    chapterTextGe: "ዑደቱ ዘሩፋኤል ናሁ ዑደቱ ዘፈዋሽ ወጉዞ ጠባቂ ዘዐቂቦ ሰዋስዋ ወዘዐቂቦ ዓቢ ዑደቱ ዘሰቡ ዘሰናይ ዘዐቢይ ፈዋሽ ወጉዞ ጠባቂ።",
    chapterTextAm: "ሩፋኤል ዙር ፈውስ፣ ጉዞ ደህንነት፣ ትምህርት ፣ ወ ጽናት ዙር ነው። ሕሙማን፣ ተማሪዎች፣ ተጓዦች ሩፋኤልን ይጠሩታል።",
    chapterTextEn: "The Circle of Raphael governs healing, safe travel, scholarly clarity, and restoration of strength. The sick, students, and travellers invoke his name.",
    prophesyForCategories: [
      {
        categoryAm: "ሕሙምና ፈውስ",
        categoryEn: "Illness and Healing",
        outcomeGe: "ፈዋሽ ይሠርር ወዘዓቢ ይሠናይ ሕሙሙ።",
        outcomeAm: "ፈዋሽ ይፋጠናል፤ ሕዝቅ ይቀለላል።",
        outcomeEn: "Healing accelerates; the burden of sickness lightens.",
      },
      {
        categoryAm: "ትምህርትና ጥበብ",
        categoryEn: "Scholarship and Wisdom",
        outcomeGe: "ንባብ ይሠናይ ወዘዓቢ ጥበብ ይሠናይ ትምህርቱ።",
        outcomeAm: "ትምህርት ይቀለልና ጥበብ ይፈሳል።",
        outcomeEn: "Studies flow easily and wisdom illuminates the mind.",
      },
    ],
    seasonalAffinityAm: "ጨቅላ ወ ከረምት — ከረምቱ ዙር ለፈዋሽ ልዩ ዕጣ ይሰጣል።",
    seasonalAffinityEn: "Early rainy season. Raphael s circle governs the season of regeneration and natural healing.",
    dayRulingAm: "ቀን — ለዶክተር ጉዞ፣ ለፈዋሽ ቦታ ጉዞ ጥሩ ቀን።",
    nightRulingAm: "ሌሊት — ለሕልም ፈዋሽ ወ ለቁስለት ዕረፍት ልዩ ጊዜ።",
    amharicProverb: "ቀስ በቀስ ቈንቋላ እንቁላል በእግሯ ትሄዳለች",
    amharicProverbEn: "Healing and learning both come gradually; patience is the true medicine.",
  },
  {
    circleNumber: 7,
    circleNameGe: "አውደ ሰራቂኤል",
    circleNameAm: "የሰራቂኤል ዙር",
    circleNameEn: "Circle of Saraqiel the Steadfast Guardian",
    guardianAngel: "ቅዱስ ሰራቂኤል",
    guardianAngelAm: "ሊቀ መላእክት ሰራቂኤል — ቤትና ልጆች ጠባቂ",
    chapterTextGe: "ዑደቱ ዘሰራቂኤል ናሁ ዑደቱ ዘጠባቂ ወቤት ዘዐቂቦ ሰዋስዋ ወዘዐቂቦ ዓቢ ዑደቱ ዘሰቡ ዘሰናይ ዘዐቢይ ጠባቂ ቤቱ ወልጆቹ።",
    chapterTextAm: "ሰራቂኤል ዙር ቤት፣ ልጆች፣ ደህንነት ዙር ነው። ቤት ምህረትና ሰላም ለሚፈልጉ ልዩ ዙር።",
    chapterTextEn: "The Circle of Saraqiel governs household protection, safety of children, and the steadfast defense of vulnerable hearths.",
    prophesyForCategories: [
      {
        categoryAm: "ቤት ሰላምና ጸጥታ",
        categoryEn: "Domestic Peace and Safety",
        outcomeGe: "ቤቱ ወሕዝቡ ይሠናይ ወዘዓቢ ሰላም ይሠናይ።",
        outcomeAm: "ቤቱ ይጠበቃል፤ ሰላምና ጸጥታ ይሠፍናሉ።",
        outcomeEn: "The household is shielded; peace and quietude shall dwell within.",
      },
    ],
    seasonalAffinityAm: "ጸሐይ ወ ሐምሌ — ሰራቂኤል ዙር ለቤት ጠባቂ ጥሩ ዙር ነው።",
    seasonalAffinityEn: "Dry sunny season. Saraqiel governs the dry protective seasons.",
    dayRulingAm: "ቀን — ለቤት ድርዳርና ለልጆች ጤናን ለመጠበቅ ልዩ ቀን።",
    nightRulingAm: "ሌሊት — ቤት ለሌሊት ጸሎት ጠባቂ ዙር ነው።",
    amharicProverb: "የታገሰ ሰው መከራን ያሳልፋል",
    amharicProverbEn: "Persistent steadfast protection and prayer outlast every shadow adversity.",
  },
  {
    circleNumber: 11,
    circleNameGe: "አውደ ነቢያት",
    circleNameAm: "የነቢያት ዙር",
    circleNameEn: "Circle of the Prophets",
    guardianAngel: "መንፈሰ ነቢያት",
    guardianAngelAm: "የነቢያት መንፈስ — ራዕይ ወ ጥበብ ዘማሪ",
    chapterTextGe: "ዑደቱ ዘነቢያት ናሁ ዑደቱ ዘዐቢይ ዘራዕይ ወጥበብ ወዘዐቂቦ ሰዋስዋ ወዘዐቂቦ ዓቢ ዑደቱ ዘሰቡ ዘሰናይ ዘዐቢይ ዘቀፃሊ ዑደቱ።",
    chapterTextAm: "ነቢያት ዙር ራዕይ፣ ህልም ትርጉም፣ ሩቅ ጥበብ ዙር ነው። ሕልም ምላሽ ፣ ምስጢር ምግለጥ ፣ ጠቅላላ ጥበብ ለሚፈልጉ ልዩ ዙር።",
    chapterTextEn: "The Circle of the Prophets governs visionary insight, dream interpretation, long-range wisdom, and the unfolding of hidden mysteries.",
    prophesyForCategories: [
      {
        categoryAm: "ሕልም መፍታት",
        categoryEn: "Dream Interpretation",
        outcomeGe: "ሕልሙ ይፋጠን ወዘዓቢ ራዕይ ይሠናይ።",
        outcomeAm: "ሕልሙ ምላሽ ያገኛል፤ ራዕይ ይጠልቃል።",
        outcomeEn: "The dream reveals its meaning; deep prophetic insight opens.",
      },
      {
        categoryAm: "የተሰወረ ምሥጢር መገለጥ",
        categoryEn: "Discovery of Hidden Truths",
        outcomeGe: "ምሥጢሩ ይፋ ወዘዓቢ ሐቅ ይሠናይ።",
        outcomeAm: "ምሥጢሩ ይገለጣል፤ ሐቅ ወደ ብርሃን ይወጣል።",
        outcomeEn: "The hidden truth will be revealed; what was concealed emerges into light.",
      },
    ],
    seasonalAffinityAm: "ምሽት ወ ሌሊት ሰዓታት — ነቢያት ዙር ሌሊት ጠንካራ ነው።",
    seasonalAffinityEn: "Evening and night hours. The Circle of the Prophets is strongest during twilight and night.",
    dayRulingAm: "ቀን — ለጠቅላላ ትምህርት፣ ለማህደር ምርምር፣ ለጸሎት ምርምር ጥሩ ቀን።",
    nightRulingAm: "ሌሊት — ለሕልም ፣ ለምስጢር ራዕይ ፣ ለምርምር ልዩ ጊዜ።",
    amharicProverb: "እውነትና ንጋት እያደር ይጠራል",
    amharicProverbEn: "Truth and dawn grow brighter with each passing hour — vision comes to those who wait.",
  },
  {
    circleNumber: 13,
    circleNameGe: "አውደ ጻድቃን",
    circleNameAm: "የጻድቃን ዙር",
    circleNameEn: "Circle of the Righteous",
    guardianAngel: "ጻድቃን ወ ቅዱሳን",
    guardianAngelAm: "ጻድቃን — ቀጥተኛ ቅዱሳን ነፍሳት",
    chapterTextGe: "ዑደቱ ዘጻድቃን ናሁ ዑደቱ ዘሐቅ ወጽድቅ ዘዐቂቦ ሰዋስዋ ወዘዐቂቦ ዓቢ ዑደቱ ዘሰቡ ዘሰናይ ዘዐቢይ ሐቅ ወጽድቅ ዘዐቂቦ።",
    chapterTextAm: "ጻድቃን ዙር ሐቅ፣ ጽድቅ፣ ለምጽዋት ወ ለሐቅ ያለ ዋጋ ዙር ነው። ሰናይ ዙር ለሐቅ ወ ለጸሎት።",
    chapterTextEn: "The Circle of the Righteous governs truth, righteous harvest, fair reward, and the blessings of almsgiving and sincere devotion.",
    prophesyForCategories: [
      {
        categoryAm: "ምጽዋትና በረከት",
        categoryEn: "Almsgiving and Multiplication",
        outcomeGe: "ምጽዋቱ ወዓቢ ሐቅ ይሠናይ ወዘዓቢ ፍሬ ይሠናይ።",
        outcomeAm: "ምጽዋት ፍሬ አፈራ፤ ሐቅ ዋጋውን ያስፈፍታል።",
        outcomeEn: "Almsgiving bears fruit; righteousness brings its full reward.",
      },
      {
        categoryAm: "ይቅርታ ማግኘት",
        categoryEn: "Cleansing of Faults",
        outcomeGe: "ይቅርታ ይሠናይ ወዘዓቢ ፀጋ ይሠናይ።",
        outcomeAm: "ይቅርታ ያገኛሉ፤ ጸጋ ይሠፍናል።",
        outcomeEn: "Forgiveness is granted; grace descends upon the humble.",
      },
    ],
    seasonalAffinityAm: "መሸ ጸደይ — ጻድቃን ዙር ሰብዕ ዋዛ ወ ቀዝቃዛ ዙር ነው።",
    seasonalAffinityEn: "Late spring/harvest season — the circle of the righteous harvest.",
    dayRulingAm: "ቀን — ሐቅ ወ ምጽዋት ልዩ ቀን።",
    nightRulingAm: "ሌሊት — ለንስሐ ወ ዳዊት ቃሎ ልዩ ጊዜ።",
    amharicProverb: "የተዘራ እህል አይጠፋም",
    amharicProverbEn: "All seeds of righteousness sown in truth shall bear their harvest in divine timing.",
  },
];

export function getAllSpiritCommentary(): SpiritCommentaryEntry[] {
  return HATETA_MENAFSEST;
}

export function getSpiritById(id: string): SpiritCommentaryEntry | undefined {
  return HATETA_MENAFSEST.find((s) => s.id === id);
}

export function getSpiritsByClass(spiritClass: SpiritClass): SpiritCommentaryEntry[] {
  return HATETA_MENAFSEST.filter((s) => s.spiritClass === spiritClass);
}

export function getAwdeChapter(circleNumber: number): AwdeNegestChapterEntry | undefined {
  return AWDE_NEGEST_CHAPTERS.find((c) => c.circleNumber === circleNumber);
}

export function getAllAwdeChapters(): AwdeNegestChapterEntry[] {
  return AWDE_NEGEST_CHAPTERS;
}

export function searchSpiritCommentary(query: string): SpiritCommentaryEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return HATETA_MENAFSEST;
  return HATETA_MENAFSEST.filter(
    (s) =>
      s.nameAm.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.nameGe.toLowerCase().includes(q) ||
      s.hatatDefinitionAm.toLowerCase().includes(q) ||
      s.hatatDefinitionEn.toLowerCase().includes(q) ||
      s.spiritClassLabelAm.toLowerCase().includes(q) ||
      s.spiritClassLabelEn.toLowerCase().includes(q)
  );
}
