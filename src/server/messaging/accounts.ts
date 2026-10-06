/**
 * Chat accounts (Telegram, WhatsApp) connected to platform accounts, and delivery of updates to them.
 * Every in-app notification passes through `deliverToUser`, so anything the platform tells a person
 * also reaches the chat apps they connected and left switched on.
 */
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { logUserActivity } from "@/lib/audit";
import { sendTelegramMessage, telegramStatus } from "@/server/auth/telegram";
import { createLinkCode, LINK_CODE_TTL_SECONDS, type LinkChannel } from "./linkCodes";
import { sendWhatsApp, whatsappStatus } from "./whatsapp";

const column = { telegram: users.telegramId, whatsapp: users.whatsappPhone } as const;

export const appOrigin = () => process.env.APP_URL?.trim().replace(/\/$/, "") || "";

// ── Delivery ─────────────────────────────────────────────────────────────────

export interface Delivery {
  title: string;
  body?: string;
  href?: string;
}

/** Sends one update to each chat app the person connected and kept on. Never throws. */
export async function deliverToUser(userId: string, input: Delivery): Promise<{ telegram: boolean; whatsapp: boolean }> {
  const result = { telegram: false, whatsapp: false };
  const telegramOn = telegramStatus().configured;
  const whatsappOn = whatsappStatus().configured;
  if (!telegramOn && !whatsappOn) return result;
  const [row] = await db
    .select({
      telegramId: users.telegramId,
      telegramNotify: users.telegramNotify,
      whatsappPhone: users.whatsappPhone,
      whatsappNotify: users.whatsappNotify,
      whatsappLastInboundAt: users.whatsappLastInboundAt,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);
  if (!row) return result;
  const origin = appOrigin();
  const url = origin && input.href ? `${origin}${input.href}` : undefined;
  const text = input.body ? `${input.title}\n\n${input.body}` : input.title;
  const [telegram, whatsapp] = await Promise.all([
    telegramOn && row.telegramId && row.telegramNotify ? sendTelegramMessage(row.telegramId, text, url ? { url, label: "Open" } : undefined) : false,
    whatsappOn && row.whatsappPhone && row.whatsappNotify ? sendWhatsApp(row.whatsappPhone, { title: input.title, body: input.body, url }, row.whatsappLastInboundAt) : false,
  ]);
  return { telegram, whatsapp };
}

// ── Account page ─────────────────────────────────────────────────────────────

const maskPhone = (phone: string) => `+${phone.slice(0, 3)}${"•".repeat(Math.max(0, phone.length - 5))}${phone.slice(-2)}`;

export async function whatsappSummary(userId: string) {
  const [row] = await db
    .select({ phone: users.whatsappPhone, verifiedAt: users.whatsappVerifiedAt, notify: users.whatsappNotify })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const status = whatsappStatus();
  return {
    /** Sending works and the webhook can receive the connect message. */
    available: status.configured && status.inbound && Boolean(status.number),
    connected: Boolean(row?.phone),
    phone: row?.phone ? maskPhone(row.phone) : null,
    verifiedAt: row?.verifiedAt ?? null,
    notify: row?.notify ?? true,
  };
}

/** A link that opens the chat with a one-time connect code already typed in. */
export async function createChatLink(user: AuthenticatedUser, channel: LinkChannel) {
  const [row] = await db.select({ linked: column[channel] }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!row) throw ApiError.notFound("Account");
  const code = createLinkCode(channel, user.id, row.linked);
  const expiresInMinutes = LINK_CODE_TTL_SECONDS / 60;
  if (channel === "telegram") {
    const { configured, botUsername } = telegramStatus();
    if (!configured || !botUsername) throw new ApiError(503, "Telegram is not set up on this site yet.");
    return { channel, url: `https://t.me/${botUsername}?start=${code}`, expiresInMinutes };
  }
  const status = whatsappStatus();
  if (!status.configured || !status.inbound || !status.number) throw new ApiError(503, "WhatsApp is not set up on this site yet.");
  return { channel, url: `https://wa.me/${status.number}?text=${encodeURIComponent(`CONNECT ${code}`)}`, expiresInMinutes };
}

export async function setWhatsAppNotify(user: AuthenticatedUser, enabled: boolean) {
  await db.update(users).set({ whatsappNotify: enabled, updatedAt: new Date() }).where(eq(users.id, user.id));
  return whatsappSummary(user.id);
}

export async function unlinkWhatsApp(user: AuthenticatedUser) {
  await db.update(users).set({ whatsappPhone: null, whatsappVerifiedAt: null, whatsappLastInboundAt: null, updatedAt: new Date() }).where(eq(users.id, user.id));
  await logUserActivity({ userId: user.id, activityType: "security", description: "Disconnected WhatsApp" });
  return whatsappSummary(user.id);
}

// ── Used by the bots (inbound.ts) ────────────────────────────────────────────

export async function findChatUser(channel: LinkChannel, sender: string): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(column[channel], sender), eq(users.isActive, true), eq(users.isSuspended, false)))
    .limit(1);
  return row ?? null;
}

/** The account's current link on a channel; `undefined` when the account cannot be linked. */
export async function currentChatLink(channel: LinkChannel, userId: string): Promise<string | null | undefined> {
  const [row] = await db
    .select({ linked: column[channel] })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isActive, true), eq(users.isSuspended, false)))
    .limit(1);
  return row ? row.linked : undefined;
}

/** Connects a chat to an account. False when that chat already belongs to another account. */
export async function linkChat(channel: LinkChannel, userId: string, sender: string, username?: string): Promise<boolean> {
  const [other] = await db.select({ id: users.id }).from(users).where(and(eq(column[channel], sender), ne(users.id, userId))).limit(1);
  if (other) return false;
  const now = new Date();
  await db
    .update(users)
    .set(
      channel === "telegram"
        ? { telegramId: sender, telegramUsername: username ?? null, telegramVerifiedAt: now, telegramNotify: true, isVerified: true, updatedAt: now }
        : { whatsappPhone: sender, whatsappVerifiedAt: now, whatsappNotify: true, whatsappLastInboundAt: now, updatedAt: now },
    )
    .where(eq(users.id, userId));
  await logUserActivity({ userId, activityType: "security", description: channel === "telegram" ? "Connected Telegram account" : "Connected WhatsApp" });
  return true;
}

export async function setChatNotify(channel: LinkChannel, userId: string, enabled: boolean) {
  await db.update(users).set(channel === "telegram" ? { telegramNotify: enabled } : { whatsappNotify: enabled }).where(eq(users.id, userId));
}

/** Records that the person wrote to the WhatsApp number, which opens the 24-hour reply window. */
export async function touchWhatsApp(userId: string) {
  await db.update(users).set({ whatsappLastInboundAt: new Date() }).where(eq(users.id, userId));
}
