import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { ensureProfileFieldCatalog } from "@/lib/profileFieldCatalog";

export async function GET() {
  try {
    await requireAuthenticatedUser();
    const fields = (await ensureProfileFieldCatalog()).filter((field) => field.isActive);
    return NextResponse.json({ success: true, fields, sections: [...new Set(fields.map((field) => field.section))] });
  } catch {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }
}
