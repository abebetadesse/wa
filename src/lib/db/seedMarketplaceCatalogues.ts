import { db } from "./index";
import { businessCategories, serviceKinds } from "./schema";
import { keepExisting } from "./write";

const categories: (typeof businessCategories.$inferInsert)[] = [
  { slug: "herbalist", name: "Herbalist", nameAm: "የባህል መድኃኒት አዋቂ", sector: "healing", icon: "leaf", sortOrder: 10, description: "Preparation of traditional herbal remedies and guidance on their safe use." },
  { slug: "debtera", name: "Debtera", nameAm: "ደብተራ", sector: "healing", icon: "scroll", sortOrder: 20, description: "Ge'ez scholarship, Awde Negest readings, prayers and protective scrolls." },
  { slug: "bone-setter", name: "Bone setter", nameAm: "ወጌሻ", sector: "healing", icon: "hand", sortOrder: 30, description: "Traditional bone setting and bodywork for sprains and minor injuries." },
  { slug: "spiritual-guide", name: "Spiritual guide", nameAm: "መንፈሳዊ አማካሪ", sector: "healing", icon: "sparkles", sortOrder: 40, description: "Spiritual counsel, reflection and life-direction guidance." },
  { slug: "bodywork", name: "Traditional bodywork", nameAm: "ባህላዊ ማሸት", sector: "healing", icon: "heart-handshake", sortOrder: 50, description: "Massage, steam and other traditional bodywork." },
  { slug: "artisan", name: "Artisan & crafts", nameAm: "የእጅ ጥበብ", sector: "cultural", icon: "palette", sortOrder: 60, description: "Weaving, pottery, basketry, jewellery and other handmade crafts." },
  { slug: "coffee-ceremony", name: "Coffee ceremony", nameAm: "የቡና ሥነ ሥርዓት", sector: "cultural", icon: "coffee", sortOrder: 70, description: "Coffee ceremony hosting for homes, offices and events." },
  { slug: "music-dance", name: "Music & dance", nameAm: "ሙዚቃና ውዝዋዜ", sector: "cultural", icon: "music", sortOrder: 80, description: "Traditional music, dance performance and lessons." },
  { slug: "ceremony-events", name: "Ceremonies & events", nameAm: "ሥነ ሥርዓትና ዝግጅት", sector: "cultural", icon: "calendar-heart", sortOrder: 90, description: "Weddings, holidays and cultural event planning." },
  { slug: "language-manuscripts", name: "Ge'ez & manuscripts", nameAm: "ግዕዝና ብራና", sector: "cultural", icon: "book-open", sortOrder: 100, description: "Ge'ez lessons, calligraphy and manuscript work." },
  { slug: "heritage-tours", name: "Heritage tours", nameAm: "የቅርስ ጉብኝት", sector: "cultural", icon: "map", sortOrder: 110, description: "Guided visits to heritage sites and living traditions." },
  { slug: "hexacore-practitioner", name: "Hexacore practitioner", nameAm: "ሄክሳኮር ልምምድ", sector: "healing", icon: "hexagon", sortOrder: 55, description: "Practitioners who combine the Hexacore six-core reflection system with body-sign readings (tongue, palm, face) and symbolic guidance. Sessions are reflective and educational, not a medical diagnosis." },
];

const kinds: (typeof serviceKinds.$inferInsert)[] = [
  { slug: "consultation", name: "Consultation", nameAm: "ምክክር", requiresSafetyScreen: false, caseDomain: null, sortOrder: 10, description: "A one-to-one session." },
  { slug: "remedy-preparation", name: "Remedy preparation", nameAm: "የመድኃኒት ዝግጅት", requiresSafetyScreen: true, caseDomain: null, sortOrder: 20, description: "A remedy prepared for the client; the safety screen checks medicines and pregnancy." },
  { slug: "bodywork-session", name: "Bodywork session", nameAm: "የሰውነት ሕክምና", requiresSafetyScreen: true, caseDomain: null, sortOrder: 30, description: "Hands-on session; the safety screen checks injuries and conditions first." },
  { slug: "reading", name: "Reading", nameAm: "ንባብ", requiresSafetyScreen: false, caseDomain: "spiritual", sortOrder: 40, description: "Awde Negest or name reading, reviewed by the practitioner." },
  { slug: "life-direction-review", name: "Life direction review", nameAm: "የሕይወት አቅጣጫ ግምገማ", requiresSafetyScreen: false, caseDomain: "career", sortOrder: 50, description: "A written review of career or life direction." },
  { slug: "ceremony", name: "Ceremony", nameAm: "ሥነ ሥርዓት", requiresSafetyScreen: false, caseDomain: null, sortOrder: 60, description: "A ceremony or blessing held for the client." },
  { slug: "class", name: "Class or workshop", nameAm: "ትምህርት", requiresSafetyScreen: false, caseDomain: null, sortOrder: 70, description: "Lessons for individuals or groups." },
  { slug: "commission", name: "Commission", nameAm: "ትዕዛዝ", requiresSafetyScreen: false, caseDomain: null, sortOrder: 80, description: "A made-to-order piece (craft, scroll, garment)." },
  { slug: "event-service", name: "Event service", nameAm: "የዝግጅት አገልግሎት", requiresSafetyScreen: false, caseDomain: null, sortOrder: 90, description: "Hosting or performing at an event." },
  { slug: "hexacore-reading", name: "Hexacore reading", nameAm: "ሄክሳኮር ንባብ", requiresSafetyScreen: false, caseDomain: "spiritual", sortOrder: 60, description: "Full six-core Hexacore Arcana session: core mapping, archetype identification, frequency analysis, correspondences and journaling guidance." },
  { slug: "tongue-reading", name: "Tongue reading", nameAm: "የምላስ ንባብ", requiresSafetyScreen: false, caseDomain: null, sortOrder: 61, description: "Traditional body-sign assessment of tongue surface, colour, coat and shape. Offered as reflective and educational content; not a medical diagnosis." },
  { slug: "palm-reading", name: "Palm reading", nameAm: "የእጅ መስመር ንባብ", requiresSafetyScreen: false, caseDomain: null, sortOrder: 62, description: "Cultural and reflective reading of hand lines, mounts and finger shape, drawing on Ethiopian hand-reading traditions and comparative palmistry." },
  { slug: "face-reading", name: "Face reading & biometrics", nameAm: "የፊት ንባብ", requiresSafetyScreen: false, caseDomain: null, sortOrder: 63, description: "Facial zone, feature and expression mapping using traditional physiognomy and modern biometric pattern reference. Covers forehead, eye, nose, mouth and ear zones. Reflective only — not a medical or forensic assessment." },
  { slug: "body-sign-reading", name: "Body-sign reading", nameAm: "የሰውነት ምልክት ንባብ", requiresSafetyScreen: false, caseDomain: null, sortOrder: 64, description: "Combined reading that may include tongue, palm, face and posture patterns as traditional body-sign indicators. Always framed as reflection, never diagnosis." },
];

/** Restores the built-in catalogue from the original marketplace migrations without overwriting admin edits. */
export async function seedMarketplaceCatalogues() {
  await db.transaction(async (tx) => {
    await tx.insert(businessCategories).values(categories).onDuplicateKeyUpdate({ set: keepExisting(businessCategories) });
    await tx.insert(serviceKinds).values(kinds).onDuplicateKeyUpdate({ set: keepExisting(serviceKinds) });
  });
  return { categories: categories.length, serviceKinds: kinds.length };
}
