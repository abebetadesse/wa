/** Client records, manually recorded payments and the business dashboard. */
import { and, asc, desc, eq, gte, ilike, inArray, isNull, lt, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings, businessClients, businesses, businessMembers, payments, remedies, reviews, services } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability, roleCan, type MemberRole } from "./access";
import { notify } from "./notifications";
import { getSettings } from "@/server/settings";
import { paymentStatus } from "./bookingRules";
import { todayIn, localToUtc, addDays } from "./time";
import { businessChannel, publish, userChannel } from "@/server/realtime";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// ── Clients ──────────────────────────────────────────────────────────────────

export const clientInput = z.object({
  name: z.string().trim().min(2, "Client name is required.").max(160),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(10_000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  recordKeepingConsent: z.boolean().default(false),
});

export const clientQuery = z.object({ q: z.string().trim().max(100).optional(), page: z.coerce.number().int().min(1).default(1) });

const PAGE = 25;

export async function listClients(user: AuthenticatedUser, businessId: string, query: z.infer<typeof clientQuery>) {
  await requireCapability(user, businessId, "manageClients");
  const conditions: SQL[] = [eq(businessClients.businessId, businessId)];
  if (query.q) {
    const pattern = `%${query.q}%`;
    conditions.push(or(ilike(businessClients.name, pattern), ilike(businessClients.phone, pattern), ilike(businessClients.email, pattern))!);
  }
  const where = and(...conditions);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: businessClients.id,
        name: businessClients.name,
        phone: businessClients.phone,
        email: businessClients.email,
        tags: businessClients.tags,
        hasAccount: sql<boolean>`${businessClients.userId} is not null`,
        visits: sql<number>`(select count(*)::int from ${bookings} where ${bookings.clientId} = ${businessClients.id} and ${bookings.status} = 'completed')`,
        lastVisit: sql<string | null>`(select max(${bookings.startsAt}) from ${bookings} where ${bookings.clientId} = ${businessClients.id} and ${bookings.status} = 'completed')`,
        nextVisit: sql<string | null>`(select min(${bookings.startsAt}) from ${bookings} where ${bookings.clientId} = ${businessClients.id} and ${bookings.status} in ('requested','confirmed') and ${bookings.startsAt} > now())`,
        totalPaidEtb: sql<string>`coalesce((select sum(${payments.amountEtb}) from ${payments} where ${payments.clientId} = ${businessClients.id} and ${payments.status} = 'recorded'), 0)`,
      })
      .from(businessClients)
      .where(where)
      .orderBy(asc(businessClients.name))
      .limit(PAGE)
      .offset((query.page - 1) * PAGE),
    db.select({ total: sql<number>`count(*)::int` }).from(businessClients).where(where),
  ]);
  return { clients: rows, total, page: query.page, totalPages: Math.max(1, Math.ceil(total / PAGE)) };
}

export async function getClient(user: AuthenticatedUser, businessId: string, clientId: string) {
  const membership = await requireCapability(user, businessId, "manageClients");
  const [client] = await db.select().from(businessClients).where(and(eq(businessClients.id, clientId), eq(businessClients.businessId, businessId))).limit(1);
  if (!client) throw ApiError.notFound("Client");
  const [history, paid] = await Promise.all([
    db
      .select({ id: bookings.id, reference: bookings.reference, startsAt: bookings.startsAt, status: bookings.status, paymentStatus: bookings.paymentStatus, priceEtb: bookings.priceEtb, serviceName: services.name, safety: bookings.safety })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .where(eq(bookings.clientId, clientId))
      .orderBy(desc(bookings.startsAt))
      .limit(100),
    db.select().from(payments).where(eq(payments.clientId, clientId)).orderBy(desc(payments.receivedOn)).limit(100),
  ]);
  const canSeeNotes = roleCan(membership.role, "viewClientNotes");
  return { ...client, notes: canSeeNotes ? client.notes : null, history, payments: paid };
}

export async function saveClient(user: AuthenticatedUser, businessId: string, clientId: string | null, input: z.infer<typeof clientInput>) {
  await requireCapability(user, businessId, "manageClients");
  const { recordKeepingConsent, ...values } = input;
  const consent = recordKeepingConsent ? { recordKeeping: new Date().toISOString() } : undefined;
  const [row] = clientId
    ? await db
        .update(businessClients)
        .set({ ...values, ...(consent ? { consent } : {}), updatedAt: new Date() })
        .where(and(eq(businessClients.id, clientId), eq(businessClients.businessId, businessId)))
        .returning()
    : await db.insert(businessClients).values({ ...values, businessId, consent: consent ?? {} }).returning();
  if (!row) throw ApiError.notFound("Client");
  await publish(businessChannel(businessId), "client.saved", { clientId: row.id });
  return row;
}

// ── Payments (recorded manually) ─────────────────────────────────────────────

export const PAYMENT_METHODS = ["cash", "bank_transfer", "telebirr", "cbe_birr", "other"] as const;

export const paymentInput = z
  .object({
    bookingId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
    amountEtb: z.coerce.number().positive("Enter an amount greater than zero.").max(10_000_000),
    method: z.enum(PAYMENT_METHODS),
    reference: z.string().trim().max(120).optional(),
    receivedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    note: z.string().trim().max(1000).optional(),
  })
  .refine((value) => value.bookingId || value.clientId, "Link the payment to a booking or a client.");

async function refreshBookingPayment(tx: Tx, bookingId: string) {
  const [row] = await tx
    .select({
      price: bookings.priceEtb,
      businessId: bookings.businessId,
      paid: sql<string>`coalesce((select sum(${payments.amountEtb}) from ${payments} where ${payments.bookingId} = ${bookings.id} and ${payments.status} = 'recorded'), 0)`,
      clientUserId: businessClients.userId,
    })
    .from(bookings)
    .innerJoin(businessClients, eq(businessClients.id, bookings.clientId))
    .where(eq(bookings.id, bookingId))
    .limit(1);
  if (!row) return;
  const status = paymentStatus(Number(row.price), Number(row.paid));
  await tx.update(bookings).set({ paymentStatus: status, updatedAt: new Date() }).where(eq(bookings.id, bookingId));
  await publish([businessChannel(row.businessId), ...(row.clientUserId ? [userChannel(row.clientUserId)] : [])], "booking.payment", { bookingId, paymentStatus: status }, tx);
}

export async function recordPayment(user: AuthenticatedUser, businessId: string, input: z.infer<typeof paymentInput>) {
  await requireCapability(user, businessId, "recordPayments");
  return db.transaction(async (tx) => {
    let clientId = input.clientId ?? null;
    if (input.bookingId) {
      const [booking] = await tx.select({ clientId: bookings.clientId }).from(bookings).where(and(eq(bookings.id, input.bookingId), eq(bookings.businessId, businessId))).limit(1);
      if (!booking) throw ApiError.notFound("Booking");
      clientId = booking.clientId;
    } else if (clientId) {
      const [client] = await tx.select({ id: businessClients.id }).from(businessClients).where(and(eq(businessClients.id, clientId), eq(businessClients.businessId, businessId))).limit(1);
      if (!client) throw ApiError.notFound("Client");
    }
    const [payment] = await tx
      .insert(payments)
      .values({ businessId, bookingId: input.bookingId ?? null, clientId, amountEtb: input.amountEtb.toFixed(2), method: input.method, reference: input.reference, receivedOn: input.receivedOn, note: input.note, recordedBy: user.id })
      .returning();
    if (input.bookingId) await refreshBookingPayment(tx, input.bookingId);
    await publish(businessChannel(businessId), "payment.recorded", { paymentId: payment.id, amountEtb: payment.amountEtb }, tx);
    return payment;
  });
}

export async function voidPayment(user: AuthenticatedUser, businessId: string, paymentId: string, reason: string) {
  await requireCapability(user, businessId, "voidPayments");
  return db.transaction(async (tx) => {
    const [payment] = await tx
      .update(payments)
      .set({ status: "voided", voidedBy: user.id, voidReason: reason, updatedAt: new Date() })
      .where(and(eq(payments.id, paymentId), eq(payments.businessId, businessId), eq(payments.status, "recorded")))
      .returning();
    if (!payment) throw ApiError.notFound("Payment");
    if (payment.bookingId) await refreshBookingPayment(tx, payment.bookingId);
    await publish(businessChannel(businessId), "payment.voided", { paymentId }, tx);
    return payment;
  });
}

// ── Payments reported by clients ─────────────────────────────────────────────
//
// A client who paid a business by telebirr or bank transfer submits the transaction number from
// their booking. It stays "pending" (not counted anywhere) until the business confirms it against
// its own statement; confirming turns it into an ordinary recorded payment.

export const clientPaymentInput = z.object({
  method: z.enum(["telebirr", "bank_transfer"]),
  amountEtb: z.coerce.number().positive("Enter the amount you paid.").max(10_000_000),
  reference: z.string().trim().min(4, "Enter the transaction number from your receipt.").max(60).regex(/^[A-Za-z0-9 _./-]+$/, "Use only the letters and numbers from your receipt."),
  note: z.string().trim().max(500).optional(),
});

async function clientBooking(user: AuthenticatedUser, bookingId: string) {
  const [row] = await db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      status: bookings.status,
      priceEtb: bookings.priceEtb,
      clientId: bookings.clientId,
      businessId: bookings.businessId,
      businessName: businesses.name,
      timezone: businesses.timezone,
      accounts: businesses.paymentAccounts,
      paidEtb: sql<string>`coalesce((select sum(${payments.amountEtb}) from ${payments} where ${payments.bookingId} = ${bookings.id} and ${payments.status} = 'recorded'), 0)`,
      pendingEtb: sql<string>`coalesce((select sum(${payments.amountEtb}) from ${payments} where ${payments.bookingId} = ${bookings.id} and ${payments.status} = 'pending'), 0)`,
    })
    .from(bookings)
    .innerJoin(businesses, eq(businesses.id, bookings.businessId))
    .where(and(eq(bookings.id, bookingId), eq(bookings.bookedByUserId, user.id)))
    .limit(1);
  if (!row) throw ApiError.notFound("Booking");
  return row;
}

export async function bookingPaymentsForClient(user: AuthenticatedUser, bookingId: string) {
  const booking = await clientBooking(user, bookingId);
  const [settings, submissions] = await Promise.all([
    getSettings("payments"),
    db
      .select({ id: payments.id, amountEtb: payments.amountEtb, method: payments.method, reference: payments.reference, status: payments.status, reason: payments.voidReason, createdAt: payments.createdAt })
      .from(payments)
      .where(and(eq(payments.bookingId, bookingId), eq(payments.submittedBy, user.id)))
      .orderBy(desc(payments.createdAt)),
  ]);
  const accounts = booking.accounts ?? {};
  const price = Number(booking.priceEtb);
  const paid = Number(booking.paidEtb);
  const pending = Number(booking.pendingEtb);
  const canSubmit = settings.bookingPayments.clientSubmissions && !["declined", "cancelled"].includes(booking.status) && Boolean(accounts.telebirr || accounts.banks?.length);
  return {
    priceEtb: price,
    paidEtb: paid,
    pendingEtb: pending,
    balanceEtb: Math.max(0, Math.round((price - paid - pending) * 100) / 100),
    canSubmit,
    accounts: { telebirr: accounts.telebirr ?? null, banks: accounts.banks ?? [], acceptsCash: accounts.acceptsCash ?? true, instructions: accounts.instructions ?? null },
    submissions,
  };
}

async function membersWith(businessId: string, capability: "recordPayments") {
  const rows = await db.select({ userId: businessMembers.userId, role: businessMembers.role }).from(businessMembers).where(eq(businessMembers.businessId, businessId));
  return rows.filter((row) => roleCan(row.role as MemberRole, capability)).map((row) => row.userId);
}

export async function submitClientPayment(user: AuthenticatedUser, bookingId: string, input: z.infer<typeof clientPaymentInput>) {
  const info = await bookingPaymentsForClient(user, bookingId);
  if (!info.canSubmit) throw ApiError.conflict("Payments can't be reported for this booking. Please pay the business directly.");
  const booking = await clientBooking(user, bookingId);
  const accounts = booking.accounts ?? {};
  if (input.method === "telebirr" && !accounts.telebirr) throw ApiError.badRequest("This business doesn't take telebirr.");
  if (input.method === "bank_transfer" && !accounts.banks?.length) throw ApiError.badRequest("This business doesn't take bank transfers.");
  if (input.amountEtb > info.balanceEtb + 0.005) {
    throw ApiError.badRequest(info.balanceEtb > 0 ? `The most you can report is ${info.balanceEtb} ETB (what's left to pay).` : "Nothing is left to pay on this booking.");
  }
  const reference = input.reference.toUpperCase().replace(/\s+/g, "");
  const [duplicate] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.businessId, booking.businessId), eq(payments.method, input.method), eq(payments.reference, reference), inArray(payments.status, ["pending", "recorded"])))
    .limit(1);
  if (duplicate) throw ApiError.conflict("This transaction number has already been submitted.");

  const payment = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(payments)
      .values({
        businessId: booking.businessId,
        bookingId,
        clientId: booking.clientId,
        amountEtb: input.amountEtb.toFixed(2),
        method: input.method,
        reference,
        note: input.note,
        status: "pending",
        receivedOn: todayIn(booking.timezone),
        submittedBy: user.id,
      })
      .returning();
    await publish(businessChannel(booking.businessId), "payment.submitted", { paymentId: row.id, bookingId }, tx);
    return row;
  });
  const staff = await membersWith(booking.businessId, "recordPayments");
  await Promise.all(
    staff.map((id) =>
      notify(id, { type: "payment.submitted", title: "Payment to confirm", body: `${booking.reference}: ${input.amountEtb} ETB by ${input.method === "telebirr" ? "telebirr" : "bank transfer"} (${reference})`, href: `/business/${booking.businessId}/payments` }).catch(() => null),
    ),
  );
  return payment;
}

export const paymentReviewInput = z.object({ decision: z.enum(["confirm", "reject"]), reason: z.string().trim().max(500).optional() });

export async function reviewClientPayment(user: AuthenticatedUser, businessId: string, paymentId: string, input: z.infer<typeof paymentReviewInput>) {
  await requireCapability(user, businessId, "recordPayments");
  if (input.decision === "reject" && !input.reason) throw ApiError.badRequest("Tell the client why the payment wasn't found.");
  const payment = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(payments)
      .set(
        input.decision === "confirm"
          ? { status: "recorded", recordedBy: user.id, updatedAt: new Date() }
          : { status: "rejected", voidedBy: user.id, voidReason: input.reason, updatedAt: new Date() },
      )
      .where(and(eq(payments.id, paymentId), eq(payments.businessId, businessId), eq(payments.status, "pending")))
      .returning();
    if (!row) throw ApiError.conflict("This payment was already reviewed.");
    if (row.bookingId) await refreshBookingPayment(tx, row.bookingId);
    await publish(businessChannel(businessId), input.decision === "confirm" ? "payment.recorded" : "payment.rejected", { paymentId }, tx);
    return row;
  });
  if (payment.submittedBy) {
    await notify(payment.submittedBy, {
      type: `payment.${input.decision === "confirm" ? "confirmed" : "rejected"}`,
      title: input.decision === "confirm" ? "Payment confirmed" : "Payment not found",
      body: input.decision === "confirm" ? `${payment.amountEtb} ETB (${payment.reference}) was received. Thank you.` : `${payment.reference}: ${input.reason}`,
      href: payment.bookingId ? `/account/bookings/${payment.bookingId}` : undefined,
    }).catch(() => null);
  }
  return payment;
}

export const paymentQuery = z.object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });

export async function listPayments(user: AuthenticatedUser, businessId: string, query: z.infer<typeof paymentQuery>) {
  await requireCapability(user, businessId, "viewFinance");
  const conditions: SQL[] = [eq(payments.businessId, businessId)];
  if (query.from) conditions.push(gte(payments.receivedOn, query.from));
  if (query.to) conditions.push(lt(payments.receivedOn, query.to));
  const rows = await db
    .select({ payment: payments, clientName: businessClients.name, bookingReference: bookings.reference })
    .from(payments)
    .leftJoin(businessClients, eq(businessClients.id, payments.clientId))
    .leftJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(and(...conditions))
    .orderBy(desc(payments.receivedOn), desc(payments.createdAt))
    .limit(500);
  const recorded = rows.filter((row) => row.payment.status === "recorded");
  const pending = await db
    .select({ payment: payments, clientName: businessClients.name, bookingReference: bookings.reference })
    .from(payments)
    .leftJoin(businessClients, eq(businessClients.id, payments.clientId))
    .leftJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(and(eq(payments.businessId, businessId), eq(payments.status, "pending")))
    .orderBy(asc(payments.createdAt));
  const byMethod = Object.fromEntries(
    [...new Set(recorded.map((row) => row.payment.method))].map((method) => [method, recorded.filter((row) => row.payment.method === method).reduce((sum, row) => sum + Number(row.payment.amountEtb), 0)]),
  );
  return { payments: rows.filter((row) => row.payment.status !== "pending"), pending, totalEtb: recorded.reduce((sum, row) => sum + Number(row.payment.amountEtb), 0), byMethod };
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function dashboard(user: AuthenticatedUser, businessId: string) {
  const membership = await requireCapability(user, businessId, "view");
  const [business] = await db.select({ timezone: businesses.timezone, status: businesses.status, ratingAverage: businesses.ratingAverage, ratingCount: businesses.ratingCount }).from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!business) throw ApiError.notFound("Business");
  const tz = business.timezone;
  const today = todayIn(tz);
  const dayStart = localToUtc(today, 0, tz);
  const dayEnd = localToUtc(addDays(today, 1), 0, tz);
  const weekEnd = localToUtc(addDays(today, 7), 0, tz);
  const monthStart = `${today.slice(0, 7)}-01`;
  const canSeeFinance = roleCan(membership.role, "viewFinance");

  const count = (where: SQL) => db.select({ n: sql<number>`count(*)::int` }).from(bookings).where(and(eq(bookings.businessId, businessId), where)).then(([row]) => row.n);

  const [todayCount, pending, weekCount, unpaidCompleted, newClients, lowStock, revenue, upcoming, latestReviews, paymentsToConfirm] = await Promise.all([
    count(and(gte(bookings.startsAt, dayStart), lt(bookings.startsAt, dayEnd), inArray(bookings.status, ["requested", "confirmed", "completed"]))!),
    count(eq(bookings.status, "requested")),
    count(and(gte(bookings.startsAt, dayStart), lt(bookings.startsAt, weekEnd), inArray(bookings.status, ["requested", "confirmed"]))!),
    count(and(eq(bookings.status, "completed"), inArray(bookings.paymentStatus, ["unpaid", "partial"]))!),
    db.select({ n: sql<number>`count(*)::int` }).from(businessClients).where(and(eq(businessClients.businessId, businessId), gte(businessClients.createdAt, new Date(Date.now() - 30 * 86_400_000)))).then(([row]) => row.n),
    db.select({ n: sql<number>`count(*)::int` }).from(remedies).where(and(eq(remedies.businessId, businessId), eq(remedies.isActive, true), sql`${remedies.stockQuantity} <= ${remedies.reorderLevel}`)).then(([row]) => row.n),
    canSeeFinance
      ? db.execute<{ day: string; total: string }>(sql`
          select to_char(${payments.receivedOn}, 'YYYY-MM-DD') as day, sum(${payments.amountEtb})::text as total
          from ${payments}
          where ${payments.businessId} = ${businessId} and ${payments.status} = 'recorded' and ${payments.receivedOn} >= ${addDays(today, -29)}
          group by 1 order by 1`)
      : Promise.resolve(null),
    db
      .select({ id: bookings.id, reference: bookings.reference, startsAt: bookings.startsAt, endsAt: bookings.endsAt, status: bookings.status, deliveryMode: bookings.deliveryMode, serviceName: services.name, clientName: businessClients.name, flagged: sql<boolean>`${bookings.safety} is not null and jsonb_array_length(coalesce(${bookings.safety}->'flags', '[]'::jsonb)) > 0` })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(businessClients, eq(businessClients.id, bookings.clientId))
      .where(and(eq(bookings.businessId, businessId), gte(bookings.endsAt, new Date()), inArray(bookings.status, ["requested", "confirmed"])))
      .orderBy(asc(bookings.startsAt))
      .limit(8),
    db.select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt, responded: sql<boolean>`${reviews.response} is not null` }).from(reviews).where(and(eq(reviews.businessId, businessId), eq(reviews.status, "published"))).orderBy(desc(reviews.createdAt)).limit(3),
    db.select({ n: sql<number>`count(*)::int` }).from(payments).where(and(eq(payments.businessId, businessId), eq(payments.status, "pending"))).then(([row]) => row.n),
  ]);

  const revenueRows = revenue ? [...revenue] : [];
  const revenueSeries = Array.from({ length: 30 }, (_, index) => {
    const day = addDays(today, index - 29);
    return { day, totalEtb: Number(revenueRows.find((row) => row.day === day)?.total ?? 0) };
  });

  return {
    status: business.status,
    timezone: tz,
    today,
    kpis: {
      bookingsToday: todayCount,
      pendingRequests: pending,
      bookingsNext7Days: weekCount,
      completedUnpaid: unpaidCompleted,
      newClients30Days: newClients,
      lowStockRemedies: lowStock,
      paymentsToConfirm,
      ratingAverage: business.ratingAverage ? Number(business.ratingAverage) : null,
      ratingCount: business.ratingCount,
      revenueMonthEtb: canSeeFinance ? revenueSeries.filter((point) => point.day >= monthStart).reduce((sum, point) => sum + point.totalEtb, 0) : null,
    },
    revenueSeries: canSeeFinance ? revenueSeries : null,
    upcoming,
    latestReviews,
  };
}

export { isNull };
