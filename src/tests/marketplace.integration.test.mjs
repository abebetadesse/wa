/**
 * End-to-end marketplace flow against the real MySQL database.
 * Skipped automatically when the database is unreachable. Everything it creates is removed.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { eq, inArray } from "drizzle-orm";

const { db, dbClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
const businessesSvc = await import("../server/marketplace/businesses.ts");
const catalogue = await import("../server/marketplace/catalogue.ts");
const bookingsSvc = await import("../server/marketplace/bookings.ts");
const operations = await import("../server/marketplace/operations.ts");
const engagement = await import("../server/marketplace/engagement.ts");
const notifications = await import("../server/marketplace/notifications.ts");
const realtime = await import("../server/realtime/index.ts");
const { addDays, todayIn } = await import("../server/marketplace/time.ts");

let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}

const run = crypto.randomBytes(4).toString("hex");
const created = { users: [], businesses: [] };
const person = (role = "user") => ({ id: crypto.randomUUID(), email: `mp-${run}-${crypto.randomBytes(3).toString("hex")}@example.test`, name: `Test ${role} ${run}`, role, permissions: [], phone: null });

let owner, client, otherClient, admin, business, service, remedyKind;

before(async () => {
  if (!available) return;
  owner = person("owner");
  client = person("client");
  otherClient = person("client");
  admin = { ...person("admin"), role: "admin" };
  for (const user of [owner, client, otherClient, admin]) {
    await db.insert(schema.users).values({ id: user.id, email: user.email, name: user.name, role: user.role === "admin" ? "admin" : "user" });
    created.users.push(user.id);
  }
});

after(async () => {
  if (!available) return;
  if (created.businesses.length) {
    const ids = created.businesses;
    await db.delete(schema.reviews).where(inArray(schema.reviews.businessId, ids));
    await db.delete(schema.payments).where(inArray(schema.payments.businessId, ids));
    await db.delete(schema.bookings).where(inArray(schema.bookings.businessId, ids));
    await db.delete(schema.businesses).where(inArray(schema.businesses.id, ids));
  }
  await db.delete(schema.realtimeEvents).where(inArray(schema.realtimeEvents.channel, [...created.users.map((id) => `user:${id}`), ...created.businesses.map((id) => `business:${id}`)]));
  await db.delete(schema.users).where(inArray(schema.users.id, created.users));
  await dbClient.end({ timeout: 2 });
});

const skip = () => !available && "database unavailable";

test("a business onboards, is verified and appears in the directory", { skip: skip() }, async () => {
  const [category] = await catalogue.listCategories();
  business = await businessesSvc.createBusiness(owner, {
    categoryId: category.id,
    name: `Tena Herbal ${run}`,
    tagline: "Traditional remedies with care",
    region: "Addis Ababa",
    city: "Addis Ababa",
    languages: ["am", "en"],
    deliveryModes: ["in_person", "video"],
  });
  created.businesses.push(business.id);
  assert.equal(business.status, "draft");

  const kinds = await catalogue.listServiceKinds();
  remedyKind = kinds.find((kind) => kind.requiresSafetyScreen);
  service = await catalogue.saveService(owner, business.id, null, {
    kindId: remedyKind.id,
    name: "Herbal consultation",
    durationMinutes: 60,
    priceEtb: 400,
    deliveryModes: ["in_person"],
    bufferMinutes: 0,
    isActive: true,
    sortOrder: 0,
  });

  await assert.rejects(businessesSvc.resolvePublicBusinessId(business.slug), (e) => e.status === 404, "drafts are not public");
  await businessesSvc.submitForVerification(owner, business.id, { credentials: [{ label: "Community elder endorsement" }] });
  await businessesSvc.decideVerification(admin, business.id, "verified", "Documents checked");

  const found = await businessesSvc.searchDirectory({ q: `Tena Herbal ${run}`, sort: "rating", page: 1, limit: 12 });
  assert.equal(found.total, 1);
  assert.equal(Number(found.businesses[0].fromPriceEtb), 400);

  const ownerInbox = await notifications.listNotifications(owner.id);
  assert.ok(ownerInbox.items.some((item) => item.type === "business.verified"), "owner is notified of verification");
});

test("clients see open slots and a slot can only be booked once, even concurrently", { skip: skip() }, async () => {
  // Open every day 08:00–12:00 in the business timezone.
  await catalogue.replaceHours(owner, business.id, {
    memberId: null,
    rules: Array.from({ length: 7 }, (_, weekday) => ({ weekday, startMinute: 8 * 60, endMinute: 12 * 60 })),
  });
  const date = addDays(todayIn("Africa/Addis_Ababa"), 2);
  const { slots } = await catalogue.availableSlots(business.id, { serviceId: service.id, date });
  assert.ok(slots.length >= 10, `expected a morning of slots, got ${slots.length}`);

  const safety = { takingMedicines: "yes", medicines: "metformin", pregnantOrBreastfeeding: "no" };
  await assert.rejects(
    bookingsSvc.requestBooking(client, business.id, { serviceId: service.id, startsAt: new Date(slots[0]), deliveryMode: "in_person" }),
    (e) => e.status === 400,
    "remedy services require the safety screen",
  );

  const attempts = await Promise.allSettled([
    bookingsSvc.requestBooking(client, business.id, { serviceId: service.id, startsAt: new Date(slots[0]), deliveryMode: "in_person", safety }),
    bookingsSvc.requestBooking(otherClient, business.id, { serviceId: service.id, startsAt: new Date(slots[0]), deliveryMode: "in_person", safety }),
  ]);
  const ok = attempts.filter((result) => result.status === "fulfilled");
  const failed = attempts.filter((result) => result.status === "rejected");
  assert.equal(ok.length, 1, "exactly one concurrent booking succeeds");
  assert.equal(failed[0].reason.status, 409);

  const after = await catalogue.availableSlots(business.id, { serviceId: service.id, date });
  assert.ok(!after.slots.includes(slots[0]), "the booked slot is no longer offered");
  assert.ok(after.slots.includes(slots[4]), "a later slot (09:00) is still offered");
});

test("the business confirms, completes, records payment; the client reviews", { skip: skip() }, async () => {
  const list = await bookingsSvc.listBusinessBookings(owner, business.id, {});
  assert.equal(list.length, 1);
  const booking = list[0];
  assert.ok(booking.safety.flags.some((flag) => flag.includes("metformin")), "safety flags reach the practitioner");

  await bookingsSvc.updateBookingStatusAsBusiness(owner, business.id, booking.id, { status: "confirmed" });
  await assert.rejects(
    bookingsSvc.updateBookingStatusAsBusiness(owner, business.id, booking.id, { status: "completed" }),
    (e) => e.status === 409,
    "cannot complete before the start time",
  );

  // Move the booking into the past to complete it (as if time had passed).
  await db.update(schema.bookings).set({ startsAt: new Date(Date.now() - 2 * 3600_000), endsAt: new Date(Date.now() - 3600_000) }).where(eq(schema.bookings.id, booking.id));
  await bookingsSvc.updateBookingStatusAsBusiness(owner, business.id, booking.id, { status: "completed" });

  const today = todayIn("Africa/Addis_Ababa");
  await operations.recordPayment(owner, business.id, { bookingId: booking.id, amountEtb: 150, method: "cash", receivedOn: today });
  let [row] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, booking.id));
  assert.equal(row.paymentStatus, "partial");
  const second = await operations.recordPayment(owner, business.id, { bookingId: booking.id, amountEtb: 250, method: "telebirr", reference: "TB123", receivedOn: today });
  [row] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, booking.id));
  assert.equal(row.paymentStatus, "paid");
  await operations.voidPayment(owner, business.id, second.id, "Entered twice");
  [row] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, booking.id));
  assert.equal(row.paymentStatus, "partial", "voiding recomputes the payment status");

  const bookedBy = row.bookedByUserId === client.id ? client : otherClient;
  const review = await engagement.createReview(bookedBy, { bookingId: booking.id, rating: 5, comment: "Very caring." });
  await assert.rejects(engagement.createReview(bookedBy, { bookingId: booking.id, rating: 4 }), (e) => e.status === 409, "one review per booking");
  const [biz] = await db.select().from(schema.businesses).where(eq(schema.businesses.id, business.id));
  assert.equal(Number(biz.ratingAverage), 5);
  assert.equal(biz.ratingCount, 1);
  await engagement.respondToReview(owner, business.id, review.id, "Thank you!");

  const board = await operations.dashboard(owner, business.id);
  assert.equal(board.kpis.ratingCount, 1);
  assert.equal(board.kpis.revenueMonthEtb, 150);
  assert.equal(board.revenueSeries.length, 30);
});

test("messages flow both ways and are delivered live through database polling", { skip: skip() }, async () => {
  const received = [];
  const unsubscribe = await realtime.subscribe([`business:${business.id}`], (event) => received.push(event));
  const conversation = await engagement.openConversation(client, business.id);
  await engagement.sendMessage(client, conversation.id, "Selam, are you open on Saturday?");
  await engagement.sendMessage(owner, conversation.id, "Yes, from 8 to 12.");

  const deadline = Date.now() + 5000;
  while (received.filter((event) => event.type === "message.created").length < 2 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 50));
  unsubscribe();
  assert.equal(received.filter((event) => event.type === "message.created").length, 2, "both messages arrive in realtime");

  const replay = await realtime.replay([`business:${business.id}`], 0);
  assert.ok(replay.length >= 2, "events can be replayed after a reconnect");

  const inbox = await engagement.listConversations(owner, business.id);
  assert.equal(inbox[0].unread, 1);
  await engagement.listMessages(owner, conversation.id);
  assert.equal((await engagement.listConversations(owner, business.id))[0].unread, 0, "opening the thread marks it read");

  await assert.rejects(engagement.listMessages(otherClient, conversation.id), (e) => e.status === 404, "strangers cannot read a conversation");
});

test("workspace access is enforced", { skip: skip() }, async () => {
  await assert.rejects(operations.listClients(client, business.id, { page: 1 }), (e) => e.status === 404);
  await assert.rejects(catalogue.saveService(client, business.id, null, { kindId: remedyKind.id, name: "X", durationMinutes: 30, priceEtb: 1, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 0 }), (e) => e.status === 404);
});

const caseSvc = await import("../server/cases/service.ts");
const { DOMAIN_CONFIGS } = await import("../server/cases/domains/index.ts");
const team = await import("../server/marketplace/team.ts");

test("booking a reading opens a case that the business's own team reviews", { skip: skip() }, async () => {
  const readingKind = (await catalogue.listServiceKinds()).find((kind) => kind.caseDomain === "spiritual");
  assert.ok(readingKind, "seed data includes a service kind linked to spiritual cases");
  const reading = await catalogue.saveService(owner, business.id, null, {
    kindId: readingKind.id, name: "Awde Negest reading", durationMinutes: 45, priceEtb: 300, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 1,
  });
  const date = addDays(todayIn("Africa/Addis_Ababa"), 3);
  const { slots } = await catalogue.availableSlots(business.id, { serviceId: reading.id, date });
  const booking = await bookingsSvc.requestBooking(client, business.id, { serviceId: reading.id, startsAt: new Date(slots[0]), deliveryMode: "in_person" });
  assert.equal(booking.caseDomain, "spiritual");

  const svc = caseSvc.caseService;
  await assert.rejects(svc.start(client, "career", { safetyAnswers: { basic_needs: "yes_comfortable", self_harm: "no", financial_pressure: "no" }, answers: {}, bookingId: booking.id }), (e) => e.status === 400, "domain must match the service");
  await assert.rejects(svc.start(otherClient, "spiritual", { safetyAnswers: { self_harm: "no", immediateRisk: "no" }, answers: { nameGeez: "ሰላማዊት" }, bookingId: booking.id }), (e) => e.status === 404, "only the booking's client can open its case");

  let view = await svc.start(client, "spiritual", { safetyAnswers: { self_harm: "no", immediateRisk: "no" }, answers: { nameGeez: "ሰላማዊት" }, bookingId: booking.id });
  const linked = await bookingsSvc.getBookingForClient(client, booking.id);
  assert.equal(linked.caseId, view.id, "the booking points at its case");
  await assert.rejects(svc.start(client, "spiritual", { safetyAnswers: { self_harm: "no", immediateRisk: "no" }, answers: { nameGeez: "ሰላማዊት" }, bookingId: booking.id }), (e) => e.status === 409, "one case per booking");

  const required = Object.fromEntries(view.questions.filter((q) => q.required).map((q) => [q.id, q.options?.[0]?.value ?? "ሰላማዊት"]));
  view = await svc.answer(client, view.id, required);
  view = await svc.submit(client, view.id);
  assert.equal(view.stage, "awaiting_expert");

  const queue = await svc.businessQueue(owner, business.id);
  assert.equal(queue.waiting.length, 1, "the case waits in the business's own queue");
  await assert.rejects(svc.businessQueue(otherClient, business.id), (e) => e.status === 404);

  // The owner is a regular account (no platform expert role) yet can review their business's case.
  await svc.claim(owner, view.id);
  const checklist = Object.fromEntries(DOMAIN_CONFIGS.spiritual.reviewChecklist.map((item) => [item.id, true]));
  await svc.approve(owner, view.id, { checklist, notes: "Reviewed with care." });
  const approved = await svc.get(client, view.id);
  assert.equal(approved.stage, "full_report_released", "the booking covers the report: no second payment");
  assert.equal(approved.report.unlocked, true);
  assert.equal(approved.payment.amountEtb, 0);
  await assert.rejects(svc.purchase(client, view.id, "telebirr"), (e) => e.status === 409, "cannot be charged again");
  assert.ok((await notifications.listNotifications(client.id)).items.some((n) => n.type === "case.approved"), "the client is told the report is ready");
});

test("owners invite team members; invitations are single-use and email-bound", { skip: skip() }, async () => {
  const invitee = person("practitioner");
  await db.insert(schema.users).values({ id: invitee.id, email: invitee.email, name: invitee.name, role: "user" });
  created.users.push(invitee.id);

  const invite = await team.inviteMember(owner, business.id, { email: invitee.email.toUpperCase(), role: "practitioner", title: "Herbalist", isBookable: true }, "http://localhost:5500");
  const token = invite.link.split("/invitations/")[1];
  assert.ok((await notifications.listNotifications(invitee.id)).items.some((n) => n.type === "team.invited"), "existing accounts are notified in-app");

  await assert.rejects(team.inviteMember(client, business.id, { email: "x@example.test", role: "staff", isBookable: false }, "http://x"), (e) => e.status === 404, "non-members cannot invite");
  await assert.rejects(team.acceptInvitation(otherClient, token), (e) => e.status === 403, "another account cannot accept");
  assert.equal((await team.previewInvitation(otherClient, token)).matchesAccount, false);

  const joined = await team.acceptInvitation(invitee, token);
  assert.equal(joined.businessId, business.id);
  await assert.rejects(team.acceptInvitation(invitee, token), (e) => e.status === 409, "invitations are single-use");

  const roster = await team.getTeam(owner, business.id);
  const member = roster.members.find((m) => m.userId === invitee.id);
  assert.equal(member.role, "practitioner");
  assert.equal(member.isBookable, true);

  // The new practitioner can now review cases but not manage the team.
  assert.ok(await caseSvc.caseService.businessQueue(invitee, business.id));
  await assert.rejects(team.inviteMember(invitee, business.id, { email: "y@example.test", role: "staff", isBookable: false }, "http://x"), (e) => e.status === 403);

  await team.updateMember(owner, business.id, member.id, { role: "manager" });
  const ownerMember = roster.members.find((m) => m.role === "owner");
  await assert.rejects(team.removeMember(invitee, business.id, ownerMember.id), (e) => e.status === 403, "the owner cannot be removed");
  await assert.rejects(team.updateMember(owner, business.id, ownerMember.id, { role: "staff" }), (e) => e.status === 403, "the owner's role is fixed");

  const left = await team.removeMember(invitee, business.id, member.id);
  assert.equal(left.left, true, "members can leave on their own");
  await assert.rejects(caseSvc.caseService.businessQueue(invitee, business.id), (e) => e.status === 404, "former members lose access");
});
