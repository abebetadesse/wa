/**
 * Care Plan Generator
 * Inspired by NaraCare.AI - Personalized AI-Driven wellbeing Journeys
 */

import {
  HolisticConstitutionProfile,
  PersonalizedCarePlan,
  CarePlanWeek,
  CarePlanGoal,
  CarePlanIntervention,
} from "./wellbeingTypes";

function generateWeeklyPlan(
  week: number,
  profile: HolisticConstitutionProfile,
  primaryGoals: string[]
): CarePlanWeek {
  const phase =
    week <= 2 ? "foundation" : week <= 5 ? "restore" : week <= 9 ? "optimize" : "maintain";

  const doshaType = profile.dosha.primaryDosha;
  const humorType = profile.humor.dominantHumor;

  const morningRoutines = {
    Vata: [
      "Wake by 7 AM — avoid alarm disruption",
      "10-min warm sesame oil self-massage (abhyanga)",
      "Warm ginger-lemon water on empty stomach",
      "5-min grounding breath: 4-4-4-4 box breathing",
    ],
    Pitta: [
      "Wake by 6:30 AM before the Pitta peak period",
      "Coconut oil pulling (5 min) for cooling oral care",
      "Lukewarm hibiscus or rose water to drink",
      "Gentle sun salutation yoga × 10 rounds",
    ],
    Kapha: [
      "Wake before 6 AM — rise immediately to avoid Kapha heaviness",
      "Vigorous dry brush massage to stimulate lymph",
      "1 tbsp honey with warm ginger water",
      "20-min brisk walk or dynamic movement",
    ],
    "Vata-Pitta": [
      "Wake 6:30–7 AM",
      "Warm oil massage (sesame on joints, coconut on scalp)",
      "Warm-cool water drink with lemon",
      "Gentle-to-moderate yoga flow",
    ],
    "Pitta-Kapha": [
      "Wake before 6:30 AM",
      "Dry brushing + light oil massage",
      "Cooling coconut water",
      "Moderate cardio 20 minutes",
    ],
    "Vata-Kapha": [
      "Wake by 6:30 AM",
      "Warm sesame oil massage",
      "Warm ginger-cinnamon tea",
      "Energizing walking meditation 15 minutes",
    ],
    Tridosha: [
      "Wake 6–7 AM based on seasonal light",
      "Light self-massage with warm sesame",
      "Warm water with lemon and honey",
      "10-min pranayama (alternate nostril breathing)",
    ],
  };

  const eveningRoutines = {
    Vata: [
      "Technology detox 1 hour before sleep",
      "Warm milk with ashwagandha and cardamom",
      "Journaling: 3 things you are grateful for (ye'aynet mesgana)",
      "Gentle legs-up-the-wall pose 10 min",
    ],
    Pitta: [
      "Evening walk in cool air (sunset preferred)",
      "Cooling foot massage with coconut or sandalwood oil",
      "Chamomile or rose petal tea",
      "Loving-kindness meditation 10 min",
    ],
    Kapha: [
      "Light dinner by 6:30 PM — no late eating",
      "Warm ginger tea to aid digestion",
      "Journaling or learning activity to stimulate mind",
      "Avoid day naps — aim for 10 PM bedtime",
    ],
    "Vata-Pitta": ["Cooling sesame foot massage", "Warm chamomile tea", "Light journaling", "Sleep by 10:30 PM"],
    "Pitta-Kapha": ["Evening walk", "Ginger-fennel tea", "5-min gratitude reflection", "Sleep by 10 PM"],
    "Vata-Kapha": ["Warm bath with 2 drops lavender oil", "Ginger-cinnamon tea", "Journaling", "Sleep by 10:30 PM"],
    Tridosha: ["Gentle yoga nidra", "Herbal tea suited to season", "Gratitude journal", "Sleep by 10:30 PM"],
  };

  const morning = morningRoutines[doshaType] || morningRoutines.Tridosha;
  const evening = eveningRoutines[doshaType] || eveningRoutines.Tridosha;

  const interventions: CarePlanIntervention[] = [
    {
      id: `int-${week}-diet`,
      type: "dietary",
      title: `Week ${week} Dietary Focus`,
      description:
        phase === "foundation"
          ? "Establish a regular 3-meal rhythm aligned with Ethiopian solar time. Emphasize fermented teff injera and cooked legumes."
          : phase === "restore"
            ? "Introduce targeted micronutrient-rich foods based on constitution. Emphasize iron, calcium, and anti-inflammatory spices."
            : phase === "optimize"
              ? "Fine-tune meal timing. Implement intermittent fasting aligned with cultural fasting schedule if constitution permits."
              : "Seasonal dietary adaptation — adjust based on kiremt/bega transition.",
      frequency: "daily",
      duration: `${phase === "foundation" ? "2 weeks" : "ongoing"}`,
      timing: "All three meals",
      contraindications: ["Pregnancy (modified protocol required)", "Active peptic ulcer (avoid spicy foods)"],
      evidenceLevel: "traditional",
      ethiopianCulturalContext: "Aligned with Ethiopian Orthodox fasting calendar and EFCT 2025 nutritional guidelines.",
    },
    {
      id: `int-${week}-herbal`,
      type: "herbal",
      title: `Constitutional Herbal Support — Week ${week}`,
      description:
        doshaType.includes("Vata")
          ? "Begin ashwagandha (Withania) tonic protocol for nervous system grounding. Pair with warm sesame milk."
          : doshaType.includes("Pitta")
            ? "Begin amla (Indian gooseberry) and coriander cooling protocol. Add hibiscus infusion daily."
            : "Begin triphala digestive cleanse: 1g powder in warm water at bedtime.",
      frequency: "daily",
      duration: "4 weeks minimum",
      timing: "As specified per herb",
      contraindications: ["Blood thinners (consult physician)", "Pregnancy (specific herbs contraindicated)"],
      evidenceLevel: "preliminary",
      ethiopianCulturalContext: "Cross-referenced with Ethiopian traditional medicine (ETM-DB) for safety.",
    },
    {
      id: `int-${week}-movement`,
      type: "movement",
      title: `Movement Protocol — Week ${week}`,
      description:
        doshaType.includes("Kapha")
          ? "Vigorous daily movement: 30–45 min brisk walking or jogging, 5 days/week."
          : doshaType.includes("Pitta")
            ? "Moderate swimming or cycling, 30 min, 4 days/week. Avoid competitive intensity."
            : "Gentle yoga, Qi Gong, or daily walking 20–30 min. Prioritize breath-body connection.",
      frequency: "5x per week",
      duration: "30–45 minutes",
      timing: "Morning preferred",
      contraindications: ["Active injury", "Cardiac conditions (modify intensity)"],
      evidenceLevel: "strong",
    },
  ];

  if (humorType === "esat" || humorType === "nifas") {
    interventions.push({
      id: `int-${week}-breathwork`,
      type: "breathwork",
      title: "Cooling Nadi Shodhana Pranayama",
      description: "Alternate nostril breathing to balance Esat (Fire) and Nifas (Air). 10 minutes morning and evening.",
      frequency: "twice daily",
      duration: "10 minutes",
      timing: "Morning and evening",
      contraindications: ["Active respiratory infection"],
      evidenceLevel: "preliminary",
      ethiopianCulturalContext: "Resonates with Ethiopian monastic Ye'atfat Timhirt (breath teaching) tradition.",
    });
  }

  const checkInPrompts = [
    "How is your energy level compared to last week? (1-10)",
    "Rate your digestive comfort this week (1-10)",
    "Are you sleeping before 10:30 PM most nights?",
    "How many days did you complete your morning routine?",
    "What Ethiopian food tradition did you honor this week?",
  ];

  return {
    weekNumber: week,
    phase,
    focus:
      phase === "foundation"
        ? "Build daily rhythm & baseline nutrition"
        : phase === "restore"
          ? "Target constitutional imbalances & micronutrient gaps"
          : phase === "optimize"
            ? "Refine timing, fasting integration & advanced protocols"
            : "Long-term maintenance & seasonal adaptation",
    goals: primaryGoals.slice(0, 3),
    dailySchedule: {
      morning,
      afternoon: [
        "Largest meal between 12–2 PM (peak digestive fire)",
        "15-minute post-meal gentle walk",
        "Herbal tea or water — no cold beverages",
      ],
      evening,
      night: [
        "Lights low after 9 PM",
        "Phone on airplane mode by 9:30 PM",
        "Set morning intention for tomorrow",
      ],
    },
    interventions,
    checkInPrompts,
  };
}

export function generateCarePlan(
  profile: HolisticConstitutionProfile,
  duration: PersonalizedCarePlan["duration"],
  primaryGoals: string[],
  clientName: string
): PersonalizedCarePlan {
  const totalWeeks =
    duration === "4-weeks" ? 4 :
      duration === "8-weeks" ? 8 :
        duration === "12-weeks" ? 12 : 24;

  const weeklyPlans: CarePlanWeek[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    weeklyPlans.push(generateWeeklyPlan(w, profile, primaryGoals));
  }

  const goals: CarePlanGoal[] = primaryGoals.map((goal, index) => ({
    id: `goal-${index + 1}`,
    title: goal,
    description: `Personalized goal based on your ${profile.dosha.primaryDosha} constitution and ${profile.humor.dominantHumor} humor dominance.`,
    targetDate: new Date(Date.now() + totalWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: index === 0 ? "high" : "medium",
    category: "nutrition",
    metrics: [],
    progress: 0,
  }));

  void goals; // Available for future extension

  return {
    planId: `cp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientName,
    duration,
    currentPhase: "foundation",
    currentWeek: 1,
    primarywellbeingGoals: primaryGoals,
    constitution: profile,
    weeklyPlans,
    overallProgress: 0,
    aiInsight: `Your ${profile.dosha.primaryDosha} Prakriti combined with ${profile.humor.dominantHumor === "esat" ? "Esat (Fire)" : profile.humor.dominantHumor === "afere" ? "Afere (Earth)" : profile.humor.dominantHumor === "nifas" ? "Nifas (Air)" : "May (Water)"} humoral dominance points to specific protocols in your first weeks. Focus on establishing rhythm before refinement — the Ethiopian wisdom of "meser qen" (foundation days) applies directly.`,
    nextMilestone: "Complete Week 1 baseline: establish 3-meal rhythm, begin morning oil massage, add fermented foods daily.",
    disclaimer:
      "This care plan is a wellness and lifestyle guidance tool. It does not replace medical care. Always consult your healthcare provider before making significant dietary or lifestyle changes, especially regarding herbal supplements and fasting protocols.",
  };
}
