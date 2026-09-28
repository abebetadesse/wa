/**
 * resolveOnRegistration.ts
 *
 * Resolves a LocationContext immediately after a user account is created.
 * Called from src/server/auth/accounts.ts inside register().
 *
 * Resolution priority:
 *   1. GPS coordinates (geoLat / geoLng) — confidence: "high"
 *   2. Admin-selected region / zone / woreda — confidence: "reduced"
 *   3. No location supplied — stores a stub with confidence: "reduced" so the
 *      onboarding page can prompt the user to confirm.
 *
 * The resolved context is written to userProfiles.locationContext (current) and
 * optionally pre-filled into userProfiles.birthLocationContext if birthLocation
 * was also supplied during registration.
 */

import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { resolveLocation } from "./index";
import type { LocationInput } from "./types";
import { eq } from "drizzle-orm";

export interface RegistrationLocationInput {
  userId: string;
  /** GPS latitude — requires explicit user consent before being sent */
  geoLat?: number;
  /** GPS longitude — requires explicit user consent before being sent */
  geoLng?: number;
  /** Whether the user granted location consent */
  consentLocation?: boolean;
  /** Administrative region declared in the registration form */
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  /** Birth location if supplied at registration time */
  birthLocation?: string;
  birthRegion?: string;
}

/**
 * Resolves and persists the user's current location context immediately after
 * account creation. Safe to call without await in a fire-and-forget pattern
 * because failures are caught and do not abort the registration flow.
 */
export async function resolveAndPersistLocationOnRegistration(
  input: RegistrationLocationInput
): Promise<void> {
  try {
    const hasGps =
      input.consentLocation &&
      typeof input.geoLat === "number" &&
      typeof input.geoLng === "number";

    const locationInput: LocationInput = hasGps
      ? { lat: input.geoLat, lng: input.geoLng, source: "gps" }
      : {
          region: input.region,
          zone: input.zone,
          woreda: input.woreda,
          kebele: input.kebele,
          source: input.region ? "manual" : "admin",
        };

    const ctx = await resolveLocation(locationInput);
    const source = hasGps ? "gps" : input.region ? "manual" : "admin";

    // Also resolve birth location context if a birth region was given
    let birthCtx: typeof ctx | null = null;
    if (input.birthRegion && input.birthRegion !== input.region) {
      birthCtx = await resolveLocation({ region: input.birthRegion, source: "manual" });
    } else if (input.birthLocation && !input.birthRegion) {
      // Attempt a fuzzy resolve using birthLocation string as the region
      birthCtx = await resolveLocation({ region: input.birthLocation, source: "manual" });
    }

    // Upsert the userProfiles row with the resolved contexts
    const existing = await db
      .select({ userId: userProfiles.userId, data: userProfiles.data })
      .from(userProfiles)
      .where(eq(userProfiles.userId, input.userId))
      .limit(1);

    const existingData = (existing[0]?.data as Record<string, unknown>) || {};
    const updatedData = {
      ...existingData,
      locationContext: ctx,
      consentLocation: input.consentLocation ?? false,
      ...(birthCtx ? { birthLocationContext: birthCtx } : {}),
    };

    const profileData = {
      locationContext: ctx,
      locationContextResolvedAt: new Date(),
      locationContextSource: source,
      consentLocation: input.consentLocation ?? false,
      data: updatedData,
      ...(birthCtx
        ? { birthLocationContext: birthCtx, birthLocationContextSource: "manual" }
        : {}),
    };

    if (existing.length > 0) {
      await db
        .update(userProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(userProfiles.userId, input.userId));
    } else {
      await db.insert(userProfiles).values({
        userId: input.userId,
        ...profileData,
      });
    }
  } catch (err) {
    // Non-fatal — log but do not surface to the user during registration
    console.error("[resolveOnRegistration] Failed to resolve location:", err);
  }
}
