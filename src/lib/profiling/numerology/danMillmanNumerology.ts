/**
 * Dan Millman's Unreduced-Digit Life Purpose System
 * Derived from "The Life You Were Born to Live" (45-Path Framework)
 * Inspired by Life Purpose App
 */

import { DanMillmanLifePath } from "../extendedTypes";

// Database of 45 Dan Millman Life Paths
const DAN_MILLMAN_PATHS: Record<
  string,
  {
    corePurpose: string;
    innateGifts: string[];
    recurringChallenges: string[];
    vulnerabilities: string[];
    vitalityPractices: string[];
    careerAffinities: string[];
    relationshipDynamics: string[];
  }
> = {
  "40/4": {
    corePurpose: "To manifest secure foundations, systematic discipline, and enduring service through patient process.",
    innateGifts: ["Structural reliability", "Practical mastery", "Tenacity", "Organizational genius"],
    recurringChallenges: ["Impatience with intermediate steps", "Rigidity", "Stubbornness", "Tendency to skip foundation work"],
    vulnerabilities: ["Skeletal system, knees, lower back tension, adrenal fatigue from overworking."],
    vitalityPractices: ["Progressive strength conditioning", "Grounding in mineral-rich highland soil", "Paced daily routines"],
    careerAffinities: ["Architecture", "Engineering", "Holistic wellness administration", "Institutional stewardship", "Community building"],
    relationshipDynamics: ["Values steadfast loyalty and tangible support; thrives when partner respects predictable pacing."],
  },
  "35/8": {
    corePurpose: "To harness emotional expression (3) and experiential freedom (5) in service of material abundance, leadership, and ethical power (8).",
    innateGifts: ["Charismatic leadership", "Dynamic resilience", "Executive capacity", "Inspirational communication"],
    recurringChallenges: ["Oscillating between self-doubt and excessive control", "Fear of failure", "Impulsive financial risks"],
    vulnerabilities: ["Cardiovascular circulation, reproductive vitality, stress-induced headaches."],
    vitalityPractices: ["Aerobic highland hiking", "Mindfulness meditation to balance ego drives", "Nourishing heart-healthy diets (Teff, Flax)"],
    careerAffinities: ["Entrepreneurship", "Public leadership", "Media production", "Philanthropic fund direction"],
    relationshipDynamics: ["Requires an autonomous partner who will not compete for control and who values emotional transparency."],
  },
  "28/10": {
    corePurpose: "To channel cooperation (2) and authority (8) into inspired creative leadership and humanitarian initiative (10).",
    innateGifts: ["Creative originality", "Empathetic leadership", "High-frequency intuition", "Catalytic problem-solving"],
    recurringChallenges: ["Hypersensitivity to criticism", "Holding back due to fear of standing out", "Passive-aggressive withdrawal"],
    vulnerabilities: ["Digestive tract, nervous system hypersensitivity, respiratory tension."],
    vitalityPractices: ["Breathwork (Pranayama / Nifas balancing)", "Herbal teas (Koseret, Damakesse)", "Journaling creative insights"],
    careerAffinities: ["Design innovation", "Educational reform", "Integrative medical leadership", "Diplomacy"],
    relationshipDynamics: ["Thrives when partner offers gentle validation and shares deep creative or spiritual ideals."],
  },
  "19/10": {
    corePurpose: "To evolve through personal creativity (1) and universal integrity (9) into self-confident, pioneering leadership (10).",
    innateGifts: ["Independent visionary", "Courageous integrity", "Natural magnetism", "Trailblazing spirit"],
    recurringChallenges: ["Loneliness at the top", "Reluctance to ask for assistance", "Perfectionistic burnout"],
    vulnerabilities: ["Circulatory wellbeing, upper spine tension, eye strain."],
    vitalityPractices: ["Sun salutations at dawn", "Regular digital detox", "Expressive singing or chanting"],
    careerAffinities: ["Pioneering technology", "Social entrepreneurship", "Author/Philosopher", "Director"],
    relationshipDynamics: ["Needs autonomy while learning to let partners contribute equally without feeling managed."],
  },
  "30/3": {
    corePurpose: "To awaken positive, honest emotional expression, creative inspiration, and joyful communication (3).",
    innateGifts: ["Eloquent verbal fluency", "Warm optimism", "Artistic resonance", "Uplifting presence"],
    recurringChallenges: ["Self-doubt masquerading as cynicism", "Scattering creative energy", "Suppressing authentic sorrow"],
    vulnerabilities: ["Throat, vocal cords, thyroid, immune fluctuations during suppressed self-expression."],
    vitalityPractices: ["Singing sacred hymns", "Tena Adam infusions", "Artistic journaling without self-critique"],
    careerAffinities: ["Creative writing", "Public teaching", "Counseling", "Performing arts", "Cultural diplomacy"],
    relationshipDynamics: ["Needs playful affection and open communication; shuts down when met with cold dismissal."],
  },
  "26/8": {
    corePurpose: "To blend cooperative empathy (2) and high structural vision (6) into authentic material stewardship and power (8).",
    innateGifts: ["Practical compassion", "Equitable negotiation", "Ethical stewardship", "Grounded foresight"],
    recurringChallenges: ["Expecting perfection from others", "Martyrdom in service", "Struggles with financial equilibrium"],
    vulnerabilities: ["Lymphatic system, liver congestion, tension in shoulders and neck."],
    vitalityPractices: ["Dry brushing", "Gentle stretching routines", "Hydration with lemon and honey"],
    careerAffinities: ["healthcare management", "Sustainable agriculture stewardship", "Legal advocacy", "Social enterprises"],
    relationshipDynamics: ["Deeply protective and loyal; must avoid taking over the partner's responsibilities."],
  },
  "32/5": {
    corePurpose: "To apply emotional sensitivity (3) and cooperative connection (2) toward expanding freedom, discipline, and adventurous discovery (5).",
    innateGifts: ["Versatility", "Social diplomacy", "Lively curiosity", "Spontaneous humor"],
    recurringChallenges: ["Restlessness", "Difficulty completing lengthy projects", "Escapist overindulgence"],
    vulnerabilities: ["Nervous exhaustion, adrenal volatility, digestive sensitivity to erratic eating."],
    vitalityPractices: ["Structured physical sports", "Paced regular mealtimes", "Grounding barefoot walking"],
    careerAffinities: ["Travel journalism", "Public relations", "Investigative consulting", "Event design"],
    relationshipDynamics: ["Flourishes with partner who enjoys spontaneous exploration while holding a calm home sanctuary."],
  },
  "20/2": {
    corePurpose: "To master balanced cooperation, diplomatic discernment, and supportive harmony without self-neglect (2).",
    innateGifts: ["Uncanny diplomacy", "Intuitive listening", "Peacemaking acumen", "Refined gentleness"],
    recurringChallenges: ["Over-giving to exhaustion", "Fear of confrontation", "Internalized resentment"],
    vulnerabilities: ["Kidneys, fluid balance, psychosomatic fatigue from absorbing atmospheric stress."],
    vitalityPractices: ["Setting firm relational boundaries", "Tsebel holy water therapies", "Quiet contemplative walks"],
    careerAffinities: ["Mediation", "Holistic nursing", "Early childhood education", "Archival research"],
    relationshipDynamics: ["Needs sincere appreciation and an equitable partner who gently invites them to speak their needs."],
  },
  "31/4": {
    corePurpose: "To channel expressive energy (3) and pioneer independence (1) into step-by-step practical stability and grounded security (4).",
    innateGifts: ["Pragmatic inventiveness", "Sturdy focus", "Systematic teaching", "Resilient stamina"],
    recurringChallenges: ["Shortcutting foundational phases", "Frustration when progress is slow", "Stubborn isolation"],
    vulnerabilities: ["Joint stiffness, lumbar spine, dental enamel."],
    vitalityPractices: ["Warm oil massages", "Consistent sleep schedule", "Mineral hydration"],
    careerAffinities: ["Project management", "Landscape architecture", "Software development", "Vocational craft mastery"],
    relationshipDynamics: ["Builds love slowly and deliberately; values consistency over flashy declarations."],
  },
  "29/11": {
    corePurpose: "To reconcile emotional cooperation (2) and higher principles (9) to step onto the Master Path of spiritual illumination and creative inspiration (11).",
    innateGifts: ["Profound intuition", "Charismatic spiritual presence", "Visionary foresight", "Healing touch"],
    recurringChallenges: ["Overwhelming psychic sensitivity", "Imposter syndrome", "Nervous overwhelm"],
    vulnerabilities: ["Central nervous system, insomnia, subtle energetic depletion."],
    vitalityPractices: ["Daily meditation in serene environments", "Energetic grounding exercises", "Highland herbal adaptogens"],
    careerAffinities: ["Spiritual guide", "Psychologist", "Transformational author", "Integrative healer"],
    relationshipDynamics: ["Craves deep soul connection; cannot thrive in purely transactional or superficial unions."],
  },
};

/**
 * Calculates the Dan Millman unreduced Life Path by adding every single digit in birth date
 * Example: 1985-06-15 = 1 + 9 + 8 + 5 + 0 + 6 + 1 + 5 = 35 -> 3 + 5 = 8 => "35/8"
 * Example: 1987-08-25 = 1 + 9 + 8 + 7 + 0 + 8 + 2 + 5 = 40 -> 4 + 0 = 4 => "40/4"
 */
export function calculateDanMillmanLifePath(birthDateStr: string): DanMillmanLifePath {
  // Strip non-digits
  const digitsOnly = birthDateStr.replace(/\D/g, "");
  const constituentDigits: number[] = [];

  let sum = 0;
  for (const char of digitsOnly) {
    const d = parseInt(char, 10);
    if (!isNaN(d)) {
      constituentDigits.push(d);
      sum += d;
    }
  }

  // Reduce sum to single digit (or master 10/11)
  let primaryNumber = 0;
  if (sum === 10 || sum === 28 || sum === 19 || sum === 37 || sum === 46) {
    primaryNumber = sum % 9 === 1 ? 10 : 1;
    if (sum === 28 || sum === 19 || sum === 37 || sum === 46) primaryNumber = 10;
  } else if (sum === 11 || sum === 29 || sum === 38 || sum === 47) {
    primaryNumber = 11;
  } else {
    let temp = sum;
    while (temp > 9) {
      temp = temp
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    primaryNumber = temp;
  }

  const unreducedKey = `${sum}/${primaryNumber}`;
  const pathData = DAN_MILLMAN_PATHS[unreducedKey] || generateFallbackPathData(sum, primaryNumber);

  return {
    unreducedNumber: unreducedKey,
    primaryNumber,
    constituentDigits,
    corePurpose: pathData.corePurpose,
    innateGifts: pathData.innateGifts,
    recurringChallenges: pathData.recurringChallenges,
    physicalwellbeingTendencies: {
      vulnerabilities: pathData.vulnerabilities,
      vitalityPractices: pathData.vitalityPractices,
    },
    careerAffinities: pathData.careerAffinities,
    relationshipDynamics: pathData.relationshipDynamics,
  };
}

function generateFallbackPathData(sum: number, primaryNumber: number) {
  const primaryThemes: Record<number, { theme: string; gift: string; challenge: string }> = {
    1: { theme: "Creativity and Confidence", gift: "Pioneering originality", challenge: "Self-doubt and hesitation" },
    2: { theme: "Cooperation and Balance", gift: "Diplomatic harmony", challenge: "Over-giving and resentment" },
    3: { theme: "Expression and Sensitivity", gift: "Inspiring communication", challenge: "Self-censorship or verbal volatility" },
    4: { theme: "Stability and Process", gift: "Systematic mastery", challenge: "Impatience with intermediate steps" },
    5: { theme: "Freedom and Discipline", gift: "Adventurous versatility", challenge: "Restlessness and inconsistency" },
    6: { theme: "Vision and Acceptance", gift: "High idealism and beauty", challenge: "Judging self and others" },
    7: { theme: "Trust and Openness", gift: "Spiritual discernment", challenge: "Paranoia or emotional withdrawal" },
    8: { theme: "Abundance and Power", gift: "Ethical executive stewardship", challenge: "Power struggles or fear of success" },
    9: { theme: "Integrity and Wisdom", gift: "Humanitarian leadership", challenge: "Hypocrisy or loss of purpose" },
    10: { theme: "Creative Independence", gift: "Catalytic leadership", challenge: "Underestimating innate power" },
    11: { theme: "Spiritual Illumination", gift: "Intuitive mastery", challenge: "Psychic overwhelm and nervous exhaustion" },
  };

  const info = primaryThemes[primaryNumber] || primaryThemes[1];

  return {
    corePurpose: `To unify the vibrational lessons of ${sum} into mastery of ${info.theme}.`,
    innateGifts: [info.gift, "Intuitive depth", "Resilient stamina", "Ancestral resonance"],
    recurringChallenges: [info.challenge, "Balancing personal desires with collective expectations"],
    vulnerabilities: ["Stress accumulation in physiological centers corresponding to primary digit."],
    vitalityPractices: ["Daily rhythmic breathing", "Highland herbal adaptogen tonics", "Structured periods of rest"],
    careerAffinities: ["Strategic guidance", "Holistic healing", "Creative administration", "Education"],
    relationshipDynamics: ["Values authentic partnership with honest dialogue and mutual respect for autonomy."],
  };
}
