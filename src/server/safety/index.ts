/**
 * Safety matrix service: keeps the reference in the database (seeded from ./seed.ts, maintained by
 * knowledge editors), resolves names people type (brand, Amharic, local names), and builds
 * pair-by-pair matrices with documented and predicted findings.
 */
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { safetyInteractions, safetySubstances } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import {
  CONDITIONS,
  PROPERTY_KEYS,
  SEVERITIES,
  SEVERITY_RANK,
  buildMatrix,
  effectiveCautions,
  evaluatePair,
  pairKey,
  parseCautionCodes,
  type Condition,
  type CuratedFacts,
  type Severity,
  type SubstanceFacts,
} from "./rules";
import { SEED_INTERACTIONS, SEED_SUBSTANCES } from "./seed";

type SubstanceRow = typeof safetySubstances.$inferSelect;
type InteractionRow = typeof safetyInteractions.$inferSelect;

const CACHE_MS = 60_000;
const MAX_ITEMS = 40;

// ── Sync ─────────────────────────────────────────────────────────────────────

let syncing: Promise<void> | null = null;

export function ensureSafetySynced(force = false) {
  if (force || !syncing) {
    syncing = syncSeed().catch((error) => {
      syncing = null;
      throw error;
    });
  }
  return syncing;
}

async function syncSeed() {
  await db.transaction(async (tx) => {
    for (const seed of SEED_SUBSTANCES) {
      const values = {
        name: seed.name,
        kind: seed.kind,
        category: seed.category,
        scientificName: seed.scientificName ?? null,
        amharicName: seed.amharicName ?? null,
        aliases: seed.aliases,
        properties: seed.properties,
        cautions: parseCautionCodes(seed.cautionCodes),
        notes: seed.notes ?? null,
        evidence: seed.evidence ?? null,
      };
      await tx.insert(safetySubstances).values({ slug: seed.slug, origin: "seed", ...values }).onConflictDoNothing();
      await tx.update(safetySubstances).set({ ...values, updatedAt: new Date() }).where(and(eq(safetySubstances.slug, seed.slug), eq(safetySubstances.customized, false)));
    }
    for (const seed of SEED_INTERACTIONS) {
      const [a, b] = seed.a < seed.b ? [seed.a, seed.b] : [seed.b, seed.a];
      const values = { severity: seed.severity, mechanism: seed.mechanism, effect: seed.effect, management: seed.management, evidence: seed.evidence, source: seed.source };
      await tx.insert(safetyInteractions).values({ substanceA: a, substanceB: b, origin: "seed", ...values }).onConflictDoNothing();
      await tx
        .update(safetyInteractions)
        .set({ ...values, updatedAt: new Date() })
        .where(and(eq(safetyInteractions.substanceA, a), eq(safetyInteractions.substanceB, b), eq(safetyInteractions.customized, false)));
    }
  });
  invalidate();
}

// ── Reference cache ──────────────────────────────────────────────────────────

interface Reference {
  substances: SubstanceRow[];
  bySlug: Map<string, SubstanceRow>;
  curated: Map<string, CuratedFacts>;
  interactions: InteractionRow[];
  loadedAt: number;
}

let reference: Reference | null = null;

function invalidate() {
  reference = null;
}

async function loadReference(): Promise<Reference> {
  if (reference && Date.now() - reference.loadedAt < CACHE_MS) return reference;
  await ensureSafetySynced();
  const [substances, interactions] = await Promise.all([
    db.select().from(safetySubstances).where(eq(safetySubstances.status, "published")).orderBy(asc(safetySubstances.name)),
    db.select().from(safetyInteractions).where(eq(safetyInteractions.status, "published")),
  ]);
  const curated = new Map<string, CuratedFacts>();
  for (const row of interactions) {
    curated.set(pairKey(row.substanceA, row.substanceB), { a: row.substanceA, b: row.substanceB, severity: row.severity as Severity, mechanism: row.mechanism, effect: row.effect, management: row.management, evidence: row.evidence, source: row.source });
  }
  reference = { substances, bySlug: new Map(substances.map((row) => [row.slug, row])), curated, interactions, loadedAt: Date.now() };
  return reference;
}

const facts = (row: SubstanceRow): SubstanceFacts => ({ slug: row.slug, name: row.name, kind: row.kind as "modern" | "traditional", category: row.category, properties: row.properties, cautions: row.cautions });

const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function namesOf(row: SubstanceRow) {
  return [row.name, row.slug.replace(/-/g, " "), row.scientificName, row.amharicName, ...row.aliases].filter((v): v is string => Boolean(v)).map(normalize);
}

// ── Public reads ─────────────────────────────────────────────────────────────

export async function listSubstances() {
  const ref = await loadReference();
  return {
    substances: ref.substances.map((row) => ({
      slug: row.slug,
      name: row.name,
      kind: row.kind,
      category: row.category,
      scientificName: row.scientificName,
      amharicName: row.amharicName,
      aliases: row.aliases,
      properties: row.properties,
      cautions: row.cautions,
    })),
    counts: {
      modern: ref.substances.filter((row) => row.kind === "modern").length,
      traditional: ref.substances.filter((row) => row.kind === "traditional").length,
      documented: ref.interactions.length,
    },
  };
}

/** Matches typed names (brand, Amharic, local or scientific) to reference entries. */
export async function resolveNames(names: string[]) {
  const ref = await loadReference();
  const matched: string[] = [];
  const unmatched: string[] = [];
  for (const raw of names) {
    const query = normalize(raw);
    if (!query) continue;
    const exact = ref.substances.find((row) => namesOf(row).includes(query));
    const partial = exact ?? ref.substances.find((row) => namesOf(row).some((name) => (query.length >= 4 && name.includes(query)) || (name.length >= 4 && query.includes(name))));
    if (partial) matched.push(partial.slug);
    else unmatched.push(raw);
  }
  return { slugs: [...new Set(matched)], unmatched };
}

export const matrixInput = z
  .object({
    items: z.array(z.string().min(1).max(100)).max(MAX_ITEMS).default([]),
    names: z.array(z.string().trim().min(1).max(120)).max(MAX_ITEMS).default([]),
    profile: z.array(z.enum(CONDITIONS)).max(CONDITIONS.length).default([]),
  })
  .refine((value) => value.items.length + value.names.length > 0, "Add at least one medicine or remedy.");

export async function computeMatrix(input: z.infer<typeof matrixInput>) {
  const ref = await loadReference();
  const resolved = input.names.length ? await resolveNames(input.names) : { slugs: [], unmatched: [] };
  const slugs = [...new Set([...input.items, ...resolved.slugs])].slice(0, MAX_ITEMS);
  const unknown = slugs.filter((slug) => !ref.bySlug.has(slug));
  const rows = slugs.map((slug) => ref.bySlug.get(slug)).filter((row): row is SubstanceRow => Boolean(row));
  const matrix = buildMatrix(rows.map(facts), ref.curated, input.profile as Condition[]);
  return {
    ...matrix,
    items: matrix.items.map((item) => {
      const row = ref.bySlug.get(item.slug)!;
      return { ...item, amharicName: row.amharicName, scientificName: row.scientificName, notes: row.notes, evidence: row.evidence, toxic: row.properties.includes("toxic_internal") };
    }),
    unmatched: [...resolved.unmatched, ...unknown],
  };
}

export async function substanceDetail(slug: string) {
  const ref = await loadReference();
  const row = ref.bySlug.get(slug);
  if (!row) throw ApiError.notFound("Medicine or remedy");
  const self = facts(row);
  const interactions = ref.substances
    .filter((other) => other.slug !== slug)
    .map((other) => ({ other, result: evaluatePair(self, facts(other), ref.curated) }))
    .filter(({ result }) => result.severity)
    .sort((x, y) => SEVERITY_RANK[y.result.severity!] - SEVERITY_RANK[x.result.severity!] || Number(y.result.basis === "documented") - Number(x.result.basis === "documented") || x.other.name.localeCompare(y.other.name))
    .map(({ other, result }) => ({ slug: other.slug, name: other.name, kind: other.kind, category: other.category, severity: result.severity, basis: result.basis, finding: result.findings[0] }));
  return {
    ...row,
    cautions: effectiveCautions(self),
    interactions,
    summary: Object.fromEntries(SEVERITIES.map((s) => [s, interactions.filter((i) => i.severity === s).length])),
  };
}

/** Traditional remedies × modern medicine groups: the worst predicted or documented finding in each cell. */
export async function overview() {
  const ref = await loadReference();
  const traditional = ref.substances.filter((row) => row.kind === "traditional");
  const modern = ref.substances.filter((row) => row.kind === "modern");
  const groups = [...new Set(modern.map((row) => row.category))];
  const rows = traditional.map((t) => {
    const self = facts(t);
    const cells = groups.map((group) => {
      const members = modern.filter((m) => m.category === group);
      let worst: Severity | null = null;
      let documented = false;
      const flagged: string[] = [];
      for (const member of members) {
        const result = evaluatePair(self, facts(member), ref.curated);
        if (!result.severity) continue;
        flagged.push(member.name);
        if (result.basis === "documented") documented = true;
        if (!worst || SEVERITY_RANK[result.severity] > SEVERITY_RANK[worst]) worst = result.severity;
      }
      return { group, worst, documented, flagged };
    });
    return { slug: t.slug, name: t.name, category: t.category, amharicName: t.amharicName, toxic: t.properties.includes("toxic_internal"), cells, score: cells.reduce((sum, cell) => sum + (cell.worst ? SEVERITY_RANK[cell.worst] : 0), 0) };
  });
  return { groups, rows: rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)) };
}

// ── Booking screen ───────────────────────────────────────────────────────────

/**
 * Compares what a client says they take with the remedies a business prepares (ingredients and
 * remedy names), returning short notes for the practitioner. Never throws: a failed screen must
 * not block a booking, the practitioner still sees the client's own answers.
 */
export async function screenBookingSafety(input: { medicinesText?: string; pregnant?: boolean; remedyNames: string[] }) {
  try {
    const ref = await loadReference();
    const clientNames = (input.medicinesText ?? "").split(/[\n,;/+]|\band\b/i).map((n) => n.trim()).filter((n) => n.length >= 3);
    const [clientSide, remedySide] = await Promise.all([resolveNames(clientNames), resolveNames(input.remedyNames)]);
    const mine = clientSide.slugs.map((slug) => ref.bySlug.get(slug)!).filter(Boolean);
    const remedies = remedySide.slugs.filter((slug) => !clientSide.slugs.includes(slug)).map((slug) => ref.bySlug.get(slug)!).filter(Boolean);
    const notes: { severity: Severity; text: string }[] = [];
    const check = (a: SubstanceRow, b: SubstanceRow) => {
      const result = evaluatePair(facts(a), facts(b), ref.curated);
      if (result.severity && SEVERITY_RANK[result.severity] >= SEVERITY_RANK.moderate) {
        notes.push({ severity: result.severity, text: `${a.name} + ${b.name} (${result.severity}${result.basis === "predicted" ? ", predicted" : ""}): ${result.findings[0].effect} ${result.findings[0].management}` });
      }
    };
    for (const med of mine) for (const remedy of remedies) check(med, remedy);
    for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) check(mine[i], mine[j]);
    if (input.pregnant) {
      for (const remedy of remedies) if (effectiveCautions(facts(remedy)).pregnancy?.level === "avoid") notes.push({ severity: "major", text: `${remedy.name}: avoid in pregnancy.` });
    }
    notes.sort((x, y) => SEVERITY_RANK[y.severity] - SEVERITY_RANK[x.severity]);
    const flags = notes.slice(0, 6).map((note) => `Safety matrix — ${note.text}`);
    if (clientSide.unmatched.length) flags.push(`Not recognised by the safety matrix (check by hand): ${clientSide.unmatched.join(", ")}.`);
    return { flags, recognised: mine.map((row) => row.slug) };
  } catch (error) {
    console.warn("[safety] booking screen failed", error);
    return { flags: [], recognised: [] as string[] };
  }
}

// ── Administration ───────────────────────────────────────────────────────────

const cautionSchema = z.record(z.enum(CONDITIONS), z.object({ level: z.enum(["avoid", "caution"]), note: z.string().trim().max(300).optional() }));

export const substanceInput = z.object({
  name: z.string().trim().min(2).max(200),
  kind: z.enum(["modern", "traditional"]),
  category: z.string().trim().min(2).max(80),
  scientificName: z.string().trim().max(200).optional(),
  amharicName: z.string().trim().max(200).optional(),
  aliases: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
  properties: z.array(z.enum(PROPERTY_KEYS as [string, ...string[]])).max(30).default([]),
  cautions: cautionSchema.default({}),
  notes: z.string().trim().max(2000).optional(),
  evidence: z.string().trim().max(120).optional(),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

export const interactionInput = z.object({
  a: z.string().min(1).max(100),
  b: z.string().min(1).max(100),
  severity: z.enum(SEVERITIES),
  mechanism: z.string().trim().min(3).max(2000),
  effect: z.string().trim().min(3).max(2000),
  management: z.string().trim().min(3).max(2000),
  evidence: z.string().trim().min(2).max(120),
  source: z.string().trim().min(2).max(300),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

const slugify = (name: string) => `${name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "item"}`;

export async function adminReference() {
  await ensureSafetySynced();
  const [substances, interactions] = await Promise.all([
    db.select().from(safetySubstances).orderBy(asc(safetySubstances.kind), asc(safetySubstances.category), asc(safetySubstances.name)),
    db.select().from(safetyInteractions).orderBy(asc(safetyInteractions.substanceA)),
  ]);
  return { substances, interactions, properties: PROPERTY_KEYS };
}

export async function createSubstance(user: AuthenticatedUser, input: z.infer<typeof substanceInput>) {
  let slug = slugify(input.name);
  const [taken] = await db.select({ slug: safetySubstances.slug }).from(safetySubstances).where(eq(safetySubstances.slug, slug)).limit(1);
  if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db.insert(safetySubstances).values({ ...input, slug, origin: "custom", customized: true, updatedBy: user.id }).returning();
  invalidate();
  return row;
}

export async function updateSubstance(user: AuthenticatedUser, slug: string, input: z.infer<typeof substanceInput>) {
  const [row] = await db.update(safetySubstances).set({ ...input, customized: true, updatedBy: user.id, updatedAt: new Date() }).where(eq(safetySubstances.slug, slug)).returning();
  if (!row) throw ApiError.notFound("Medicine or remedy");
  invalidate();
  return row;
}

export async function saveInteraction(user: AuthenticatedUser, input: z.infer<typeof interactionInput>) {
  if (input.a === input.b) throw ApiError.badRequest("Choose two different items.");
  const [a, b] = input.a < input.b ? [input.a, input.b] : [input.b, input.a];
  const found = await db.select({ slug: safetySubstances.slug }).from(safetySubstances).where(sql`${safetySubstances.slug} in (${a}, ${b})`);
  if (found.length !== 2) throw ApiError.badRequest("Both items must exist in the reference.");
  const values = { severity: input.severity, mechanism: input.mechanism, effect: input.effect, management: input.management, evidence: input.evidence, source: input.source, status: input.status, customized: true, updatedBy: user.id, updatedAt: new Date() };
  const [row] = await db
    .insert(safetyInteractions)
    .values({ substanceA: a, substanceB: b, origin: "custom", ...values })
    .onConflictDoUpdate({ target: [safetyInteractions.substanceA, safetyInteractions.substanceB], set: values })
    .returning();
  invalidate();
  return row;
}

/** Custom pairs are deleted; seeded pairs are archived so a later sync does not bring them back. */
export async function deleteInteraction(user: AuthenticatedUser, id: string) {
  const [row] = await db.select().from(safetyInteractions).where(eq(safetyInteractions.id, id)).limit(1);
  if (!row) throw ApiError.notFound("Interaction");
  if (row.origin === "seed") {
    await db.update(safetyInteractions).set({ status: "archived", customized: true, updatedBy: user.id, updatedAt: new Date() }).where(eq(safetyInteractions.id, id));
  } else {
    await db.delete(safetyInteractions).where(eq(safetyInteractions.id, id));
  }
  invalidate();
  return { deleted: row.origin !== "seed", archived: row.origin === "seed" };
}
