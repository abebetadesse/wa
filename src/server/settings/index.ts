/**
 * Administrator-controlled platform settings, stored in `platform_settings` (one JSON document per key).
 * Reads are cached briefly per process; writes invalidate the local cache immediately, and other
 * instances pick the change up within CACHE_MS.
 */
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { platformSettings } from "@/lib/db/schema";
import { WORKFLOW_DOMAINS } from "@/server/cases/types";

const CACHE_MS = 10_000;

const account = z.object({
  bank: z.string().trim().min(2, "Enter the bank name.").max(80),
  accountName: z.string().trim().min(2, "Enter the account holder's name.").max(120),
  accountNumber: z.string().trim().regex(/^[0-9 -]{6,30}$/, "Enter a valid account number."),
});
export type BankAccount = z.infer<typeof account>;

const price = z.object({ reportEtb: z.coerce.number().min(0).max(1_000_000), consultationEtb: z.coerce.number().min(0).max(1_000_000) });

export const paymentSettings = z.object({
  /** Everything the platform charges for is free while this is on. */
  freeMode: z.boolean(),
  methods: z.object({
    chapa: z.object({ enabled: z.boolean() }),
    telebirr: z.object({
      enabled: z.boolean(),
      /** "chapa": pay with telebirr inside Chapa checkout; "manual": send to our telebirr number and submit the transaction number. */
      channel: z.enum(["chapa", "manual"]),
      accountName: z.string().trim().max(120).default(""),
      phone: z.string().trim().max(20).default(""),
    }),
    bank_transfer: z.object({ enabled: z.boolean(), accounts: z.array(account).max(10) }),
  }),
  /** Per case type overrides; missing types use the built-in defaults. */
  prices: z.record(z.enum(WORKFLOW_DOMAINS), price).default({}),
  /** Let clients report telebirr / bank payments to businesses from their booking page. */
  bookingPayments: z.object({ clientSubmissions: z.boolean() }),
  instructions: z.string().trim().max(1000).default(""),
});
export type PaymentSettings = z.infer<typeof paymentSettings>;

export const registrationSettings = z.object({
  /** New people can create accounts themselves. */
  open: z.boolean(),
  /**
   * Telegram verification: off, optional (a badge and Telegram sign-in), or required before a
   * business can be submitted for listing.
   */
  telegram: z.enum(["off", "optional", "required_for_business"]),
});
export type RegistrationSettings = z.infer<typeof registrationSettings>;

export const marketplaceSettings = z.object({
  /** Who sees cultural (non-healing) businesses and the "Cultural services" entry points. */
  culturalVisibility: z.enum(["admins", "everyone"]),
});
export type MarketplaceSettings = z.infer<typeof marketplaceSettings>;

const SCHEMAS = { payments: paymentSettings, registration: registrationSettings, marketplace: marketplaceSettings } as const;
export type SettingsKey = keyof typeof SCHEMAS;
export type SettingsValue<K extends SettingsKey> = z.infer<(typeof SCHEMAS)[K]>;

export const DEFAULT_SETTINGS: { [K in SettingsKey]: SettingsValue<K> } = {
  payments: {
    freeMode: false,
    methods: {
      chapa: { enabled: true },
      telebirr: { enabled: true, channel: "chapa", accountName: "", phone: "" },
      bank_transfer: { enabled: false, accounts: [] },
    },
    prices: {},
    bookingPayments: { clientSubmissions: true },
    instructions: "",
  },
  registration: { open: true, telegram: "optional" },
  marketplace: { culturalVisibility: "admins" },
};

const cache = new Map<SettingsKey, { value: unknown; at: number }>();

export async function getSettings<K extends SettingsKey>(key: K): Promise<SettingsValue<K>> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as SettingsValue<K>;
  const [row] = await db.select({ value: platformSettings.value }).from(platformSettings).where(eq(platformSettings.key, key)).limit(1);
  // Stored documents are merged over defaults so settings added later get sensible values.
  const parsed = SCHEMAS[key].safeParse(deepMerge(DEFAULT_SETTINGS[key], row?.value ?? {}));
  const value = (parsed.success ? parsed.data : DEFAULT_SETTINGS[key]) as SettingsValue<K>;
  cache.set(key, { value, at: Date.now() });
  return value;
}

export async function updateSettings<K extends SettingsKey>(key: K, raw: unknown, actorId: string): Promise<SettingsValue<K>> {
  const value = SCHEMAS[key].parse(raw) as SettingsValue<K>;
  await db
    .insert(platformSettings)
    .values({ key, value: value as Record<string, unknown>, updatedBy: actorId })
    .onConflictDoUpdate({ target: platformSettings.key, set: { value: value as Record<string, unknown>, updatedBy: actorId, updatedAt: new Date() } });
  cache.set(key, { value, at: Date.now() });
  return value;
}

/** For tests. */
export function clearSettingsCache() {
  cache.clear();
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (!isObject(base) || !isObject(patch)) return (patch === undefined ? base : patch) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) out[key] = key in out ? deepMerge(out[key], value) : value;
  return out as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
