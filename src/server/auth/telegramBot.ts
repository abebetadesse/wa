import crypto from "node:crypto";

/** Telegram echoes the secret given to setWebhook in `X-Telegram-Bot-Api-Secret-Token`. */
export function verifyTelegramWebhookSecret(expected: string, received: string | null): boolean {
  if (!expected || !received) return false;
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return expectedBytes.length === receivedBytes.length && crypto.timingSafeEqual(expectedBytes, receivedBytes);
}
