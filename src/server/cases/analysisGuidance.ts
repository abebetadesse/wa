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
  abdominal: {
    insight: "Abdominal pain has many sources — the stomach lining, the bowel, the liver and gallbladder, infections and parasites, painkillers, alcohol or khat, irregular meals around fasting, and stress. Where the pain sits, when it comes and what changes it are the clues a health worker uses first.",
    watchFor: "Vomiting blood, black or bloody stools, severe pain that does not ease, a hard swollen belly, yellow eyes, or fever with the pain: go to a health facility the same day.",
  },
  weight_loss: {
    insight: "Losing weight without trying is the body's signal that intake has fallen or that something is using more energy than usual. It is common, it is usually explained by simple tests, and the earlier it is checked the easier the cause is to treat.",
    watchFor: "Weight loss with night sweats, fever, a lasting cough, great thirst, difficulty swallowing or vomiting after meals should be seen within days, not weeks.",
  },
  appetite_loss: {
    insight: "Appetite falls with illness, pain, worry, grief, khat, some medicines and long fasts. Small, frequent meals that are easy to eat protect strength while the cause is found.",
    watchFor: "Poor appetite lasting more than two weeks, or with weight loss or yellow eyes, should be checked at a health facility.",
  },
  nausea_vomiting: {
    insight: "Nausea and vomiting most often come from the stomach and from infections, but also from medicines, pregnancy, alcohol and migraine. Keeping fluids down is the first priority.",
    watchFor: "Being unable to keep fluids down for a day, very little urine, blood in the vomit, or vomiting with severe headache or stiff neck needs urgent care.",
  },
  bowel: {
    insight: "Changes in the bowel usually come from infections, parasites, water and food hygiene, low fibre or fluids, khat, or medicines. A stool test at the health centre is simple and often decisive.",
    watchFor: "Blood or black stool, diarrhoea lasting more than two weeks, or signs of dehydration should be seen promptly.",
  },
  fever_sweats: {
    insight: "Fever is the body fighting an infection. In Ethiopia the commonest causes — malaria, chest and urine infections, typhoid and TB — are found with simple tests and treated, often free of charge.",
    watchFor: "Fever with a stiff neck, confusion, a fit, yellow eyes, or fever in pregnancy or a young child needs emergency care; fever lasting more than three days should be tested.",
  },
  respiratory: {
    insight: "Most coughs pass within two or three weeks. A cough that lasts longer, brings up blood or comes with sweats and weight loss is checked for TB, which is free to test and treat.",
    watchFor: "Breathlessness at rest, blue lips, coughing blood or chest pain need urgent care.",
  },
  jaundice: {
    insight: "Yellow eyes or skin mean that bilirubin, which the liver normally clears, is building up. Hepatitis, malaria, gallstones and some medicines or herbs are common causes.",
    watchFor: "Yellowing should be seen within a day or two; with confusion, bleeding or pregnancy, at once.",
  },
  thirst_urination: {
    insight: "Being very thirsty and passing urine often is the classic reason to check blood sugar; burning or blood in the urine points instead to the urinary tract.",
    watchFor: "Great thirst with drowsiness, vomiting or fast breathing is an emergency.",
  },
  headache_dizziness: {
    insight: "Most headaches come from tension, short sleep, dehydration, missed meals, caffeine changes or eye strain; blood pressure and a low blood count are common bodily causes worth checking.",
    watchFor: "A sudden severe headache, headache with fever and stiff neck, weakness or numbness on one side, difficulty speaking or fainting needs emergency care.",
  },
  musculoskeletal: {
    insight: "Joint and back pain are often linked to heavy work, posture and carrying, and in the Rift Valley sometimes to fluoride in water. Frequent painkillers can harm the stomach, so a plan matters.",
    watchFor: "A hot, swollen joint with fever, or back pain with leg weakness or loss of bladder control, needs urgent care.",
  },
  skin: {
    insight: "Skin changes come from infections, allergies, insect bites, contact with plants, soaps or remedies, and sometimes from conditions elsewhere in the body.",
    watchFor: "A rash with fever and feeling very unwell, swelling of the lips or throat, or a sore that has not healed in a month should be seen promptly.",
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
