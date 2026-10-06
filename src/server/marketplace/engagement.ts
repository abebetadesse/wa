/** Reviews, remedies inventory and client–business messaging. */
import { and, asc, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings, businessClients, businesses, businessMembers, conversations, herbs, messages, remedies, remedyIngredients, reviews, stockMovements, users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { membershipsOf, requireCapability, roleCan, type MemberRole } from "./access";
import { notify } from "./notifications";
import { businessChannel, publish, userChannel } from "@/server/realtime";
import { insertReturning, updateReturning, upsertReturning } from "@/lib/db/write";

// ── Reviews ──────────────────────────────────────────────────────────────────

export const reviewInput = z.object({
  bookingId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

async function refreshRating(businessId: string) {
  await db.execute(sql`
    update ${businesses} set
      rating_average = (select round(avg(${reviews.rating}), 2) from ${reviews} where ${reviews.businessId} = ${businessId} and ${reviews.status} = 'published'),
      rating_count = (select count(*) from ${reviews} where ${reviews.businessId} = ${businessId} and ${reviews.status} = 'published')
    where ${businesses.id} = ${businessId}`);
}

/** Only the client of a completed booking can review it, once. */
export async function createReview(user: AuthenticatedUser, input: z.infer<typeof reviewInput>) {
  const [booking] = await db.select().from(bookings).where(and(eq(bookings.id, input.bookingId), eq(bookings.bookedByUserId, user.id))).limit(1);
  if (!booking) throw ApiError.notFound("Booking");
  if (booking.status !== "completed") throw ApiError.conflict("You can review a booking after it is completed.");
  const [review] = await insertReturning(db, reviews, { businessId: booking.businessId, bookingId: booking.id, authorId: user.id, rating: input.rating, comment: input.comment }, { ifAbsent: true });
  if (!review) throw ApiError.conflict("You have already reviewed this booking.");
  await refreshRating(booking.businessId);
  await publish(businessChannel(booking.businessId), "review.created", { reviewId: review.id, rating: review.rating });
  return review;
}

export async function listPublicReviews(businessId: string, limit = 20) {
  return db
    .select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, response: reviews.response, respondedAt: reviews.respondedAt, createdAt: reviews.createdAt, author: sql<string>`coalesce(split_part(${users.name}, ' ', 1), 'Client')` })
    .from(reviews)
    .leftJoin(users, eq(users.id, reviews.authorId))
    .where(and(eq(reviews.businessId, businessId), eq(reviews.status, "published")))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function listBusinessReviews(user: AuthenticatedUser, businessId: string) {
  await requireCapability(user, businessId, "view");
  return db.select().from(reviews).where(eq(reviews.businessId, businessId)).orderBy(desc(reviews.createdAt)).limit(200);
}

export async function respondToReview(user: AuthenticatedUser, businessId: string, reviewId: string, response: string) {
  await requireCapability(user, businessId, "respondReviews");
  const [review] = await updateReturning(db, reviews, { response, respondedAt: new Date(), updatedAt: new Date() }, and(eq(reviews.id, reviewId), eq(reviews.businessId, businessId)));
  if (!review) throw ApiError.notFound("Review");
  if (review.authorId) await notify(review.authorId, { type: "review.responded", title: "The business replied to your review", body: response.slice(0, 140) });
  return review;
}

/** Platform moderation: hide or restore a review. */
export async function moderateReview(reviewId: string, status: "published" | "hidden") {
  const [review] = await updateReturning(db, reviews, { status, updatedAt: new Date() }, eq(reviews.id, reviewId));
  if (!review) throw ApiError.notFound("Review");
  await refreshRating(review.businessId);
  return review;
}

// ── Remedies & stock ─────────────────────────────────────────────────────────

export const remedyInput = z.object({
  name: z.string().trim().min(2).max(160),
  nameAm: z.string().trim().max(160).optional(),
  form: z.string().trim().min(2).max(40),
  description: z.string().trim().max(3000).optional(),
  unit: z.string().trim().min(1).max(20),
  reorderLevel: z.coerce.number().min(0).default(0),
  priceEtb: z.coerce.number().min(0).optional(),
  safetyNotes: z.string().trim().max(3000).optional(),
  isActive: z.boolean().default(true),
  ingredients: z.array(z.object({ name: z.string().trim().min(1).max(160), herbId: z.string().uuid().optional() })).max(40).default([]),
});

export const stockInput = z.object({
  quantity: z.coerce.number().refine((value) => value !== 0, "Quantity cannot be zero."),
  reason: z.enum(["restock", "dispensed", "waste", "correction"]),
  bookingId: z.string().uuid().optional(),
  note: z.string().trim().max(500).optional(),
});

export async function listRemedies(user: AuthenticatedUser, businessId: string) {
  await requireCapability(user, businessId, "manageInventory");
  const rows = await db.select().from(remedies).where(eq(remedies.businessId, businessId)).orderBy(asc(remedies.name));
  const ingredients = rows.length
    ? await db
        .select({ remedyId: remedyIngredients.remedyId, name: remedyIngredients.name, herbId: remedyIngredients.herbId, herbName: herbs.nameVernacular, scientificName: herbs.nameScientific, safetyLevel: herbs.safetyLevel })
        .from(remedyIngredients)
        .leftJoin(herbs, eq(herbs.id, remedyIngredients.herbId))
        .where(inArray(remedyIngredients.remedyId, rows.map((row) => row.id)))
    : [];
  return rows.map((remedy) => ({
    ...remedy,
    lowStock: Number(remedy.stockQuantity) <= Number(remedy.reorderLevel),
    ingredients: ingredients.filter((ingredient) => ingredient.remedyId === remedy.id),
  }));
}

export async function saveRemedy(user: AuthenticatedUser, businessId: string, remedyId: string | null, input: z.infer<typeof remedyInput>) {
  await requireCapability(user, businessId, "manageInventory");
  const { ingredients, ...values } = input;
  const record = { ...values, reorderLevel: values.reorderLevel.toFixed(2), priceEtb: values.priceEtb === undefined ? null : values.priceEtb.toFixed(2) };
  return db.transaction(async (tx) => {
    const [remedy] = remedyId
      ? await updateReturning(tx, remedies, { ...record, updatedAt: new Date() }, and(eq(remedies.id, remedyId), eq(remedies.businessId, businessId)))
      : await insertReturning(tx, remedies, { ...record, businessId });
    if (!remedy) throw ApiError.notFound("Remedy");
    await tx.delete(remedyIngredients).where(eq(remedyIngredients.remedyId, remedy.id));
    if (ingredients.length) await tx.insert(remedyIngredients).values(ingredients.map((ingredient) => ({ ...ingredient, remedyId: remedy.id })));
    await publish(businessChannel(businessId), "remedy.saved", { remedyId: remedy.id }, tx);
    return remedy;
  });
}

export async function moveStock(user: AuthenticatedUser, businessId: string, remedyId: string, input: z.infer<typeof stockInput>) {
  await requireCapability(user, businessId, "manageInventory");
  const signed = input.reason === "restock" ? Math.abs(input.quantity) : input.reason === "correction" ? input.quantity : -Math.abs(input.quantity);
  return db.transaction(async (tx) => {
    const [remedy] = await updateReturning(tx, remedies, { stockQuantity: sql`${remedies.stockQuantity} + ${signed}`, updatedAt: new Date() }, and(eq(remedies.id, remedyId), eq(remedies.businessId, businessId)));
    if (!remedy) throw ApiError.notFound("Remedy");
    if (Number(remedy.stockQuantity) < 0) throw ApiError.conflict(`Not enough ${remedy.name} in stock.`);
    await tx.insert(stockMovements).values({ remedyId, quantity: signed.toFixed(2), reason: input.reason, bookingId: input.bookingId, note: input.note, recordedBy: user.id });
    const low = Number(remedy.stockQuantity) <= Number(remedy.reorderLevel);
    await publish(businessChannel(businessId), "stock.changed", { remedyId, stockQuantity: remedy.stockQuantity, lowStock: low }, tx);
    return { ...remedy, lowStock: low };
  });
}

export async function searchHerbs(query: string) {
  const pattern = `%${query}%`;
  return db
    .select({ id: herbs.id, vernacularName: herbs.nameVernacular, scientificName: herbs.nameScientific, amharicName: herbs.nameAmharic, safetyLevel: herbs.safetyLevel, contraindications: herbs.contraindicationsGeneral })
    .from(herbs)
    .where(sql`${herbs.nameVernacular} ilike ${pattern} or ${herbs.nameScientific} ilike ${pattern} or ${herbs.nameAmharic} ilike ${pattern}`)
    .orderBy(asc(herbs.nameVernacular))
    .limit(20);
}

// ── Messaging ────────────────────────────────────────────────────────────────

export const messageInput = z.object({ body: z.string().trim().min(1, "Write a message.").max(4000) });

async function staffIds(businessId: string) {
  const rows = await db.select({ userId: businessMembers.userId, role: businessMembers.role }).from(businessMembers).where(eq(businessMembers.businessId, businessId));
  return rows.filter((row) => roleCan(row.role as MemberRole, "message")).map((row) => row.userId);
}

/** Opens (or returns) the conversation between the signed-in client and a verified business. */
export async function openConversation(user: AuthenticatedUser, businessId: string) {
  const [business] = await db.select({ id: businesses.id, status: businesses.status }).from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!business || business.status !== "verified") throw ApiError.notFound("Business");
  const [row] = await upsertReturning(db, conversations, { businessId, clientUserId: user.id }, { target: [conversations.businessId, conversations.clientUserId], set: { updatedAt: new Date() } });
  return row;
}

/** Which side the user is on in a conversation; throws 404 if neither. */
async function participant(user: AuthenticatedUser, conversationId: string) {
  const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!conversation) throw ApiError.notFound("Conversation");
  if (conversation.clientUserId === user.id) return { conversation, side: "client" as const };
  await requireCapability(user, conversation.businessId, "message");
  return { conversation, side: "business" as const };
}

export async function listMessages(user: AuthenticatedUser, conversationId: string) {
  const { conversation, side } = await participant(user, conversationId);
  const rows = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt)).limit(500);
  // Opening the thread marks the other side's messages as read.
  await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.conversationId, conversationId), ne(messages.senderSide, side), isNull(messages.readAt)));
  return { conversation, side, messages: rows };
}

export async function sendMessage(user: AuthenticatedUser, conversationId: string, body: string) {
  const { conversation, side } = await participant(user, conversationId);
  return db.transaction(async (tx) => {
    const [message] = await insertReturning(tx, messages, { conversationId, senderId: user.id, senderSide: side, body });
    await tx.update(conversations).set({ lastMessageAt: message.createdAt, updatedAt: new Date() }).where(eq(conversations.id, conversationId));
    const payload = { conversationId, message };
    await publish([businessChannel(conversation.businessId), userChannel(conversation.clientUserId)], "message.created", payload, tx);
    return message;
  });
}

/** Conversation list for a client (all businesses) or a business inbox. */
export async function listConversations(user: AuthenticatedUser, businessId?: string) {
  const unread = (side: "client" | "business") =>
    sql<number>`(select count(*) from ${messages} where ${messages.conversationId} = ${conversations.id} and ${messages.senderSide} <> ${side} and ${messages.readAt} is null)`;
  const lastBody = sql<string | null>`(select ${messages.body} from ${messages} where ${messages.conversationId} = ${conversations.id} order by ${messages.createdAt} desc limit 1)`;

  if (businessId) {
    await requireCapability(user, businessId, "message");
    return db
      .select({ id: conversations.id, lastMessageAt: conversations.lastMessageAt, counterpart: users.name, unread: unread("business"), lastMessage: lastBody })
      .from(conversations)
      .innerJoin(users, eq(users.id, conversations.clientUserId))
      .where(eq(conversations.businessId, businessId))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(200);
  }
  return db
    .select({ id: conversations.id, lastMessageAt: conversations.lastMessageAt, counterpart: businesses.name, businessSlug: businesses.slug, unread: unread("client"), lastMessage: lastBody })
    .from(conversations)
    .innerJoin(businesses, eq(businesses.id, conversations.businessId))
    .where(eq(conversations.clientUserId, user.id))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(200);
}

export { membershipsOf, businessClients, users };
