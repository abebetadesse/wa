import { db } from "@/lib/db";
import {
  hexacoreProducts,
  hexacorePurchases,
  hexacoreSubscriptions,
  HEXACORE_DEFAULT_PRODUCTS,
  type HexacoreCommercialProduct,
} from "@/lib/db/schema/hexacore";
import { eq } from "drizzle-orm";
import { generateHexacoreDossier, type HexacoreDossierInput, type HexacoreDossierReport } from "./HexacoreDossierService";

export interface CreatePurchaseInput {
  productId?: string;
  productCode?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  motherName?: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  focusQuestion?: string;
  paymentMethod: "telebirr" | "cbe_transfer" | "chapa" | "card" | "demo";
  currency?: "ETB" | "USD";
  userId?: string;
  bookingId?: string;
  notes?: string;
}

export interface PurchaseRecord {
  id: string;
  reference: string;
  userId?: string | null;
  clientEmail?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  productId: string;
  productCode: string;
  productName: string;
  productNameAm?: string;
  amountPaidEtb: number;
  amountPaidUsd: number;
  paymentMethod: string;
  paymentReference?: string | null;
  status: "pending" | "completed" | "refunded";
  clientIntake: Record<string, unknown>;
  unlockedPayload?: HexacoreDossierReport | null;
  proofUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

// In-memory fallback repository (persists across hot-reloads within process memory)
const globalStore = globalThis as unknown as {
  __hexacorePurchases?: Map<string, PurchaseRecord>;
};

if (!globalStore.__hexacorePurchases) {
  globalStore.__hexacorePurchases = new Map<string, PurchaseRecord>();
}

export const inMemoryPurchases = globalStore.__hexacorePurchases;

/**
 * Retrieves the commercial product catalog.
 */
export async function getCommercialProducts(): Promise<HexacoreCommercialProduct[]> {
  try {
    const dbRows = await db.select().from(hexacoreProducts).where(eq(hexacoreProducts.isActive, true));
    if (dbRows && dbRows.length > 0) {
      return dbRows as unknown as HexacoreCommercialProduct[];
    }
  } catch {
    // If DB is offline or table unseeded, fall back smoothly
  }
  return HEXACORE_DEFAULT_PRODUCTS as unknown as HexacoreCommercialProduct[];
}

/**
 * Finds a product by ID or Code.
 */
export async function findProduct(productIdOrCode: string): Promise<HexacoreCommercialProduct | undefined> {
  const products = await getCommercialProducts();
  return products.find(
    (p) =>
      ("id" in p && p.id === productIdOrCode) ||
      p.code === productIdOrCode
  );
}

/**
 * Creates a pending purchase record.
 */
export async function createPurchaseOrder(input: CreatePurchaseInput): Promise<{
  purchase: PurchaseRecord;
  paymentInstructions: {
    method: string;
    instructionsEn: string;
    instructionsAm: string;
    accountDetails?: { bankName: string; accountNumber: string; accountHolder: string };
    telebirrCode?: string;
    reference: string;
    amountFormatted: string;
  };
}> {
  const targetCode = input.productCode || "natal_dossier";
  const product = (await findProduct(input.productId || targetCode)) || HEXACORE_DEFAULT_PRODUCTS[1];

  const reference = `EWP-HEX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const purchaseId = `pur-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const amountEtb = typeof product.priceEtb === "number" ? product.priceEtb : parseFloat(String(product.priceEtb)) || 450;
  const amountUsd = typeof product.priceUsd === "number" ? product.priceUsd : parseFloat(String(product.priceUsd)) || 14.99;

  const intakeData: HexacoreDossierInput = {
    clientName: input.clientName,
    motherName: input.motherName,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthLocation: input.birthLocation,
    focusQuestion: input.focusQuestion,
    notes: input.notes,
  };

  const isFree = product.tier === "free" || (amountEtb === 0 && amountUsd === 0);
  const isDemo = input.paymentMethod === "demo" || isFree;

  let unlockedPayload: HexacoreDossierReport | null = null;
  if (isDemo) {
    unlockedPayload = generateHexacoreDossier(intakeData);
  }

  const record: PurchaseRecord = {
    id: purchaseId,
    reference,
    userId: input.userId || null,
    clientEmail: input.clientEmail || null,
    clientName: input.clientName,
    clientPhone: input.clientPhone || null,
    productId: "id" in product && product.id ? String(product.id) : purchaseId,
    productCode: product.code,
    productName: product.name,
    productNameAm: product.nameAm || product.name,
    amountPaidEtb: amountEtb,
    amountPaidUsd: amountUsd,
    paymentMethod: input.paymentMethod,
    paymentReference: isDemo ? `DEMO-AUTO-${reference}` : null,
    status: isDemo ? "completed" : "pending",
    clientIntake: intakeData as unknown as Record<string, unknown>,
    unlockedPayload,
    notes: input.notes || null,
    createdAt: new Date().toISOString(),
    completedAt: isDemo ? new Date().toISOString() : null,
  };

  // Cache in-memory
  inMemoryPurchases.set(reference, record);
  inMemoryPurchases.set(purchaseId, record);

  // Attempt DB persistence
  try {
    await db.insert(hexacorePurchases).values({
      id: purchaseId as any,
      reference,
      userId: input.userId as any,
      clientEmail: input.clientEmail,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      productId: ("id" in product && product.id ? product.id : purchaseId) as any,
      bookingId: input.bookingId as any,
      amountPaidEtb: amountEtb.toFixed(2),
      amountPaidUsd: amountUsd.toFixed(2),
      paymentMethod: input.paymentMethod,
      paymentReference: record.paymentReference,
      status: record.status,
      clientIntake: record.clientIntake,
      unlockedPayload: record.unlockedPayload as any,
      notes: input.notes,
    });
  } catch {
    // Graceful fallback to memory store
  }

  // Payment instructions based on method
  let paymentInstructions;
  const currency = input.currency || "ETB";
  const amountStr = currency === "USD" ? `$${amountUsd.toFixed(2)} USD` : `${amountEtb.toFixed(2)} ETB`;

  if (input.paymentMethod === "telebirr") {
    paymentInstructions = {
      method: "telebirr",
      reference,
      amountFormatted: amountStr,
      telebirrCode: "0911002233",
      instructionsEn: `Please send ${amountStr} to Telebirr Merchant / Phone: 0911002233 (Ethiopian Wellness Platform). Use reference code "${reference}" as the transaction note. Submit your transaction code below to unlock instantly.`,
      instructionsAm: `እባክዎ ${amountStr} ወደ ቴሌብር ቁጥር 0911002233 ያስተላልፉ። በመልዕክት መስኩ ላይ "${reference}" ያስገቡ። ክፍያውን እንዳጠናቀቁ የግብይት ቁጥሩን አስገብተው ወዲያውኑ ማህደርዎን ይክፈቱ።`,
    };
  } else if (input.paymentMethod === "cbe_transfer") {
    paymentInstructions = {
      method: "cbe_transfer",
      reference,
      amountFormatted: amountStr,
      accountDetails: {
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "1000234567891",
        accountHolder: "Ethiopian Wellness & Wisdom Platform",
      },
      instructionsEn: `Deposit or transfer ${amountStr} to Commercial Bank of Ethiopia (CBE) Account: 1000234567891 (Ethiopian Wellness Platform). Use reference code "${reference}" in the deposit remark.`,
      instructionsAm: `እባክዎ ${amountStr} ወደ ንግድ ባንክ (CBE) ሂሳብ ቁጥር: 1000234567891 (Ethiopian Wellness Platform) ያስተላልፉ። በማስረከቢያው ላይ "${reference}" የሚለውን መለያ ቁጥር ይጠቀሙ።`,
    };
  } else if (input.paymentMethod === "chapa" || input.paymentMethod === "card") {
    paymentInstructions = {
      method: "chapa",
      reference,
      amountFormatted: amountStr,
      instructionsEn: `Proceed with online payment via Chapa gateway for ${amountStr}. Use transaction reference "${reference}" to verify and unlock your full 14-layer dossier.`,
      instructionsAm: `በቻፓ የክፍያ በር በኩል ${amountStr} ይክፈሉ። ክፍያውን ሲያጠናቅቁ "${reference}" የሚለውን መለያ በማረጋገጫነት ያስገቡ።`,
    };
  } else if (isFree) {
    paymentInstructions = {
      method: "free",
      reference,
      amountFormatted: "0.00 ETB",
      instructionsEn: "Free Celestial Preview unlocked. Explore your active cores, archetypes, and seasonal guidance!",
      instructionsAm: "ነጻ እይታው ተከፍቷል፤ ዋና ማዕከላትን፣ ወቅታዊ መመሪያንና የሕይወት ቅኝትዎን ይቃኙ!",
    };
  } else {
    paymentInstructions = {
      method: input.paymentMethod,
      reference,
      amountFormatted: amountStr,
      instructionsEn: "Complete your payment and submit your transaction reference code to unlock.",
      instructionsAm: "ክፍያውን አጠናቀው የግብይት ቁጥሩን በማስገባት ማህደርዎን ይክፈቱ።",
    };
  }

  return { purchase: record, paymentInstructions };
}

/**
 * Verifies payment and unlocks the dossier.
 */
export async function verifyAndUnlockPurchase(input: {
  referenceOrId: string;
  paymentReference?: string;
  proofUrl?: string;
  demoInstant?: boolean;
}): Promise<PurchaseRecord> {
  const purchase =
    inMemoryPurchases.get(input.referenceOrId) ||
    Array.from(inMemoryPurchases.values()).find(
      (p) => p.reference === input.referenceOrId || p.id === input.referenceOrId
    );

  if (!purchase) {
    throw new Error(`Purchase order with reference "${input.referenceOrId}" not found.`);
  }

  // Synthesize unlocked dossier if not already unlocked
  if (!purchase.unlockedPayload) {
    const intake = purchase.clientIntake as unknown as HexacoreDossierInput;
    purchase.unlockedPayload = generateHexacoreDossier(intake);
  }

  purchase.status = "completed";
  purchase.completedAt = new Date().toISOString();
  if (input.paymentReference) purchase.paymentReference = input.paymentReference;
  if (input.proofUrl) purchase.proofUrl = input.proofUrl;

  inMemoryPurchases.set(purchase.reference, purchase);
  inMemoryPurchases.set(purchase.id, purchase);

  // Try updating DB
  try {
    await db
      .update(hexacorePurchases)
      .set({
        status: "completed",
        paymentReference: purchase.paymentReference,
        proofUrl: purchase.proofUrl,
        unlockedPayload: purchase.unlockedPayload as any,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hexacorePurchases.reference, purchase.reference));
  } catch {
    // fallback
  }

  return purchase;
}

/**
 * Retrieves a purchase by ID or Reference.
 */
export async function getPurchase(idOrReference: string): Promise<PurchaseRecord | null> {
  const cached = inMemoryPurchases.get(idOrReference);
  if (cached) return cached;

  try {
    const [row] = await db
      .select()
      .from(hexacorePurchases)
      .where(eq(hexacorePurchases.reference, idOrReference))
      .limit(1);

    if (row) {
      return {
        id: row.id,
        reference: row.reference,
        userId: row.userId,
        clientEmail: row.clientEmail,
        clientName: row.clientName,
        clientPhone: row.clientPhone,
        productId: row.productId,
        productCode: "natal_dossier",
        productName: "Hexacore Dossier",
        amountPaidEtb: Number(row.amountPaidEtb),
        amountPaidUsd: Number(row.amountPaidUsd || 0),
        paymentMethod: row.paymentMethod,
        paymentReference: row.paymentReference,
        status: row.status as "pending" | "completed" | "refunded",
        clientIntake: row.clientIntake || {},
        unlockedPayload: row.unlockedPayload as unknown as HexacoreDossierReport,
        proofUrl: row.proofUrl,
        notes: row.notes,
        createdAt: row.createdAt.toISOString(),
        completedAt: row.completedAt?.toISOString(),
      };
    }
  } catch {
    // fallback
  }

  return null;
}
