/**
 * Medicine & remedy safety matrix: the property vocabulary and the rules that predict an
 * interaction from shared properties. Pure (no I/O), shared by the server, tests and the UI.
 *
 * Two kinds of finding:
 *   documented  a curated pair (e.g. warfarin + metronidazole) with its source
 *   predicted   two substances share properties that are known to add up or clash
 *               (e.g. anything that thins the blood + anything that thins the blood)
 * Predictions are screening signals, clearly labelled, never a substitute for a pharmacist.
 */

export const SEVERITIES = ["contraindicated", "major", "moderate", "minor"] as const;
export type Severity = (typeof SEVERITIES)[number];
export const SEVERITY_RANK: Record<Severity, number> = { contraindicated: 4, major: 3, moderate: 2, minor: 1 };

export const CONDITIONS = ["pregnancy", "breastfeeding", "kidney", "liver", "children", "older"] as const;
export type Condition = (typeof CONDITIONS)[number];
export type CautionLevel = "avoid" | "caution";
export type Cautions = Partial<Record<Condition, { level: CautionLevel; note?: string }>>;

export const CONDITION_LABELS: Record<Condition, string> = {
  pregnancy: "Pregnancy",
  breastfeeding: "Breastfeeding",
  kidney: "Weak kidneys",
  liver: "Liver problems",
  children: "Children",
  older: "Older adults",
};

/** Plain-language meaning of every property tag. */
export const PROPERTIES = {
  anticoagulant: "Thins the blood (anticoagulant)",
  vka: "Vitamin K–dependent blood thinner",
  antiplatelet: "Stops platelets clumping",
  nsaid: "Anti-inflammatory painkiller (NSAID)",
  bleeding_risk: "May increase bleeding",
  vitamin_k: "Rich in vitamin K",
  hypoglycemic: "Lowers blood sugar",
  hyperglycemic: "Raises blood sugar",
  lactic_acidosis_risk: "Lactic acidosis risk",
  hypotensive: "Lowers blood pressure",
  hypertensive: "Raises blood pressure",
  bradycardic: "Slows the heart",
  nitrate: "Nitrate (widens blood vessels)",
  pde5_inhibitor: "PDE-5 inhibitor",
  cardiac_glycoside: "Heart glycoside (narrow margin)",
  diuretic: "Increases urine (water pill)",
  potassium_raising: "Raises potassium",
  potassium_lowering: "Lowers potassium",
  raas_blocker: "ACE inhibitor / ARB",
  narrow_renal: "Cleared by kidneys, narrow margin",
  cns_depressant: "Causes drowsiness / slows breathing",
  stimulant: "Stimulant",
  serotonergic: "Raises serotonin",
  qt_prolonging: "Can disturb heart rhythm (QT)",
  anticholinergic: "Anticholinergic (dry mouth, confusion)",
  seizure_threshold_lowering: "Can trigger seizures",
  cyp3a4_inhibitor_strong: "Strongly blocks liver enzyme CYP3A4",
  cyp3a4_inhibitor: "Blocks liver enzyme CYP3A4",
  cyp3a4_inducer: "Speeds up liver enzymes (inducer)",
  cyp3a4_inducer_weak: "May speed up liver enzymes",
  cyp3a4_substrate: "Broken down by CYP3A4",
  cyp3a4_substrate_narrow: "Broken down by CYP3A4, narrow margin",
  cyp2c9_inhibitor: "Blocks liver enzyme CYP2C9",
  cyp2c9_substrate_narrow: "Broken down by CYP2C9, narrow margin",
  cyp1a2_inhibitor: "Blocks liver enzyme CYP1A2",
  cyp1a2_substrate: "Broken down by CYP1A2",
  cyp2c19_inhibitor: "Blocks liver enzyme CYP2C19",
  cyp2c19_prodrug: "Needs CYP2C19 to work",
  cyp2d6_inhibitor: "Blocks liver enzyme CYP2D6",
  cyp2d6_prodrug: "Needs CYP2D6 to work",
  hepatotoxic: "Can harm the liver",
  hepatic_load: "Strains the liver at high doses",
  nephrotoxic: "Can harm the kidneys",
  ototoxic: "Can harm hearing",
  polyvalent_cation: "Contains iron, calcium, magnesium or zinc",
  chelation_sensitive: "Binds minerals in the gut",
  acid_suppressant: "Reduces stomach acid",
  acid_dependent: "Needs stomach acid to be absorbed",
  absorption_reducing: "Slows or reduces absorption (fibre, mucilage)",
  laxative_stimulant: "Stimulant laxative / purgative",
  gi_irritant: "Irritates the stomach and gut",
  alcohol: "Alcohol",
  disulfiram_like: "Reacts badly with alcohol",
  uterotonic: "Stimulates the womb",
  hormonal_contraceptive: "Hormonal contraceptive",
  estrogenic: "Estrogen-like",
  immunosuppressant: "Suppresses the immune system",
  immunostimulant: "Stimulates the immune system",
  corticosteroid: "Corticosteroid",
  bone_marrow_suppressant: "Can lower blood counts",
  narrow_therapeutic: "Narrow margin between dose and harm",
  photosensitizing: "Sun sensitivity",
  toxic_internal: "Poisonous if swallowed",
  hemolytic: "Can break red cells (G6PD)",
  urate_lowering: "Xanthine oxidase blocker",
} as const;
export type Property = keyof typeof PROPERTIES;
export const PROPERTY_KEYS = Object.keys(PROPERTIES) as Property[];

export interface PropertyRule {
  a: Property[];
  b: Property[];
  severity: Severity;
  mechanism: string;
  effect: string;
  management: string;
}

const r = (a: Property | Property[], b: Property | Property[], severity: Severity, mechanism: string, effect: string, management: string): PropertyRule => ({
  a: Array.isArray(a) ? a : [a],
  b: Array.isArray(b) ? b : [b],
  severity,
  mechanism,
  effect,
  management,
});

/** Symmetric: a rule matches when one substance has an `a` property and the other a `b` property. */
export const PROPERTY_RULES: PropertyRule[] = [
  r("anticoagulant", ["anticoagulant", "antiplatelet", "nsaid"], "major", "Two blood-thinning actions add together.", "Serious bleeding, including in the stomach or brain.", "Avoid together unless a prescriber manages it; watch for bruising, black stools, blood in urine."),
  r("antiplatelet", ["antiplatelet", "nsaid"], "moderate", "Platelet effects add together.", "More bruising and stomach bleeding.", "Use together only when prescribed; protect the stomach and watch for bleeding."),
  r(["anticoagulant", "antiplatelet"], ["bleeding_risk", "gi_irritant"], "moderate", "The remedy adds a mild blood-thinning or stomach-irritating effect.", "Higher bleeding risk.", "Avoid regular or large amounts; stop before procedures; watch for bleeding."),
  r("nsaid", ["nsaid", "corticosteroid", "gi_irritant"], "moderate", "Both irritate or thin the stomach lining.", "Stomach ulcers and bleeding.", "Avoid combining painkillers of this type; take with food; ask about stomach protection."),
  r("vka", "vitamin_k", "moderate", "Vitamin K works against warfarin-type blood thinners.", "The blood thinner works less well; clot risk.", "Keep vitamin K intake steady rather than avoiding it; tell the prescriber about big diet changes."),
  r("hypoglycemic", "hypoglycemic", "moderate", "Blood-sugar lowering effects add together.", "Low blood sugar: shaking, sweating, confusion.", "Check sugar more often; eat regularly; know how to treat a low."),
  r("hypoglycemic", "hyperglycemic", "moderate", "Opposing effects on blood sugar.", "Diabetes control becomes unpredictable.", "Monitor blood sugar; the diabetes dose may need adjusting."),
  r("hypotensive", "hypotensive", "moderate", "Blood-pressure lowering effects add together.", "Dizziness, fainting and falls, especially on standing.", "Stand up slowly; check blood pressure; reduce if dizzy."),
  r("hypotensive", "hypertensive", "moderate", "Opposing effects on blood pressure.", "Blood-pressure medicine works less well.", "Check blood pressure; limit the stimulant."),
  r("bradycardic", ["bradycardic", "cardiac_glycoside"], "moderate", "Heart-slowing effects add together.", "Very slow pulse, dizziness, fainting.", "Check pulse; seek care if under 50 or fainting."),
  r("nitrate", "pde5_inhibitor", "contraindicated", "Both widen blood vessels strongly.", "Dangerous fall in blood pressure.", "Never take together."),
  r("cns_depressant", ["cns_depressant", "alcohol"], "major", "Sedating effects add together.", "Heavy drowsiness, slowed breathing, falls, accidents.", "Avoid together; never drive; lower doses if unavoidable."),
  r("serotonergic", "serotonergic", "major", "Serotonin builds up.", "Serotonin syndrome: agitation, fever, shaking, fast heart.", "Avoid combining; seek urgent care for these signs."),
  r("qt_prolonging", "qt_prolonging", "major", "Both lengthen the heart's recovery time (QT).", "Dangerous heart rhythm, fainting, sudden death.", "Avoid together where possible; an ECG may be needed."),
  r("qt_prolonging", "potassium_lowering", "moderate", "Low potassium makes QT prolongation more dangerous.", "Heart rhythm problems.", "Keep potassium normal; monitor."),
  r("anticholinergic", "anticholinergic", "moderate", "Anticholinergic effects add together.", "Confusion, constipation, urine retention, fast heart; worse in older adults.", "Avoid combining, especially in older adults."),
  r("seizure_threshold_lowering", "seizure_threshold_lowering", "moderate", "Both lower the seizure threshold.", "Fits, especially with epilepsy or alcohol withdrawal.", "Avoid together in people prone to seizures."),
  r("cyp3a4_inhibitor_strong", "cyp3a4_substrate_narrow", "major", "The liver breaks the medicine down much more slowly.", "Medicine levels rise to toxic levels.", "Avoid, or adjust dose under a prescriber."),
  r("cyp3a4_inhibitor_strong", "cyp3a4_substrate", "moderate", "The liver breaks the medicine down more slowly.", "Stronger effects and side effects.", "Watch for side effects; a lower dose may be needed."),
  r("cyp3a4_inhibitor", "cyp3a4_substrate_narrow", "moderate", "The liver breaks the medicine down more slowly.", "Higher medicine levels and side effects.", "Monitor closely; dose changes may be needed."),
  r("cyp3a4_inducer", "cyp3a4_substrate_narrow", "major", "The liver clears the medicine much faster.", "The medicine stops working properly.", "Avoid, or use a different medicine or a higher dose under supervision."),
  r("cyp3a4_inducer", "cyp3a4_substrate", "moderate", "The liver clears the medicine faster.", "Weaker effect.", "Check that the medicine still works; dose may need raising."),
  r(["cyp3a4_inducer", "cyp3a4_inducer_weak"], "hormonal_contraceptive", "major", "Faster breakdown of contraceptive hormones.", "Contraception can fail; unplanned pregnancy.", "Use condoms or a method not affected (e.g. IUD, injection) during and 4 weeks after."),
  r("cyp3a4_inducer_weak", "cyp3a4_substrate_narrow", "moderate", "The remedy may speed up breakdown of the medicine.", "The medicine may work less well.", "Avoid regular use alongside; monitor effect."),
  r("cyp2c9_inhibitor", "cyp2c9_substrate_narrow", "major", "Slower breakdown of warfarin-type or phenytoin-type medicines.", "Bleeding (warfarin) or toxicity (phenytoin).", "Avoid or monitor INR / levels closely."),
  r("cyp1a2_inhibitor", "cyp1a2_substrate", "moderate", "Slower breakdown by liver enzyme CYP1A2.", "Higher levels: jitteriness, fast heart (caffeine, theophylline).", "Reduce coffee; monitor theophylline."),
  r("cyp2c19_inhibitor", "cyp2c19_prodrug", "moderate", "The medicine cannot be activated properly.", "Clopidogrel protects the heart less well.", "Prefer an alternative stomach medicine (e.g. pantoprazole)."),
  r("cyp2d6_inhibitor", "cyp2d6_prodrug", "moderate", "The painkiller cannot be converted to its active form.", "Poor pain relief.", "Choose a different painkiller."),
  r("hepatotoxic", ["hepatotoxic", "alcohol"], "major", "Two strains on the liver.", "Liver injury: yellow eyes, dark urine, tiredness.", "Avoid combining; check liver tests; stop if jaundice appears."),
  r("hepatic_load", ["hepatotoxic", "alcohol"], "moderate", "Added strain on the liver.", "Higher chance of liver injury.", "Keep doses low; avoid alcohol; watch for jaundice."),
  r("nephrotoxic", "nephrotoxic", "major", "Two strains on the kidneys.", "Kidney injury.", "Avoid combining; check kidney function; drink enough fluids."),
  r("nsaid", ["nephrotoxic", "raas_blocker", "diuretic"], "moderate", "NSAIDs reduce blood flow to the kidneys.", "Kidney injury, especially when dehydrated; weaker blood-pressure control.", "Use the lowest dose for the shortest time; keep hydrated."),
  r("narrow_renal", ["nsaid", "raas_blocker", "diuretic"], "major", "Kidneys clear lithium more slowly.", "Lithium toxicity: shaking, confusion, vomiting.", "Avoid, or check lithium levels closely."),
  r("potassium_raising", "potassium_raising", "major", "Potassium builds up.", "Dangerously high potassium; heart rhythm problems.", "Check potassium; avoid potassium supplements unless prescribed."),
  r("potassium_lowering", "cardiac_glycoside", "major", "Low potassium makes digoxin toxic.", "Digoxin toxicity: nausea, visual changes, irregular pulse.", "Check potassium and digoxin levels."),
  r("potassium_lowering", "potassium_lowering", "moderate", "Potassium losses add together.", "Weakness, cramps, heart rhythm problems.", "Check potassium; eat potassium-rich foods."),
  r("diuretic", "diuretic", "moderate", "Fluid losses add together.", "Dehydration, dizziness, kidney strain.", "Drink enough; watch for dizziness and low urine."),
  r("polyvalent_cation", "chelation_sensitive", "moderate", "Minerals bind the medicine in the gut.", "The medicine is poorly absorbed and may fail.", "Take the medicine 2 hours before or 4–6 hours after."),
  r("acid_suppressant", "acid_dependent", "moderate", "Less stomach acid means poorer absorption.", "The medicine works less well.", "Separate doses or use an alternative."),
  r("absorption_reducing", ["narrow_therapeutic", "hormonal_contraceptive", "chelation_sensitive"], "minor", "Fibre or mucilage slows absorption.", "Lower or delayed medicine effect.", "Take the medicine 1–2 hours before the remedy."),
  r("laxative_stimulant", ["narrow_therapeutic", "hormonal_contraceptive"], "minor", "Faster gut transit and diarrhoea reduce absorption.", "The medicine may work less well.", "Avoid purgatives around important doses; use backup contraception if diarrhoea."),
  r("alcohol", "disulfiram_like", "major", "The medicine blocks alcohol breakdown.", "Flushing, vomiting, fast heart, collapse.", "No alcohol during and for 3 days after."),
  r("alcohol", "lactic_acidosis_risk", "moderate", "Alcohol raises lactic acid.", "Lactic acidosis (rare but serious).", "Avoid heavy drinking."),
  r("alcohol", ["hypoglycemic", "anticoagulant", "nsaid"], "moderate", "Alcohol adds to the medicine's risks.", "Low blood sugar, bleeding or stomach bleeding.", "Avoid or keep to small amounts with food."),
  r("stimulant", "stimulant", "moderate", "Stimulant effects add together.", "Fast heart, raised blood pressure, anxiety, poor sleep.", "Limit the stimulants."),
  r("uterotonic", "uterotonic", "major", "Womb-stimulating effects add together.", "Over-strong contractions, bleeding.", "Never combine outside a birth attendant's care."),
  r("immunostimulant", "immunosuppressant", "moderate", "Opposing effects on the immune system.", "The immune-suppressing medicine may work less well.", "Avoid immune-stimulating remedies with transplant or autoimmune medicines."),
  r("immunosuppressant", "immunosuppressant", "moderate", "Immune suppression adds together.", "Serious infections.", "Only as prescribed; watch for fever."),
  r("bone_marrow_suppressant", "bone_marrow_suppressant", "major", "Effects on blood-cell production add together.", "Anaemia, infections, bleeding.", "Check blood counts."),
  r("ototoxic", "ototoxic", "moderate", "Effects on the inner ear add together.", "Hearing loss, ringing, dizziness.", "Avoid combining; monitor hearing."),
  r("photosensitizing", "photosensitizing", "minor", "Sun-sensitising effects add together.", "Sunburn and skin reactions.", "Protect skin from the sun."),
  r("estrogenic", "hormonal_contraceptive", "minor", "Estrogen-like plant compounds.", "Possible change in hormonal effect.", "Avoid large regular amounts."),
];

// ── Engine ───────────────────────────────────────────────────────────────────

export interface SubstanceFacts {
  slug: string;
  name: string;
  kind: "modern" | "traditional";
  category: string;
  properties: string[];
  cautions: Cautions;
}

export interface CuratedFacts {
  a: string;
  b: string;
  severity: Severity;
  mechanism: string;
  effect: string;
  management: string;
  evidence: string;
  source: string;
}

export interface Finding {
  severity: Severity;
  basis: "documented" | "predicted";
  mechanism: string;
  effect: string;
  management: string;
  evidence?: string;
  source?: string;
  /** Predicted findings: the properties that triggered the rule. */
  because?: [string, string];
}

export interface PairResult {
  a: string;
  b: string;
  severity: Severity | null;
  basis: "documented" | "predicted" | null;
  findings: Finding[];
}

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function evaluatePair(a: SubstanceFacts, b: SubstanceFacts, curated: Map<string, CuratedFacts>): PairResult {
  const findings: Finding[] = [];
  const documented = curated.get(pairKey(a.slug, b.slug));
  if (documented) {
    findings.push({ severity: documented.severity, basis: "documented", mechanism: documented.mechanism, effect: documented.effect, management: documented.management, evidence: documented.evidence, source: documented.source });
  }
  const seen = new Set<PropertyRule>();
  for (const rule of PROPERTY_RULES) {
    const forward = rule.a.find((p) => a.properties.includes(p)) && rule.b.find((p) => b.properties.includes(p));
    const backward = rule.a.find((p) => b.properties.includes(p)) && rule.b.find((p) => a.properties.includes(p));
    if (!forward && !backward) continue;
    if (seen.has(rule)) continue;
    seen.add(rule);
    const [x, y] = forward ? [a, b] : [b, a];
    findings.push({
      severity: rule.severity,
      basis: "predicted",
      mechanism: rule.mechanism,
      effect: rule.effect,
      management: rule.management,
      because: [rule.a.find((p) => x.properties.includes(p))!, rule.b.find((p) => y.properties.includes(p))!],
    });
  }
  findings.sort((l, m) => Number(m.basis === "documented") - Number(l.basis === "documented") || SEVERITY_RANK[m.severity] - SEVERITY_RANK[l.severity]);
  // A documented rule is authoritative for the pair's severity; otherwise the strongest prediction.
  const top = documented ? findings[0] : findings.reduce<Finding | null>((best, f) => (!best || SEVERITY_RANK[f.severity] > SEVERITY_RANK[best.severity] ? f : best), null);
  return { a: a.slug, b: b.slug, severity: top?.severity ?? null, basis: top?.basis ?? null, findings };
}

/** Cautions from the substance's own record plus those implied by its properties. */
export function effectiveCautions(substance: SubstanceFacts): Cautions {
  const merged: Cautions = { ...substance.cautions };
  const add = (condition: Condition, level: CautionLevel, note: string) => {
    const current = merged[condition];
    if (!current || (current.level === "caution" && level === "avoid")) merged[condition] = { level, note: current?.note ?? note };
  };
  const p = substance.properties;
  if (p.includes("uterotonic")) add("pregnancy", "avoid", "Stimulates the womb.");
  if (p.includes("toxic_internal")) (["pregnancy", "breastfeeding", "children", "older", "kidney", "liver"] as const).forEach((c) => add(c, "avoid", "Poisonous if swallowed."));
  if (p.includes("nephrotoxic") || p.includes("narrow_renal")) add("kidney", "caution", "Cleared or affected by the kidneys.");
  if (p.includes("hepatotoxic")) add("liver", "caution", "Can harm the liver.");
  if (p.includes("cns_depressant") || p.includes("anticholinergic")) add("older", "caution", "Falls and confusion are more likely.");
  if (p.includes("alcohol")) (["pregnancy", "breastfeeding", "children"] as const).forEach((c) => add(c, "avoid", "Alcohol."));
  if (p.includes("laxative_stimulant")) add("pregnancy", "caution", "Purgatives can trigger contractions.");
  return merged;
}

export interface MatrixItem extends SubstanceFacts {
  alerts: { condition: Condition; level: CautionLevel; note?: string }[];
}

export function buildMatrix(items: SubstanceFacts[], curated: Map<string, CuratedFacts>, profile: Condition[] = []) {
  const pairs: PairResult[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) pairs.push(evaluatePair(items[i], items[j], curated));
  }
  const flagged = pairs.filter((pair) => pair.severity).sort((x, y) => SEVERITY_RANK[y.severity!] - SEVERITY_RANK[x.severity!]);
  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, flagged.filter((p) => p.severity === s).length])) as Record<Severity, number>;
  const withAlerts: MatrixItem[] = items.map((item) => {
    const cautions = effectiveCautions(item);
    return { ...item, alerts: profile.filter((c) => cautions[c]).map((c) => ({ condition: c, ...cautions[c]! })) };
  });
  const worst = flagged[0]?.severity ?? null;
  return {
    items: withAlerts,
    pairs: flagged,
    counts,
    checkedPairs: pairs.length,
    worst,
    verdict: verdictFor(worst, withAlerts.some((i) => i.alerts.some((a) => a.level === "avoid"))),
  };
}

function verdictFor(worst: Severity | null, avoidAlert: boolean) {
  if (worst === "contraindicated") return { tone: "danger" as const, title: "Do not combine", body: "At least one pair must never be taken together." };
  if (worst === "major" || avoidAlert) return { tone: "danger" as const, title: "Serious concerns", body: "Change the plan or get a pharmacist or prescriber to review it first." };
  if (worst === "moderate") return { tone: "warning" as const, title: "Use with care", body: "These can be used together only with the precautions listed." };
  if (worst === "minor") return { tone: "info" as const, title: "Minor points", body: "Small effects; follow the timing advice." };
  return { tone: "success" as const, title: "No interaction found in this reference", body: "This does not prove the combination is safe; the reference cannot cover everything." };
}

/** Parses compact caution codes used in the seed: upper case = avoid, lower case = caution. */
export function parseCautionCodes(codes: string): Cautions {
  const map: Record<string, Condition> = { p: "pregnancy", b: "breastfeeding", k: "kidney", l: "liver", c: "children", e: "older" };
  const out: Cautions = {};
  for (const ch of codes) {
    const condition = map[ch.toLowerCase()];
    if (condition) out[condition] = { level: ch === ch.toUpperCase() ? "avoid" : "caution" };
  }
  return out;
}
