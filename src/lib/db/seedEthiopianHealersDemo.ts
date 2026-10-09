import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { and, eq } from "drizzle-orm";
import { db, dbClient } from "./index";
import { businessCategories, businessMembers, businesses, serviceKinds, services, users } from "./schema";

const SAMPLE_MARKER = "[DEMO SAMPLE]";
const COUNT = 50;

const owners = [
  ["Abebe Tadesse", "አበበ ታደሰ"], ["Almaz Bekele", "አልማዝ በቀለ"], ["Dawit Mengistu", "ዳዊት መንግስቱ"],
  ["Hana Alemu", "ሀና አለሙ"], ["Kebede Girma", "ከበደ ግርማ"], ["Mekdes Haile", "መቅደስ ኃይሌ"],
  ["Tesfaye Worku", "ተስፋዬ ወርቁ"], ["Senait Fikru", "ሰናይት ፍቅሩ"], ["Getachew Assefa", "ጌታቸው አሰፋ"],
  ["Tigist Kebede", "ትዕግስት ከበደ"], ["Yohannes Kassa", "ዮሐንስ ካሳ"], ["Mulu Alemayehu", "ሙሉ አለማየሁ"],
  ["Biruk Demissie", "ብሩክ ደምሴ"], ["Hiwot Tamiru", "ህይወት ታምሩ"], ["Solomon Abebe", "ሰሎሞን አበበ"],
  ["Rahel Girma", "ራሄል ግርማ"], ["Fikru Tesema", "ፍቅሩ ተሰማ"], ["Wubit Lemma", "ውብት ለማ"],
  ["Mihret Desta", "ምህረት ደስታ"], ["Kassahun Mamo", "ካሳሁን ማሞ"], ["Eyerusalem Wolde", "ኢየሩሳሌም ወልዴ"],
  ["Biniam Berhe", "ቢንያም በርሄ"], ["Aster Kebede", "አስቴር ከበደ"], ["Mulugeta Shiferaw", "ሙሉጌታ ሽፈራው"],
  ["Liya Tesfahun", "ሊያ ተስፋሁን"], ["Girma Wolde", "ግርማ ወልዴ"], ["Martha Assefa", "ማርታ አሰፋ"],
  ["Tewodros Fenta", "ቴዎድሮስ ፈንታ"], ["Selamawit Kassa", "ሰላማዊት ካሳ"], ["Eshetu Bekele", "እሸቱ በቀለ"],
  ["Hirut Desta", "ሂሩት ደስታ"], ["Abel Mebratu", "አቤል መብራቱ"], ["Tsehay Ayele", "ፀሃይ አየለ"],
  ["Wondimu Kassaye", "ወንድሙ ካሳዬ"], ["Mimi Seifu", "ሚሚ ሰይፉ"], ["Yared Asfaw", "ያሬድ አስፋው"],
  ["Emebet Fikre", "እመቤት ፍቅረ"], ["Nebiyu Solomon", "ነቢዩ ሰሎሞን"], ["Genet Mekonnen", "ገነት መኮንን"],
  ["Amanuel Tesfaye", "አማኑኤል ተስፋዬ"], ["Tsige Mamo", "ፅጌ ማሞ"], ["Kiros Hailu", "ኪሮስ ኃይሉ"],
  ["Mahlet Kebede", "ማህሌት ከበደ"], ["Fasil Abate", "ፋሲል አባተ"], ["Yeshimebet Alemu", "የሽመቤት አለሙ"],
  ["Samuel Girma", "ሳሙኤል ግርማ"], ["Meseret Tadesse", "መሰረት ታደሰ"], ["Demeke Worku", "ደመቀ ወርቁ"],
  ["Alemnesh Fikru", "አለምነሽ ፍቅሩ"], ["Mekonnen Desta", "መኮንን ደስታ"],
] as const;

const locations = [
  ["Addis Ababa", "Addis Ababa"], ["Bahir Dar", "Amhara"], ["Gondar", "Amhara"], ["Dessie", "Amhara"],
  ["Debre Markos", "Amhara"], ["Lalibela", "Amhara"], ["Woldia", "Amhara"], ["Debre Birhan", "Amhara"],
  ["Mekelle", "Tigray"], ["Adigrat", "Tigray"], ["Axum", "Tigray"], ["Shire", "Tigray"],
  ["Hawassa", "Sidama"], ["Dilla", "Sidama"], ["Yirgalem", "Sidama"], ["Arba Minch", "South Ethiopia"],
  ["Wolaita Sodo", "South Ethiopia"], ["Jinka", "South Ethiopia"], ["Hosaena", "Central Ethiopia"], ["Bonga", "Southwest Ethiopia"],
  ["Jimma", "Oromia"], ["Nekemte", "Oromia"], ["Adama", "Oromia"], ["Bishoftu", "Oromia"],
  ["Shashamane", "Oromia"], ["Harar", "Harari"], ["Dire Dawa", "Dire Dawa"], ["Jijiga", "Somali"],
  ["Gode", "Somali"], ["Assosa", "Benishangul-Gumuz"], ["Bambasi", "Benishangul-Gumuz"], ["Gambela", "Gambela"],
  ["Mizan Aman", "Southwest Ethiopia"], ["Metu", "Oromia"], ["Ambo", "Oromia"], ["Goba", "Oromia"],
  ["Debre Tabor", "Amhara"], ["Kombolcha", "Amhara"], ["Finote Selam", "Amhara"], ["Wukro", "Tigray"],
  ["Shashemene", "Oromia"], ["Mettu", "Oromia"], ["Agaro", "Oromia"], ["Bedele", "Oromia"],
  ["Wendo", "Sidama"], ["Butajira", "Central Ethiopia"], ["Worabe", "Central Ethiopia"], ["Dembi Dolo", "Oromia"],
  ["Kebri Dehar", "Somali"], ["Ginir", "Oromia"],
] as const;

const traditions = [
  {
    category: "herbalist",
    label: "Traditional Herbal Knowledge",
    labelAm: "የባህል ዕፅዋት ጥበብ",
    kind: "consultation",
    service: "Traditional herbal knowledge consultation",
    serviceAm: "የባህል ዕፅዋት ምክክር",
    modes: ["in_person", "video"],
    rate: 180,
  },
  {
    category: "debtera",
    label: "Debtera Manuscript Wisdom",
    labelAm: "የደብተራ ብራና ጥበብ",
    kind: "consultation",
    service: "Ge'ez manuscript and Awde Negest reflection",
    serviceAm: "የግዕዝ ብራናና አውደ ነገሥት ምክክር",
    modes: ["in_person", "video", "voice"],
    rate: 250,
  },
  {
    category: "bone-setter",
    label: "Wogesha Traditional Bodywork",
    labelAm: "ወጌሻ ባህላዊ የሰውነት እንክብካቤ",
    kind: "bodywork-session",
    service: "Wogesha bodywork tradition consultation",
    serviceAm: "የወጌሻ ልምድ ምክክር",
    modes: ["in_person"],
    rate: 300,
  },
  {
    category: "spiritual-guide",
    label: "Community Spiritual Guidance",
    labelAm: "የማኅበረሰብ መንፈሳዊ ምክር",
    kind: "consultation",
    service: "Traditional spiritual guidance and reflection",
    serviceAm: "ባህላዊ መንፈሳዊ ምክክር",
    modes: ["in_person", "video", "voice"],
    rate: 200,
  },
  {
    category: "bodywork",
    label: "Traditional Bodywork",
    labelAm: "ባህላዊ የሰውነት እንክብካቤ",
    kind: "bodywork-session",
    service: "Traditional bodywork and wellness session",
    serviceAm: "ባህላዊ የሰውነት እንክብካቤ ክፍለ ጊዜ",
    modes: ["in_person", "home_visit"],
    rate: 280,
  },
] as const;

const backgrounds = [
  "Introductory community apprenticeship; sample profile does not claim formal certification.",
  "Several years of family-taught practice; mentor and experience details are fictional examples.",
  "Longstanding community tradition with peer learning; no institution or credential is being represented as verified.",
  "Advanced sample profile with intergenerational teaching experience; illustrative only, not an authenticated qualification.",
  "Senior sample tradition-keeper profile with workshop experience; all background details are fictional and unverified.",
] as const;

function assertLocalDevelopmentTarget() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed demo profiles when NODE_ENV=production.");
  if (!process.argv.includes("--confirm-demo-data") || !process.argv.includes("--approve-demo")) {
    throw new Error("Pass both --confirm-demo-data and --approve-demo to seed clearly labeled local demo profiles.");
  }
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    const hostname = new URL(connectionString).hostname;
    if (!new Set(["localhost", "127.0.0.1", "::1", "[::1]"]).has(hostname)) {
      throw new Error(`Refusing non-local database host '${hostname}'. This seed is local-development only.`);
    }
  }
}

async function seed() {
  assertLocalDevelopmentTarget();
  if (owners.length !== COUNT || locations.length !== COUNT) throw new Error("Demo fixture data must contain exactly 50 owners and locations.");

  const categoryRows = await db.select().from(businessCategories);
  const categories = new Map(categoryRows.map((row) => [row.slug, row]));
  const kindRows = await db.select().from(serviceKinds);
  const kinds = new Map(kindRows.map((row) => [row.slug, row]));
  for (const tradition of traditions) {
    if (!categories.has(tradition.category) || !kinds.has(tradition.kind)) {
      throw new Error(`Missing marketplace category '${tradition.category}' or service kind '${tradition.kind}'. Run npm run db:setup first.`);
    }
  }

  const currentUsers = new Map<string, typeof users.$inferSelect>();
  const currentBusinesses = new Map<string, typeof businesses.$inferSelect>();
  for (let index = 0; index < COUNT; index++) {
    const number = String(index + 1).padStart(2, "0");
    const email = `ethiopian-healer-demo-${number}@example.invalid`;
    const slug = `ethiopian-healer-demo-${number}`;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
    if (user && user.notes !== SAMPLE_MARKER) throw new Error(`Reserved demo email ${email} belongs to a non-demo user; refusing to modify it.`);
    if (business && (!business.description?.startsWith(SAMPLE_MARKER) || business.ownerId !== user?.id)) {
      throw new Error(`Reserved demo listing ${slug} is not owned by its marked demo account; refusing to modify it.`);
    }
    if (business?.status === "suspended") throw new Error(`Demo listing ${slug} is suspended; refusing to reactivate it.`);
    if (user) currentUsers.set(email, user);
    if (business) currentBusinesses.set(slug, business);
  }

  await db.transaction(async (tx) => {
    for (let index = 0; index < COUNT; index++) {
      const number = String(index + 1).padStart(2, "0");
      const email = `ethiopian-healer-demo-${number}@example.invalid`;
      const slug = `ethiopian-healer-demo-${number}`;
      const [ownerName, ownerNameAm] = owners[index];
      const [city, region] = locations[index];
      const tradition = traditions[index % traditions.length];
      const tier = Math.floor(index / 10);
      const category = categories.get(tradition.category)!;
      const kindId = kinds.get(tradition.kind)!.id;
      const profileDescription = [
        SAMPLE_MARKER,
        "Fictional local-development profile. This is not a real healer, business, credential, endorsement, or service offer.",
        `Tradition: ${tradition.label}.`,
        `Illustrative background: ${backgrounds[tier]}`,
        "No medical diagnosis or treatment is offered. Seek a licensed clinician for health concerns; traditional practices are not a substitute for medical care.",
      ].join(" ");
      let owner = currentUsers.get(email);
      if (!owner) {
        const ownerId = randomUUID();
        await tx.insert(users).values({
          id: ownerId,
          email,
          name: ownerName,
          role: "user",
          preferredLanguage: "am",
          notes: SAMPLE_MARKER,
          tags: ["demo-data", "fictional-healer"],
        });
        [owner] = await tx.select().from(users).where(eq(users.id, ownerId)).limit(1);
        if (!owner) throw new Error(`Could not create demo owner ${email}.`);
        currentUsers.set(email, owner);
      } else if (owner.name !== ownerName) {
        await tx.update(users).set({ name: ownerName, updatedAt: new Date() }).where(eq(users.id, owner.id));
      }

      let business = currentBusinesses.get(slug);
      const profile = {
        name: `${ownerName} · ${tradition.label}`,
        nameAm: `${ownerNameAm} · ${tradition.labelAm}`,
        tagline: `${SAMPLE_MARKER} ${backgrounds[tier]} · ${city}, ${region}`,
        description: profileDescription,
        region,
        city,
        address: `Sample location · ${city}`,
        email,
        languages: ["am", "en"],
        deliveryModes: [...tradition.modes],
        categoryId: category.id,
        verification: {
          reviewedAt: new Date(0).toISOString(),
          notes: "Demo listing approved for local search testing only. No credentials or identity were checked.",
          credentials: [{ label: `Illustrative sample background only: ${backgrounds[tier]}` }],
        },
        status: "verified",
      };
      if (!business) {
        const businessId = randomUUID();
        await tx.insert(businesses).values({ id: businessId, slug, ownerId: owner.id, ...profile });
        [business] = await tx.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
        if (!business) throw new Error(`Could not create demo business ${slug}.`);
        currentBusinesses.set(slug, business);
      } else {
        await tx.update(businesses).set({ ...profile, updatedAt: new Date() }).where(eq(businesses.id, business.id));
      }

      await tx.insert(businessMembers).values({
        businessId: business.id,
        userId: owner.id,
        role: "owner",
        title: tradition.label,
        isBookable: true,
      }).onDuplicateKeyUpdate({ set: { title: tradition.label, isBookable: true, updatedAt: new Date() } });

      const serviceName = `${tradition.service} · ${city} · Sample ${number}`;
      const [existingService] = await tx.select({ id: services.id }).from(services)
        .where(and(eq(services.businessId, business.id), eq(services.name, serviceName))).limit(1);
      const service = {
        businessId: business.id,
        kindId,
        name: serviceName,
        nameAm: tradition.serviceAm,
        description: `${SAMPLE_MARKER} Fictional searchable sample service; not a real offer. ${backgrounds[tier]}`,
        durationMinutes: 45,
        priceEtb: String(tradition.rate + (index % 5) * 25 + tier * 20),
        deliveryModes: [...tradition.modes],
        bufferMinutes: 0,
        isActive: true,
        sortOrder: 0,
      };
      if (existingService) {
        await tx.update(services).set({ ...service, updatedAt: new Date() }).where(eq(services.id, existingService.id));
      } else {
        await tx.insert(services).values(service);
      }
    }
  });

  console.log(`Seeded ${COUNT} clearly labeled fictional Ethiopian healer profiles for local marketplace search.`);
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMainModule) {
  seed().then(() => dbClient.end({ timeout: 2 })).catch(async (error) => {
    console.error(error);
    await dbClient.end({ timeout: 2 });
    process.exitCode = 1;
  });
}
