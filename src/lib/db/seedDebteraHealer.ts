/**
 * Reference setup: "Debtera Traditional Healing & Wisdom Sanctuary" (Gondar, Amhara), showing the
 * healer intake, Metsehafe Fewus, Metsehafe Asmat, Awde Negest and auto-response features end to end.
 *
 *   npm run db:seed:debtera -- --owner owner@example.com [--team herbalist@x,debtera@y,healer@z]
 *
 * The owner (and optional team members) must already have accounts; no passwords are created.
 * Safe to run more than once: the business, services, rules and remedies are updated in place.
 */
import { and, eq } from "drizzle-orm";
import { db, dbClient } from "./index";
import { autoResponseRules, businessCategories, businessMembers, businesses, remedies, services, serviceKinds, users } from "./schema";
import type { AuthenticatedUser } from "@/lib/auth";
import { replaceHours, saveService } from "@/server/marketplace/catalogue";
import { remedyInput, saveRemedy } from "@/server/marketplace/engagement";
import { intakeSettingsInput, saveIntakeSettings } from "@/server/intake/settings";
import { ruleInput } from "@/server/intake/responses";
import { insertReturning } from "@/lib/db/write";

const SLUG = "debtera-sanctuary";

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function account(email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!row) throw new Error(`No account for ${email}. Create it in the app first, then run this again.`);
  return { id: row.id, email: row.email, name: row.name, role: row.role, permissions: [], phone: row.phone } as unknown as AuthenticatedUser;
}

async function upsertService(owner: AuthenticatedUser, businessId: string, name: string, input: Parameters<typeof saveService>[3]) {
  const [existing] = await db.select({ id: services.id }).from(services).where(and(eq(services.businessId, businessId), eq(services.name, name))).limit(1);
  return saveService(owner, businessId, existing?.id ?? null, input);
}

async function upsertRule(owner: AuthenticatedUser, businessId: string, input: ReturnType<typeof ruleInput.parse>) {
  const [existing] = await db.select({ id: autoResponseRules.id }).from(autoResponseRules).where(and(eq(autoResponseRules.businessId, businessId), eq(autoResponseRules.name, input.name))).limit(1);
  if (existing) await db.update(autoResponseRules).set({ ...input, updatedAt: new Date() }).where(eq(autoResponseRules.id, existing.id));
  else await db.insert(autoResponseRules).values({ ...input, businessId, createdBy: owner.id });
}

async function main() {
  const ownerEmail = arg("owner") ?? process.env.SEED_OWNER_EMAIL;
  if (!ownerEmail) throw new Error("Pass the owner's email: --owner you@example.com (or set SEED_OWNER_EMAIL).");
  const owner = await account(ownerEmail);

  const [category] = await db.select().from(businessCategories).where(eq(businessCategories.slug, "debtera")).limit(1);
  if (!category) throw new Error("The 'debtera' business category is missing. Run the marketplace migration first.");
  const kind = async (slug: string) => {
    const [row] = await db.select().from(serviceKinds).where(eq(serviceKinds.slug, slug)).limit(1);
    if (!row) throw new Error(`Service kind '${slug}' is missing.`);
    return row.id;
  };

  // ── Business
  const profile = {
    name: "Debtera Traditional Healing & Wisdom Sanctuary",
    nameAm: "የደብተራ ባህላዊ ፈውስና የጥበብ ማዕከል",
    tagline: "Metsehafe Fewus consultation, Awde Negest reflection and sacred naming, with every remedy safety-checked.",
    description: "A Gondar sanctuary rooted in the debtera tradition: classical manuscript consultation, name reckoning in Ge'ez letters, and herbal preparations screened against modern medicines.",
    region: "Amhara",
    city: "Gondar",
    languages: ["am", "en"],
    deliveryModes: ["in_person", "video", "voice"],
    categoryId: category.id,
  };
  let [business] = await db.select().from(businesses).where(eq(businesses.slug, SLUG)).limit(1);
  if (!business) {
    [business] = await insertReturning(db, businesses, { ...profile, slug: SLUG, ownerId: owner.id, email: owner.email, status: "verified", verification: { reviewedAt: new Date().toISOString(), notes: "Reference business created by the seed script." } });
    await db.insert(businessMembers).values({ businessId: business.id, userId: owner.id, role: "owner", title: "Debtera", isBookable: true });
  } else {
    await db.update(businesses).set({ ...profile, updatedAt: new Date() }).where(eq(businesses.id, business.id));
  }
  const businessId = business.id;

  // ── Team: Herbalist, Debtera, Spiritual Healer (existing accounts only)
  const titles = ["Herbalist", "Debtera", "Spiritual Healer"];
  const team = (arg("team") ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  for (const [index, email] of team.entries()) {
    const member = await account(email);
    await db
      .insert(businessMembers)
      .values({ businessId, userId: member.id, role: "practitioner", title: titles[index] ?? "Practitioner", isBookable: true })
      .onDuplicateKeyUpdate({ set: { title: titles[index] ?? "Practitioner", updatedAt: new Date() } });
  }

  // ── Opening hours: Monday to Saturday, 08:00–17:00 Addis Ababa time
  await replaceHours(owner, businessId, { memberId: null, rules: [1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, startMinute: 8 * 60, endMinute: 17 * 60 })) });

  // ── Services and their intake
  const fewusService = await upsertService(owner, businessId, "Metsehafe Fewus Classical Consultation", {
    kindId: await kind("consultation"),
    name: "Metsehafe Fewus Classical Consultation",
    nameAm: "የመጽሐፈ ፈውስ ምክክር",
    description: "Choose a heading from መጽሐፈ ፈውስ, describe what is happening, and add a photo, voice note or video. The debtera prepares a response from the manuscript tradition, with any plant checked against your medicines.",
    durationMinutes: 60,
    priceEtb: 500,
    deliveryModes: ["in_person", "video", "voice"],
    bufferMinutes: 15,
    isActive: true,
    sortOrder: 0,
  });
  await saveIntakeSettings(owner, businessId, fewusService.id, intakeSettingsInput.parse({ allowText: true, allowImage: true, allowAudio: true, allowVideo: true, dropdownType: "metsehafe_fewus", textPrompt: "What is happening, where, and since when?" }));

  // A consultation (not a "reading"), so the booking intake is the only intake: "reading" services
  // also open the separate spiritual case intake, which would ask for the Ge'ez name a second time.
  const awdeService = await upsertService(owner, businessId, "Awde Negest Spiritual Divination & Sacred Naming", {
    kindId: await kind("consultation"),
    name: "Awde Negest Spiritual Divination & Sacred Naming",
    nameAm: "የአውደ ነገሥት ምክርና ቅዱስ ስም",
    description: "A reflective Awde Negest reading from your name (and your mother's name) in Ge'ez letters, with sacred baptismal names to consider. Reflection, not prediction.",
    durationMinutes: 45,
    priceEtb: 400,
    deliveryModes: ["in_person", "video", "voice"],
    bufferMinutes: 15,
    isActive: true,
    sortOrder: 1,
  });
  await saveIntakeSettings(owner, businessId, awdeService.id, intakeSettingsInput.parse({ allowText: true, allowImage: false, allowAudio: true, allowVideo: false, dropdownType: "awde_negest", textPrompt: "What would you like to reflect on?" }));

  const asmatService = await upsertService(owner, businessId, "Metsehafe Asmat Protection & Blessing", {
    kindId: await kind("consultation"),
    name: "Metsehafe Asmat Protection & Blessing",
    nameAm: "የመጽሐፈ አስማት ጥበቃና በረከት",
    description: "Choose a chapter of መጽሐፈ አስማት (release, protection, learning, trade, favour and more) and write your baptismal name. The debtera prepares the chapter for you with its safety notes. Protection and blessing only: nothing is ever directed at, or given to, another person.",
    durationMinutes: 45,
    priceEtb: 450,
    deliveryModes: ["in_person", "video", "voice"],
    bufferMinutes: 15,
    isActive: true,
    sortOrder: 2,
  });
  await saveIntakeSettings(owner, businessId, asmatService.id, intakeSettingsInput.parse({ allowText: true, allowImage: false, allowAudio: true, allowVideo: false, dropdownType: "metsehafe_asmat", textPrompt: "What is happening, and what would you like the prayer to address?" }));

  // ── Remedies (ingredient names are screened by the safety matrix when clients book)
  const remedyDefs = [
    { name: "Feto seed paste (for the temples)", nameAm: "የፌጦ ቅባት", form: "paste", unit: "jar", safetyNotes: "Skin use only. Not in pregnancy.", ingredients: [{ name: "Feto" }] },
    { name: "Damakesse steam", nameAm: "የደማከሴ እንፋሎት", form: "leaves", unit: "bundle", safetyNotes: "Inhale the steam; do not drink large amounts with blood pressure medicines.", ingredients: [{ name: "Damakesse" }] },
    { name: "Tena Adam infusion", nameAm: "የጤና አዳም መረቅ", form: "infusion", unit: "sachet", safetyNotes: "Not with blood thinners; not in pregnancy.", ingredients: [{ name: "Tena Adam" }] },
  ];
  const remedyIds: Record<string, string> = {};
  for (const def of remedyDefs) {
    const [existing] = await db.select({ id: remedies.id }).from(remedies).where(and(eq(remedies.businessId, businessId), eq(remedies.name, def.name))).limit(1);
    const saved = await saveRemedy(owner, businessId, existing?.id ?? null, remedyInput.parse(def));
    remedyIds[def.name] = saved.id;
  }

  // ── Auto-responses
  await upsertRule(owner, businessId, ruleInput.parse({
    name: "Immediate acknowledgement",
    responseMode: "instant_auto_send",
    priority: 1,
    templateTitle: "We received your request",
    templateBody: "ሰላም {{client_name}}፣ Thank you for booking {{service_name}} ({{booking_reference}}) for {{booking_time}}. The debtera will read what you shared and reply here before your visit.",
  }));
  await upsertRule(owner, businessId, ruleInput.parse({
    name: "Headache: Fewus guidance",
    serviceId: fewusService.id,
    responseMode: "draft_for_review",
    triggerCriteria: { dropdownValues: ["fewus_headache_migraine"] },
    templateTitle: "Guidance for {{selection}}",
    templateBody: "{{client_name}}, here is the guidance we prepare for this heading. Please tell us straight away if the headache is sudden and severe, or comes with a stiff neck, fever or weakness on one side.",
    includeFewusText: true,
    attachedRemedies: [{ remedyId: remedyIds["Feto seed paste (for the temples)"], name: "Feto seed paste (for the temples)", note: "Apply thinly to the temples; wash off if the skin burns." }],
  }));
  for (const [key, title] of [["fewus_digestive", "Digestive guidance"], ["fewus_respiratory", "Chest and breathing guidance"], ["fewus_dermatological", "Skin and wound guidance"]] as const) {
    await upsertRule(owner, businessId, ruleInput.parse({
      name: `${title} (Fewus)`,
      serviceId: fewusService.id,
      responseMode: "draft_for_review",
      triggerCriteria: { dropdownValues: [key] },
      templateTitle: "{{selection}}",
      templateBody: "{{client_name}}, this is what the tradition offers for your concern. We have checked the plants against what you told us you take.",
      includeFewusText: true,
    }));
  }
  await upsertRule(owner, businessId, ruleInput.parse({
    name: "Asmat chapter (prepared in the client's name)",
    serviceId: asmatService.id,
    responseMode: "draft_for_review",
    templateTitle: "{{selection}}",
    templateBody: "{{client_name}}, this is the chapter we prepared in your name. Please read the safety notes below before you begin.",
    includeFewusText: true,
    includeProfile: true,
  }));
  await upsertRule(owner, businessId, ruleInput.parse({
    name: "Awde Negest reading and sacred names",
    serviceId: awdeService.id,
    responseMode: "draft_for_review",
    templateTitle: "Your Awde Negest reflection",
    templateBody: "{{client_name}}, your name falls under {{circle}}, with the digital root {{digital_root}} and the {{humor}} temperament. Below are your reckoning and three sacred names to reflect on with your family and priest.",
    includeProfile: true,
  }));

  console.log(`✓ ${profile.name} is ready at /b/${SLUG} (business id ${businessId}).`);
  console.log("  Next: open Intake & automation → Fewus library and Asmat library, and write the texts you use for each heading.");
  if (!team.length) console.log(`  Tip: add your ${titles.join(", ")} with --team email1,email2,email3 (existing accounts).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => dbClient.end({ timeout: 2 }));
