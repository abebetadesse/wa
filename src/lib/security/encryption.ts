import crypto from "crypto";

const ENCRYPTION_KEY =
  process.env.DATA_ENCRYPTION_KEY ||
  "ethio-wellness-enterprise-aes256-key-32b!"; // 32 bytes key for production

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export interface EncryptedPayload {
  iv: string;
  tag: string;
  ciphertext: string;
  classification: "Restricted";
  encryptedAt: string;
}

/**
 * Encrypts field-level sensitive medical and medication data (Restricted Data Class).
 */
export function encryptRestrictedField(data: any): EncryptedPayload {
  const jsonStr = JSON.stringify(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(jsonStr, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    ciphertext: encrypted,
    classification: "Restricted",
    encryptedAt: new Date().toISOString(),
  };
}

/**
 * Decrypts field-level restricted data.
 */
export function decryptRestrictedField<T = any>(payload: EncryptedPayload | any): T {
  // If plain object or not encrypted yet, return as is
  if (!payload || !payload.ciphertext || !payload.iv || !payload.tag) {
    return payload as T;
  }

  try {
    const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
    const iv = Buffer.from(payload.iv, "hex");
    const tag = Buffer.from(payload.tag, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted) as T;
  } catch (err) {
    console.error("Failed to decrypt restricted field:", err);
    return payload as T;
  }
}

/**
 * Generates an immutable cryptographic SHA-256 audit digest.
 */
export function generateAuditChecksum(eventType: string, payload: any, prevHash: string = ""): string {
  const payloadStr = JSON.stringify(payload);
  return crypto
    .createHash("sha256")
    .update(`${eventType}:${payloadStr}:${prevHash}`)
    .digest("hex");
}
