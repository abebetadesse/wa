import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";

export type KnowledgeAdminRole = "editor" | "reviewer" | "admin" | "super_admin";

export async function requireKnowledgeRole(roles: KnowledgeAdminRole[]) {
  try {
    const user = await requireAuthenticatedUser();
    if (!roles.includes(user.role as KnowledgeAdminRole)) return { error: NextResponse.json({ success: false, error: "Knowledge-admin permission required." }, { status: 403 }) };
    return { user };
  } catch {
    return { error: NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }) };
  }
}

export function parseJsonObject(value: unknown, field: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as Record<string, unknown>;
}
