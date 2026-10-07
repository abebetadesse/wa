import { z } from "zod";
import { eq } from "drizzle-orm";
import { defineRoute, ApiError } from "@/lib/api/route";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { getSettings } from "@/server/settings";
import { availableOptions, createOnlinePayment, submitManualPayment } from "@/server/payments";

export const GET = defineRoute({
  access: "user",
  handler: async ({ user }) => {
    const paymentConfig = await getSettings("payments");
    const [prof] = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).limit(1);
    const data = prof?.data || {};
    const isAdmin = user.role === "admin" || user.role === "super_admin";
    const isUnlocked = Boolean(
      isAdmin ||
      paymentConfig.freeMode ||
      !paymentConfig.profileGating?.enabled ||
      data.profileUnlocked
    );

    return {
      isUnlocked,
      gatingSettings: paymentConfig.profileGating,
      freeMode: paymentConfig.freeMode,
      options: availableOptions(paymentConfig),
      instructions: paymentConfig.instructions || null,
    };
  },
});

export const POST = defineRoute({
  access: "user",
  body: z.object({
    method: z.enum(["chapa", "telebirr", "bank_transfer", "free"]).default("chapa"),
    reference: z.string().trim().max(80).optional(),
    payerName: z.string().trim().max(160).optional(),
    origin: z.string().url().optional(),
  }),
  handler: async ({ user, body, req }) => {
    const paymentConfig = await getSettings("payments");
    const priceEtb = Number(paymentConfig.profileGating?.priceEtb ?? 150);
    const isFree = paymentConfig.freeMode || !paymentConfig.profileGating?.enabled || priceEtb === 0 || body.method === "free";

    const [prof] = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).limit(1);
    const data = prof?.data || {};

    if (isFree || user.role === "admin" || user.role === "super_admin") {
      await db.update(userProfiles).set({
        data: { ...data, profileUnlocked: true, profileUnlockedAt: new Date().toISOString() },
        updatedAt: new Date(),
      }).where(eq(userProfiles.userId, user.id));
      return { success: true, unlocked: true };
    }

    // Paid unlock flow
    const origin = body.origin || req.headers.get("origin") || process.env.APP_URL || "https://app.wisdomcourse.com.et";
    const description = `Unlock ${paymentConfig.profileGating?.title || "Complete 5-System Sacred Blueprint"}`;

    if (body.method === "chapa") {
      const payment = await createOnlinePayment({
        user,
        purpose: "profile_unlock",
        subjectId: user.id,
        amountEtb: priceEtb,
        method: "chapa",
        description,
        returnPath: "/profile",
        origin,
      });
      return { success: true, unlocked: false, checkoutUrl: payment.checkoutUrl, txRef: payment.txRef };
    }

    if (body.method === "telebirr" || body.method === "bank_transfer") {
      if (!body.reference) {
        throw ApiError.badRequest("Please provide the transaction reference from your payment confirmation.");
      }
      const payment = await submitManualPayment({
        user,
        purpose: "profile_unlock",
        subjectId: user.id,
        amountEtb: priceEtb,
        method: body.method,
        reference: body.reference,
        payerName: body.payerName,
        description,
      });
      return { success: true, unlocked: false, awaitingReview: true, txRef: payment.txRef };
    }

    throw ApiError.badRequest("Unsupported payment method.");
  },
});
