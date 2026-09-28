/** Services, opening hours, time off and slot availability for a business. */
import { and, asc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { availabilityRules, bookings, businessCategories, businesses, businessMembers, serviceKinds, services, timeOff } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability } from "./access";
import { DELIVERY_MODES } from "./businesses";
import { addDays, computeSlots, localToUtc, todayIn, weekdayOf } from "./time";
import { businessChannel, publish } from "@/server/realtime";

const MIN = 60_000;
/** Earliest a client can book, and how far ahead. Businesses can tune these later. */
export const BOOKING_LEAD_MINUTES = 60;
export const BOOKING_HORIZON_DAYS = 60;
const SLOT_STEP_MINUTES = 15;

// ── Catalogues (admin-managed data) ──────────────────────────────────────────

export function listCategories(includeInactive = false) {
  return db.select().from(businessCategories).where(includeInactive ? undefined : eq(businessCategories.isActive, true)).orderBy(asc(businessCategories.sortOrder), asc(businessCategories.name));
}

export function listServiceKinds(includeInactive = false) {
  return db.select().from(serviceKinds).where(includeInactive ? undefined : eq(serviceKinds.isActive, true)).orderBy(asc(serviceKinds.sortOrder), asc(serviceKinds.name));
}

export const categoryInput = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/, "Use lowercase letters, digits and dashes."),
  name: z.string().trim().min(2).max(120),
  nameAm: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  sector: z.enum(["healing", "cultural"]),
  icon: z.string().trim().max(40).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const serviceKindInput = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/, "Use lowercase letters, digits and dashes."),
  name: z.string().trim().min(2).max(120),
  nameAm: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  requiresSafetyScreen: z.boolean().default(false),
  caseDomain: z.enum(["career", "legal", "relationship", "social", "spiritual"]).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function upsertCategory(id: string | null, input: z.infer<typeof categoryInput>) {
  if (id) {
    const [row] = await db.update(businessCategories).set({ ...input, updatedAt: new Date() }).where(eq(businessCategories.id, id)).returning();
    if (!row) throw ApiError.notFound("Category");
    return row;
  }
  const [row] = await db.insert(businessCategories).values(input).onConflictDoNothing().returning();
  if (!row) throw ApiError.conflict(`A category with slug '${input.slug}' already exists.`);
  return row;
}

export async function upsertServiceKind(id: string | null, input: z.infer<typeof serviceKindInput>) {
  if (id) {
    const [row] = await db.update(serviceKinds).set({ ...input, updatedAt: new Date() }).where(eq(serviceKinds.id, id)).returning();
    if (!row) throw ApiError.notFound("Service kind");
    return row;
  }
  const [row] = await db.insert(serviceKinds).values(input).onConflictDoNothing().returning();
  if (!row) throw ApiError.conflict(`A service kind with slug '${input.slug}' already exists.`);
  return row;
}

// ── Services ─────────────────────────────────────────────────────────────────

export const serviceInput = z.object({
  kindId: z.string().uuid("Choose a service type."),
  name: z.string().trim().min(2, "Service name is required.").max(160),
  nameAm: z.string().trim().max(160).optional(),
  description: z.string().trim().max(3000).optional(),
  durationMinutes: z.coerce.number().int().min(10, "At least 10 minutes.").max(8 * 60),
  priceEtb: z.coerce.number().min(0).max(1_000_000),
  deliveryModes: z.array(z.enum(DELIVERY_MODES)).min(1, "Choose at least one way to deliver this service."),
  bufferMinutes: z.coerce.number().int().min(0).max(240).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function listServices(user: AuthenticatedUser, businessId: string) {
  await requireCapability(user, businessId, "view");
  return db
    .select({ service: services, kind: serviceKinds })
    .from(services)
    .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
    .where(eq(services.businessId, businessId))
    .orderBy(asc(services.sortOrder), asc(services.name))
    .then((rows) => rows.map(({ service, kind }) => ({ ...service, kind: { id: kind.id, name: kind.name, slug: kind.slug, requiresSafetyScreen: kind.requiresSafetyScreen } })));
}

export async function saveService(user: AuthenticatedUser, businessId: string, serviceId: string | null, input: z.infer<typeof serviceInput>) {
  await requireCapability(user, businessId, "manageServices");
  const [kind] = await db.select({ id: serviceKinds.id }).from(serviceKinds).where(and(eq(serviceKinds.id, input.kindId), eq(serviceKinds.isActive, true))).limit(1);
  if (!kind) throw ApiError.badRequest("Choose a valid service type.");
  const values = { ...input, priceEtb: input.priceEtb.toFixed(2) };
  const [row] = serviceId
    ? await db.update(services).set({ ...values, updatedAt: new Date() }).where(and(eq(services.id, serviceId), eq(services.businessId, businessId))).returning()
    : await db.insert(services).values({ ...values, businessId }).returning();
  if (!row) throw ApiError.notFound("Service");
  await publish(businessChannel(businessId), "service.saved", { serviceId: row.id });
  return row;
}

export async function archiveService(user: AuthenticatedUser, businessId: string, serviceId: string) {
  await requireCapability(user, businessId, "manageServices");
  const [row] = await db.update(services).set({ isActive: false, updatedAt: new Date() }).where(and(eq(services.id, serviceId), eq(services.businessId, businessId))).returning();
  if (!row) throw ApiError.notFound("Service");
  return row;
}

// ── Opening hours & time off ─────────────────────────────────────────────────

export const hoursInput = z.object({
  memberId: z.string().uuid().nullable().default(null),
  rules: z
    .array(
      z
        .object({ weekday: z.number().int().min(0).max(6), startMinute: z.number().int().min(0).max(1439), endMinute: z.number().int().min(1).max(1440) })
        .refine((rule) => rule.endMinute > rule.startMinute, "Closing time must be after opening time."),
    )
    .max(50),
});

export async function getHours(user: AuthenticatedUser, businessId: string) {
  await requireCapability(user, businessId, "view");
  const [rules, off] = await Promise.all([
    db.select().from(availabilityRules).where(eq(availabilityRules.businessId, businessId)).orderBy(asc(availabilityRules.weekday), asc(availabilityRules.startMinute)),
    db.select().from(timeOff).where(and(eq(timeOff.businessId, businessId), gte(timeOff.endsAt, new Date()))).orderBy(asc(timeOff.startsAt)),
  ]);
  return { rules, timeOff: off };
}

/** Replaces the weekly hours for the business (or one practitioner) in one transaction. */
export async function replaceHours(user: AuthenticatedUser, businessId: string, input: z.infer<typeof hoursInput>) {
  await requireCapability(user, businessId, "manageSchedule");
  await db.transaction(async (tx) => {
    await tx
      .delete(availabilityRules)
      .where(and(eq(availabilityRules.businessId, businessId), input.memberId ? eq(availabilityRules.memberId, input.memberId) : sql`${availabilityRules.memberId} is null`));
    if (input.rules.length) await tx.insert(availabilityRules).values(input.rules.map((rule) => ({ ...rule, businessId, memberId: input.memberId })));
    await publish(businessChannel(businessId), "schedule.updated", {}, tx);
  });
  return getHours(user, businessId);
}

export const timeOffInput = z
  .object({ memberId: z.string().uuid().nullable().default(null), startsAt: z.coerce.date(), endsAt: z.coerce.date(), reason: z.string().trim().max(200).optional() })
  .refine((value) => value.endsAt > value.startsAt, "The end must be after the start.");

export async function addTimeOff(user: AuthenticatedUser, businessId: string, input: z.infer<typeof timeOffInput>) {
  await requireCapability(user, businessId, "manageSchedule");
  const [row] = await db.insert(timeOff).values({ ...input, businessId }).returning();
  await publish(businessChannel(businessId), "schedule.updated", {});
  return row;
}

export async function removeTimeOff(user: AuthenticatedUser, businessId: string, id: string) {
  await requireCapability(user, businessId, "manageSchedule");
  await db.delete(timeOff).where(and(eq(timeOff.id, id), eq(timeOff.businessId, businessId)));
  await publish(businessChannel(businessId), "schedule.updated", {});
  return { removed: id };
}

// ── Slots ────────────────────────────────────────────────────────────────────

export const slotQuery = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  memberId: z.string().uuid().optional(),
});

/** Open start times for a service on a local date, honouring hours, time off, bookings and buffers. */
export async function availableSlots(businessId: string, query: z.infer<typeof slotQuery>, now = new Date()) {
  const [row] = await db
    .select({ service: services, timezone: businesses.timezone, status: businesses.status })
    .from(services)
    .innerJoin(businesses, eq(businesses.id, services.businessId))
    .where(and(eq(services.id, query.serviceId), eq(services.businessId, businessId), eq(services.isActive, true)))
    .limit(1);
  if (!row) throw ApiError.notFound("Service");
  const tz = row.timezone;

  const today = todayIn(tz, now);
  if (query.date < today || query.date > addDays(today, BOOKING_HORIZON_DAYS)) return { date: query.date, timezone: tz, slots: [] };

  if (query.memberId) {
    const [member] = await db.select({ id: businessMembers.id }).from(businessMembers).where(and(eq(businessMembers.id, query.memberId), eq(businessMembers.businessId, businessId), eq(businessMembers.isBookable, true))).limit(1);
    if (!member) throw ApiError.notFound("Practitioner");
  }

  const weekday = weekdayOf(query.date);
  const rules = await db
    .select()
    .from(availabilityRules)
    .where(and(eq(availabilityRules.businessId, businessId), eq(availabilityRules.weekday, weekday)));
  // A practitioner's own hours override the business hours when they exist.
  const own = query.memberId ? rules.filter((rule) => rule.memberId === query.memberId) : [];
  const applicable = own.length ? own : rules.filter((rule) => rule.memberId === null);

  const dayStart = localToUtc(query.date, 0, tz);
  const dayEnd = localToUtc(addDays(query.date, 1), 0, tz);

  const [booked, off] = await Promise.all([
    db
      .select({ startsAt: bookings.startsAt, endsAt: bookings.endsAt, memberId: bookings.memberId, bufferMinutes: services.bufferMinutes })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .where(and(eq(bookings.businessId, businessId), inArray(bookings.status, ["requested", "confirmed"]), lt(bookings.startsAt, dayEnd), gte(bookings.endsAt, dayStart))),
    db.select().from(timeOff).where(and(eq(timeOff.businessId, businessId), lt(timeOff.startsAt, dayEnd), gte(timeOff.endsAt, dayStart))),
  ]);

  const memberKey = query.memberId ?? null;
  const busy = [
    ...booked.filter((b) => (b.memberId ?? null) === memberKey).map((b) => ({ start: b.startsAt.getTime(), end: b.endsAt.getTime() + b.bufferMinutes * MIN })),
    ...off.filter((t) => t.memberId === null || t.memberId === memberKey).map((t) => ({ start: t.startsAt.getTime(), end: t.endsAt.getTime() })),
  ];

  const slots = computeSlots({
    windows: applicable.map((rule) => ({ start: localToUtc(query.date, rule.startMinute, tz).getTime(), end: localToUtc(query.date, rule.endMinute, tz).getTime() })),
    busy,
    duration: (row.service.durationMinutes + row.service.bufferMinutes) * MIN,
    step: SLOT_STEP_MINUTES * MIN,
    notBefore: now.getTime() + BOOKING_LEAD_MINUTES * MIN,
  });

  return { date: query.date, timezone: tz, slots: slots.map((start) => new Date(start).toISOString()) };
}
