/**
 * One-time codes and tokens for email verification and password reset.
 * Only SHA-256 digests are stored, so a database leak does not expose usable tokens.
 */
import crypto from "node:crypto";
import { actionEmail, mailStatus, sendMail } from "@/server/mail";

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
 * Development-only disclosure of codes that would normally be emailed, for working without a mail
 * server. Never enabled in production.
 */
export function exposeCodesToClient(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_CODES === "true";
}

export interface CodeDelivery {
  to: string;
  purpose: "email_verification" | "password_reset";
  code?: string;
  token: string;
  /** The request's origin, used for links in development when APP_URL is not set. */
  origin?: string;
}

/**
 * Base address for links sent to people. In production only APP_URL is trusted: the request's Host
 * header can be chosen by whoever sends the request, and must never end up in a reset link.
 */
export function linkBaseUrl(origin = ""): string {
  const configured = process.env.APP_URL?.trim();
  const base = configured || (process.env.NODE_ENV !== "production" ? origin : "");
  return base.replace(/\/$/, "");
}

async function emailCode(delivery: CodeDelivery): Promise<boolean> {
  if (!mailStatus().configured) return false;
  if (delivery.purpose === "password_reset") {
    const base = linkBaseUrl(delivery.origin);
    if (!base) {
      console.error("[auth] APP_URL is not set, so a password reset link could not be built.");
      return false;
    }
    const { text, html } = actionEmail({
      heading: "Reset your password · የይለፍ ቃልዎን ይቀይሩ",
      lines: ["Someone asked to reset the password for this account. The link works once and expires in 1 hour.", "ለዚህ መለያ የይለፍ ቃል ለመቀየር ጥያቄ ቀርቧል። ማስፈንጠሪያው አንድ ጊዜ ብቻ ይሠራል፣ በ1 ሰዓት ውስጥም ያበቃል።"],
      action: { label: "Reset password", url: `${base}/auth/reset-password?token=${delivery.token}` },
      footer: "If this wasn't you, ignore this message: your password stays the same.",
    });
    return (await sendMail({ to: delivery.to, subject: "Reset your password · የይለፍ ቃል መቀየሪያ", text, html })).sent;
  }
  if (!delivery.code) return false;
  const { text, html } = actionEmail({
    heading: "Your verification code · የማረጋገጫ ኮድዎ",
    lines: ["Enter this code to confirm your email address.", "የኢሜይል አድራሻዎን ለማረጋገጥ ይህን ኮድ ያስገቡ።"],
    code: delivery.code,
    footer: "If you did not create an account, ignore this message.",
  });
  return (await sendMail({ to: delivery.to, subject: `${delivery.code} is your verification code`, text, html })).sent;
}

export async function deliverCode(delivery: CodeDelivery): Promise<Record<string, string>> {
  const emailed = await emailCode(delivery);
  if (process.env.NODE_ENV !== "production") {
    console.info(`[auth] ${delivery.purpose} for ${delivery.to}: code=${delivery.code ?? "-"} token=${delivery.token}${emailed ? " (emailed)" : ""}`);
  } else if (!emailed) {
    console.warn(`[auth] A ${delivery.purpose} message was not emailed (set SMTP_HOST, MAIL_FROM and APP_URL to enable email).`);
  }
  if (!exposeCodesToClient()) return {};
  return delivery.purpose === "password_reset"
    ? { demoResetToken: delivery.token }
    : { demoVerificationToken: delivery.token, ...(delivery.code ? { demoOtpCode: delivery.code } : {}) };
}
