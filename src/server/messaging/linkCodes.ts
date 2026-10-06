/**
 * One-time codes that connect a Telegram or WhatsApp chat to a signed-in account.
 *
 * The account page shows a link that opens the chat with the code filled in; the person presses
 * Send, the bot receives the code and the chat is linked. Nothing is stored: the code is the user
 * id and an expiry, signed with AUTH_SECRET together with the channel and the account's current
 * link. Linking changes that state, so a code stops working once it has been used.
 */
import crypto from "node:crypto";
import { getAuthSecret } from "@/lib/auth/secret";

export type LinkChannel = "telegram" | "whatsapp";

export const LINK_CODE_TTL_SECONDS = 15 * 60;
const MAC_BYTES = 10;

function mac(channel: LinkChannel, head: Buffer, linked: string | null) {
  return crypto.createHmac("sha256", getAuthSecret()).update(`chat-link:${channel}:${linked ?? ""}:`).update(head).digest().subarray(0, MAC_BYTES);
}

export function createLinkCode(channel: LinkChannel, userId: string, linked: string | null, nowSeconds = Math.floor(Date.now() / 1000)): string {
  const head = Buffer.alloc(20);
  Buffer.from(userId.replace(/-/g, ""), "hex").copy(head, 0);
  head.writeUInt32BE(nowSeconds + LINK_CODE_TTL_SECONDS, 16);
  return Buffer.concat([head, mac(channel, head, linked)]).toString("base64url");
}

/** The user id inside a well-formed, unexpired code. The signature is checked by `verifyLinkCode`. */
export function readLinkCode(code: string, nowSeconds = Math.floor(Date.now() / 1000)): string | null {
  if (!/^[A-Za-z0-9_-]{40}$/.test(code)) return null;
  const raw = Buffer.from(code, "base64url");
  if (raw.length !== 20 + MAC_BYTES || raw.readUInt32BE(16) < nowSeconds) return null;
  const hex = raw.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** `linked` is the account's current link on this channel (null when none), read after `readLinkCode`. */
export function verifyLinkCode(channel: LinkChannel, code: string, linked: string | null): boolean {
  if (!readLinkCode(code)) return false;
  const raw = Buffer.from(code, "base64url");
  const expected = mac(channel, raw.subarray(0, 20), linked);
  const received = raw.subarray(20);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
