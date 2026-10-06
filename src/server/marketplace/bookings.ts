import { and, asc, desc, eq, gt, gte, inArray, isNull, lt, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings, businessClients, businesses, businessMembers, payments, remedies, remedyIngredients, serviceKinds, services, users } from "@/lib/db/schema";
import { screenBookingSafety } from "@/server/safety";
import { bookingIntakeInput, validateBookingIntake } from "@/server/intake/settings";
import { attachToBooking } from "@/server/intake/attachments";
import { runAutoResponses } from "@/server/intake/responses";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability, roleCan, type MemberRole } from "./access";
import { DELIVERY_MODES } from "./businesses";
import { availableSlots } from "./catalogue";
import { localToUtc } from "./time";
import { BOOKING_STATUSES, bookingReference, canTransition, type BookingStatus } from "./bookingRules";
import { notify } from "./notifications";
import { businessChannel, publish, userChannel } from "@/server/realtime";
import { insertReturning, updateReturning, upsertReturning } from "@/lib/db/write";
import { isDuplicateKey, isTransientConflict } from "@/lib/db/errors";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Bookings that hold a time slot. */
const HOLDING: BookingStatus[] = ["requested", "confirmed"];

// ── Schemas ──────────────────────────────────────────────────────────────────

export const safetyAnswers = z.object({
  takingMedicines: z.enum(["no", "yes", "prefer_not"]),
  medicines: z.string().trim().max(500).optional(),
  pregnantOrBreastfeeding: z.enum(["no", "yes", "not_applicable", "prefer_not"]),
  conditions: z.string().trim().max(1000).optional(),
});

export const bookingRequest = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.coerce.date(),
  memberId: z.string().uuid().optional(),
  deliveryMode: z.enum(DELIVERY_MODES),
  note: z.string().trim().max(2000).optional(),
  safety: safetyAnswers.optional(),
  /** Answers to the service's own intake (dropdown, description, Ge'ez names, uploaded media). */
  intake: bookingIntakeInput.optional(),
});

/** Staff enter wall-clock time in the business's timezone; the server converts it. */
export const staffBookingRequest = bookingRequest.omit({ safety: true, startsAt: true, intake: true }).extend({
  startsAtLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose a date and time."),
  clientId: z.string().uuid(),
  status: z.enum(["requested", "confirmed"]).default("confirmed"),
});

export const transitionRequest = z.object({
  status: z.enum(BOOKING_STATUSES),
  reason: z.string().trim().max(1000).optional(),
});

/** Flags a practitioner must see before a remedy or bodywork session. */
function safetyFlags(answers?: z.infer<typeof safetyAnswers>) {
  if (!answers) return [];
  const flags: string[] = [];
  if (answers.takingMedicines === "yes") flags.push(`Takes medicines${answers.medicines ? `: ${answers.medicines}` : ""} — check herb–drug interactions.`);
  if (answers.pregnantOrBreastfeeding === "yes") flags.push("Pregnant or breastfeeding — avoid remedies and practices that are not known to be safe.");
  if (answers.conditions) flags.push(`Reported conditions: ${answers.conditions}`);
  if (answers.takingMedicines === "prefer_not" || answers.pregnantOrBreastfeeding === "prefer_not") flags.push("Some safety answers were withheld — ask before preparing any remedy.");
  return flags;
}

/** Runs the client's medicines against this business's remedies through the safety matrix. */
async function matrixFlags(businessId: string, answers: z.infer<typeof safetyAnswers>) {
  const rows = await db
    .select({ remedy: remedies.name, ingredient: remedyIngredients.name })
    .from(remedies)
    .leftJoin(remedyIngredients, eq(remedyIngredients.remedyId, remedies.id))
    .where(and(eq(remedies.businessId, businessId), eq(remedies.isActive, true)));
  const remedyNames = [...new Set(rows.flatMap((row) => [row.remedy, row.ingredient]).filter((name): name is string => Boolean(name)))];
  const screen = await screenBookingSafety({
    medicinesText: answers.takingMedicines === "yes" ? answers.medicines : undefined,
    pregnant: answers.pregnantOrBreastfeeding === "yes",
    remedyNames,
  });
  return screen.flags;
}

// ── Notification fan-out ─────────────────────────────────────────────────────

async function staffToNotify(tx: Tx, businessId: string) {
  const members = await tx.select({ userId: businessMembers.userId, role: businessMembers.role }).from(businessMembers).where(eq(businessMembers.businessId, businessId));
  return members.filter((member) => roleCan(member.role as MemberRole, "manageBookings")).map((member) => member.userId);
}

const when = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);

// ── Creating bookings ────────────────────────────────────────────────────────

async function loadBookableService(businessId: string, serviceId: string) {
  const [row] = await db
    .select({ service: services, kind: serviceKinds, business: businesses })
    .from(services)
    .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
    .innerJoin(businesses, eq(businesses.id, services.businessId))
    .where(and(eq(services.id, serviceId), eq(services.businessId, businessId), eq(services.isActive, true)))
    .limit(1);
  if (!row) throw ApiError.notFound("Service");
  return row;
}

/**
 * No two bookings that hold a slot may overlap for the same practitioner (or for the business
 * when no practitioner is assigned). MySQL cannot express this as a constraint, so it is enforced
 * here: the business row is locked for the rest of the transaction, which makes concurrent
 * bookings for one business queue up, and the overlap is checked while that lock is held.
 */
async function assertSlotFree(tx: Tx, slot: { businessId: string; memberId: string | null | undefined; startsAt: Date; endsAt: Date }) {
  await tx.select({ id: businesses.id }).from(businesses).where(eq(businesses.id, slot.businessId)).for("update");
  const [taken] = await tx
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.businessId, slot.businessId),
        slot.memberId ? eq(bookings.memberId, slot.memberId) : isNull(bookings.memberId),
        inArray(bookings.status, HOLDING),
        lt(bookings.startsAt, slot.endsAt),
        gt(bookings.endsAt, slot.startsAt),
      ),
    )
    .limit(1);
  if (taken) throw ApiError.conflict("That time was just taken. Please choose another slot.");
}

async function insertBooking(tx: Tx, values: typeof bookings.$inferInsert) {
  try {
    await assertSlotFree(tx, { businessId: values.businessId, memberId: values.memberId, startsAt: values.startsAt, endsAt: values.endsAt });
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [row] = await insertReturning(tx, bookings, { ...values, reference: bookingReference() });
        return row;
      } catch (error) {
        // A reference that already exists: draw another.
        if (!isDuplicateKey(error)) throw error;
      }
    }
  } catch (error) {
    if (isTransientConflict(error)) throw ApiError.conflict("Someone else is booking this time right now. Please try again.");
    throw error;
  }
  throw new Error("Could not allocate a booking reference.");
}

/** A client books a service at an open slot. */
export async function requestBooking(user: AuthenticatedUser, businessId: string, input: z.infer<typeof bookingRequest>) {
  const { service, kind, business } = await loadBookableService(businessId, input.serviceId);
  if (business.status !== "verified") throw ApiError.forbidden("This business is not accepting bookings yet.");
  if (!service.deliveryModes.includes(input.deliveryMode)) throw ApiError.badRequest("This service is not offered that way.");
  if (kind.requiresSafetyScreen && !input.safety) throw ApiError.badRequest("Please complete the safety questions for this service.");

  const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: business.timezone }).format(input.startsAt);
  const { slots } = await availableSlots(businessId, { serviceId: service.id, date: localDate, memberId: input.memberId });
  if (!slots.includes(input.startsAt.toISOString())) throw ApiError.conflict("That time is no longer available. Please choose another slot.");

  const endsAt = new Date(input.startsAt.getTime() + service.durationMinutes * 60_000);
  const intake = await validateBookingIntake(user, businessId, service.id, input.intake);
  const flags = safetyFlags(input.safety);
  if (input.safety && (input.safety.takingMedicines === "yes" || input.safety.pregnantOrBreastfeeding === "yes")) {
    flags.push(...(await matrixFlags(businessId, input.safety)));
  }

  const booking = await db.transaction(async (tx) => {
    const [client] = await upsertReturning(tx, businessClients, { businessId, userId: user.id, name: user.name ?? user.email, email: user.email, phone: user.phone, consent: { recordKeeping: new Date().toISOString() } }, { target: [businessClients.businessId, businessClients.userId], set: { updatedAt: new Date() }, fields: { id: businessClients.id } });

    const created = await insertBooking(tx, {
      reference: "",
      businessId,
      serviceId: service.id,
      clientId: client.id,
      bookedByUserId: user.id,
      memberId: input.memberId ?? null,
      startsAt: input.startsAt,
      endsAt,
      deliveryMode: input.deliveryMode,
      status: "requested",
      priceEtb: service.priceEtb,
      clientNote: input.note,
      safety: input.safety ? { answers: input.safety, flags } : null,
      intake: intake as Record<string, unknown> | null,
    });
    if (intake?.attachmentIds.length) await attachToBooking(tx, user.id, businessId, created.id, intake.attachmentIds);

    const payload = { bookingId: created.id, reference: created.reference, status: created.status, startsAt: created.startsAt.toISOString() };
    await publish([businessChannel(businessId), userChannel(user.id)], "booking.created", payload, tx);
    for (const staffId of await staffToNotify(tx, businessId)) {
      await notify(
        staffId,
        {
          type: "booking.requested",
          title: `New booking request: ${service.name}`,
          body: `${user.name ?? "A client"} · ${when(created.startsAt, business.timezone)}${flags.length ? " · safety notes attached" : ""}`,
          href: `/business/${businessId}/bookings?focus=${created.id}`,
        },
        tx,
      );
    }
    return created;
  });

  // Criteria-based responses run after the booking is safely stored; a failure never loses the booking.
  await runAutoResponses(booking.id).catch((error) => console.error("[intake] auto-responses failed", booking.id, error));
  return getBookingForClient(user, booking.id);
}

/** Staff book on behalf of a client (phone or walk-in). */
export async function createStaffBooking(user: AuthenticatedUser, businessId: string, input: z.infer<typeof staffBookingRequest>) {
  await requireCapability(user, businessId, "manageBookings");
  const { service, business } = await loadBookableService(businessId, input.serviceId);
  if (!service.deliveryModes.includes(input.deliveryMode)) throw ApiError.badRequest("This service is not offered that way.");
  const [date, time] = input.startsAtLocal.split("T");
  const [hours, minutes] = time.split(":").map(Number);
  const startsAt = localToUtc(date, hours * 60 + minutes, business.timezone);
  const [client] = await db.select({ id: businessClients.id, userId: businessClients.userId }).from(businessClients).where(and(eq(businessClients.id, input.clientId), eq(businessClients.businessId, businessId))).limit(1);
  if (!client) throw ApiError.notFound("Client");

  const booking = await db.transaction(async (tx) => {
    const created = await insertBooking(tx, {
      reference: "",
      businessId,
      serviceId: service.id,
      clientId: client.id,
      // The client's own account (if any) owns the booking; staff act on their behalf.
      bookedByUserId: client.userId,
      memberId: input.memberId ?? null,
      startsAt,
      endsAt: new Date(startsAt.getTime() + service.durationMinutes * 60_000),
      deliveryMode: input.deliveryMode,
      status: input.status,
      priceEtb: service.priceEtb,
      businessNote: input.note,
    });
    const channels = [businessChannel(businessId), ...(client.userId ? [userChannel(client.userId)] : [])];
    await publish(channels, "booking.created", { bookingId: created.id, reference: created.reference, status: created.status }, tx);
    return created;
  });
  return booking;
}

// ── Status changes ───────────────────────────────────────────────────────────

const STATUS_COPY: Record<BookingStatus, string> = {
  requested: "requested",
  confirmed: "confirmed",
  declined: "declined",
  cancelled: "cancelled",
  completed: "completed",
  no_show: "marked as missed",
};

async function applyTransition(bookingId: string, actor: "client" | "business", actorUser: AuthenticatedUser, input: z.infer<typeof transitionRequest>, scope: SQL) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ booking: bookings, serviceName: services.name, business: businesses, clientUserId: businessClients.userId })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(businesses, eq(businesses.id, bookings.businessId))
      .innerJoin(businessClients, eq(businessClients.id, bookings.clientId))
      .where(and(eq(bookings.id, bookingId), scope))
      .for("update")
      .limit(1);
    if (!row) throw ApiError.notFound("Booking");

    const check = canTransition({ from: row.booking.status as BookingStatus, to: input.status, actor, startsAt: row.booking.startsAt });
    if (!check.ok) throw ApiError.conflict(check.reason);

    const [updated] = await updateReturning(tx, bookings, {
        status: input.status,
        updatedAt: new Date(),
        ...(input.status === "cancelled" ? { cancelledBy: actor, cancelReason: input.reason } : {}),
        ...(actor === "business" && input.reason && input.status !== "cancelled" ? { businessNote: input.reason } : {}),
      }, eq(bookings.id, bookingId));

    const payload = { bookingId, reference: updated.reference, status: updated.status, previous: row.booking.status };
    await publish([businessChannel(row.business.id), ...(row.clientUserId ? [userChannel(row.clientUserId)] : [])], "booking.updated", payload, tx);

    const summary = `${row.serviceName} · ${when(row.booking.startsAt, row.business.timezone)}`;
    if (actor === "business" && row.clientUserId) {
      await notify(row.clientUserId, { type: `booking.${input.status}`, title: `Your booking was ${STATUS_COPY[input.status]}`, body: `${row.business.name}: ${summary}${input.reason ? ` — ${input.reason}` : ""}`, href: `/account/bookings/${bookingId}` }, tx);
    }
    if (actor === "client") {
      for (const staffId of await staffToNotify(tx, row.business.id)) {
        await notify(staffId, { type: `booking.${input.status}`, title: `Booking ${updated.reference} was ${STATUS_COPY[input.status]} by the client`, body: summary, href: `/business/${row.business.id}/bookings?focus=${bookingId}` }, tx);
      }
    }
    return updated;
  });
}

export async function updateBookingStatusAsBusiness(user: AuthenticatedUser, businessId: string, bookingId: string, input: z.infer<typeof transitionRequest>) {
  await requireCapability(user, businessId, "manageBookings");
  return applyTransition(bookingId, "business", user, input, eq(bookings.businessId, businessId));
}

export async function cancelBookingAsClient(user: AuthenticatedUser, bookingId: string, reason?: string) {
  await applyTransition(bookingId, "client", user, { status: "cancelled", reason }, eq(bookings.bookedByUserId, user.id));
  return getBookingForClient(user, bookingId);
}

// ── Reading bookings ─────────────────────────────────────────────────────────

const bookingColumns = {
  id: bookings.id,
  reference: bookings.reference,
  status: bookings.status,
  paymentStatus: bookings.paymentStatus,
  startsAt: bookings.startsAt,
  endsAt: bookings.endsAt,
  deliveryMode: bookings.deliveryMode,
  priceEtb: bookings.priceEtb,
  clientNote: bookings.clientNote,
  createdAt: bookings.createdAt,
  serviceId: services.id,
  serviceName: services.name,
  businessId: businesses.id,
  businessName: businesses.name,
  businessSlug: businesses.slug,
  businessPhone: businesses.phone,
  timezone: businesses.timezone,
};

export async function listClientBookings(user: AuthenticatedUser, scope: "upcoming" | "past" = "upcoming") {
  const now = new Date();
  return db
    .select(bookingColumns)
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(businesses, eq(businesses.id, bookings.businessId))
    .where(and(eq(bookings.bookedByUserId, user.id), scope === "upcoming" ? gte(bookings.endsAt, now) : lt(bookings.endsAt, now)))
    .orderBy(scope === "upcoming" ? asc(bookings.startsAt) : desc(bookings.startsAt))
    .limit(100);
}

export async function getBookingForClient(user: AuthenticatedUser, bookingId: string) {
  const [row] = await db
    .select({
      ...bookingColumns,
      safety: bookings.safety,
      businessAddress: businesses.address,
      cancelReason: bookings.cancelReason,
      reviewed: sql<boolean>`exists (select 1 from reviews where reviews.booking_id = ${bookings.id})`,
      caseId: bookings.caseId,
      caseDomain: serviceKinds.caseDomain,
    })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
    .innerJoin(businesses, eq(businesses.id, bookings.businessId))
    .where(and(eq(bookings.id, bookingId), eq(bookings.bookedByUserId, user.id)))
    .limit(1);
  if (!row) throw ApiError.notFound("Booking");
  return row;
}

export const businessBookingQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
  clientId: z.string().uuid().optional(),
});

export async function listBusinessBookings(user: AuthenticatedUser, businessId: string, query: z.infer<typeof businessBookingQuery>) {
  const membership = await requireCapability(user, businessId, "view");
  const canSeeSafety = roleCan(membership.role, "viewClientNotes");
  const conditions: SQL[] = [eq(bookings.businessId, businessId)];
  if (query.from) conditions.push(gte(bookings.startsAt, query.from));
  if (query.to) conditions.push(lt(bookings.startsAt, query.to));
  if (query.status) conditions.push(eq(bookings.status, query.status));
  if (query.clientId) conditions.push(eq(bookings.clientId, query.clientId));

  const rows = await db
    .select({
      ...bookingColumns,
      businessNote: bookings.businessNote,
      safety: bookings.safety,
      memberId: bookings.memberId,
      clientId: businessClients.id,
      clientName: businessClients.name,
      clientPhone: businessClients.phone,
      paidEtb: sql<string>`coalesce((select sum(${payments.amountEtb}) from ${payments} where ${payments.bookingId} = ${bookings.id} and ${payments.status} = 'recorded'), 0)`,
    })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(businesses, eq(businesses.id, bookings.businessId))
    .innerJoin(businessClients, eq(businessClients.id, bookings.clientId))
    .where(and(...conditions))
    .orderBy(asc(bookings.startsAt))
    .limit(500);

  return rows.map((row) => (canSeeSafety ? row : { ...row, safety: row.safety ? { flags: ["Safety notes are visible to practitioners and managers."] } : null }));
}

export async function listPractitioners(businessId: string) {
  return db
    .select({ id: businessMembers.id, name: users.name, title: businessMembers.title })
    .from(businessMembers)
    .innerJoin(users, eq(users.id, businessMembers.userId))
    .where(and(eq(businessMembers.businessId, businessId), eq(businessMembers.isBookable, true)));
}
