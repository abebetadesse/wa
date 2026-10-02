/**
 * The healer's review workspace for one booking. The server is where Domain A (safety, science)
 * and Domain B (manuscripts, name reckoning) meet: each side is computed by its own module and
 * shown side by side, never mixed into one another's logic.
 */
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings, businessClients, serviceKinds, services, users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability } from "@/server/marketplace/access";
import { computeMatrix } from "@/server/safety";
import { composeManuscriptBlock, manuscriptHeader, manuscriptSelectionFor, type ManuscriptSelection } from "./manuscripts";
import { formatHealerProfile } from "@/lib/cultural/healerProfileCalculator";
import { orchestrateRemedies, type OrchestratorDeps, type ScreenCondition } from "@/lib/case-workflow/remedyPharmacologyOrchestrator";
import { ecologicalMatrixFor } from "@/lib/location/ecologicalHealthMatrix";
import { ETHIOPIAN_REGION_PROFILES } from "@/lib/location/ethiopianDatasets";
import { PubMedSource } from "@/lib/literature/sources/pubmedSource";
import { attachmentsForBooking } from "./attachments";
import { createDraft, listDrafts, manuscriptTextFor, safeProfile, sendDraft } from "./responses";
import type { StoredIntake } from "./settings";

function ageFrom(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  return now.getFullYear() - birth.getFullYear() - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
}

async function loadBooking(user: AuthenticatedUser, businessId: string, bookingId: string) {
  await requireCapability(user, businessId, "viewClientNotes");
  const [row] = await db
    .select({ booking: bookings, serviceName: services.name, serviceKind: serviceKinds.slug, clientName: businessClients.name, clientPhone: businessClients.phone, region: users.region, city: users.city, dateOfBirth: users.dateOfBirth })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
    .innerJoin(businessClients, eq(businessClients.id, bookings.clientId))
    .leftJoin(users, eq(users.id, bookings.bookedByUserId))
    .where(and(eq(bookings.id, bookingId), eq(bookings.businessId, businessId)))
    .limit(1);
  if (!row) throw ApiError.notFound("Booking");
  return row;
}

type SafetyAnswers = { takingMedicines?: string; medicines?: string; pregnantOrBreastfeeding?: string; conditions?: string };

function profileConditions(answers: SafetyAnswers | undefined, age: number | null): ScreenCondition[] {
  const out: ScreenCondition[] = [];
  if (answers?.pregnantOrBreastfeeding === "yes") out.push("pregnancy", "breastfeeding");
  if (age != null && age < 12) out.push("children");
  if (age != null && age >= 65) out.push("older");
  return out;
}

const splitMedicines = (text?: string) => (text ?? "").split(/[\n,;/+]|\band\b/i).map((n) => n.trim()).filter((n) => n.length >= 3);

export async function getBookingReview(user: AuthenticatedUser, businessId: string, bookingId: string) {
  const row = await loadBooking(user, businessId, bookingId);
  const { booking } = row;
  const intake = (booking.intake as StoredIntake | null) ?? null;
  const safety = booking.safety as { answers?: SafetyAnswers; flags?: string[] } | null;
  const age = ageFrom(row.dateOfBirth);
  const [attachments, drafts] = await Promise.all([attachmentsForBooking(bookingId), listDrafts(user, businessId, bookingId)]);

  const selection = manuscriptSelectionFor(intake);
  const profile = safeProfile(intake);
  const manuscript = selection ? await manuscriptWorkspace(businessId, selection, safety?.answers, age) : null;

  return {
    booking: { id: booking.id, reference: booking.reference, status: booking.status, startsAt: booking.startsAt, deliveryMode: booking.deliveryMode, serviceName: row.serviceName, serviceKind: row.serviceKind, clientNote: booking.clientNote, caseId: booking.caseId },
    client: { name: row.clientName, phone: row.clientPhone, region: row.region, city: row.city, age },
    intake,
    attachments: attachments.map((a) => ({ ...a, url: `/api/intake/uploads/${a.id}` })),
    safety: { answers: safety?.answers ?? null, flags: safety?.flags ?? [] },
    manuscript: manuscript
      ? {
          ...manuscript.selection,
          text: manuscript.text,
          plants: manuscript.plants,
          // The composed solution, as it would go out (the healer can still refine it as a draft).
          solution: { title: manuscriptHeader(manuscript.selection), body: composeManuscriptBlock(manuscript.selection, manuscript.text, { plantLines: manuscript.plantLines }) },
        }
      : null,
    profile: profile ? { ...profile, text: formatHealerProfile(profile) } : null,
    drafts,
    regions: Object.keys(ETHIOPIAN_REGION_PROFILES),
  };
}

/**
 * Domain B (the chapter and the business's own text) beside Domain A (a live screen of the
 * chapter's plants against what this client takes). Joined only here, on the server.
 */
async function manuscriptWorkspace(businessId: string, selection: ManuscriptSelection, answers: SafetyAnswers | undefined, age: number | null) {
  const text = await manuscriptTextFor(businessId, selection.heading.key);
  const screen = selection.plantSlugs.length
    ? await computeMatrix({ items: selection.plantSlugs, names: splitMedicines(answers?.medicines), profile: profileConditions(answers, age) }).catch(() => null)
    : null;
  const items = screen ? screen.items.filter((item) => selection.plantSlugs.includes(item.slug)).map((item) => ({ slug: item.slug, name: item.name, amharicName: item.amharicName, scientificName: item.scientificName, toxic: item.toxic, alerts: item.alerts, notes: item.notes })) : [];
  const pairs = screen ? screen.pairs.filter((pair) => pair.severity) : [];
  const plantLines = [
    ...items.map((item) => {
      const flags = [item.toxic ? "poisonous if swallowed, outside use only" : "", ...item.alerts.map((a) => `${a.level === "avoid" ? "avoid" : "caution"}: ${a.condition}`)].filter(Boolean);
      return `• ${[item.amharicName, item.name].filter(Boolean).join(" ")}${flags.length ? `: ${flags.join("; ")}` : ""}`;
    }),
    ...pairs.map((pair) => `• ${pair.a} + ${pair.b} (${pair.severity}): ${[pair.findings[0]?.effect, pair.findings[0]?.management].filter(Boolean).join(" ")}`),
  ];
  return {
    selection,
    text,
    plantLines,
    plants: screen ? { items, pairs: screen.pairs, verdict: screen.verdict, unmatched: screen.unmatched } : null,
  };
}

// ── Delivering the selected chapter as a solution ─────────────────────────────

export const solutionInput = z.object({
  /** draft: prepare it for refining; send: deliver it to the client now. */
  mode: z.enum(["draft", "send"]),
  includeProfile: z.boolean().default(false),
  includePlantScreen: z.boolean().default(true),
  /** The healer's opening words, placed above the chapter block. */
  note: z.string().trim().max(2000).optional(),
});

/** Composes the selected chapter with its enhancements, then drafts or sends it. */
export async function deliverManuscriptSolution(user: AuthenticatedUser, businessId: string, bookingId: string, input: z.infer<typeof solutionInput>) {
  const row = await loadBooking(user, businessId, bookingId);
  const intake = (row.booking.intake as StoredIntake | null) ?? null;
  const selection = manuscriptSelectionFor(intake);
  if (!selection) throw ApiError.badRequest("The client did not choose a manuscript chapter for this booking.");
  const answers = (row.booking.safety as { answers?: SafetyAnswers } | null)?.answers;
  const workspace = await manuscriptWorkspace(businessId, selection, answers, ageFrom(row.dateOfBirth));
  if (input.mode === "send" && !workspace.text?.geezText && !workspace.text?.amharicText && !input.note) {
    throw ApiError.badRequest("Add your own text for this chapter (or an opening note) before sending it directly.");
  }
  const profile = input.includeProfile ? safeProfile(intake) : null;
  const block = composeManuscriptBlock(selection, workspace.text, { plantLines: input.includePlantScreen ? workspace.plantLines : [], profileText: profile ? formatHealerProfile(profile) : null, lead: input.note });
  const draft = await createDraft(user, businessId, bookingId, { title: manuscriptHeader(selection).slice(0, 200), body: block, remedies: [] });
  return input.mode === "send" ? sendDraft(user, businessId, draft.id) : draft;
}

// ── Heavier analysis: remedies, literature, ecology, biochemistry ────────────

const literatureCache = new Map<string, { at: number; articles: { pmid: string; title: string; journal: string; year: string }[] }>();
const LITERATURE_TTL = 24 * 60 * 60 * 1000;

async function pubmedLiterature(scientificName: string) {
  const cached = literatureCache.get(scientificName);
  if (cached && Date.now() - cached.at < LITERATURE_TTL) return cached.articles;
  const query = `"${scientificName.replace(/"/g, "")}"[Title/Abstract] AND (pharmacology OR bioactivity OR antioxidant OR anti-inflammatory OR antimicrobial)`;
  const raw = await new PubMedSource().searchArticles(query, { maxResults: 3, dateRange: "last 30 years", restrictToEthiopia: false });
  const articles = raw.map((a) => ({ pmid: a.pmid ?? "", title: a.title, journal: a.journal ?? "", year: (a.pubDate ?? "").slice(0, 4) })).filter((a) => a.pmid);
  literatureCache.set(scientificName, { at: Date.now(), articles });
  return articles;
}

const deps: OrchestratorDeps = {
  async screen({ slugs, medicineNames, profile }) {
    const matrix = await computeMatrix({ items: slugs, names: medicineNames, profile });
    return {
      items: matrix.items.map((item) => ({ slug: item.slug, name: item.name, scientificName: item.scientificName, kind: item.kind, toxic: item.toxic, alerts: item.alerts })),
      pairs: matrix.pairs.map((pair) => ({ a: pair.a, b: pair.b, severity: pair.severity, basis: pair.basis, findings: pair.findings.map((f) => ({ effect: f.effect, management: f.management, mechanism: f.mechanism })) })),
      unmatched: matrix.unmatched,
    };
  },
  literature: pubmedLiterature,
};

export const analysisInput = z.object({
  region: z.string().trim().max(60).optional(),
  age: z.number().int().min(0).max(120).nullable().optional(),
  includeLiterature: z.boolean().default(true),
});

export async function analyseBooking(user: AuthenticatedUser, businessId: string, bookingId: string, input: z.infer<typeof analysisInput>) {
  const row = await loadBooking(user, businessId, bookingId);
  const intake = (row.booking.intake as StoredIntake | null) ?? null;
  const safety = row.booking.safety as { answers?: SafetyAnswers } | null;
  const age = input.age !== undefined ? input.age : ageFrom(row.dateOfBirth);
  const region = input.region || row.region || "Addis Ababa";

  const selection = manuscriptSelectionFor(intake);
  const profile = safeProfile(intake);
  const ecology = await ecologicalMatrixFor({ region });
  const nutrientGaps = ecology.deficiencies.map((d) => d.nutrient.toLowerCase()).filter((n): n is "iron" | "zinc" => n === "iron" || n === "zinc");

  const remedies = await orchestrateRemedies(
    {
      symptomsText: [intake?.text, row.booking.clientNote, safety?.answers?.conditions].filter(Boolean).join("\n"),
      categories: selection ? [selection.symptomCategory] : [],
      extraPlantSlugs: selection?.plantSlugs ?? [],
      age,
      pregnant: safety?.answers?.pregnantOrBreastfeeding === "yes",
      medicinesText: safety?.answers?.medicines,
      nutrientGaps,
      culturalContext: { humor: profile?.humor.key ?? null },
    },
    input.includeLiterature ? deps : { ...deps, literature: async () => [] },
  );
  return { region, age, ecology, remedies };
}
