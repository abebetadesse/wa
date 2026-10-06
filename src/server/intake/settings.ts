/** Per-service intake modalities and dropdowns, and validation of what a client submits. */
import { and, eq, inArray, isNull, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { intakeAttachments, serviceIntakeSettings, services, DROPDOWN_TYPES, type DropdownType } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability } from "@/server/marketplace/access";
import { AWUDE_NEGEST_60_CATEGORIES } from "@/lib/cultural/awudeNegestEngine";
import { isManuscriptSource, manuscriptDropdownOptions } from "./manuscripts";

export interface IntakeConfig {
  allowText: boolean;
  allowImage: boolean;
  allowAudio: boolean;
  allowVideo: boolean;
  dropdownType: DropdownType;
  dropdownLabel: string | null;
  textPrompt: string | null;
  options: { value: string; label: string }[];
  /** Awde Negest readings and Asmat work need the client's name (and optionally mother's name) in Ge'ez. */
  asksGeezName: boolean;
}

export const DEFAULT_INTAKE: Omit<IntakeConfig, "options" | "asksGeezName"> = {
  allowText: true,
  allowImage: true,
  allowAudio: true,
  allowVideo: false,
  dropdownType: "none",
  dropdownLabel: null,
  textPrompt: null,
};

const DROPDOWN_LABELS: Record<DropdownType, string | null> = {
  none: null,
  custom: "Choose what fits best",
  metsehafe_fewus: "መጽሐፈ ፈውስ · What would you like help with?",
  metsehafe_asmat: "መጽሐፈ አስማት · Which chapter should the healer work from?",
  awde_negest: "አውደ ነገሥት · What is your question about?",
};

export function dropdownOptionsFor(type: DropdownType, custom: { value: string; label: string }[]) {
  if (type === "custom") return custom;
  if (isManuscriptSource(type)) return manuscriptDropdownOptions(type);
  if (type === "awde_negest") return AWUDE_NEGEST_60_CATEGORIES.map((c) => ({ value: c.id, label: `${c.am} · ${c.en}` }));
  return [];
}

type SettingsRow = typeof serviceIntakeSettings.$inferSelect;

export function toConfig(row: SettingsRow | undefined): IntakeConfig {
  const base = row ?? { ...DEFAULT_INTAKE, customDropdownOptions: [] as { value: string; label: string }[] };
  const dropdownType = (base.dropdownType as DropdownType) ?? "none";
  return {
    allowText: base.allowText,
    allowImage: base.allowImage,
    allowAudio: base.allowAudio,
    allowVideo: base.allowVideo,
    dropdownType,
    dropdownLabel: base.dropdownLabel || DROPDOWN_LABELS[dropdownType],
    textPrompt: base.textPrompt ?? null,
    options: dropdownOptionsFor(dropdownType, base.customDropdownOptions ?? []),
    // Asmat work is done in the person's (baptismal) name, as Awde Negest reckoning is.
    asksGeezName: dropdownType === "awde_negest" || dropdownType === "metsehafe_asmat",
  };
}

export async function intakeConfigs(serviceIds: string[]) {
  if (!serviceIds.length) return new Map<string, IntakeConfig>();
  const rows = await db.select().from(serviceIntakeSettings).where(inArray(serviceIntakeSettings.serviceId, serviceIds));
  return new Map(serviceIds.map((id) => [id, toConfig(rows.find((row) => row.serviceId === id))]));
}

export async function withPublicIntake<T extends { id: string }>(serviceRows: T[]) {
  const configs = await intakeConfigs(serviceRows.map((s) => s.id));
  return serviceRows.map((service) => ({ ...service, intake: configs.get(service.id)! }));
}

// ── Editing (owners and managers) ────────────────────────────────────────────

export const intakeSettingsInput = z
  .object({
    allowText: z.boolean(),
    allowImage: z.boolean(),
    allowAudio: z.boolean(),
    allowVideo: z.boolean(),
    dropdownType: z.enum(DROPDOWN_TYPES),
    dropdownLabel: z.string().trim().max(160).optional(),
    textPrompt: z.string().trim().max(300).optional(),
    customDropdownOptions: z
      .array(z.object({ value: z.string().trim().min(1).max(80), label: z.string().trim().min(1).max(160) }))
      .max(60)
      .default([]),
  })
  .refine((v) => v.dropdownType !== "custom" || v.customDropdownOptions.length >= 2, { message: "Add at least two options for a custom list.", path: ["customDropdownOptions"] })
  .refine((v) => new Set(v.customDropdownOptions.map((o) => o.value)).size === v.customDropdownOptions.length, { message: "Option values must be unique.", path: ["customDropdownOptions"] });

async function serviceOf(businessId: string, serviceId: string) {
  const [service] = await db.select({ id: services.id, name: services.name }).from(services).where(and(eq(services.id, serviceId), eq(services.businessId, businessId))).limit(1);
  if (!service) throw ApiError.notFound("Service");
  return service;
}

export async function listIntakeSettings(user: AuthenticatedUser, businessId: string) {
  await requireCapability(user, businessId, "manageServices");
  const rows = await db.select({ id: services.id, name: services.name, isActive: services.isActive }).from(services).where(eq(services.businessId, businessId));
  const stored = await db.select().from(serviceIntakeSettings).where(eq(serviceIntakeSettings.businessId, businessId));
  return rows.map((service) => {
    const row = stored.find((s) => s.serviceId === service.id);
    return { serviceId: service.id, serviceName: service.name, isActive: service.isActive, settings: row ? { ...row } : { ...DEFAULT_INTAKE, customDropdownOptions: [] }, config: toConfig(row) };
  });
}

export async function saveIntakeSettings(user: AuthenticatedUser, businessId: string, serviceId: string, input: z.infer<typeof intakeSettingsInput>) {
  await requireCapability(user, businessId, "manageServices");
  await serviceOf(businessId, serviceId);
  const values = { ...input, dropdownLabel: input.dropdownLabel || null, textPrompt: input.textPrompt || null, businessId, updatedAt: new Date() };
  await db.insert(serviceIntakeSettings).values({ serviceId, ...values }).onDuplicateKeyUpdate({ set: values });
  const [row] = await db.select().from(serviceIntakeSettings).where(eq(serviceIntakeSettings.serviceId, serviceId));
  return toConfig(row);
}

// ── What a client submits with a booking ─────────────────────────────────────

export const bookingIntakeInput = z.object({
  dropdownValue: z.string().trim().max(80).optional(),
  text: z.string().trim().max(4000).optional(),
  nameGeez: z.string().trim().max(80).optional(),
  motherNameGeez: z.string().trim().max(80).optional(),
  attachmentIds: z.array(z.string().uuid()).max(10).default([]),
});
export type BookingIntakeInput = z.infer<typeof bookingIntakeInput>;

export interface StoredIntake {
  dropdownType: DropdownType;
  dropdownValue: string | null;
  dropdownLabel: string | null;
  text: string | null;
  nameGeez: string | null;
  motherNameGeez: string | null;
  attachmentIds: string[];
}

const hasGeez = (value?: string) => Boolean(value && /[ሀ-፿]/.test(value));

/** Checks the intake against the service's settings and the client's own unattached uploads. */
export async function validateBookingIntake(user: AuthenticatedUser, businessId: string, serviceId: string, input: BookingIntakeInput | undefined): Promise<StoredIntake | null> {
  const [row] = await db.select().from(serviceIntakeSettings).where(eq(serviceIntakeSettings.serviceId, serviceId)).limit(1);
  const config = toConfig(row);
  if (!input) return null;
  const attachmentIds = input.attachmentIds ?? [];
  if (input.text && !config.allowText) throw ApiError.badRequest("This service does not take a written description.");
  let dropdownLabel: string | null = null;
  if (input.dropdownValue) {
    const option = config.options.find((o) => o.value === input.dropdownValue);
    if (!option) throw ApiError.badRequest("Choose one of the listed options.");
    dropdownLabel = option.label;
  }
  if (config.asksGeezName && input.nameGeez && !hasGeez(input.nameGeez)) throw ApiError.badRequest("Write the name in Ge'ez letters (for example ሰላማዊት).");
  if (input.motherNameGeez && !hasGeez(input.motherNameGeez)) throw ApiError.badRequest("Write your mother's name in Ge'ez letters.");

  if (attachmentIds.length) {
    const uploads = await db
      .select()
      .from(intakeAttachments)
      .where(and(inArray(intakeAttachments.id, attachmentIds), eq(intakeAttachments.uploaderId, user.id), eq(intakeAttachments.businessId, businessId), isNull(intakeAttachments.bookingId)));
    if (uploads.length !== new Set(attachmentIds).size) throw ApiError.badRequest("Some attachments are missing or already used. Please attach them again.");
    const allowed = { image: config.allowImage, audio: config.allowAudio, video: config.allowVideo } as Record<string, boolean>;
    if (uploads.some((u) => !allowed[u.kind])) throw ApiError.badRequest("This service does not accept one of the attached file types.");
  }

  return {
    dropdownType: config.dropdownType,
    dropdownValue: input.dropdownValue ?? null,
    dropdownLabel,
    text: input.text || null,
    nameGeez: input.nameGeez || null,
    motherNameGeez: input.motherNameGeez || null,
    attachmentIds: [...new Set(attachmentIds)],
  };
}

/** Upload quota: an account may hold up to 30 unused uploads per day. */
export async function assertUploadQuota(userId: string) {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(intakeAttachments)
    .where(and(eq(intakeAttachments.uploaderId, userId), isNull(intakeAttachments.bookingId), gte(intakeAttachments.createdAt, new Date(Date.now() - 86_400_000))));
  if (n >= 30) throw new ApiError(429, "Too many uploads today. Please finish your booking first.");
}
