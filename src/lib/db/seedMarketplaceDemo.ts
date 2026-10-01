import { and, eq } from "drizzle-orm";
import { db, pgClient } from "./index";
import {
  bookings,
  businessCategories,
  businessClients,
  businesses,
  messages,
  payments,
  reviews,
  serviceKinds,
  services,
  users,
  workflowCases,
} from "./schema";
import type { AuthenticatedUser } from "@/lib/auth";
import * as businessService from "@/server/marketplace/businesses";
import * as catalogue from "@/server/marketplace/catalogue";
import * as bookingService from "@/server/marketplace/bookings";
import * as operations from "@/server/marketplace/operations";
import * as engagement from "@/server/marketplace/engagement";
import * as teamService from "@/server/marketplace/team";
import { addDays, todayIn } from "@/server/marketplace/time";
import { intakeSettingsInput, saveIntakeSettings } from "@/server/intake/settings";
import { caseService } from "@/server/cases/service";
import { DOMAIN_CONFIGS } from "@/server/cases/domains";

const BUSINESS_SLUG = "sample-hexacore-reflection-studio-demo";
const TIME_ZONE = "Africa/Addis_Ababa";
const DEMO_PREFIX = "[DEMO FIXTURE]";
const CASE_SAFETY_ANSWERS: Record<string, string> = {
  self_harm: "no",
  immediateRisk: "no",
};

type Actor = AuthenticatedUser;

function argument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index < 0 ? undefined : process.argv[index + 1];
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  npm run db:seed:marketplace-demo -- --confirm-demo-data --approve-demo --owner owner@example.test --client client@example.test --admin admin@example.test [--practitioner practitioner@example.test]",
      "",
      "All accounts must already exist in the local development database.",
      "Set DATABASE_URL for a local database, or omit it to use the app's local development default.",
      "The admin approval is only for testing the sample listing; it is not credential verification.",
    ].join("\n"),
  );
}

function assertLocalDevelopmentTarget() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo data when NODE_ENV=production.");
  }
  if (!process.argv.includes("--confirm-demo-data")) {
    throw new Error("Pass --confirm-demo-data to confirm this database is disposable local/dev data.");
  }
  if (!process.argv.includes("--approve-demo")) {
    throw new Error("Pass --approve-demo to approve the clearly labeled sample listing for marketplace workflow testing.");
  }

  const connectionString = process.env.DATABASE_URL;
  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
  if (connectionString) {
    const url = new URL(connectionString);
    if (!localHosts.has(url.hostname)) {
      throw new Error(`Refusing non-local database host '${url.hostname}'. This seed is local-development only.`);
    }
  }
}

async function actor(email: string, expectedAdmin = false): Promise<Actor> {
  const normalized = email.trim().toLowerCase();
  const [row] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (!row) throw new Error(`No account exists for ${normalized}. Create a dedicated local demo account first.`);
  if (row.isSuspended || !row.isActive) throw new Error(`Demo account ${normalized} is inactive or suspended.`);
  if (expectedAdmin && !["admin", "super_admin"].includes(row.role)) {
    throw new Error(`The approval account ${normalized} must already have the admin or super_admin role.`);
  }
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    roleId: row.roleId,
    phone: row.phone,
    preferredLanguage: row.preferredLanguage,
    gender: row.gender,
    region: row.region,
    city: row.city,
    isVerified: row.isVerified,
    isActive: row.isActive,
    permissions: [],
  };
}

async function prepareBusiness(owner: Actor) {
  const [category] = await db.select().from(businessCategories).where(eq(businessCategories.slug, "hexacore-practitioner")).limit(1);
  if (!category) throw new Error("Missing hexacore-practitioner category. Apply drizzle/0010_hexacore_body_readings.sql first.");

  const profile: businessService.BusinessInput = {
    categoryId: category.id,
    name: "Sample Hexacore Reflection Studio Demo",
    nameAm: "የሄክሳኮር ነጸብራቅ ማዕከል (ሙከራ)",
    tagline: "DEMO DATA ONLY · Hexacore reflection and cultural body-sign readings",
    description:
      `${DEMO_PREFIX} Not a real provider. Use this clearly labeled listing to test the Hexacore practitioner workflow. Sessions are reflective and educational, never diagnosis or treatment.`,
    region: "Addis Ababa",
    city: "Addis Ababa",
    address: "Sample location for local testing",
    email: "hexacore-demo@example.invalid",
    languages: ["am", "en"],
    deliveryModes: ["in_person", "video", "voice"],
  };

  let [business] = await db.select().from(businesses).where(eq(businesses.slug, BUSINESS_SLUG)).limit(1);
  if (!business) {
    business = await businessService.createBusiness(owner, profile);
    if (business.slug !== BUSINESS_SLUG) {
      throw new Error(`Unexpected demo slug '${business.slug}'. Refusing to continue with an unrecognized listing.`);
    }
  } else {
    if (business.ownerId !== owner.id) {
      throw new Error(`The reserved demo listing '${BUSINESS_SLUG}' belongs to a different account. No changes were made.`);
    }
    if (!business.description?.startsWith(DEMO_PREFIX)) {
      throw new Error(`The reserved demo slug '${BUSINESS_SLUG}' is not marked as demo data. No changes were made.`);
    }
    if (business.status === "suspended") throw new Error("The sample business is suspended; refusing to reactivate it.");
    business = await businessService.updateBusiness(owner, business.id, profile);
  }

  await businessService.updatePaymentAccounts(owner, business.id, {
    telebirr: null,
    banks: [],
    acceptsCash: true,
    instructions: "Demo listing only. No real payment is due.",
  });

  return { business, category };
}

async function ensureTeam(owner: Actor, practitioner: Actor | undefined, businessId: string) {
  const roster = await teamService.getTeam(owner, businessId);
  const ownerMember = roster.members.find((member) => member.userId === owner.id);
  if (!ownerMember) throw new Error("The listing owner is missing from its team.");
  await teamService.updateMember(owner, businessId, ownerMember.id, { title: "Hexacore Practitioner", isBookable: true });

  if (!practitioner || practitioner.id === owner.id) return;
  if (roster.members.some((member) => member.userId === practitioner.id)) return;
  const invite = await teamService.inviteMember(
    owner,
    businessId,
    { email: practitioner.email, role: "practitioner", title: "Body-sign Reading Practitioner", isBookable: true },
    "http://localhost:5500",
  );
  const token = invite.link.split("/invitations/")[1];
  if (!token) throw new Error("Could not extract the local team invitation token.");
  await teamService.acceptInvitation(practitioner, token);
}

const SERVICES = [
  {
    kind: "hexacore-reading",
    name: "Six-Core Reflection Session (Demo)",
    nameAm: "የስድስቱ ኮሮች ነጸብራቅ ክፍለ ጊዜ",
    description: "A guided, non-clinical exploration of core themes, archetypes, and journaling prompts.",
    durationMinutes: 60,
    priceEtb: 450,
    modes: ["in_person", "video"] as const,
    prompt: "Which Hexacore theme would you like to reflect on?",
    options: [
      { value: "core-alignment", label: "Six-core alignment" },
      { value: "archetypes", label: "Archetypes and strengths" },
      { value: "seasonal-reflection", label: "Seasonal reflection" },
    ],
  },
  {
    kind: "tongue-reading",
    name: "Tongue Body-Sign Reflection (Demo)",
    nameAm: "የምላስ ምልክት ነጸብራቅ",
    description: "An educational discussion of traditional tongue-reading symbolism. Not a medical assessment.",
    durationMinutes: 30,
    priceEtb: 200,
    modes: ["in_person", "video"] as const,
    prompt: "What would you like to learn about the traditional symbolism?",
    options: [
      { value: "tongue-zones", label: "Traditional tongue zones" },
      { value: "cultural-context", label: "Cultural context and limitations" },
    ],
  },
  {
    kind: "palm-reading",
    name: "Palmistry & Hand-Line Reflection (Demo)",
    nameAm: "የእጅ መስመር ነጸብራቅ",
    description: "A cultural and reflective conversation about hand-line traditions, without predictive claims.",
    durationMinutes: 45,
    priceEtb: 300,
    modes: ["in_person", "video"] as const,
    prompt: "Which hand-reading topic would you like to explore?",
    options: [
      { value: "palm-lines", label: "Hand-line traditions" },
      { value: "hand-shapes", label: "Hand shapes and symbolism" },
    ],
  },
  {
    kind: "face-reading",
    name: "Face-Sign Cultural Reflection (Demo)",
    nameAm: "የፊት ምልክት ባህላዊ ነጸብራቅ",
    description: "A cultural reflection guide only. Never used for identity, trustworthiness, health, or forensic assessment.",
    durationMinutes: 30,
    priceEtb: 200,
    modes: ["video"] as const,
    prompt: "What cultural or historical topic would you like to discuss?",
    options: [
      { value: "face-history", label: "Historical traditions" },
      { value: "ethical-use", label: "Ethical limits of face-reading" },
    ],
  },
  {
    kind: "body-sign-reading",
    name: "Combined Body-Sign Traditions Overview (Demo)",
    nameAm: "የሰውነት ምልክቶች አጠቃላይ ነጸብራቅ",
    description: "A reflective overview of cultural body-sign traditions, with clear limits and no diagnosis.",
    durationMinutes: 45,
    priceEtb: 350,
    modes: ["in_person", "video"] as const,
    prompt: "Which body-sign tradition are you interested in?",
    options: [
      { value: "tongue-tradition", label: "Tongue-reading tradition" },
      { value: "palm-tradition", label: "Palm-reading tradition" },
      { value: "face-tradition", label: "Face-reading tradition and its limits" },
    ],
  },
] as const;

async function ensureServices(owner: Actor, businessId: string) {
  const kinds = await catalogue.listServiceKinds();
  const result = new Map<string, typeof services.$inferSelect>();
  for (const [index, definition] of SERVICES.entries()) {
    const kind = kinds.find((entry) => entry.slug === definition.kind);
    if (!kind) throw new Error(`Missing '${definition.kind}' service kind. Apply drizzle/0010_hexacore_body_readings.sql first.`);
    const [existing] = await db
      .select({ id: services.id })
      .from(services)
      .where(and(eq(services.businessId, businessId), eq(services.name, definition.name)))
      .limit(1);
    const service = await catalogue.saveService(owner, businessId, existing?.id ?? null, {
      kindId: kind.id,
      name: definition.name,
      nameAm: definition.nameAm,
      description: definition.description,
      durationMinutes: definition.durationMinutes,
      priceEtb: definition.priceEtb,
      deliveryModes: [...definition.modes],
      bufferMinutes: 15,
      isActive: true,
      sortOrder: index,
    });
    await saveIntakeSettings(owner, businessId, service.id, intakeSettingsInput.parse({
      allowText: true,
      allowImage: false,
      allowAudio: true,
      allowVideo: false,
      dropdownType: "custom",
      textPrompt: definition.prompt,
      customDropdownOptions: [...definition.options],
    }));
    result.set(definition.kind, service);
  }
  return result;
}

async function ensureVerification(owner: Actor, admin: Actor, businessId: string) {
  let [business] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (business.status === "draft") {
    await businessService.submitForVerification(owner, businessId, {
      credentials: [{ label: "DEMO ONLY — not a real professional credential", issuer: "Local workflow test fixture" }],
    });
    [business] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  }
  if (business.status === "pending_verification") {
    await businessService.decideVerification(
      admin,
      businessId,
      "verified",
      "DEMO ONLY: approved to exercise the local sample listing. No real credentials were checked.",
    );
  } else if (business.status !== "verified") {
    throw new Error(`Unexpected sample business status '${business.status}'.`);
  }
}

async function ensureHours(owner: Actor, businessId: string) {
  await catalogue.replaceHours(owner, businessId, {
    memberId: null,
    rules: [
      ...[1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMinute: 9 * 60, endMinute: 17 * 60 })),
      { weekday: 6, startMinute: 9 * 60, endMinute: 13 * 60 },
    ],
  });
}

async function bookingFor(
  client: Actor,
  businessId: string,
  service: typeof services.$inferSelect,
  marker: string,
  dropdownValue: string,
) {
  const clientNote = `${DEMO_PREFIX} ${marker}`;
  const [existing] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.businessId, businessId), eq(bookings.bookedByUserId, client.id), eq(bookings.clientNote, clientNote)))
    .limit(1);
  if (existing) return existing;

  for (let offset = 2; offset <= 12; offset++) {
    const date = addDays(todayIn(TIME_ZONE), offset);
    const { slots } = await catalogue.availableSlots(businessId, { serviceId: service.id, date });
    if (!slots.length) continue;
    return bookingsFromRequest(client, businessId, service, slots[0], clientNote, dropdownValue);
  }
  throw new Error(`No open booking slots found for ${marker} in the next 12 days.`);
}

async function bookingsFromRequest(
  client: Actor,
  businessId: string,
  service: typeof services.$inferSelect,
  startsAt: string,
  note: string,
  dropdownValue: string,
) {
  const deliveryMode = service.deliveryModes.includes("in_person") ? "in_person" : "video";
  const result = await bookingService.requestBooking(client, businessId, {
    serviceId: service.id,
    startsAt: new Date(startsAt),
    deliveryMode,
    note,
    intake: { dropdownValue, text: `${DEMO_PREFIX} Sample client request for workflow testing.`, attachmentIds: [] },
  });
  const [row] = await db.select().from(bookings).where(eq(bookings.id, result.id)).limit(1);
  if (!row) throw new Error("The booking request was accepted but could not be reloaded.");
  return row;
}

async function ensureBookingState(owner: Actor, client: Actor, businessId: string, bookingId: string, target: "confirmed" | "cancelled" | "completed") {
  let [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (target === "cancelled") {
    if (booking.status === "requested") await bookingService.cancelBookingAsClient(client, booking.id, `${DEMO_PREFIX} Cancellation workflow example.`);
    else if (booking.status !== "cancelled") throw new Error(`Cannot advance demo cancellation from '${booking.status}'.`);
    return;
  }
  if (booking.status === "requested") {
    booking = await bookingService.updateBookingStatusAsBusiness(owner, businessId, booking.id, { status: "confirmed" });
  }
  if (target === "confirmed") {
    if (booking.status !== "confirmed") throw new Error(`Expected a confirmed demo booking, found '${booking.status}'.`);
    return;
  }
  if (booking.status === "confirmed") {
    // Simulate elapsed appointment time, then use the normal completion transition.
    const startsAt = new Date(Date.now() - 2 * 60 * 60_000);
    const [service] = await db.select({ durationMinutes: services.durationMinutes }).from(services).where(eq(services.id, booking.serviceId)).limit(1);
    if (!service) throw new Error("The completed demo booking no longer has an active service record.");
    await db.update(bookings).set({
      startsAt,
      endsAt: new Date(startsAt.getTime() + service.durationMinutes * 60_000),
      updatedAt: new Date(),
    }).where(eq(bookings.id, booking.id));
    booking = await bookingService.updateBookingStatusAsBusiness(owner, businessId, booking.id, { status: "completed" });
  }
  if (booking.status !== "completed") throw new Error(`Expected a completed demo booking, found '${booking.status}'.`);
}

async function ensureCaseReview(owner: Actor, client: Actor, bookingId: string) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  let view = booking.caseId ? await caseService.get(client, booking.caseId) : null;
  if (!view) {
    const config = DOMAIN_CONFIGS.spiritual;
    const safetyAnswers = Object.fromEntries(config.safetyQuestions.map((question) => {
      const safeChoice = question.options?.find((option) => /^(no|none|not applicable|not at risk)$/i.test(option.value));
      return [question.id, CASE_SAFETY_ANSWERS[question.id] ?? safeChoice?.value ?? "no"];
    }));
    view = await caseService.start(client, "spiritual", {
      safetyAnswers,
      answers: { nameGeez: "ሰላማዊት" },
      bookingId,
    });
  }

  if (view.stage === "intake") {
    const answers = Object.fromEntries(view.questions.filter((question) => question.required).map((question) => [
      question.id,
      question.options?.[0]?.value ?? "ሰላማዊት",
    ]));
    if (Object.keys(answers).length) view = await caseService.answer(client, view.id, answers);
    view = await caseService.submit(client, view.id);
  }

  const [storedCase] = await db.select().from(workflowCases).where(eq(workflowCases.id, view.id)).limit(1);
  if (view.stage === "awaiting_expert") {
    await caseService.claim(owner, view.id);
    await caseService.approve(owner, view.id, {
      checklist: Object.fromEntries(DOMAIN_CONFIGS.spiritual.reviewChecklist.map((item) => [item.id, true])),
      notes: `${DEMO_PREFIX} Example practitioner review.`,
    });
  } else if (view.stage === "in_review" && storedCase?.reviewerId === owner.id) {
    await caseService.approve(owner, view.id, {
      checklist: Object.fromEntries(DOMAIN_CONFIGS.spiritual.reviewChecklist.map((item) => [item.id, true])),
      notes: `${DEMO_PREFIX} Example practitioner review.`,
    });
  } else if (!["full_report_released", "visible_to_user"].includes(view.stage)) {
    throw new Error(`The sample reading case is at unexpected stage '${view.stage}'.`);
  }
}

async function ensurePaidAndReviewed(owner: Actor, client: Actor, businessId: string, bookingId: string) {
  const [existingPayment] = await db.select({ id: payments.id }).from(payments).where(and(
    eq(payments.businessId, businessId),
    eq(payments.bookingId, bookingId),
    eq(payments.status, "recorded"),
  )).limit(1);
  if (!existingPayment) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    await operations.recordPayment(owner, businessId, {
      bookingId,
      amountEtb: Number(booking.priceEtb),
      method: "cash",
      receivedOn: todayIn(TIME_ZONE),
      note: `${DEMO_PREFIX} No real payment was received.`,
    });
  }

  const [existingReview] = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId)).limit(1);
  let review = existingReview;
  if (!review) {
    review = await engagement.createReview(client, {
      bookingId,
      rating: 5,
      comment: `${DEMO_PREFIX} Example client feedback for local testing.`,
    });
  }
  await engagement.respondToReview(owner, businessId, review.id, `${DEMO_PREFIX} Sample practitioner response.`);
}

async function ensureMessages(owner: Actor, client: Actor, businessId: string) {
  const conversation = await engagement.openConversation(client, businessId);
  const [existing] = await db.select({ id: messages.id }).from(messages).where(eq(messages.conversationId, conversation.id)).limit(1);
  if (!existing) {
    await engagement.sendMessage(client, conversation.id, `${DEMO_PREFIX} Hello, I would like to learn about the six-core reflection session.`);
    await engagement.sendMessage(owner, conversation.id, `${DEMO_PREFIX} Welcome. This is a sample conversation; no payment or health advice is involved.`);
  }
  return conversation;
}

async function ensureClientNotes(owner: Actor, client: Actor, businessId: string) {
  const [record] = await db.select().from(businessClients).where(and(
    eq(businessClients.businessId, businessId),
    eq(businessClients.userId, client.id),
  )).limit(1);
  if (!record) throw new Error("Booking flow did not create the expected business CRM client record.");
  await operations.saveClient(owner, businessId, record.id, {
    name: client.name ?? "Sample Client",
    email: client.email ?? undefined,
    notes: `${DEMO_PREFIX} Sample record for testing client history, not real client notes.`,
    tags: ["demo", "hexacore", "local-test"],
    recordKeepingConsent: true,
  });
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }
  assertLocalDevelopmentTarget();

  const ownerEmail = argument("owner");
  const clientEmail = argument("client");
  const adminEmail = argument("admin");
  if (!ownerEmail || !clientEmail || !adminEmail) {
    printUsage();
    throw new Error("Provide existing --owner, --client, and --admin account emails.");
  }

  const [owner, client, admin] = await Promise.all([
    actor(ownerEmail),
    actor(clientEmail),
    actor(adminEmail, true),
  ]);
  if (owner.id === client.id || owner.id === admin.id || client.id === admin.id) {
    throw new Error("Use separate owner, client, and admin accounts for this workflow fixture.");
  }
  const practitionerEmail = argument("practitioner");
  const practitioner = practitionerEmail ? await actor(practitionerEmail) : undefined;
  if (practitioner && [owner.id, client.id, admin.id].includes(practitioner.id)) {
    throw new Error("The optional practitioner account must be distinct from owner, client, and admin.");
  }

  const { business } = await prepareBusiness(owner);
  await ensureTeam(owner, practitioner, business.id);
  const serviceByKind = await ensureServices(owner, business.id);
  await ensureVerification(owner, admin, business.id);
  await ensureHours(owner, business.id);

  const alignmentService = serviceByKind.get("hexacore-reading");
  const tongueService = serviceByKind.get("tongue-reading");
  const palmService = serviceByKind.get("palm-reading");
  const faceService = serviceByKind.get("face-reading");
  if (!alignmentService || !tongueService || !palmService || !faceService) {
    throw new Error("The demo service catalogue is incomplete.");
  }

  const alignmentBooking = await bookingFor(client, business.id, alignmentService, "BOOKING: alignment request", "core-alignment");
  await ensureCaseReview(owner, client, alignmentBooking.id);

  const confirmedBooking = await bookingFor(client, business.id, faceService, "BOOKING: future confirmed", "face-history");
  await ensureBookingState(owner, client, business.id, confirmedBooking.id, "confirmed");

  const cancelledBooking = await bookingFor(client, business.id, palmService, "BOOKING: client cancellation", "palm-lines");
  await ensureBookingState(owner, client, business.id, cancelledBooking.id, "cancelled");

  const completedBooking = await bookingFor(client, business.id, tongueService, "BOOKING: completed and reviewed", "tongue-zones");
  await ensureBookingState(owner, client, business.id, completedBooking.id, "completed");
  await ensurePaidAndReviewed(owner, client, business.id, completedBooking.id);
  await ensureMessages(owner, client, business.id);
  await ensureClientNotes(owner, client, business.id);
  const [refreshedAlignmentBooking] = await db.select().from(bookings).where(eq(bookings.id, alignmentBooking.id)).limit(1);

  const [finalBusiness] = await db.select().from(businesses).where(eq(businesses.id, business.id)).limit(1);
  const finalBookings = await db.select({ reference: bookings.reference, status: bookings.status, clientNote: bookings.clientNote })
    .from(bookings)
    .where(and(eq(bookings.businessId, business.id), eq(bookings.bookedByUserId, client.id)));
  const dashboard = await operations.dashboard(owner, business.id);

  console.log(`Seeded sample business: ${finalBusiness.name}`);
  console.log(`Public demo URL: /b/${finalBusiness.slug}`);
  console.log(`Business ID: ${business.id}`);
  console.log("Sample services:", [...serviceByKind.values()].map((service) => service.name).join(" | "));
  console.log("Sample booking states:", finalBookings.map((booking) => `${booking.status}: ${booking.clientNote}`).join("\n  "));
  console.log(`Completed report case: ${refreshedAlignmentBooking.caseId ?? "not linked"}`);
  console.log(`Dashboard: ${finalBookings.length} sample bookings, ${dashboard.kpis.ratingCount} reviews.`);
  console.log("Demo content is clearly labeled and contains no real credential claims or payment details.");
}

main()
  .catch((error) => {
    console.error("Marketplace demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pgClient.end({ timeout: 2 });
  });
