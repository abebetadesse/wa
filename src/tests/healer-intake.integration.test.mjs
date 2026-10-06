/**
 * Healer intake end to end against MySQL: per-service modalities, uploads, criteria-based
 * auto-responses (instant vs. held for review), drafts, the review workspace and analysis.
 * Skipped when the database is unreachable; everything created is removed.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "intake-test-"));
process.env.UPLOAD_DIR = uploadDir;

const { db, dbClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}
const skip = () => !available && "database unavailable";

const businessesSvc = await import("../server/marketplace/businesses.ts");
const catalogue = await import("../server/marketplace/catalogue.ts");
const bookingsSvc = await import("../server/marketplace/bookings.ts");
const settings = await import("../server/intake/settings.ts");
const attachments = await import("../server/intake/attachments.ts");
const responses = await import("../server/intake/responses.ts");
const review = await import("../server/intake/review.ts");
const { addDays, todayIn } = await import("../server/marketplace/time.ts");

const run = crypto.randomBytes(3).toString("hex");
const person = (label, role = "user") => ({ id: crypto.randomUUID(), email: `intake-${label}-${run}@example.test`, name: `Intake ${label}`, role, permissions: [], phone: null });
const owner = person("owner");
const client = person("client");
const stranger = person("stranger");
const admin = person("admin", "admin");
let business, service, readingService, slots;

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(64).fill(1)]);

before(async () => {
  if (!available) return;
  for (const u of [owner, client, stranger, admin]) await db.insert(schema.users).values({ id: u.id, email: u.email, name: u.name, role: u.role, region: u === client ? "Amhara" : null });
  const categories = await catalogue.listCategories();
  business = await businessesSvc.createBusiness(owner, { categoryId: categories.find((c) => c.slug === "debtera").id, name: `Intake Sanctuary ${run}`, languages: ["am"], deliveryModes: ["in_person", "video"] });
  const kinds = await catalogue.listServiceKinds();
  service = await catalogue.saveService(owner, business.id, null, { kindId: kinds.find((k) => k.slug === "consultation").id, name: "Fewus consultation", durationMinutes: 60, priceEtb: 300, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 0 });
  readingService = await catalogue.saveService(owner, business.id, null, { kindId: kinds.find((k) => k.slug === "consultation").id, name: "Awde Negest naming", durationMinutes: 45, priceEtb: 200, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 1 });
  await businessesSvc.submitForVerification(owner, business.id, { credentials: [{ label: "Debtera lineage" }] });
  await businessesSvc.decideVerification(admin, business.id, "verified");
  await catalogue.replaceHours(owner, business.id, { memberId: null, rules: Array.from({ length: 7 }, (_, weekday) => ({ weekday, startMinute: 8 * 60, endMinute: 16 * 60 })) });
  slots = (await catalogue.availableSlots(business.id, { serviceId: service.id, date: addDays(todayIn("Africa/Addis_Ababa"), 3) })).slots;
});

after(async () => {
  if (!available) return;
  if (business) {
    await db.delete(schema.payments).where(eq(schema.payments.businessId, business.id));
    await db.delete(schema.bookings).where(eq(schema.bookings.businessId, business.id));
    await db.delete(schema.businesses).where(eq(schema.businesses.id, business.id));
  }
  const ids = [owner.id, client.id, stranger.id, admin.id];
  await db.delete(schema.notifications).where(inArray(schema.notifications.userId, ids));
  await db.delete(schema.realtimeEvents).where(inArray(schema.realtimeEvents.channel, [...ids.map((id) => `user:${id}`), ...(business ? [`business:${business.id}`] : [])]));
  await db.delete(schema.users).where(inArray(schema.users.id, ids));
  fs.rmSync(uploadDir, { recursive: true, force: true });
  await dbClient.end({ timeout: 2 });
});

/** A free slot on day 3–5, fetched fresh so earlier bookings in this file never collide. */
async function freeSlot(serviceId) {
  for (let day = 3; day <= 6; day++) {
    const { slots: open } = await catalogue.availableSlots(business.id, { serviceId, date: addDays(todayIn("Africa/Addis_Ababa"), day) });
    if (open.length) return new Date(open[open.length - 1]);
  }
  throw new Error("no free slot");
}

const messagesFor = async (bookingId) => {
  const [conversation] = await db.select().from(schema.conversations).where(eq(schema.conversations.bookingId, bookingId));
  return conversation ? db.select().from(schema.messages).where(eq(schema.messages.conversationId, conversation.id)) : [];
};

test("owners configure intake per service; clients see it with the service", { skip: skip() }, async () => {
  assert.throws(() => settings.intakeSettingsInput.parse({ allowText: true, allowImage: true, allowAudio: true, allowVideo: false, dropdownType: "custom", customDropdownOptions: [{ value: "a", label: "A" }] }), /two options/);
  const config = await settings.saveIntakeSettings(owner, business.id, service.id, settings.intakeSettingsInput.parse({ allowText: true, allowImage: true, allowAudio: true, allowVideo: false, dropdownType: "metsehafe_fewus" }));
  assert.ok(config.options.some((o) => o.value === "fewus_headache_migraine"));
  await settings.saveIntakeSettings(owner, business.id, readingService.id, settings.intakeSettingsInput.parse({ allowText: true, allowImage: false, allowAudio: true, allowVideo: false, dropdownType: "awde_negest" }));
  await assert.rejects(settings.saveIntakeSettings(client, business.id, service.id, settings.intakeSettingsInput.parse({ allowText: true, allowImage: true, allowAudio: true, allowVideo: false, dropdownType: "none" })), (e) => e.status === 404);

  const page = await businessesSvc.getPublicBusiness(business.slug, null);
  const reading = page.services.find((s) => s.id === readingService.id);
  assert.equal(reading.intake.asksGeezName, true);
  assert.equal(reading.intake.allowImage, false);
});

test("uploads: sniffed by content, limited by the service, private until attached", { skip: skip() }, async () => {
  await assert.rejects(attachments.uploadAttachment(client, { serviceId: service.id, kind: "image", file: new File([new TextEncoder().encode("not an image at all")], "x.png") }), /not supported/);
  await assert.rejects(attachments.uploadAttachment(client, { serviceId: service.id, kind: "video", file: new File([PNG], "v.mp4") }), /does not accept videos/);
  await assert.rejects(attachments.uploadAttachment(client, { serviceId: service.id, kind: "audio", file: new File([PNG], "a.webm") }), /not a audio/);
  const upload = await attachments.uploadAttachment(client, { serviceId: service.id, kind: "image", file: new File([PNG], "tongue.png") });
  assert.equal(upload.mimeType, "image/png");
  await assert.rejects(attachments.readAttachment(owner, upload.id), (e) => e.status === 404, "the business sees it only once attached");
  assert.ok((await attachments.readAttachment(client, upload.id)).size > 0);
  globalThis.__upload = upload;
});

test("auto-responses: instant acknowledgement, reviewed Fewus draft, and no instant send with remedies", { skip: skip() }, async () => {
  assert.throws(() => responses.ruleInput.parse({ name: "Bad", responseMode: "instant_auto_send", templateTitle: "t t", templateBody: "b b", includeFewusText: true }), /reviewed before sending/);
  await responses.createRule(owner, business.id, responses.ruleInput.parse({ name: "Acknowledge", responseMode: "instant_auto_send", templateTitle: "Thank you", templateBody: "Selam {{client_name}}, we received your request {{booking_reference}} for {{service_name}} on {{booking_time}}.", priority: 1 }));
  await responses.createRule(owner, business.id, responses.ruleInput.parse({ name: "Headache reading", serviceId: service.id, responseMode: "draft_for_review", triggerCriteria: { dropdownValues: ["fewus_headache_migraine"] }, templateTitle: "Guidance for {{selection}}", templateBody: "Our guidance:", includeFewusText: true, attachedRemedies: [{ name: "Feto seed paste", note: "on the temples only" }] }));
  await responses.createRule(owner, business.id, responses.ruleInput.parse({ name: "Chest words", responseMode: "instant_auto_send", triggerCriteria: { keywords: ["chest"] }, templateTitle: "About your chest", templateBody: "We will call you." }));
  await responses.saveFewusText(owner, business.id, "fewus_headache_migraine", { amharicText: "የባለሙያው የራሱ ጽሑፍ" });

  const booking = await bookingsSvc.requestBooking(client, business.id, {
    serviceId: service.id,
    startsAt: await freeSlot(service.id),
    deliveryMode: "in_person",
    intake: { dropdownValue: "fewus_headache_migraine", text: "Throbbing headache on the right side", attachmentIds: [globalThis.__upload.id] },
  });
  const msgs = await messagesFor(booking.id);
  assert.equal(msgs.length, 1, "only the acknowledgement goes out automatically");
  assert.match(msgs[0].body, new RegExp(`Selam Intake client, we received your request ${booking.reference}`));
  const drafts = await responses.listDrafts(owner, business.id, booking.id);
  const fewusDraft = drafts.find((d) => d.status === "draft");
  assert.ok(fewusDraft, "the Fewus response waits for the healer");
  assert.match(fewusDraft.body, /የባለሙያው የራሱ ጽሑፍ/);
  assert.match(fewusDraft.body, /ገጽ 78/);
  assert.equal(fewusDraft.remedies[0].name, "Feto seed paste");
  const [att] = await db.select().from(schema.intakeAttachments).where(eq(schema.intakeAttachments.id, globalThis.__upload.id));
  assert.equal(att.bookingId, booking.id);
  assert.ok((await attachments.readAttachment(owner, att.id)).size > 0, "now visible to the healer");
  await assert.rejects(attachments.readAttachment(stranger, att.id), (e) => e.status === 404);
  await assert.rejects(bookingsSvc.requestBooking(client, business.id, { serviceId: service.id, startsAt: await freeSlot(service.id), deliveryMode: "in_person", intake: { attachmentIds: [att.id] } }), /already used/);

  // One-click approval sends it with the remedies listed.
  await responses.sendDraft(owner, business.id, fewusDraft.id);
  const after = await messagesFor(booking.id);
  assert.equal(after.length, 2);
  assert.match(after.at(-1).body, /• Feto seed paste: on the temples only/);
  await assert.rejects(responses.sendDraft(owner, business.id, fewusDraft.id), (e) => e.status === 409);
  globalThis.__booking = booking;
});

test("urgent intake: instant rules are held, the client gets a safety message and the team is alerted", { skip: skip() }, async () => {
  const booking = await bookingsSvc.requestBooking(client, business.id, { serviceId: service.id, startsAt: await freeSlot(service.id), deliveryMode: "in_person", intake: { text: "Sudden chest pain and I can't breathe well" } });
  const drafts = await responses.listDrafts(owner, business.id, booking.id);
  const held = drafts.filter((d) => d.status === "draft");
  assert.ok(held.length >= 2 && held.every((d) => /held for review/.test(d.heldReason ?? "")), "acknowledgement and keyword rule both held");
  const sentDrafts = drafts.filter((d) => d.status === "sent" && d.messageId);
  assert.equal(sentDrafts.length, 1, "nothing but the safety message goes out");
  const [message] = await db.select().from(schema.messages).where(eq(schema.messages.id, sentDrafts[0].messageId));
  assert.ok(message);
  assert.match(message.body, /Automatic safety message/);
  const [alert] = await db.select().from(schema.notifications).where(eq(schema.notifications.userId, owner.id));
  assert.ok(alert);
});

test("review workspace and analysis bring both domains side by side", { skip: skip() }, async () => {
  const booking = globalThis.__booking;
  const ws = await review.getBookingReview(owner, business.id, booking.id);
  assert.equal(ws.manuscript.heading.key, "fewus_headache_migraine");
  assert.ok(ws.manuscript.bookReferences.some((r) => r.page === 78));
  assert.ok(ws.manuscript.plants.items.some((p) => p.slug === "feto"));
  assert.equal(ws.attachments.length, 1);
  assert.equal(ws.client.region, "Amhara");
  await assert.rejects(review.getBookingReview(stranger, business.id, booking.id), (e) => e.status === 404);

  const analysis = await review.analyseBooking(owner, business.id, booking.id, { includeLiterature: false });
  assert.equal(analysis.ecology.ecology.key, "dega");
  assert.ok(analysis.remedies.categories.includes("headache"));
  assert.ok(analysis.remedies.candidates.some((c) => c.slug === "feto"));
  assert.equal(analysis.remedies.biochemistry.levels.length, 4);

  // Insert into review / auto-communicate.
  const draft = await responses.createDraft(owner, business.id, booking.id, { title: "Profile", body: "Inserted text", remedies: [] });
  assert.equal(draft.status, "draft");
  const sent = await responses.sendNow(owner, business.id, booking.id, { title: "Direct", body: "Sent directly by the healer" });
  assert.equal(sent.status, "sent");
});

test("Awde Negest intake: Ge'ez name drives the digital-root and humour criteria", { skip: skip() }, async () => {
  const profile = (await import("../lib/cultural/healerProfileCalculator.ts")).calculateHealerProfile({ nameGeez: "ሰላማዊት", category: "wellbeing" });
  await responses.createRule(owner, business.id, responses.ruleInput.parse({ name: "Root match", serviceId: readingService.id, responseMode: "draft_for_review", triggerCriteria: { digitalRoots: [profile.gematria.digitalRoot], humors: [profile.humor.key] }, templateTitle: "Your reading", templateBody: "Circle: {{circle}} · root {{digital_root}}", includeProfile: true }));
  await assert.rejects(bookingsSvc.requestBooking(client, business.id, { serviceId: readingService.id, startsAt: await freeSlot(readingService.id), deliveryMode: "in_person", intake: { dropdownValue: "wellbeing", nameGeez: "Selam" } }), /Ge'ez/);
  const booking = await bookingsSvc.requestBooking(client, business.id, { serviceId: readingService.id, startsAt: await freeSlot(readingService.id), deliveryMode: "in_person", intake: { dropdownValue: "wellbeing", nameGeez: "ሰላማዊት" } });
  const drafts = await responses.listDrafts(owner, business.id, booking.id);
  const reading = drafts.find((d) => d.title === "Your reading");
  assert.ok(reading, "digital root and humour matched");
  assert.match(reading.body, new RegExp(`root ${profile.gematria.digitalRoot}`));
  assert.match(reading.body, /Sacred names to consider/);
  const ws = await review.getBookingReview(owner, business.id, booking.id);
  assert.equal(ws.profile.sacredNames.length, 3);
});

test("Metsehafe Asmat: the client picks a chapter; the healer delivers it with cautions and framing", { skip: skip() }, async () => {
  const kinds = await catalogue.listServiceKinds();
  const asmatService = await catalogue.saveService(owner, business.id, null, { kindId: kinds.find((k) => k.slug === "consultation").id, name: "Asmat protection", durationMinutes: 45, priceEtb: 250, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 2 });
  const config = await settings.saveIntakeSettings(owner, business.id, asmatService.id, settings.intakeSettingsInput.parse({ allowText: true, allowImage: false, allowAudio: true, allowVideo: false, dropdownType: "metsehafe_asmat" }));
  assert.equal(config.options.length, 13);
  assert.equal(config.asksGeezName, true);
  assert.ok(config.options.some((o) => o.value === "asmat_ayne_tila" && /ስለ አይነ ጥላ መፍትሔ/.test(o.label)));
  await assert.rejects(bookingsSvc.requestBooking(client, business.id, { serviceId: asmatService.id, startsAt: await freeSlot(asmatService.id), deliveryMode: "in_person", intake: { dropdownValue: "fewus_headache_migraine" } }), /listed options/);

  await assert.rejects(responses.saveManuscriptText(owner, business.id, "asmat_nonexistent", { amharicText: "x" }), (e) => e.status === 404);
  await responses.saveManuscriptText(owner, business.id, "asmat_ayne_tila", { amharicText: "የደብተራው የራሱ የአይነ ጥላ ጽሑፍ" });
  const library = await responses.listManuscriptLibrary(owner, business.id, "metsehafe_asmat");
  assert.equal(library.contents.length, 13);
  assert.equal(library.headings.filter((h) => h.text).length, 1);
  await responses.createRule(owner, business.id, responses.ruleInput.parse({ name: "Asmat chapter", serviceId: asmatService.id, responseMode: "draft_for_review", templateTitle: "{{selection}}", templateBody: "Prepared for you:", includeFewusText: true }));

  const booking = await bookingsSvc.requestBooking(client, business.id, { serviceId: asmatService.id, startsAt: await freeSlot(asmatService.id), deliveryMode: "in_person", intake: { dropdownValue: "asmat_ayne_tila", nameGeez: "ሰላማዊት", text: "I feel a shadow over me" } });
  const drafts = await responses.listDrafts(owner, business.id, booking.id);
  const chapter = drafts.find((d) => d.status === "draft" && /Prepared for you/.test(d.body));
  assert.ok(chapter, "manuscript texts always wait for the healer");
  assert.match(chapter.body, /የደብተራው የራሱ የአይነ ጥላ ጽሑፍ/);
  assert.match(chapter.body, /ገጽ 14–15/);
  assert.match(chapter.body, /euphorbia/i, "the eye caution travels with the chapter");

  const ws = await review.getBookingReview(owner, business.id, booking.id);
  assert.equal(ws.manuscript.source, "metsehafe_asmat");
  assert.equal(ws.manuscript.cautions[0].level, "danger");
  assert.ok(ws.manuscript.plants.items.some((p) => p.slug === "kulkual" && p.toxic));
  assert.ok(ws.manuscript.ethics.some((e) => e.key === "health_overlap"));
  assert.match(ws.manuscript.solution.body, /Plants checked against your medicines/);
  assert.ok(ws.profile, "the baptismal name is reckoned");

  // Refine further: a draft with the healer's opening words and the name reckoning.
  const refined = await review.deliverManuscriptSolution(owner, business.id, booking.id, { mode: "draft", includeProfile: true, includePlantScreen: true, note: "ሰላም ሰላማዊት" });
  assert.equal(refined.status, "draft");
  assert.match(refined.body, /^ሰላም ሰላማዊት/);
  assert.match(refined.body, /Sacred names to consider/);
  // Deliver directly.
  const sent = await review.deliverManuscriptSolution(owner, business.id, booking.id, { mode: "send", includeProfile: false, includePlantScreen: false });
  assert.equal(sent.status, "sent");
  const [message] = await db.select().from(schema.messages).where(eq(schema.messages.id, sent.messageId));
  assert.ok(message);
  assert.match(message.body, /የደብተራው የራሱ የአይነ ጥላ ጽሑፍ/);
  assert.match(message.body, /euphorbia/i);
  assert.doesNotMatch(message.body, /Plants checked against your medicines/);
  await assert.rejects(review.deliverManuscriptSolution(stranger, business.id, booking.id, { mode: "send", includeProfile: false, includePlantScreen: true }), (e) => e.status === 404);

  // A chapter with no text of the healer's own cannot be sent directly without at least an opening note.
  const empty = await bookingsSvc.requestBooking(client, business.id, { serviceId: asmatService.id, startsAt: await freeSlot(asmatService.id), deliveryMode: "in_person", intake: { dropdownValue: "asmat_mesetefaqir", nameGeez: "ሰላማዊት" } });
  await assert.rejects(review.deliverManuscriptSolution(owner, business.id, empty.id, { mode: "send", includeProfile: false, includePlantScreen: true }), /your own text/);
  const framed = await review.deliverManuscriptSolution(owner, business.id, empty.id, { mode: "draft", includeProfile: false, includePlantScreen: true });
  assert.match(framed.body, /without their knowledge and agreement/);
});

test("abandoned uploads are removed with their files; attached ones are kept", { skip: skip() }, async () => {
  const stray = await attachments.uploadAttachment(client, { serviceId: service.id, kind: "image", file: new File([PNG], "left-behind.png") });
  const [row] = await db.select().from(schema.intakeAttachments).where(eq(schema.intakeAttachments.id, stray.id));
  const file = path.join(uploadDir, row.storageKey);
  assert.ok(fs.existsSync(file));
  assert.equal(await attachments.removeAbandonedUploads(), 0, "recent uploads are left for the client to finish booking");
  await db.update(schema.intakeAttachments).set({ createdAt: new Date(Date.now() - 3 * 86_400_000) }).where(inArray(schema.intakeAttachments.id, [stray.id, globalThis.__upload.id]));
  assert.equal(await attachments.removeAbandonedUploads(), 1);
  assert.equal(fs.existsSync(file), false, "the file goes with the row");
  const [kept] = await db.select().from(schema.intakeAttachments).where(eq(schema.intakeAttachments.id, globalThis.__upload.id));
  assert.ok(kept?.bookingId, "an upload attached to a booking is never removed, however old");
});
