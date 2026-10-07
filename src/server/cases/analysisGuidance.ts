/**
 * Plain-language elaboration for each factor of the case analysis (analysisLexicon.ts), used when
 * a reviewer builds the detailed report.
 *
 * `insight` says what the theme usually involves and how it tends to work on everything else;
 * `watchFor` says when it stops being something to manage alone. Both are general orientation for
 * the reviewer to edit: nothing here diagnoses, and every `watchFor` points to a person or service.
 */
import type { AnalysisConfidence } from "./types";

export interface FactorGuidance {
  insight: string;
  watchFor?: string;
}

export const FACTOR_GUIDANCE: Record<string, FactorGuidance> = {
  violence: {
    insight: "Fear of another person changes what advice is safe to give; safety and trusted support come before anything else.",
    watchFor: "Any threat, injury or fear for your safety is a reason to contact the support line or the police at once.",
  },
  sleep: {
    insight: "Sleep is usually the first thing to suffer under strain and the first to recover when the strain eases. Irregular hours, late stimulants, screens and unresolved worry are its commonest disturbers.",
    watchFor: "Several weeks of very little sleep, or sleeplessness together with hopelessness, is a reason to see a health professional promptly.",
  },
  anxiety: {
    insight: "Persistent worry narrows attention to the threat and tightens the body: breathing, stomach and muscles. Naming the specific fear, and separating what can be acted on this week from what cannot, usually lowers it.",
    watchFor: "Panic that stops daily activity, or worry that comes with chest pain or breathlessness, should be checked by a health professional.",
  },
  low_mood: {
    insight: "Low mood shrinks activity and contact, and less activity and contact keep mood low. Small scheduled activities and one regular contact work against that loop.",
    watchFor: "Low mood on most days for two weeks or more, or any thought of harming yourself, needs prompt professional support.",
  },
  fatigue: {
    insight: "Tiredness has many ordinary sources — short sleep, long fasting without planned meals, heavy workload, low mood — and some medical ones, which is why tiredness that persists deserves a basic health check.",
    watchFor: "Tiredness with weight loss, fever or breathlessness, or lasting more than a few weeks, should be assessed at a health facility.",
  },
  physical: {
    insight: "Bodily symptoms are noted here as part of the picture, not assessed: this service does not diagnose, and a health professional is the right person to examine them.",
    watchFor: "Any severe, sudden or worsening symptom is a reason to go to a health facility without waiting for this report.",
  },
  medication: {
    insight: "Medicines and traditional remedies can act on each other. An accurate list of everything being taken is the most useful thing to bring to a pharmacist or clinician.",
    watchFor: "New symptoms after starting or combining remedies should be reported to a health professional promptly; do not stop a prescribed medicine without advice.",
  },
  substance: {
    insight: "Khat, alcohol and similar substances often begin as a way of coping and then add to the sleep, money and relationship strain they were meant to ease.",
    watchFor: "Needing more for the same effect, using early in the day, or feeling unwell when stopping are signs to seek help from a health service.",
  },
  caffeine: {
    insight: "Coffee and tea taken later in the day delay sleep for hours. The effect is easy to test by moving the last cup to before midday for a week.",
    watchFor: "Palpitations or marked anxiety after coffee or tea are worth mentioning to a health professional.",
  },
  food: {
    insight: "Eating patterns — fasting seasons, skipped meals, less variety — affect energy and mood within days. Planning what replaces the foods left out matters more than the fast itself.",
    watchFor: "Unintended weight loss, dizziness or fainting should be assessed by a health professional.",
  },
  money: {
    insight: "Money pressure works on everything at once: sleep, patience at home, choices about work. It eases most when obligations are written down and shared rather than carried by one person.",
    watchFor: "Borrowing to repay other debt, or pressure from lenders, is a sign to seek advice early from the woreda social affairs office, a savings association or a trusted elder.",
  },
  work: {
    insight: "Work is both income and standing. Losing it or doubting it affects confidence as well as the budget, so practical steps and encouragement both matter.",
    watchFor: "Unpaid wages or an unfair dismissal are matters a legal-aid clinic can advise on; claims often have time limits.",
  },
  conflict: {
    insight: "Repeated arguments usually follow a pattern: the same trigger, the same time of day, the same escalation. Seeing the pattern and agreeing on a calm time to talk changes more than winning any one argument.",
    watchFor: "Arguments that involve threats, pushing or fear are a safety matter, not a communication problem: contact the support line.",
  },
  family: {
    insight: "Family expectations and obligations can be the main support and the main pressure at the same time. Involving a respected elder is the customary route and often the effective one.",
    watchFor: "Family pressure that controls your movement, money or choices by force should be treated as a safety matter.",
  },
  isolation: {
    insight: "Being alone with a problem magnifies it. One regular, low-effort contact — a relative, a neighbour, an idir or mahiber, a faith community — is protective.",
    watchFor: "Withdrawing from all contact for weeks, especially together with low mood, is a reason to seek support.",
  },
  grief: {
    insight: "Grief keeps no timetable. Waves of sadness, poor sleep and loss of interest are expected, and shared mourning practices exist because they help.",
    watchFor: "Being unable to manage daily life many months after a loss, or wishing to join the person who died, needs professional support.",
  },
  legal: {
    insight: "Disputes over property, inheritance or agreements are decided on documents and procedure. Collecting papers and taking advice early protects a position better than argument does.",
    watchFor: "Many claims have deadlines: if you have received any official notice, seek legal aid promptly.",
  },
  purpose: {
    insight: "Uncertainty about direction is common at times of transition. It usually clears through small trials and conversations rather than through thinking alone.",
  },
  spiritual: {
    insight: "Faith and practice are a resource many people draw on in difficulty. A spiritual father or trusted elder can accompany a person alongside the practical steps.",
    watchFor: "Be cautious of anyone who asks for large payments or tells you to stop medical treatment.",
  },
};

/** What each confidence label means, in words for the person reading the report. */
export const CONFIDENCE_MEANING: Record<AnalysisConfidence, string> = {
  strong: "several things you said point the same way and reference knowledge supports the link",
  moderate: "more than one thing you said points this way, but it still needs your confirmation",
  tentative: "mentioned once or supported only loosely — treat it as a question, not a finding",
};
