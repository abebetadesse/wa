/**
 * Clinical reading of bodily symptoms for the reviewer's analysis (clinical.ts).
 *
 * The symptom factors themselves (words, follow-up question, first steps) are in analysisLexicon.ts;
 * this file adds what a reviewer needs to hand the case on well: the questions that describe a
 * symptom, the warning signs to rule out, what a health worker may check, the conditions a clinician
 * would usually consider for a combination (with why they matter in Ethiopia), and how each of the
 * eleven knowledge strands reads the picture.
 *
 * `reviewer` text is for the reviewer only and may name conditions to rule out. `person` text is
 * what may reach the report: it names no disease the person did not mention, and every line ends
 * with a person or service. Nothing here is a diagnosis.
 */
import type { KnowledgeStrandType } from "@/lib/knowledge/types";

export type ClinicalPriority = "routine" | "prompt" | "soon" | "emergency";

export const PRIORITY: Record<ClinicalPriority, { label: string; timeframe: string; rank: number }> = {
  routine: { label: "Routine", timeframe: "at a convenient time in the coming weeks", rank: 0 },
  prompt: { label: "Prompt", timeframe: "within one to two weeks", rank: 1 },
  soon: { label: "Soon", timeframe: "within one to two days", rank: 2 },
  emergency: { label: "Emergency", timeframe: "now, at the nearest emergency service", rank: 3 },
};

export interface SymptomDetail {
  /** How soon the symptom on its own should be seen. */
  priority: ClinicalPriority;
  /** Questions that describe the symptom (site, onset, character, pattern, what changes it). */
  characterise: string[];
  /** Warning signs to ask about: any one of them raises the priority. */
  redFlags: string[];
  /** What a health worker may check, in plain words. */
  checks: string[];
  /** Extra words for the knowledge search, so each strand is asked about this symptom. */
  retrieval: string[];
}

export const SYMPTOM_DETAIL: Record<string, SymptomDetail> = {
  abdominal: {
    priority: "routine",
    characterise: [
      "Where exactly is the pain (upper middle, right or left side, around the navel, lower belly), and does it move?",
      "Is the pain burning, cramping, dull or sharp, and is it constant or does it come in waves?",
      "Is it worse when you are hungry, after meals, at night, or on fasting days and when you break the fast?",
      "What eases it — food, milk, antacids, passing stool — and what makes it worse?",
    ],
    redFlags: [
      "Vomiting blood or material like coffee grounds",
      "Black, tarry or bloody stools",
      "Severe pain that does not let up, or a hard, swollen belly",
      "Difficulty or pain when swallowing",
      "Yellow eyes or skin",
      "Fever with the pain",
    ],
    checks: ["Examination of the abdomen", "Stool test for parasites and blood", "H. pylori stool or breath test", "Blood count", "Abdominal ultrasound when the examination suggests it"],
    retrieval: ["abdominal pain", "digestive", "gut", "gastritis", "ulcer", "parasites"],
  },
  weight_loss: {
    priority: "prompt",
    characterise: [
      "How much weight have you lost, over what period, and how did you notice it (a scale, looser clothes, others' comments)?",
      "Were you trying to lose weight (dieting, fasting), or did it happen without trying?",
      "Are you eating less than before, or losing weight even though you eat as usual?",
    ],
    redFlags: [
      "Weight that keeps falling week after week",
      "Night sweats, fever or a cough for two weeks or more",
      "Great thirst and passing urine often",
      "Difficulty swallowing or vomiting after meals",
      "A lump or swelling anywhere, including the neck, armpit or belly",
    ],
    checks: ["Weight measured now and again in two to four weeks", "Blood sugar", "Blood count", "HIV test offered with consent", "TB screening", "Liver tests and hepatitis B", "Thyroid test where the examination suggests it"],
    retrieval: ["weight loss", "nutrition", "undernutrition", "tuberculosis", "diabetes"],
  },
  appetite_loss: {
    priority: "routine",
    characterise: ["Are you simply not hungry, full after a few bites, or afraid to eat because eating brings pain or nausea?", "Did the change start with an illness, a fast, a loss or a worry?"],
    redFlags: ["Appetite loss with weight loss", "Feeling full after very little food for weeks", "Yellow eyes or dark urine"],
    checks: ["Weight and nutritional assessment", "Blood count", "Mood screening"],
    retrieval: ["appetite", "nutrition", "mood"],
  },
  nausea_vomiting: {
    priority: "routine",
    characterise: ["How often do you vomit, at what time of day, and how soon after meals?", "Could you be pregnant?"],
    redFlags: ["Unable to keep any fluids down for a day", "Blood or coffee-ground material in the vomit", "Severe headache or stiff neck with vomiting", "Signs of dehydration: very little urine, dizziness on standing, dry mouth"],
    checks: ["Hydration assessment", "Pregnancy test where relevant", "Examination of the abdomen"],
    retrieval: ["nausea", "vomiting", "dehydration"],
  },
  bowel: {
    priority: "routine",
    characterise: ["How often do you open your bowels, and what is the stool like (watery, hard, with mucus or blood, pale, black)?", "How long has the change lasted, and has anyone else at home had the same?"],
    redFlags: ["Blood in or on the stool, or black stool", "Diarrhoea for more than two weeks", "Signs of dehydration", "Constipation that is new and persistent in an adult over 45"],
    checks: ["Stool examination for parasites, blood and infection", "Hydration assessment", "Blood count"],
    retrieval: ["diarrhoea", "parasites", "water", "sanitation"],
  },
  fever_sweats: {
    priority: "soon",
    characterise: ["How high and how often is the fever, and is it every day or every few days?", "Have you recently travelled to the lowlands, irrigated areas or a place with malaria?"],
    redFlags: ["Fever with stiff neck, confusion or a fit", "Fever in pregnancy or in a young child", "Fever with yellow eyes or dark urine", "Fever lasting more than three days"],
    checks: ["Malaria test", "Blood count", "TB screening with cough, sweats or weight loss", "Typhoid or other tests as the clinician judges"],
    retrieval: ["fever", "infection", "malaria", "tuberculosis"],
  },
  respiratory: {
    priority: "routine",
    characterise: ["How long has the cough lasted, is it dry or with sputum, and is there blood?", "Is there smoke at home (wood or charcoal cooking), do you smoke, or do you work with dust?"],
    redFlags: ["Coughing blood", "Breathlessness at rest or on light effort", "Cough for two weeks or more, especially with sweats or weight loss", "A household member with TB"],
    checks: ["TB sputum test", "Chest examination", "Oxygen level where available", "Chest X-ray as the clinician judges"],
    retrieval: ["cough", "respiratory", "tuberculosis", "smoke"],
  },
  jaundice: {
    priority: "soon",
    characterise: ["When did the yellow colour start, and is your urine dark or your stool pale?", "Did you take alcohol, a new herbal remedy or a medicine in the weeks before?"],
    redFlags: ["Confusion or drowsiness", "Bleeding or bruising easily", "Severe pain in the upper right belly with fever", "Jaundice in pregnancy"],
    checks: ["Liver tests", "Hepatitis B and C tests", "Malaria test where relevant", "Abdominal ultrasound"],
    retrieval: ["liver", "hepatitis", "jaundice"],
  },
  thirst_urination: {
    priority: "prompt",
    characterise: ["How much more are you drinking than usual, and how often do you pass urine at night?", "Is there burning, blood or pain when you pass urine?"],
    redFlags: ["Very great thirst with drowsiness, vomiting or rapid breathing", "Blood in the urine", "Fever with back or side pain"],
    checks: ["Blood-sugar test (fasting or random) and HbA1c where available", "Urine test", "Blood pressure"],
    retrieval: ["diabetes", "blood sugar", "urinary"],
  },
  headache_dizziness: {
    priority: "routine",
    characterise: ["When do the headaches come, where are they, and how long do they last?", "Is the dizziness on standing up, a spinning feeling, or a feeling of fainting?"],
    redFlags: ["Sudden, severe 'worst ever' headache", "Headache with fever and stiff neck", "Weakness or numbness on one side, difficulty speaking", "Fainting"],
    checks: ["Blood pressure", "Blood count", "Blood sugar", "Eye check where headaches are with vision changes"],
    retrieval: ["headache", "blood pressure", "anaemia"],
  },
  musculoskeletal: {
    priority: "routine",
    characterise: ["Which joints hurt, for how long, and is there swelling, redness or morning stiffness?", "What work, carrying or farming do you do?"],
    redFlags: ["A hot, red, swollen joint with fever", "Back pain with weakness in the legs or loss of bladder or bowel control", "Pain after a fall or injury"],
    checks: ["Physical examination", "Inflammation markers as the clinician judges", "Fluoride exposure history in the Rift Valley"],
    retrieval: ["joint pain", "inflammation", "fluorosis"],
  },
  skin: {
    priority: "routine",
    characterise: ["Where is the skin change, how long has it been there, and is it itchy, painful, spreading or not healing?", "Have you been in contact with animals, soil, or new soaps, plants or remedies?"],
    redFlags: ["A rash with fever and feeling very unwell", "Swelling of the lips, eyes or throat", "A sore that has not healed in a month"],
    checks: ["Skin examination", "Skin scraping or other tests as the clinician judges"],
    retrieval: ["skin", "rash", "itching"],
  },
};

export interface ClusterConsideration {
  /** A condition or contributor a clinician would usually consider or rule out. */
  name: string;
  /** Why it matters here, including what makes it more or less likely in Ethiopia. */
  why: string;
  strand: KnowledgeStrandType;
  /** Only when the profile suggests it (see clinical.ts). */
  when?: "age_45_plus" | "lowland" | "rift_valley" | "medicines" | "substances" | "female";
}

export interface ClusterDetail {
  priority: ClinicalPriority;
  considerations: ClusterConsideration[];
  checks: string[];
  ask: string[];
}

/** Keyed by the PATTERNS ids of analysisLexicon.ts. Reviewer-only. */
export const CLUSTERS: Record<string, ClusterDetail> = {
  abdominal_weight_loss: {
    priority: "prompt",
    considerations: [
      { name: "Peptic ulcer disease or chronic gastritis, often with H. pylori", why: "H. pylori infection is very common in Ethiopia; ulcer pain can reduce eating and cause weight loss. Painkillers, alcohol and khat add to the risk.", strand: "biological" },
      { name: "Intestinal parasites (giardia, amoeba, hookworm, tapeworm, schistosomiasis)", why: "Common where water and sanitation are limited; can cause pain, diarrhoea, poor absorption and anaemia.", strand: "epidemiological" },
      { name: "Abdominal or disseminated tuberculosis", why: "Ethiopia carries a high TB burden; abdominal TB presents with pain, weight loss and sometimes fever or swelling.", strand: "epidemiological" },
      { name: "Diabetes", why: "Rising in towns and in people over 40; weight loss with thirst or tiredness is a common way it shows.", strand: "epidemiological" },
      { name: "HIV-related illness", why: "Weight loss and gut symptoms are recognised presentations; an HIV test is routinely offered with consent.", strand: "epidemiological" },
      { name: "Chronic hepatitis B or other liver disease", why: "Hepatitis B is common in Ethiopia and may cause upper-right pain, poor appetite and weight loss before jaundice appears.", strand: "epidemiological" },
      { name: "Visceral leishmaniasis (kala-azar)", why: "Endemic in the north-western and southern lowlands; causes weight loss, fever and an enlarged spleen.", strand: "ecological", when: "lowland" },
      { name: "Malabsorption, including coeliac disease", why: "Weight loss despite eating, with bloating or diarrhoea; teff is gluten-free but wheat, barley and kolo are not.", strand: "biochemical" },
      { name: "Cancers of the stomach, oesophagus, liver, pancreas or bowel", why: "Less common, but the reason clinicians do not wait with this combination, particularly over age 45 or with swallowing trouble, bleeding or a mass.", strand: "biological", when: "age_45_plus" },
      { name: "Reduced intake from low mood, worry or grief", why: "Depression and anxiety often first show as loss of appetite, stomach discomfort and weight loss.", strand: "psychological" },
      { name: "Khat or alcohol use", why: "Khat suppresses appetite and causes constipation and gastritis; alcohol causes gastritis and pancreatitis.", strand: "addiction", when: "substances" },
      { name: "Medicine or remedy effects", why: "NSAID painkillers (ibuprofen, diclofenac, aspirin) cause ulcers; metformin causes stomach upset; traditional purgatives (kosso, enkoko, endod) can cause pain, vomiting and dehydration.", strand: "medication" },
      { name: "Food insecurity or long fasting without replacement foods", why: "Eating less because of cost or long fasts lowers weight and energy; the remedy is practical, not medical.", strand: "socioeconomic" },
    ],
    checks: ["Weight measured now and again in two to four weeks", "Abdominal examination", "Stool test for parasites and blood", "H. pylori test", "Blood count", "Blood sugar", "HIV test offered with consent", "TB screening", "Liver tests and hepatitis B", "Abdominal ultrasound", "Referral for endoscopy when there are warning signs or the person is over about 45"],
    ask: ["How much weight, over how long?", "Is the pain linked to meals, hunger or fasting?", "Any black stool, vomiting blood or trouble swallowing?", "Fever, night sweats or cough?", "Which painkillers, medicines or traditional remedies have been used?"],
  },
  weight_loss_fever: {
    priority: "soon",
    considerations: [
      { name: "Tuberculosis (pulmonary or outside the lungs)", why: "The classic picture: weight loss, night sweats, fever, cough for two weeks or more. Testing and treatment are free in Ethiopia.", strand: "epidemiological" },
      { name: "HIV-related infection", why: "Weight loss with recurrent fevers; HIV testing is routinely offered with consent.", strand: "epidemiological" },
      { name: "Visceral leishmaniasis (kala-azar)", why: "Fever and weight loss in people from or working in endemic lowlands (Metema, Humera, South Omo, Afar, Somali).", strand: "ecological", when: "lowland" },
      { name: "Malaria, brucellosis or typhoid", why: "Recurrent fevers are common in malarious areas; brucellosis follows raw milk or contact with livestock.", strand: "epidemiological" },
    ],
    checks: ["TB screening and sputum test", "HIV test offered with consent", "Malaria test", "Blood count", "Chest X-ray as the clinician judges"],
    ask: ["Night sweats? How long has the cough lasted?", "Any contact with someone with TB?", "Travel to or work in lowland areas?", "Raw milk or close work with livestock?"],
  },
  weight_loss_thirst: {
    priority: "prompt",
    considerations: [
      { name: "Diabetes", why: "Thirst, frequent urination, tiredness and weight loss are the common first signs; a finger-prick test at the health centre settles it.", strand: "epidemiological" },
      { name: "Overactive thyroid", why: "Weight loss despite eating, with palpitations, heat intolerance or tremor.", strand: "biochemical" },
    ],
    checks: ["Blood sugar (random or fasting), HbA1c where available", "Urine test for sugar and ketones", "Thyroid test as the clinician judges"],
    ask: ["How often do you pass urine at night?", "Is there diabetes in the family?", "Any blurred vision or slow-healing sores?"],
  },
  gut_upset: {
    priority: "routine",
    considerations: [
      { name: "Gastritis or functional dyspepsia", why: "Common with irregular meals and fasting transitions, spicy and acidic foods, painkillers, alcohol, khat, coffee on an empty stomach and stress.", strand: "biological" },
      { name: "Intestinal infection or parasites", why: "Water source and hand-washing matter; others at home with the same symptoms point this way.", strand: "epidemiological" },
      { name: "Gallbladder or liver trouble", why: "Pain in the upper right after fatty meals, sometimes with nausea.", strand: "biological" },
      { name: "Stress and the gut–brain link", why: "Worry and low mood commonly show up as stomach pain, nausea and bowel changes.", strand: "psychological" },
    ],
    checks: ["Abdominal examination", "Stool test", "H. pylori test", "Blood count"],
    ask: ["Is the pain related to meals or fasting?", "Does anyone else at home have similar symptoms?", "What is the drinking-water source?"],
  },
  liver_signs: {
    priority: "soon",
    considerations: [
      { name: "Acute viral hepatitis (A, B or E)", why: "Common in Ethiopia; hepatitis E outbreaks are linked to unsafe water and are dangerous in pregnancy.", strand: "epidemiological" },
      { name: "Liver injury from alcohol, medicines or herbal remedies", why: "Isoniazid, some antiretrovirals, paracetamol in excess, and several traditional remedies can injure the liver.", strand: "medication" },
      { name: "Malaria or a blocked bile duct (gallstones)", why: "Malaria causes jaundice in endemic areas; gallstones cause pain with jaundice and fever.", strand: "biological" },
    ],
    checks: ["Liver tests", "Hepatitis A, B, C and E tests as available", "Malaria test", "Abdominal ultrasound"],
    ask: ["Any alcohol, new medicines or herbs in the last month?", "Dark urine or pale stool?", "Could you be pregnant?"],
  },
  anaemia_signs: {
    priority: "prompt",
    considerations: [
      { name: "Iron-deficiency anaemia", why: "Very common, especially with heavy periods, pregnancy, hookworm, or long fasts without iron-rich foods.", strand: "biochemical" },
      { name: "Vitamin B12 or folate deficiency", why: "Possible with long plant-only fasting seasons and in older adults.", strand: "dietary" },
      { name: "Malaria or chronic infection", why: "Repeated malaria and chronic infections lower the blood count.", strand: "epidemiological" },
    ],
    checks: ["Blood count (haemoglobin)", "Stool test for hookworm", "Malaria test in malarious areas"],
    ask: ["Are periods heavy or long?", "How many fasting days have there been lately, and what replaces meat and dairy?"],
  },
};

export interface StrandLens {
  /** Symptom or factor ids that make this reading relevant; "physical" means any bodily symptom. */
  when: string[];
  reviewer: string;
  /** What may be said to the person; no disease names the person did not use. */
  person?: string;
  ask?: string;
  /** Only when the profile suggests it (see clinical.ts). */
  only?: "lowland" | "rift_valley" | "highland" | "age_45_plus" | "age_60_plus" | "female" | "medicines" | "pregnancy";
}

const ANY = ["physical"];

/** How each of the eleven knowledge strands reads a bodily complaint. */
export const STRAND_LENSES: Record<KnowledgeStrandType, StrandLens[]> = {
  biological: [
    { when: ["abdominal"], reviewer: "Locate the pain by region: upper middle (stomach, ulcer, pancreas), upper right (liver, gallbladder), lower or around the navel (bowel, parasites, appendix, and in women gynaecological causes).", person: "Where the pain sits and when it comes are the most useful clues for a health worker, so note them before the visit.", ask: "Where exactly is the pain, and when does it come?" },
    { when: ["weight_loss", "appetite_loss"], reviewer: "Separate reduced intake (pain, nausea, appetite, cost, fasting) from loss despite normal intake (diabetes, thyroid, malabsorption, chronic infection); the two point to different work-ups.", person: "Whether you are eating less or losing weight while eating as usual helps the health worker decide which simple tests to do first." },
    { when: ["abdominal", "nausea_vomiting", "bowel"], reviewer: "The gut–brain axis links stress, sleep and mood with pain, nausea and bowel habit in both directions.", person: "The stomach and mood affect each other; looking after sleep and worry often eases stomach symptoms too." },
    { when: ANY, reviewer: "Record onset, duration, pattern and what changes each symptom before referral; the health worker can then examine rather than re-take the history." },
  ],
  biochemical: [
    { when: ["weight_loss", "appetite_loss", "fatigue"], reviewer: "Reduced intake for weeks risks protein-energy, iron, zinc, B12 and folate deficits; with tiredness or pallor, a blood count is the first test.", person: "Eating less for several weeks can lower iron and other nutrients, which shows up as tiredness; a simple blood test checks this." },
    { when: ["weight_loss", "bowel"], reviewer: "Weight loss despite eating, with bloating or loose stools, suggests malabsorption (parasites, coeliac disease, pancreatic insufficiency)." },
    { when: ["thirst_urination", "weight_loss"], reviewer: "Check glucose: hyperglycaemia causes osmotic diuresis, thirst and catabolic weight loss." },
    { when: ["jaundice"], reviewer: "Jaundice needs liver tests (bilirubin, transaminases) before any herb or new medicine metabolised by the liver is added." },
  ],
  medication: [
    { when: ["abdominal", "nausea_vomiting", "musculoskeletal", "headache_dizziness"], reviewer: "Ask specifically about NSAIDs (ibuprofen, diclofenac, aspirin) — the commonest drug cause of gastritis and ulcer bleeding, worse on an empty stomach or while fasting.", person: "Painkillers such as ibuprofen, diclofenac or aspirin can upset or injure the stomach, especially on an empty stomach; tell the health worker about any you take.", ask: "Which painkillers or other medicines have you taken in the last month, and how often?" },
    { when: ["abdominal", "bowel", "weight_loss"], reviewer: "Traditional purgatives and anthelmintics (kosso / Hagenia abyssinica, enkoko / Embelia schimperi, endod) can cause cramping, vomiting, diarrhoea and dehydration; ask what has been taken and how much.", person: "Some traditional remedies for the stomach or for worms are strong; please tell the health worker which ones you have used.", ask: "Have you used any traditional remedy for the stomach or for worms, such as kosso or enkoko?" },
    { when: ["weight_loss", "nausea_vomiting", "jaundice"], reviewer: "Metformin causes GI upset and modest weight loss; isoniazid, rifampicin, some antiretrovirals and excess paracetamol can injure the liver.", only: "medicines" },
    { when: ANY, reviewer: "Ask for every medicine, supplement and remedy to be brought to the visit; check interactions with the herb–medicine table before advising anything." },
  ],
  addiction: [
    { when: ["abdominal", "weight_loss", "appetite_loss", "bowel"], reviewer: "Khat suppresses appetite, delays meals and causes constipation and gastritis; daily chewing is a common contributor to weight loss. Alcohol (including areke, tej and tella) causes gastritis and pancreatitis.", person: "Khat and alcohol both affect the stomach and appetite; if you use either, mention how often to the health worker.", ask: "Do you chew khat, drink alcohol or smoke, and how often?" },
    { when: ["respiratory"], reviewer: "Tobacco and shisha raise the risk of chronic cough and TB progression; ask about smoking and indoor smoke." },
  ],
  ecological: [
    { when: ["bowel", "abdominal", "fever_sweats", "weight_loss"], reviewer: "Ask about the drinking-water source (protected well, tap, river), latrine access and irrigation work: these drive parasites, schistosomiasis and diarrhoeal disease.", person: "Safe drinking water (boiled, filtered or treated) and hand-washing protect the stomach; it is worth checking at home.", ask: "Where does your drinking water come from, and is it boiled or treated?" },
    { when: ["fever_sweats", "weight_loss"], reviewer: "In lowland or irrigated areas below about 2,000 m, consider malaria, schistosomiasis and, in the north-west and south, kala-azar.", only: "lowland" },
    { when: ["musculoskeletal", "skin"], reviewer: "In the Rift Valley, high-fluoride water causes dental and skeletal fluorosis (joint stiffness, bone pain).", only: "rift_valley" },
    { when: ["respiratory"], reviewer: "Cooking with wood, dung or charcoal indoors is a major cause of chronic cough; at high altitude, breathlessness may be from low oxygen as well." },
  ],
  epidemiological: [
    { when: ["weight_loss"], reviewer: "Unintentional weight loss in Ethiopia warrants screening for TB, HIV (with consent), diabetes and hepatitis B; these are common, testable and treatable." },
    { when: ["abdominal"], reviewer: "H. pylori prevalence in Ethiopian adults is high; intestinal parasites remain common where sanitation is limited." },
    { when: ["fever_sweats", "respiratory"], reviewer: "Cough of two weeks or more, or fever with night sweats, meets the national TB screening criteria; testing and treatment are free." },
    { when: ANY, reviewer: "Ask whether others in the household have similar symptoms; a shared illness points to water, food or infection." },
  ],
  psychological: [
    { when: ["abdominal", "appetite_loss", "weight_loss", "nausea_vomiting"], reviewer: "Screen gently for low mood, worry, grief and stress: they commonly present as stomach pain, loss of appetite and weight loss, and they also follow from being ill.", person: "Worry, sadness or a recent loss can affect appetite and the stomach, and being unwell can affect mood; both are worth mentioning.", ask: "How has your mood been, and has anything worried or saddened you since this began?" },
    { when: ANY, reviewer: "Ask what the person fears the symptoms mean; naming the fear often lowers distress and helps them attend the health visit." },
  ],
  socioeconomic: [
    { when: ["weight_loss", "appetite_loss"], reviewer: "Check whether eating less is about cost or food availability; if so, refer to kebele or woreda support, PSNP or iddir before treating it as a medical problem.", person: "If buying enough food has become hard, the kebele or woreda office, iddir or a faith community may be able to help.", ask: "Has it become harder to get enough food at home recently?" },
    { when: ANY, reviewer: "Ask about the cost and distance of a health visit; community-based health insurance (CBHI) and free TB, HIV and malaria services remove most barriers to the first tests.", person: "Many first tests at government health centres are free or covered by community-based health insurance (CBHI); ask at the health centre." },
  ],
  dietary: [
    { when: ["abdominal", "nausea_vomiting"], reviewer: "Review meal rhythm: long fasts broken with spicy wot or coffee on an empty stomach commonly aggravate gastritis; smaller, regular meals help.", person: "Smaller, regular meals and not breaking a long fast with coffee or very spicy food are often easier on the stomach." },
    { when: ["weight_loss", "appetite_loss"], reviewer: "While the cause is found, protect intake: energy-dense, protein-rich meals (shiro, misir, eggs, kinche, kolo, milk and fish where not fasting); during fasting seasons plan legume, oilseed and grain combinations.", person: "While the cause is looked for, small meals rich in energy and protein — such as shiro, lentils, kinche, roasted grains and, outside fasting days, eggs and milk — help keep strength up." },
    { when: ["bowel"], reviewer: "Diarrhoea: oral rehydration solution and continued feeding; constipation with khat or low fibre: fluids, vegetables, whole grains and teff." },
  ],
  cultural: [
    { when: ANY, reviewer: "Ask how the person and family understand the illness (for example evil eye, a spirit, or a natural cause) and what help they have sought (holy water, a debtera, a herbalist); respect it while keeping the health visit on the plan.", person: "Many people seek spiritual help as well as medical care; both can go together, and prayer or holy water need not delay a health check.", ask: "What do you and your family think is causing this, and what help have you already sought?" },
    { when: ["weight_loss", "abdominal", "appetite_loss"], reviewer: "Fasting: the Orthodox Church releases the sick from fasting with the counsel of their spiritual father; Islam exempts the ill during Ramadan. Offer this framing if fasting is limiting intake.", person: "If fasting is making it hard to eat enough, your spiritual father or imam can advise; faith traditions allow the sick to ease their fast." },
  ],
  astrological: [
    { when: ANY, reviewer: "Domain B only: the healing calendar's 'Strengthening & recovery' intent (waxing moon, morning) can frame the timing of prayer or a nourishing routine. It must never set the date of a health visit.", person: "If you keep a spiritual or traditional calendar, it can guide the timing of prayer or a nourishing routine — but do not let it delay the health check." },
  ],
};
