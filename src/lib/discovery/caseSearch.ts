export const CASE_SEARCH_FIELDS = ["caseType", "herb", "diet", "location", "element"] as const;
export type CaseSearchField = (typeof CASE_SEARCH_FIELDS)[number];
export type CaseSearchSettings = Record<CaseSearchField, boolean>;

export const DEFAULT_CASE_SEARCH_SETTINGS: CaseSearchSettings = {
  caseType: true,
  herb: true,
  diet: true,
  location: true,
  element: true,
};

export interface CaseSample {
  id: string;
  caseType: string;
  title: string;
  summary: string;
  herb: string;
  diet: string;
  location: string;
  element: string;
  recommendation: string;
  keywords: string[];
  safetyNote: string;
}

const locations = [
  "Addis Ababa", "Gondar", "Adama", "Mekelle", "Hawassa",
  "Dire Dawa", "Harar", "Jijiga", "Semera", "Arba Minch",
];

const elements = ["Fire", "Water", "Earth", "Air", "Aether"];

const scenarios = [
  { caseType: "Sleep & rest", title: "Building a steadier evening routine", summary: "A sample case about irregular bedtimes and difficulty winding down.", herb: "Chamomile (tea)", diet: "A lighter evening meal", recommendation: "Choose a consistent wind-down time, dim bright screens, and keep a brief sleep diary for two weeks." },
  { caseType: "Everyday energy", title: "Planning balanced meals for busy days", summary: "A sample case about skipped meals and feeling low on energy during a busy day.", herb: "Moringa leaves (food ingredient)", diet: "Teff injera with lentils", recommendation: "Plan regular meals with a familiar grain, protein-rich legumes, and vegetables; persistent fatigue deserves a clinician's assessment." },
  { caseType: "Hydration", title: "Remembering fluids during warm days", summary: "A sample case about forgetting to drink during work or travel.", herb: "Mint (food ingredient)", diet: "Water and water-rich fruit", recommendation: "Keep safe drinking water within reach and take regular drink breaks; follow medical advice if you have a fluid restriction." },
  { caseType: "Digestive comfort", title: "Making room for regular meals", summary: "A sample case about irregular meal timing and occasional digestive discomfort.", herb: "Ginger (food ingredient)", diet: "Gradual servings of fiber-rich foods", recommendation: "Try regular, unhurried meals and add fiber gradually with adequate fluids; seek care for severe or persistent symptoms." },
  { caseType: "Meal planning", title: "Adding variety to a familiar menu", summary: "A sample case about wanting more variety from accessible local foods.", herb: "Garlic (food ingredient)", diet: "A mix of legumes and seasonal vegetables", recommendation: "Add one affordable seasonal vegetable or legume to a familiar meal and adapt choices to allergies and personal needs." },
  { caseType: "Stress & mood", title: "Creating a small daily pause", summary: "A sample case about everyday stress and having little time to reset.", herb: "Basil (food ingredient)", diet: "Regular meals and water", recommendation: "Try a short breathing pause or supportive conversation; seek qualified help if distress persists or daily functioning is affected." },
  { caseType: "Movement", title: "Finding a comfortable way to move", summary: "A sample case about wanting to add gentle movement to a sedentary routine.", herb: "Rosemary (food ingredient)", diet: "A balanced meal after activity", recommendation: "Start with short, comfortable walks and increase gradually; stop and seek care for chest pain, faintness, or unusual breathlessness." },
  { caseType: "Seasonal comfort", title: "Noticing seasonal changes", summary: "A sample case about tracking how seasonal conditions affect everyday comfort.", herb: "Turmeric (food ingredient)", diet: "Regular meals with vegetables", recommendation: "Track timing and possible environmental triggers; discuss recurring or worsening symptoms with a qualified clinician." },
  { caseType: "Focus", title: "Making focused work breaks", summary: "A sample case about long work sessions and difficulty staying focused.", herb: "Cinnamon (food ingredient)", diet: "A regular breakfast with whole grains", recommendation: "Break work into manageable blocks, take brief movement breaks, and protect regular sleep and meal times." },
  { caseType: "Oral wellbeing", title: "Supporting a consistent oral-care routine", summary: "A sample case about building reliable daily oral hygiene habits.", herb: "Clove (food ingredient)", diet: "Water instead of frequent sugary drinks", recommendation: "Brush twice daily with fluoride toothpaste and arrange routine dental care; food spices are not a substitute for dental treatment." },
  { caseType: "Skin comfort", title: "Tracking everyday skin irritants", summary: "A sample case about noticing skin discomfort after changes in products or environment.", herb: "Aloe (topical use needs care)", diet: "A varied, balanced diet", recommendation: "Stop newly introduced irritants and track exposures; do not apply unknown plants to skin, and seek care for severe reactions." },
  { caseType: "Respiratory comfort", title: "Reducing common indoor irritants", summary: "A sample case about reducing dust or smoke exposure at home.", herb: "Thyme (food ingredient)", diet: "Regular meals and fluids", recommendation: "Improve ventilation where safe and reduce smoke or dust exposure; breathing difficulty needs urgent medical attention." },
  { caseType: "Joint comfort", title: "Adapting movement for comfort", summary: "A sample case about stiffness after long periods in one position.", herb: "Ginger (food ingredient)", diet: "A varied diet with vegetables and legumes", recommendation: "Try gentle range-of-motion breaks and avoid movements that worsen pain; ongoing swelling or pain should be evaluated." },
  { caseType: "Community support", title: "Making time for social connection", summary: "A sample case about feeling isolated and wanting more regular connection.", herb: "Coffee (traditional social drink)", diet: "Shared, regular meals", recommendation: "Consider a trusted community gathering or check-in with someone you trust; cultural practices complement, not replace, mental-health care." },
  { caseType: "Fasting routine", title: "Planning nourishment around a fast", summary: "A sample case about coordinating meals with a personal or religious fasting routine.", herb: "Fenugreek (food ingredient)", diet: "Balanced meals during permitted eating times", recommendation: "Plan nourishing meals and hydration for permitted times; people with medical conditions or medicines should consult their clinician before fasting." },
  { caseType: "Family meals", title: "Making family meals more inclusive", summary: "A sample case about accommodating different preferences at one shared meal.", herb: "Coriander (food ingredient)", diet: "A shared base with optional additions", recommendation: "Serve a familiar shared base and offer optional sides to accommodate preferences, allergies, and age-appropriate needs." },
  { caseType: "Heart-healthy habits", title: "Choosing practical everyday habits", summary: "A sample case about looking for sustainable everyday food and movement habits.", herb: "Garlic (food ingredient)", diet: "More legumes and vegetables", recommendation: "Choose manageable food and activity habits; this is not a treatment plan, and prescribed medicines should not be changed without a clinician." },
  { caseType: "Food access", title: "Working with available local foods", summary: "A sample case about planning meals around seasonal availability and budget.", herb: "Berbere spices (food seasoning)", diet: "Seasonal grains, pulses, and vegetables", recommendation: "Build meals around locally available staples and legumes; a community nutrition service can help when food access is limited." },
  { caseType: "Healthy weight", title: "Setting non-restrictive routine goals", summary: "A sample case about seeking sustainable routines without restrictive dieting.", herb: "Black cumin (food ingredient)", diet: "Regular balanced meals", recommendation: "Focus on achievable routines, enjoyable movement, and adequate nourishment rather than restrictive diets; seek individualized clinical advice." },
  { caseType: "Travel routine", title: "Keeping simple habits while traveling", summary: "A sample case about disrupted sleep and meals during travel.", herb: "Ginger (food ingredient)", diet: "Safe water and familiar balanced snacks", recommendation: "Plan safe drinking water, familiar snacks, and rest breaks; seek medical advice for significant or persistent travel-related symptoms." },
];

export const CASE_SAMPLES: CaseSample[] = scenarios.flatMap((scenario, scenarioIndex) =>
  locations.map((location, locationIndex) => ({
    id: `sample-${String(scenarioIndex * locations.length + locationIndex + 1).padStart(3, "0")}`,
    ...scenario,
    location,
    element: elements[(scenarioIndex + locationIndex) % elements.length],
    keywords: [scenario.caseType, location, elements[(scenarioIndex + locationIndex) % elements.length], scenario.herb, scenario.diet],
    safetyNote: "Illustrative educational example only, not a real patient case, diagnosis, or treatment plan. Food ingredients are not medical treatments; check allergies and ask a qualified clinician before using herbs or supplements, especially with medicines, pregnancy, or ongoing conditions.",
  })),
);

export interface CaseSearchInput {
  query?: string;
  caseType?: string;
  herb?: string;
  diet?: string;
  location?: string;
  element?: string;
  limit?: number;
}

export interface CaseSearchResult {
  query: string;
  results: CaseSample[];
  total: number;
  isFallback: boolean;
  message: string;
  options: Record<CaseSearchField, string[]>;
  settings: CaseSearchSettings;
}

const textFor = (sample: CaseSample, settings: CaseSearchSettings) =>
  [
    sample.title,
    sample.summary,
    sample.recommendation,
    ...(settings.caseType ? [sample.caseType] : []),
    ...(settings.herb ? [sample.herb] : []),
    ...(settings.diet ? [sample.diet] : []),
    ...(settings.location ? [sample.location] : []),
    ...(settings.element ? [sample.element] : []),
  ].join(" ").toLowerCase();

function optionsFor(field: CaseSearchField) {
  return [...new Set(CASE_SAMPLES.map((sample) => sample[field]))].sort((a, b) => a.localeCompare(b));
}

export function searchCaseSamples(input: CaseSearchInput, settings: CaseSearchSettings = DEFAULT_CASE_SEARCH_SETTINGS): CaseSearchResult {
  const query = input.query?.trim() ?? "";
  const activeFilters = CASE_SEARCH_FIELDS.filter((field) => settings[field] && input[field]?.trim());
  const matchesFilters = (sample: CaseSample) =>
    activeFilters.every((field) => sample[field].toLowerCase() === input[field]!.trim().toLowerCase());
  const filtered = CASE_SAMPLES.filter(matchesFilters);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const ranked = filtered
    .map((sample) => {
      const text = textFor(sample, settings);
      const score = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      return { sample, score };
    })
    .filter(({ score }) => !terms.length || score > 0)
    .sort((a, b) => b.score - a.score || a.sample.id.localeCompare(b.sample.id));

  const isFallback = ranked.length === 0;
  const fallbackPool = filtered.length ? filtered : CASE_SAMPLES;
  const results = (isFallback
    ? fallbackPool.slice(0, 12)
    : ranked.map(({ sample }) => sample)
  ).slice(0, Math.max(1, Math.min(input.limit ?? 12, 50)));

  return {
    query,
    results,
    total: isFallback ? fallbackPool.length : ranked.length,
    isFallback,
    message: isFallback
      ? activeFilters.length && filtered.length
        ? "No exact text match was found. Here are examples that still match your selected filters."
        : activeFilters.length
          ? "No example matched every selected filter. Showing popular starter examples; try removing or changing a filter."
          : "No exact match was found. Here are popular starter examples; try a related topic or one of the filters."
      : "",
    options: Object.fromEntries(CASE_SEARCH_FIELDS.map((field) => [field, settings[field] ? optionsFor(field) : []])) as Record<CaseSearchField, string[]>,
    settings,
  };
}
