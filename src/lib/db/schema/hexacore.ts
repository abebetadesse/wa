import { mysqlTable, uuid, varchar, text, timestamp, jsonb, integer, boolean, primaryKey, numeric } from "../mysqlSchema";
import { users } from "./users";
import { bookings } from "./marketplace";

export type HexacoreCoreCode = "P" | "H" | "C" | "E" | "S" | "O";
export type EthiopianSeason = "kiremt" | "tseday" | "bega" | "belg";

export const hexacoreAspects = mysqlTable("hexacore_aspects", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  nameAm: varchar("name_am", { length: 80 }),
  expression: text("expression"),
  bodyZone: varchar("body_zone", { length: 80 }),
  frequencyHz: integer("frequency_hz"),
  shadow: varchar("shadow", { length: 100 }),
  gift: varchar("gift", { length: 100 }),
  displayOrder: integer("display_order").notNull(),
});

export const hexacorePractices = mysqlTable("hexacore_practices", {
  id: uuid("id").primaryKey().defaultRandom(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  aspectCode: varchar("aspect_code", { length: 3 }),
  type: varchar("type", { length: 30 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  nameAm: varchar("name_am", { length: 120 }),
  instruction: text("instruction").notNull(),
  durationMin: integer("duration_min"),
  timeOfDay: varchar("time_of_day", { length: 30 }),
  soundHz: integer("sound_hz"),
  herbId: uuid("herb_id"),
  references: jsonb("references").$type<string[]>().default([]).notNull(),
});

export const hexacoreJournal = mysqlTable("hexacore_journal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  selectedCore: varchar("selected_core", { length: 1 }).$type<HexacoreCoreCode>(),
  selectedAspect: varchar("selected_aspect", { length: 3 }),
  prompt: text("prompt"),
  response: text("response"),
  mood: integer("mood"),
  practiceCompleted: jsonb("practice_completed").$type<string[]>().default([]).notNull(),
  frequenciesSnapshot: jsonb("frequencies_snapshot").$type<Record<string, number>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacorePracticeLog = mysqlTable("hexacore_practice_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  practiceId: uuid("practice_id").references(() => hexacorePractices.id, { onDelete: "cascade" }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  durationSec: integer("duration_sec"),
  notes: text("notes"),
});

export const hexacoreFrequencyHistory = mysqlTable("hexacore_frequency_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  frequencies: jsonb("frequencies").$type<Record<HexacoreCoreCode, number>>().notNull(),
  dominantCore: varchar("dominant_core", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  source: varchar("source", { length: 50 }).notNull(),
});

export const hexacoreCircles = mysqlTable("hexacore_circles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false).notNull(),
  maxMembers: integer("max_members").default(12).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacoreCircleMembers = mysqlTable("hexacore_circle_members", {
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  memberKey: primaryKey({ columns: [table.circleId, table.userId] }),
}));

export const hexacoreCirclePosts = mysqlTable("hexacore_circle_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  body: text("body").notNull(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>(),
  aspectCode: varchar("aspect_code", { length: 3 }),
  frequenciesAtPost: jsonb("frequencies_at_post").$type<Record<string, number>>(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacoreCircleReactions = mysqlTable("hexacore_circle_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => hexacoreCirclePosts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  kind: varchar("kind", { length: 30 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacoreCircleInvites = mysqlTable("hexacore_circle_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  invitedEmail: varchar("invited_email", { length: 255 }),
  invitedUserId: uuid("invited_user_id").references(() => users.id, { onDelete: "set null" }),
  token: varchar("token", { length: 80 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── COMMERCIAL & BUSINESS TABLES ─────────────────────────────────────────────

export type HexacoreProductTier = "free" | "standard" | "premium" | "subscription" | "session";

export interface HexacoreProductFeature {
  textEn: string;
  textAm: string;
  highlight?: boolean;
}

export interface HexacoreCommercialProduct {
  id?: string;
  code: string;
  name: string;
  nameAm?: string | null;
  tagline?: string | null;
  taglineAm?: string | null;
  description?: string | null;
  descriptionAm?: string | null;
  priceEtb: string | number;
  priceUsd: string | number;
  tier: HexacoreProductTier;
  features: HexacoreProductFeature[];
  badgeEn?: string | null;
  badgeAm?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const hexacoreProducts = mysqlTable("hexacore_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 140 }).notNull(),
  nameAm: varchar("name_am", { length: 140 }),
  tagline: varchar("tagline", { length: 240 }),
  taglineAm: varchar("tagline_am", { length: 240 }),
  description: text("description"),
  descriptionAm: text("description_am"),
  priceEtb: numeric("price_etb", { precision: 12, scale: 2 }).notNull(),
  priceUsd: numeric("price_usd", { precision: 8, scale: 2 }).notNull(),
  tier: varchar("tier", { length: 30 }).$type<HexacoreProductTier>().notNull(),
  features: jsonb("features").$type<HexacoreProductFeature[]>().default([]).notNull(),
  badgeEn: varchar("badge_en", { length: 60 }),
  badgeAm: varchar("badge_am", { length: 60 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hexacorePurchases = mysqlTable("hexacore_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 30 }).notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  clientEmail: varchar("client_email", { length: 255 }),
  clientName: varchar("client_name", { length: 160 }),
  clientPhone: varchar("client_phone", { length: 40 }),
  productId: uuid("product_id").references(() => hexacoreProducts.id, { onDelete: "restrict" }).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  amountPaidEtb: numeric("amount_paid_etb", { precision: 12, scale: 2 }).notNull(),
  amountPaidUsd: numeric("amount_paid_usd", { precision: 8, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 40 }).notNull(),
  paymentReference: varchar("payment_reference", { length: 140 }),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  clientIntake: jsonb("client_intake").$type<Record<string, unknown>>(),
  unlockedPayload: jsonb("unlocked_payload").$type<Record<string, unknown>>(),
  proofUrl: text("proof_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hexacoreSubscriptions = mysqlTable("hexacore_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plan: varchar("plan", { length: 40 }).notNull(),
  status: varchar("status", { length: 30 }).default("active").notNull(),
  amountEtb: numeric("amount_etb", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 40 }).notNull(),
  renewsAt: timestamp("renews_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Default Commercial Product Catalog (fallback & seeding reference)
export const HEXACORE_DEFAULT_PRODUCTS = [
  {
    code: "free_preview",
    name: "Hexacore Celestial Preview",
    nameAm: "የሄክሳኮር መሰረታዊ እይታ",
    tagline: "Explore the 3 outer cores & current Ethiopian seasonal shift",
    taglineAm: "3ቱን ዋና ማዕከላት እና የወቅቱን የኢትዮጵያ ለውጥ በነጻ ይቃኙ",
    description: "Free celestial reflection exploring primary active cores and planetary alignments.",
    descriptionAm: "የ3ቱን ዋና ማዕከላት ሚዛንና ወቅታዊ መመሪያን በነጻ የሚቃኙበት።",
    priceEtb: "0.00",
    priceUsd: "0.00",
    tier: "free" as const,
    badgeEn: "Free Access",
    badgeAm: "ነጻ መዳረሻ",
    sortOrder: 1,
    features: [
      { textEn: "Interactive 3D Celestial Orrery (Layers 1–3)", textAm: "ተንቀሳቃሽ የኦረሪ እይታ (ደረጃ 1-3)", highlight: true },
      { textEn: "Dominant Core & Aspect Identification", textAm: "የቀዳሚ ማዕከል መለያ" },
      { textEn: "Current Ethiopian Season Shift (Kiremt/Tseday/Bega/Belg)", textAm: "ወቅታዊ የኢትዮጵያ ወቅት መመሪያ" },
      { textEn: "Basic Daily Journal Prompt", textAm: "የቀን ማሰላሰያ ጥያቄ" },
    ],
  },
  {
    code: "natal_dossier",
    name: "Complete 14-Layer Natal Arcana Dossier",
    nameAm: "የተሟላ የ14-ደረጃ የልደት አርካና ማህደር",
    tagline: "Full numerology, archetypes, initiation trials, and exportable PDF dossier",
    taglineAm: "ሙሉ የቁጥር ስሌት፣ ጥንታዊ ምልክቶች፣ የህይወት ፈተናዎች እና የሚወርድ ፒዲኤፍ ማህደር",
    description: "The definitive personal wisdom blueprint decoding all 14 layers, 6-based numerology, personal solfeggio audio frequency, and custom botanical formulations.",
    descriptionAm: "ሁሉንም 14 የጥበብ ደረጃዎች፣ የኢትዮጵያ ዕጽዋት ቀመሞች፣ የድምፅ ፍሪኩዌንሲ እና የህይወት መንገድን የያዘ ጥልቅ ማህደር።",
    priceEtb: "450.00",
    priceUsd: "14.99",
    tier: "standard" as const,
    badgeEn: "Most Popular",
    badgeAm: "ተመራጭ ማህደር",
    sortOrder: 2,
    features: [
      { textEn: "Complete 14-Layer Arcana Analysis Unlocked", textAm: "ሙሉ 14ቱ የጥበብ ደረጃዎች ተከፍተዋል", highlight: true },
      { textEn: "6-Based Traditional Numerology & Destiny Map", textAm: "በ6 ቁጥር ስሌት የተሰራ የዕጣ-ፈንታ ካርታ" },
      { textEn: "Personal Solfeggio Audio Frequency (Hz)", textAm: "የግል የሶልፌጅዮ ድምፅ ፍሪኩዌንሲ (Hz)" },
      { textEn: "Indigenous Ethiopian Botanical Formulations (Damakesse, Tena Adam)", textAm: "የሀገር በቀል ዕጽዋት ቀመሞች መመሪያ" },
      { textEn: "Genesis Creation-Day Relational Cycles", textAm: "የስነ-ፍጥረት 6ቱ ቀናት ግንኙነቶች" },
      { textEn: "Print-Ready Gold & Obsidian PDF Client Dossier", textAm: "በሚያምር ወርቃማ ዲዛይን የሚወርድ ፒዲኤፍ ማህደር", highlight: true },
    ],
  },
  {
    code: "guided_session",
    name: "1-on-1 Guided Debtera Consultation + Dossier",
    nameAm: "የግል ደብተራ/ባለሙያ የማማከር ክፍለ-ጊዜ + ማህደር",
    tagline: "45-min private video/in-person session with certified traditional wisdom guide",
    taglineAm: "ከባለሙያ ጋር የ45 ደቂቃ የግል ቪዲዮ ወይም በአካል የሚደረግ የንባብ ክፍለ-ጊዜ",
    description: "Personalized reading with an authentic traditional debtera/spiritual guide to interpret your Awde Negast alignment, review family lineage, and formulate custom life direction practices.",
    descriptionAm: "የአውደ-ነገሥት ንባብ፣ የቤተሰብ ትውልድ ጥናት እና የህይወት አቅጣጫ መመሪያዎችን ከባለሙያ ጋር በጥልቀት የሚመረምሩበት።",
    priceEtb: "1200.00",
    priceUsd: "39.99",
    tier: "session" as const,
    badgeEn: "Live Practitioner",
    badgeAm: "የቀጥታ ባለሙያ",
    sortOrder: 3,
    features: [
      { textEn: "45-Minute Private Video or In-Person Session", textAm: "የ45 ደቂቃ የግል የማማከር ክፍለ-ጊዜ", highlight: true },
      { textEn: "Full 14-Layer Dossier Included ($14.99 Value)", textAm: "የተሟላው የ14-ደረጃ ማህደር በነጻ ተካትቷል" },
      { textEn: "Awde Negast & Ge'ez Lineage Interpretation", textAm: "የአውደ-ነገሥትና የብራና ትርጓሜ" },
      { textEn: "Debtera-Endorsed Botanical Formulation Guidance", textAm: "በባለሙያ የተረጋገጠ የባህላዊ ዕጽዋት ምክረ-ሀሳብ" },
      { textEn: "Follow-up Q&A and 30-Day Practice Plan", textAm: "የ30-ቀን የልምምድ እቅድ እና የድጋፍ መመሪያ" },
    ],
  },
  {
    code: "monthly_membership",
    name: "Hexacore Arcana Daily Biorhythm Club",
    nameAm: "የወርሃዊ የሄክሳኮር ባዮሪዝም እና የድምፅ አባልነት",
    tagline: "Daily 30-day journal, solfeggio audio player, and private circle access",
    taglineAm: "ዕለታዊ ማሰላሰያ፣ የሶልፌጅዮ ድምፅ ማጫወቻ እና የህብረት ማህበር መዳረሻ",
    description: "Continuous spiritual and cultural alignment with daily reflection prompts, audio solfeggio sound baths, seasonal shifts tracking, and access to private Hexacore Circles.",
    descriptionAm: "ቀጣይነት ያለው የዕለት ተዕለት መንፈሳዊ ጉዞ፣ የማሰላሰያ ድምፆች፣ እና የግል የጥናት ማህበራት መዳረሻ።",
    priceEtb: "199.00",
    priceUsd: "4.99",
    tier: "subscription" as const,
    badgeEn: "Monthly SaaS",
    badgeAm: "ወርሃዊ ምዝገባ",
    sortOrder: 4,
    features: [
      { textEn: "Daily 30-Day Guided Alignment Journal & Mood Tracking", textAm: "ዕለታዊ የ30-ቀን ማሰላሰያ እና የስሜት መዝገብ", highlight: true },
      { textEn: "Streamable Solfeggio Frequencies (396Hz–963Hz)", textAm: "የተስተካከሉ የሶልፌጅዮ ድምፆች ማጫወቻ" },
      { textEn: "Exclusive Access to Private Hexacore Community Circles", textAm: "የግል የሄክሳኮር ማህበራት ሙሉ መዳረሻ" },
      { textEn: "Automated Seasonal Transition & Planetary Biorhythm Alerts", textAm: "ወቅታዊ የኢትዮጵያ የአየርና የፕላኔቶች ማሳወቂያ" },
      { textEn: "Priority Booking Discounts on Debtera Consultations", textAm: "በባለሙያ ምክክር ላይ ልዩ ቅናሽ" },
    ],
  },
];
