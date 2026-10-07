import { NormalizedProfile, Medication, LifestyleHabits } from "./types";
import { ETHIOPIAN_REGION_LOCATIONS, resolveEthiopianLocation } from "@/lib/location/ethiopiaLocations";

export const ETHIOPIAN_REGION_ALTITUDES: Record<string, number> = Object.fromEntries(
  ETHIOPIAN_REGION_LOCATIONS.map((location) => [location.name, location.altitudeMeters]),
);
Object.assign(ETHIOPIAN_REGION_ALTITUDES, {
  "Amhara (Highlands - Gondar/Debre Berhan)": 2600,
  "Amhara (Midlands - Bahir Dar)": 1800,
  "Oromia (Highlands)": 2300,
  "Oromia (Rift Valley)": 1600,
  "Tigray (Highlands)": 2200,
  "Sidama (Hawassa)": 1700,
  "Southern Nations (SNNP / Enset zone)": 2000,
  "Dire Dawa / Harari": 1300,
  "Somali (Lowlands)": 600,
  "Afar (Danakil / Lowlands)": 400,
});

export function stage1Normalize(rawInput: any): NormalizedProfile {
  const age = Number(rawInput.age) || 30;
  const gender = (rawInput.gender === "male" || rawInput.gender === "female") ? rawInput.gender : "other";
  const location = resolveEthiopianLocation(rawInput.city || rawInput.region);
  const region = typeof rawInput.region === "string" && rawInput.region ? rawInput.region : location.name;
  
  // Resolve altitude
  let altitudeMeters = Number(rawInput.altitudeMeters);
  if (isNaN(altitudeMeters) || altitudeMeters <= 0) {
    altitudeMeters = ETHIOPIAN_REGION_ALTITUDES[region] ?? location.altitudeMeters;
  }

  // Normalize activity
  const activityLevel = ["sedentary", "moderate", "active", "very_active"].includes(rawInput.activityLevel)
    ? rawInput.activityLevel
    : "moderate";

  // Normalize pregnancy/lactation
  const pregnancyOrLactation = [
    "none",
    "pregnant_t1",
    "pregnant_t2",
    "pregnant_t3",
    "lactating"
  ].includes(rawInput.pregnancyOrLactation)
    ? rawInput.pregnancyOrLactation
    : "none";

  // Normalize medications
  const rawMeds = Array.isArray(rawInput.medications) ? rawInput.medications : [];
  const medications: Medication[] = rawMeds.map((m: any) => {
    if (typeof m === "string") {
      const lower = m.toLowerCase();
      let drugClass = "General Medication";
      if (lower.includes("warfarin") || lower.includes("aspirin") || lower.includes("heparin") || lower.includes("clopidogrel")) {
        drugClass = "Anticoagulants / Antiplatelets";
      } else if (lower.includes("metformin") || lower.includes("insulin") || lower.includes("glimepiride")) {
        drugClass = "Hypoglycemics";
      } else if (lower.includes("lisinopril") || lower.includes("amlodipine") || lower.includes("enalapril") || lower.includes("losartan")) {
        drugClass = "Antihypertensives";
      } else if (lower.includes("furosemide") || lower.includes("hydrochlorothiazide") || lower.includes("lasix")) {
        drugClass = "Diuretics";
      } else if (lower.includes("omeprazole") || lower.includes("pantoprazole")) {
        drugClass = "Proton Pump Inhibitors";
      }
      return { name: m, drugClass };
    }
    return {
      name: m.name || "Unknown",
      dose: m.dose || "",
      drugClass: m.drugClass || "General Medication",
    };
  });

  // Normalize lifestyle
  const rawHabits = rawInput.lifestyleHabits || {};
  const lifestyleHabits: LifestyleHabits = {
    teaWithMeals: Boolean(rawHabits.teaWithMeals ?? rawInput.teaWithMeals ?? false),
    coffeeRitualTwiceDaily: Boolean(rawHabits.coffeeRitualTwiceDaily ?? rawInput.coffeeRitualTwiceDaily ?? true),
    fastingDays: rawHabits.fastingDays || rawInput.fastingDays || "none",
    sunExposureMinutesDaily: Number(rawHabits.sunExposureMinutesDaily ?? 20),
    unfermentedGrainsHabit: Boolean(rawHabits.unfermentedGrainsHabit ?? false),
  };

  return {
    userId: rawInput.userId,
    age,
    gender,
    weightKg: Number(rawInput.weightKg) || undefined,
    region,
    altitudeMeters,
    activityLevel,
    pregnancyOrLactation,
    medications,
    medicalHistory: Array.isArray(rawInput.medicalHistory) ? rawInput.medicalHistory : [],
    allergies: Array.isArray(rawInput.allergies) ? rawInput.allergies : [],
    lifestyleHabits,
  };
}
