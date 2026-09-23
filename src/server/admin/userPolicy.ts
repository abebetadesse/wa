/**
 * Pure rules for account administration. Kept free of database access so they can be unit-tested.
 */
import crypto from "node:crypto";
import { ApiError } from "@/lib/api/route";

export const ADMIN_ROLES = ["admin", "super_admin"] as const;
export const USER_STATUSES = ["active", "inactive", "suspended"] as const;
export const LANGUAGES = ["am", "om", "en", "ti", "so"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

interface Actor { id: string; role: string }
interface Target { id: string; role: string }

const isAdministrative = (role: string) => (ADMIN_ROLES as readonly string[]).includes(role);

/** Only a super admin may act on administrative accounts or grant administrative roles. */
export function assertCanManage(actor: Actor, target: Target) {
  if (isAdministrative(target.role) && actor.role !== "super_admin" && actor.id !== target.id) {
    throw ApiError.forbidden("Only a Super Admin can manage administrative accounts.");
  }
}

export function assertCanAssignRole(actor: Actor, role: string) {
  if (isAdministrative(role) && actor.role !== "super_admin") {
    throw ApiError.forbidden("Only a Super Admin can grant administrative roles.");
  }
}

export function assertStatusChangeAllowed(actor: Actor, targetId: string, status: UserStatus) {
  if (actor.id === targetId && status !== "active") {
    throw ApiError.badRequest("You cannot suspend or deactivate your own account.");
  }
}

export function assertRoleChangeAllowed(actor: Actor, targetId: string, role: string) {
  if (actor.id === targetId && role !== "super_admin") {
    throw ApiError.badRequest("You cannot demote your own Super Admin role.");
  }
}

export function statusFlags(status: UserStatus) {
  return { isActive: status !== "inactive", isSuspended: status === "suspended" };
}

/** Cryptographically random password that satisfies validatePasswordStrength. */
export function generateTemporaryPassword(): string {
  const pick = (set: string) => set[crypto.randomInt(set.length)];
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$%&*!?";
  const all = upper + lower + digits + special;
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (chars.length < 16) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/** RFC 4180 CSV cell; also neutralises spreadsheet formula injection. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
