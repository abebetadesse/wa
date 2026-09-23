// Shared by the Node runtime (lib/auth.ts) and the Edge middleware so both verify tokens identically.
const DEVELOPMENT_SECRET = "ethiopian-holistic-wellbeing-development-secret-key-2026";

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production.");
  }
  return DEVELOPMENT_SECRET;
}
