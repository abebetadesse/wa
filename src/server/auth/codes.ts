/**
 * One-time codes and tokens for email verification and password reset.
 * Only SHA-256 digests are stored, so a database leak does not expose usable tokens.
 */
import crypto from "node:crypto";

export function createSecretToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function digest(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Development-only disclosure of codes that would normally be emailed. No email/SMS provider is
 * configured yet, so without this flag codes are only written to the server log in development.
 * Never enabled in production.
 */
export function exposeCodesToClient(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_CODES === "true";
}

export interface CodeDelivery {
  to: string;
  purpose: "email_verification" | "password_reset";
  code?: string;
  token: string;
}

export async function deliverCode(delivery: CodeDelivery): Promise<Record<string, string>> {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[auth] ${delivery.purpose} for ${delivery.to}: code=${delivery.code ?? "-"} token=${delivery.token}`);
  } else {
    // TODO(provider): send via the configured email/SMS provider.
    console.warn(`[auth] No delivery provider configured; ${delivery.purpose} for ${delivery.to} was not sent.`);
  }
  if (!exposeCodesToClient()) return {};
  return delivery.purpose === "password_reset"
    ? { demoResetToken: delivery.token }
    : { demoVerificationToken: delivery.token, ...(delivery.code ? { demoOtpCode: delivery.code } : {}) };
}
