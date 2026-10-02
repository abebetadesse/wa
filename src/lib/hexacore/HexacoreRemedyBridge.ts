/**
 * Hexacore Commercial Remedy Bridge
 *
 * Connects Hexacore botanical correspondences (Damakesse, Tena Adam, Kosso, Korarima, etc.)
 * directly to commercial apothecary remedies and verified marketplace providers.
 */

export type RemedyPreparationType =
  | "tincture"
  | "dried_cut"
  | "essential_oil"
  | "fumigation_incense"
  | "powder_infusion";

export interface HexacoreRemedyOffering {
  sku: string;
  core: "Power" | "Humanity" | "Creation" | "Peace" | "Spirit" | "Order";
  coreAm: string;
  herbNameEn: string;
  herbNameAm: string;
  scientificName: string;
  preparationType: RemedyPreparationType;
  productTitleEn: string;
  productTitleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  therapeuticSynergyEn: string;
  therapeuticSynergyAm: string;
  suggestedRitualEn: string;
  suggestedRitualAm: string;
  safetyCautionEn: string;
  safetyCautionAm: string;
  priceEtb: number;
  priceUsd: number;
  unit: string;
  vendor: {
    id: string;
    businessSlug: string;
    nameEn: string;
    nameAm: string;
    region: string;
    city: string;
    isVerified: boolean;
    rating: number;
  };
  inStock: boolean;
}

export const HEXACORE_COMMERCIAL_REMEDIES: HexacoreRemedyOffering[] = [
  // ── 1. POWER CORE (እሳት / ኃይል) ─────────────────────────────────────────────
  {
    sku: "HEX-REM-DAM-01",
    core: "Power",
    coreAm: "ኃይል (Power)",
    herbNameEn: "Damakesse (Koseret / Lippia adoensis)",
    herbNameAm: "ደማከሴ (ኮሰረት)",
    scientificName: "Lippia adoensis var. koseret",
    preparationType: "tincture",
    productTitleEn: "Sun-Extracted Damakesse Essence Tincture (50ml)",
    productTitleAm: "በፀሐይ የነጠረ የደማከሴ ጠብታ (50 ሚሊ ሊትር)",
    descriptionEn: "Authentic highland Lippia cold-extracted in alcohol-free organic vegetable glycerin with mountain spring water.",
    descriptionAm: "ከደጋማው የኢትዮጵያ ተራሮች የተሰበሰበ ንጹህ የደማከሴ ዘይትና ጠብታ።",
    therapeuticSynergyEn: "Awakens internal metabolic fire, clears respiratory blockages, and stimulates mental clarity.",
    therapeuticSynergyAm: "የሰውነት ሙቀትን ያመጣጥናል፣ አዕምሮን ያነቃቃል እንዲሁም የትንፋሽ ቧንቧን ያጸዳል።",
    suggestedRitualEn: "Take 5 drops under the tongue or in warm water at sunrise facing east.",
    suggestedRitualAm: "ጠዋት በፀሐይ መውጫ 5 ጠብታ በሞቀ ውሃ በጥብጠው ይውሰዱ።",
    safetyCautionEn: "Reflective wellness only. Avoid high doses during pregnancy.",
    safetyCautionAm: "በባህል የሚታወቅ ማጠናከሪያ፤ እርጉዝ ሴቶች በጥንቃቄ መውሰድ አለባቸው።",
    priceEtb: 380,
    priceUsd: 12.5,
    unit: "50ml dropper bottle",
    vendor: {
      id: "v-entoto-01",
      businessSlug: "entoto-botanical-apothecary",
      nameEn: "Entoto Botanical Apothecary",
      nameAm: "የእንጦጦ ባህላዊ መድኃኒት መደብር",
      region: "Addis Ababa",
      city: "Addis Ababa",
      isVerified: true,
      rating: 4.9,
    },
    inStock: true,
  },
  {
    sku: "HEX-REM-KOS-02",
    core: "Power",
    coreAm: "ኃይል (Power)",
    herbNameEn: "Kosso (Hagenia abyssinica)",
    herbNameAm: "ኮሶ (ሐገንያ አቢሲኒካ)",
    scientificName: "Hagenia abyssinica",
    preparationType: "dried_cut",
    productTitleEn: "Shade-Dried Highland Kosso Flowers (100g)",
    productTitleAm: "ጥላ ላይ የደረቀ የደጋ ኮሶ አበባ (100 ግራም)",
    descriptionEn: "Wildcrafted female flower inflorescences harvested according to traditional lunar calendar.",
    descriptionAm: "በባህላዊ የጨረቃ ዑደት መሰረት የተሰበሰበ ንጹህ የኮሶ አበባ።",
    therapeuticSynergyEn: "Purifying somatic detoxifier, grounding volatile energy, traditional digestive cleanser.",
    therapeuticSynergyAm: "የሰውነት ውስጣዊ ቆሻሻን የሚያጸዳ፣ ለሆድ ዕቃ ጥንካሬ የሚሰጥ ጥንታዊ መድኃኒት።",
    safetyCautionEn: "Potent traditional purgative. Do not use without guidance. Contraindicated in pregnancy and childhood.",
    safetyCautionAm: "ኃይለኛ የማጽዳት አቅም ያለው በመሆኑ በባለሙያ መመሪያ ብቻ ጥቅም ላይ ይውላል። በእርግዝና ወቅት ፈጽሞ አይወሰድም።",
    suggestedRitualEn: "Infuse 10g in lukewarm water for gentle periodic cleansing.",
    suggestedRitualAm: "10 ግራም በጥቂት ለብ ባለ ውሃ በማፍላት በመጠኑ ይጠጡ።",
    priceEtb: 290,
    priceUsd: 9.9,
    unit: "100g sealed pouch",
    vendor: {
      id: "v-gondar-02",
      businessSlug: "gondar-heritage-herbarium",
      nameEn: "Gondar Heritage Herbarium",
      nameAm: "የጎንደር ጥንታዊ ዕጽዋት አውደ-ጥናት",
      region: "Amhara",
      city: "Gondar",
      isVerified: true,
      rating: 4.85,
    },
    inStock: true,
  },

  // ── 2. HUMANITY CORE (ውሃ / ስሜት) ──────────────────────────────────────────
  {
    sku: "HEX-REM-TNA-03",
    core: "Humanity",
    coreAm: "ሰብአዊነት (Humanity)",
    herbNameEn: "Tena Adam (Ruta chalepensis / Rue)",
    herbNameAm: "ጤና አዳም (ሩታ)",
    scientificName: "Ruta chalepensis",
    preparationType: "essential_oil",
    productTitleEn: "Pure Steam-Distilled Tena Adam Elixir (15ml)",
    productTitleAm: "በእንፋሎት የተጣራ የጤና አዳም ዘይት (15 ሚሊ ሊትር)",
    descriptionEn: "Cold mountain stream distilled Ruta chalepensis oil preserving delicate bioflavonoids.",
    descriptionAm: "በተፈጥሮ ውሃ የተጣራ ንጹህ የጤና አዳም ጠብታ።",
    therapeuticSynergyEn: "Heart coherence, interpersonal bridge-building, easing spasmodic grief and nervous tension.",
    therapeuticSynergyAm: "የልብ ምትን ያረጋጋል፣ የጭንቀት ስሜትን ያስወግዳል፣ ማህበራዊ መረጋጋትን ያጠናክራል።",
    suggestedRitualEn: "Add 1–2 drops to traditional Ethiopian roasted coffee (Buna) or inhale from palm during quiet reflection.",
    suggestedRitualAm: "1 ወይም 2 ጠብታ በቡና ላይ አድርገው ይጠጡ ወይም በእጅዎ ላይ አድርገው ያሽቱት።",
    safetyCautionEn: "Potent uterine stimulant. Strictly avoid during pregnancy. Do not apply undiluted to sensitive skin.",
    safetyCautionAm: "ማህፀንን የማነቃቃት ባህሪ ስላለው በእርግዝና ወቅት ፈጽሞ አይወሰድም።",
    priceEtb: 320,
    priceUsd: 11.0,
    unit: "15ml amber dropper",
    vendor: {
      id: "v-entoto-01",
      businessSlug: "entoto-botanical-apothecary",
      nameEn: "Entoto Botanical Apothecary",
      nameAm: "የእንጦጦ ባህላዊ መድኃኒት መደብር",
      region: "Addis Ababa",
      city: "Addis Ababa",
      isVerified: true,
      rating: 4.9,
    },
    inStock: true,
  },

  // ── 3. CREATION CORE (ምድር / ፈጠራ) ─────────────────────────────────────────
  {
    sku: "HEX-REM-KOR-04",
    core: "Creation",
    coreAm: "ፈጠራ (Creation)",
    herbNameEn: "Korarima (Aframomum corrorima / Ethiopian Cardamom)",
    herbNameAm: "ኮረሪማ (የሐበሻ ካርዳሞም)",
    scientificName: "Aframomum corrorima",
    preparationType: "powder_infusion",
    productTitleEn: "Wild-Foraged Kaffa Korarima Seeds (150g)",
    productTitleAm: "የጫካ ቆላማ ኮረሪማ ፍሬ (150 ግራም)",
    descriptionEn: "Sun-dried wild cardamom pods from the montane rainforests of Kaffa, rich in aromatic monoterpenes.",
    descriptionAm: "ከካፋ የዝናብ ደን የተሰበሰበ ጥሩ መዓዛ ያለው የኮረሪማ ፍሬ።",
    therapeuticSynergyEn: "Awakening creative manifestation, stimulating splenic digestion, sensory groundedness.",
    therapeuticSynergyAm: "የፈጠራ ችሎታን ያነቃቃል፣ የምግብ መፈጨትን ያፋጥናል፣ የሰውነት ጥንካሬን ይጨምራል።",
    suggestedRitualEn: "Crush 3 seeds freshly in a stone mortar before creative endeavors; add to warm herbal infusions.",
    suggestedRitualAm: "3 ፍሬዎችን በሙቀጫ ወቅጠው በሞቀ ውሃ ወይም በሻይ ውስጥ ጨምረው ይጠጡ።",
    safetyCautionEn: "Safe traditional food spice. Enjoy in moderate daily portions.",
    safetyCautionAm: "አስተማማኝ የባህል ቅመም፤ በዕለት ተዕለት አመጋገብ ውስጥ መጠቀም ይቻላል።",
    priceEtb: 260,
    priceUsd: 8.5,
    unit: "150g craft jar",
    vendor: {
      id: "v-kaffa-03",
      businessSlug: "kaffa-rainforest-cooperative",
      nameEn: "Kaffa Rainforest Botanical Co-op",
      nameAm: "የካፋ የዝናብ ደን ዕጽዋት ሕብረት ስራ ማህበር",
      region: "South West Ethiopia",
      city: "Bonga",
      isVerified: true,
      rating: 4.95,
    },
    inStock: true,
  },

  // ── 4. PEACE CORE (ኤተር / ጽሞና) ──────────────────────────────────────────
  {
    sku: "HEX-REM-TOS-05",
    core: "Peace",
    coreAm: "ሰላም (Peace)",
    herbNameEn: "Tosign (Thymus serrulatus / Highland Wild Thyme)",
    herbNameAm: "ጦስኝ (ደጋማ የዱር ቲም)",
    scientificName: "Thymus serrulatus",
    preparationType: "dried_cut",
    productTitleEn: "Bale Mountain Organic Tosign Tisane (75g)",
    productTitleAm: "የባሌ ተራራ የተፈጥሮ ጦስኝ ሻይ (75 ግራም)",
    descriptionEn: "High-altitude hand-picked wild thyme rich in thymol, carvacrol, and calming polyphenols.",
    descriptionAm: "ከባሌ ተራሮች በንጽህና የተለቀመ የመረጋጋትና የጉንፋን መከላከያ ጦስኝ።",
    therapeuticSynergyEn: "Nervous system soothing, evening tranquility, gentle meditative stillness.",
    therapeuticSynergyAm: "የነርቭ ስርዓትን ያረጋጋል፣ ለጥልቅ እንቅልፍ ይረዳል፣ መንፈሳዊ ሰላምን ያጎናጽፋል።",
    suggestedRitualEn: "Steep 1 tablespoon in 95°C water for 7 minutes at twilight; inhale aromatic steam.",
    suggestedRitualAm: "አንድ የሾርባ ማንኪያ በፈላ ውሃ ውስጥ ለ7 ደቂቃ ዘፍዝፈው ምሽት ላይ ይጠጡት።",
    safetyCautionEn: "Gentle restorative tea. Safe for all adults.",
    safetyCautionAm: "ለስላሳ የባህል ሻይ፤ ለሁሉም አዋቂዎች ተስማሚ ነው።",
    priceEtb: 220,
    priceUsd: 7.0,
    unit: "75g resealable bag",
    vendor: {
      id: "v-bale-04",
      businessSlug: "bale-alpine-herbs",
      nameEn: "Bale Alpine Traditional Herbs",
      nameAm: "የባሌ ተራሮች ባህላዊ ቅመሞች",
      region: "Oromia",
      city: "Robe",
      isVerified: true,
      rating: 4.9,
    },
    inStock: true,
  },

  // ── 5. SPIRIT CORE (ነፋስ / መንፈስ) ─────────────────────────────────────────
  {
    sku: "HEX-REM-ITN-06",
    core: "Spirit",
    coreAm: "መንፈስ (Spirit)",
    herbNameEn: "Itan / Lubanj (Boswellia papyrifera / Frankincense)",
    herbNameAm: "ዕጣን (ቦስዌሊያ)",
    scientificName: "Boswellia papyrifera",
    preparationType: "fumigation_incense",
    productTitleEn: "Tigray Sacred Grade-1 Coptic Frankincense Tears (100g)",
    productTitleAm: "የመጀመሪያ ደረጃ የትግራይ ቤተ-ክርስቲያን ዕጣን (100 ግራም)",
    descriptionEn: "Translucent golden resin tears wild-tapped from ancient Boswellia trees, rich in boswellic acids and incensole acetate.",
    descriptionAm: "ከጥንታዊ የቦስዌሊያ ዛፎች የተሰበሰበ ንጹህ የወርቅ ቀለም ያለው የቤተ-ክርስቲያን ዕጣን።",
    therapeuticSynergyEn: "Atmospheric sanctification, neuro-protective calming, spiritual transcendence, elevating brain alpha waves.",
    therapeuticSynergyAm: "አየርን ያጸዳል፣ መንፈስን ወደ ላቀ ጸሎትና ማሰላሰል ያደርሳል፣ ሰላምን ያሰፍናል።",
    suggestedRitualEn: "Place 2 resin tears upon natural glowing coconut charcoal during prayer, meditation, or Hexacore reflection.",
    suggestedRitualAm: "በጸሎት ወይም በማሰላሰል ጊዜ በጋለ ከሰል ላይ አድርገው መዓዛውን ያጣጥሙ።",
    safetyCautionEn: "Aromatic fumigation use only. Ensure adequate ventilation in enclosed rooms.",
    safetyCautionAm: "ለማጠን ብቻ የሚውል፤ በቂ አየር ባለው ክፍል ውስጥ ይጠቀሙ።",
    priceEtb: 340,
    priceUsd: 11.5,
    unit: "100g linen sack",
    vendor: {
      id: "v-gondar-02",
      businessSlug: "gondar-heritage-herbarium",
      nameEn: "Gondar Heritage Herbarium",
      nameAm: "የጎንደር ጥንታዊ ዕጽዋት አውደ-ጥናት",
      region: "Amhara",
      city: "Gondar",
      isVerified: true,
      rating: 4.85,
    },
    inStock: true,
  },

  // ── 6. ORDER CORE (ብረት / ስርዓት) ──────────────────────────────────────────
  {
    sku: "HEX-REM-KRB-07",
    core: "Order",
    coreAm: "ስርዓት (Order)",
    herbNameEn: "Karbe / Myrrh (Commiphora myrrha)",
    herbNameAm: "ከርቤ (ኮሚፎራ ሚርሀ)",
    scientificName: "Commiphora myrrha",
    preparationType: "fumigation_incense",
    productTitleEn: "Wild Ogaden Red Myrrh Resin (80g)",
    productTitleAm: "የሶማሌ/ኦጋዴን ንጹህ ቀይ ከርቤ (80 ግራም)",
    descriptionEn: "Deep ruby oleo-gum-resin wild-harvested in dry savannah woodlands, known for grounding discipline and somatic protection.",
    descriptionAm: "ከቆላማው የሶማሌ ክልል የተሰበሰበ ጥልቅ ቀይ የተፈጥሮ ከርቤ።",
    therapeuticSynergyEn: "Structural boundaries, anti-microbial barrier resilience, grounding cosmic order into physical reality.",
    therapeuticSynergyAm: "የሰውነትን የበሽታ መከላከያ ያጠናክራል፣ ሥርዓትና ጥንካሬን በህይወት ውስጥ ያሰፍናል።",
    suggestedRitualEn: "Burn alongside Frankincense at sunset on Mondays and Fridays to seal personal energy boundaries.",
    suggestedRitualAm: "ከሰኞና ዓርብ ጀምበር መጥለቂያ ላይ ከዕጣን ጋር አዋህደው ያጭሱት።",
    safetyCautionEn: "External and fumigation use. Not for internal consumption during pregnancy.",
    safetyCautionAm: "ለማጠንና ለውጫዊ አጠቃቀም ብቻ፤ በእርግዝና ወቅት አይወሰድም።",
    priceEtb: 360,
    priceUsd: 12.0,
    unit: "80g linen pouch",
    vendor: {
      id: "v-entoto-01",
      businessSlug: "entoto-botanical-apothecary",
      nameEn: "Entoto Botanical Apothecary",
      nameAm: "የእንጦጦ ባህላዊ መድኃኒት መደብር",
      region: "Addis Ababa",
      city: "Addis Ababa",
      isVerified: true,
      rating: 4.9,
    },
    inStock: true,
  },
];

/**
 * Retrieves matching commercial remedies for a specific Hexacore core
 */
export function getCommercialRemediesForCore(coreName: string): HexacoreRemedyOffering[] {
  const normalized = coreName.trim().toLowerCase();
  return HEXACORE_COMMERCIAL_REMEDIES.filter(
    (rem) => rem.core.toLowerCase() === normalized
  );
}

/**
 * Resolves a plant correspondence keyword to the best matching marketplace remedy
 */
export function resolveHerbCrossSell(herbQuery: string): HexacoreRemedyOffering | null {
  if (!herbQuery) return null;
  const q = herbQuery.toLowerCase();

  return (
    HEXACORE_COMMERCIAL_REMEDIES.find(
      (rem) =>
        rem.herbNameEn.toLowerCase().includes(q) ||
        rem.herbNameAm.includes(q) ||
        rem.scientificName.toLowerCase().includes(q)
    ) ?? null
  );
}
