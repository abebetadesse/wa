import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile } from "../types";
import { db } from "@/lib/db";
import { herbs as herbsTable, herbDrugInteractions as herbDrugInteractionsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface HerbDrugInteractionRule {
  herb: string;
  scientificName: string;
  drug: string;
  targetDrugClass: string;
  interaction: string;
  severity: "critical" | "high" | "moderate" | "low";
  mechanism: string;
  ethiopian_context: string;
  recommendation: string;
}

export interface EssentialMedicineProfile {
  name: string;
  brand?: string;
  className: string;
  indications: string[];
  mechanism: string;
  commonSideEffects: string[];
  seriousSideEffects: string[];
  interactions: string[];
  contraindications: string[];
  pregnancyCategory: string;
  lactation: string;
  availability: string;
  costContext: string;
  resistanceContext?: string;
  safetyNotes: string[];
}

export class MedicationKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "medication";
  readonly domain = "wellbeing" as const;

  private queryAliases: Record<string, string[]> = {
    antimalarial: ["malaria", "plasmodium", "fever", "coartem", "artemisinin", "lumefantrine"],
    antibiotic: ["antibiotic", "infection", "amoxicillin", "azithromycin", "ciprofloxacin", "doxycycline"],
    antihypertensive: ["blood pressure", "hypertension", "enalapril", "amlodipine", "losartan", "hydrochlorothiazide"],
    antidiabetic: ["diabetes", "blood sugar", "metformin", "glibenclamide", "insulin"],
    antiretroviral: ["hiv", "aids", "tenofovir", "efavirenz", "dolutegravir"],
    pain: ["pain", "paracetamol", "ibuprofen", "aspirin", "tramadol", "headache"],
    antiTB: ["tb", "tuberculosis", "rifampin", "isoniazid", "pyrazinamide", "ethambutol"],
    antifungal: ["fungal", "candida", "fluconazole", "clotrimazole"],
    antidepressant: ["depression", "anxiety", "ssri", "fluoxetine", "sertraline", "amitriptyline"],
    antipsychotic: ["psychosis", "schizophrenia", "haloperidol", "chlorpromazine", "risperidone"],
    pregnancy: ["pregnancy", "pregnant", "lactation", "breastfeeding"],
    fasting: ["fasting", "tsome", "ramadan", "medication during fasting"],
    availability: ["cost", "price", "availability", "pharmacy", "health center"],
    tena_adam: ["tena adam", "ruta", "rue"],
    kosso: ["kosso", "hagenia", "tapeworm"],
    tikur_azmud: ["tikur azmud", "nigella", "black seed"],
    damakesse: ["damakesse", "ocimum"],
    garlic: ["garlic", "shinkurt"],
  };

  private essentialMedicineProfiles: EssentialMedicineProfile[] = [
    {
      name: "Artemether + Lumefantrine",
      brand: "Coartem",
      className: "Antimalarial (ACT)",
      indications: ["Uncomplicated Plasmodium falciparum malaria"],
      mechanism: "Rapid parasite clearance followed by sustained antimalarial activity.",
      commonSideEffects: ["Nausea", "Vomiting", "Headache", "Dizziness", "Abdominal pain"],
      seriousSideEffects: ["QT prolongation", "Anaphylaxis", "Rare liver injury"],
      interactions: ["Rifampicin and other enzyme inducers may reduce exposure", "Antacids or poor food intake may reduce absorption"],
      contraindications: ["Hypersensitivity", "Severe malaria requiring parenteral treatment"],
      pregnancyCategory: "Use only after practitioner assessment; malaria itself is high risk in pregnancy",
      lactation: "Discuss with a practitioner; treatment decisions depend on maternal and infant context",
      availability: "Commonly supplied through public health centres and pharmacies",
      costContext: "Public-sector access and private prices vary by region and supply",
      resistanceContext: "Treatment failure requires testing and public-wellbeing follow-up rather than self-repeating a course",
      safetyNotes: ["Take the complete prescribed course and seek urgent review for breathing difficulty, fainting, or severe vomiting"],
    },
    {
      name: "Rifampicin",
      brand: "Rifadin",
      className: "Antituberculosis medicine",
      indications: ["Tuberculosis combination therapy", "Latent TB treatment when prescribed"],
      mechanism: "Inhibits bacterial RNA polymerase.",
      commonSideEffects: ["Nausea", "Rash", "Flu-like symptoms", "Orange discolouration of body fluids"],
      seriousSideEffects: ["Liver injury", "Thrombocytopenia", "Acute kidney injury"],
      interactions: ["Strong enzyme inducer that can reduce warfarin, contraceptive, antiretroviral, and other medicine exposure"],
      contraindications: ["Severe active liver disease", "Hypersensitivity"],
      pregnancyCategory: "Use under TB-program or specialist supervision",
      lactation: "Usually compatible when scientificly indicated; confirm with the treatment team",
      availability: "Widely supplied through national TB/DOTS services",
      costContext: "Often provided through public TB services",
      resistanceContext: "Never use alone for active TB; incomplete therapy increases resistance risk",
      safetyNotes: ["Complete the prescribed combination regimen and report jaundice, unusual bleeding, or severe weakness"],
    },
    {
      name: "Isoniazid",
      brand: "INH",
      className: "Antituberculosis medicine",
      indications: ["Tuberculosis combination therapy", "Latent TB treatment when prescribed"],
      mechanism: "Inhibits mycolic-acid synthesis in susceptible mycobacteria.",
      commonSideEffects: ["Nausea", "Rash", "Peripheral tingling", "Fatigue"],
      seriousSideEffects: ["Liver injury", "Severe neuropathy", "Seizures (rare)"],
      interactions: ["May increase phenytoin or carbamazepine exposure", "Alcohol increases liver risk"],
      contraindications: ["Severe active liver disease", "Previous severe isoniazid reaction"],
      pregnancyCategory: "Use under TB-program or specialist supervision",
      lactation: "Usually compatible when scientificly indicated; pyridoxine may be advised",
      availability: "Widely supplied through TB services",
      costContext: "Often provided through public TB services",
      resistanceContext: "Must be used in an appropriate regimen to reduce resistance",
      safetyNotes: ["Ask about pyridoxine, alcohol, neuropathy, and liver symptoms during treatment"],
    },
    {
      name: "Enalapril",
      brand: "Renitec",
      className: "ACE inhibitor antihypertensive",
      indications: ["Hypertension", "Heart failure", "Selected kidney-protection indications"],
      mechanism: "Reduces angiotensin-converting enzyme activity.",
      commonSideEffects: ["Dry cough", "Dizziness", "Raised potassium"],
      seriousSideEffects: ["Angioedema", "Acute kidney injury", "Severe hypotension"],
      interactions: ["Potassium supplements and potassium-sparing medicines", "NSAIDs may worsen kidney risk or reduce effect"],
      contraindications: ["Pregnancy", "Previous ACE-inhibitor angioedema", "Some renal artery disorders"],
      pregnancyCategory: "Avoid in pregnancy",
      lactation: "Discuss infant age and scientific context with a practitioner",
      availability: "Commonly available, but continuity varies by facility",
      costContext: "Public and private prices vary by strength and supply",
      safetyNotes: ["Monitor blood pressure, kidney function, and potassium as advised"],
    },
    {
      name: "Metformin",
      className: "Biguanide antidiabetic",
      indications: ["Type 2 diabetes and selected practitioner-directed uses"],
      mechanism: "Reduces hepatic glucose production and improves insulin sensitivity.",
      commonSideEffects: ["Nausea", "Diarrhoea", "Abdominal discomfort", "Long-term B12 reduction"],
      seriousSideEffects: ["Rare lactic acidosis, especially with severe kidney or acute illness"],
      interactions: ["Alcohol and dehydration increase risk", "Kidney function affects safe use"],
      contraindications: ["Severe kidney impairment or acute hypoxia without practitioner review"],
      pregnancyCategory: "Use only as prescribed for the individual",
      lactation: "Discuss with a practitioner",
      availability: "Commonly available through public and private services",
      costContext: "Cost varies by formulation and supply",
      safetyNotes: ["Do not change doses for fasting without a diabetes plan; ask about kidney function and B12 monitoring"],
    },
  ];

  private pharmacokineticContext = [
    {
      terms: ["cyp", "metabolism", "pharmacokinetic", "drug level", "slow metabolizer"],
      title: "Individual medicine metabolism varies",
      description: "Genetic variation, liver and kidney function, age, nutrition, infection, and interacting medicines can change exposure.",
      recommendation: "Use the prescribed dose and review unexpected toxicity or treatment failure with a practitioner or pharmacist; ancestry alone cannot predict an individual genotype.",
    },
    {
      terms: ["rifampicin", "enzyme inducer", "interaction"],
      title: "Enzyme-inducing medicines",
      description: "Rifampicin can lower concentrations of several medicines, including some contraceptives, anticoagulants, antiretrovirals, and cardiovascular medicines.",
      recommendation: "Perform a full medication reconciliation before starting or stopping rifampicin.",
    },
  ];

  private antimicrobialResistanceGuidance = [
    { terms: ["antibiotic", "resistance", "amr"], title: "Antimicrobial resistance prevention", advice: "Use antibiotics only when prescribed, take the full regimen, do not share leftovers, and return for review if symptoms worsen or fail to improve." },
    { terms: ["tb", "tuberculosis", "rifampicin"], title: "TB resistance safety", advice: "Active TB requires a supervised combination regimen; missed doses or monotherapy can promote drug resistance." },
    { terms: ["malaria", "antimalarial"], title: "Antimalarial treatment failure", advice: "Confirm suspected malaria and return for testing when fever persists; do not repeatedly self-treat or use leftover antimalarials." },
  ];

  private drugDatabase = {
    antimalarials: {
      name: "Antimalarial Medications",
      drugs: ["Artemether-Lumefantrine (Coartem)", "Artesunate", "Chloroquine", "Quinine", "Primaquine", "Doxycycline"],
      indications: ["Acute uncomplicated Plasmodium falciparum malaria", "Plasmodium vivax relapse prevention", "Severe malaria"],
      common_side_effects: ["Nausea", "Dizziness", "Headache", "Abdominal discomfort", "QT prolongation risk with quinine"],
      ethiopian_context: [
        "First-line national protocol for P. falciparum is Artemether-Lumefantrine (Coartem)",
        "Chloroquine retained in select highland-fringe zones for confirmed P. vivax only",
      ],
      interactions: ["Avoid concurrent high-dose iron during acute infection", "CYP3A4 inducers reduce artemether levels"],
      contraindications: ["First trimester pregnancy for select derivatives", "Known severe cardiac arrhythmias for quinine"],
    },
    antihypertensives: {
      name: "Cardiovascular & Blood Pressure Agents",
      drugs: ["Enalapril", "Lisinopril", "Amlodipine", "Hydrochlorothiazide", "Atenolol", "Losartan"],
      indications: ["Primary hypertension", "Cardiomyopathy", "Post-myocardial infarction secondary prevention"],
      common_side_effects: ["Dry persistent cough with ACE inhibitors", "Peripheral pedal edema with Amlodipine", "Electrolyte shifts (hypokalemia with thiazides, hyperkalemia with ACEi)"],
      ethiopian_context: [
        "Rapid rise of hypertension in urban Ethiopian centers (Addis Ababa, Hawassa, Adama) linked to dietary sodium transitions and sedentary lifestyle",
      ],
      interactions: ["NSAIDs blunt antihypertensive efficacy", "Potassium supplements with ACEi/ARBs increase hyperkalemia risk"],
      contraindications: ["Pregnancy (ACE inhibitors and ARBs are teratogenic)", "Bilateral renal artery stenosis"],
    },
    antidiabetics: {
      name: "Glycemic Control Medications",
      drugs: ["Metformin", "Glibenclamide (Sulfonylurea)", "Gliclazide", "Insulin (Regular, NPH, Premixed)"],
      indications: ["Type 2 diabetes mellitus", "Type 1 diabetes", "Gestational diabetes"],
      common_side_effects: ["Gastrointestinal intolerance with metformin", "Symptomatic hypoglycemia with sulfonylureas/insulin", "Long-term metformin-induced Vitamin B12 depletion"],
      ethiopian_context: [
        "Diabetes care in Ethiopia emphasizes combining metformin with unrefined teff injera to provide stable postprandial glucose curves without precipitating hypoglycemia",
      ],
      interactions: ["Alcohol potentiates lactic acidosis with metformin", "Herbal hypoglycemics (Tena Adam, Fenugreek) compound hypoglycemia risk"],
      contraindications: ["Severe renal impairment (eGFR < 30 mL/min for metformin)", "Diabetic ketoacidosis"],
    },
    antiretrovirals: {
      name: "HIV Antiretroviral Therapy (ART)",
      drugs: ["Dolutegravir (DTG)", "Tenofovir Disoproxil Fumarate (TDF)", "Lamivudine (3TC)", "Efavirenz (EFV)"],
      indications: ["Chronic HIV-1 infection suppression", "Post-exposure prophylaxis (PEP)", "Prevention of mother-to-child transmission (PMTCT)"],
      common_side_effects: ["Transient sleep disturbance and vivid dreams with DTG/EFV", "Renal tubular and bone mineral shifts with TDF"],
      ethiopian_context: [
        "Universal national standard of care transitioned to TLD (Tenofovir + Lamivudine + Dolutegravir) across public Ethiopian health centers",
      ],
      interactions: ["Polyvalent cations (calcium, iron, antacids) chelate Dolutegravir reducing absorption", "Rifampicin markedly lowers DTG requiring dose doubling"],
      contraindications: ["Severe acute hepatic decompensation", "Documented hypersensitivity"],
    },
    anti_tuberculosis: {
      name: "Antitubercular Chemotherapy (DOTS)",
      drugs: ["Rifampicin", "Isoniazid", "Pyrazinamide", "Ethambutol"],
      indications: ["Active pulmonary and extrapulmonary tuberculosis", "Latent TB preventive therapy (TPT)"],
      common_side_effects: ["Hepatotoxicity (elevated transaminases)", "Peripheral neuropathy from pyridoxine depletion", "Optic neuritis with ethambutol", "Orange discoloration of body fluids"],
      ethiopian_context: [
        "Administered under national DOTS protocols with mandatory Pyridoxine (Vitamin B6) co-prescription to prevent Isoniazid peripheral neuropathy",
      ],
      interactions: ["Rifampicin is a master CYP450 inducer (reduces oral contraceptives, warfarin, artemisinins, dolutegravir)", "Alcohol multiplies hepatotoxic injury"],
      contraindications: ["Pre-existing acute hepatitis", "Pre-existing severe optic neuropathy"],
    },
    analgesics: {
      name: "Analgesics and Antipyretics",
      drugs: ["Paracetamol", "Ibuprofen", "Aspirin", "Tramadol", "Morphine"],
      indications: ["Pain", "Fever", "Inflammatory pain"],
      common_side_effects: ["Liver injury with excess paracetamol", "Gastritis and kidney injury with NSAIDs", "Sedation and dependence with opioids"],
      ethiopian_context: ["Paracetamol is widely available through public and private pharmacies; dose limits remain important even for over-the-counter products."],
      interactions: ["Avoid duplicate paracetamol-containing products", "NSAIDs increase bleeding risk with anticoagulants and kidney risk with ACE inhibitors"],
      contraindications: ["Severe liver disease for paracetamol", "Active peptic ulcer or severe kidney disease for NSAIDs"],
    },
    antifungals: {
      name: "Antifungal Medicines",
      drugs: ["Fluconazole", "Clotrimazole", "Nystatin", "Amphotericin B"],
      indications: ["Candidiasis", "Dermatophyte infection", "Invasive fungal infection"],
      common_side_effects: ["Nausea", "Liver enzyme elevation", "Kidney toxicity with amphotericin B"],
      ethiopian_context: ["Topical and oral antifungals are used in primary care; persistent or recurrent infection needs confirmation rather than repeated self-treatment."],
      interactions: ["Azole antifungals inhibit CYP enzymes and can raise levels of warfarin and some statins"],
      contraindications: ["Known severe azole hypersensitivity", "Specialist review required for amphotericin B"],
    },
    psychiatric_medicines: {
      name: "Psychiatric Medicines",
      drugs: ["Amitriptyline", "Fluoxetine", "Sertraline", "Haloperidol", "Diazepam"],
      indications: ["Depression", "Anxiety", "Psychosis", "Neuropathic pain"],
      common_side_effects: ["Sedation", "Dizziness", "Sexual dysfunction", "Extrapyramidal symptoms"],
      ethiopian_context: ["Access and continuity may vary outside referral hospitals; do not stop long-term psychiatric treatment abruptly."],
      interactions: ["Alcohol and sedatives increase respiratory depression", "Multiple QT-prolonging medicines increase arrhythmia risk"],
      contraindications: ["Unsupervised combination with monoamine oxidase inhibitors", "Abrupt withdrawal of benzodiazepines"],
    },
  };

  private drugDrugInteractions = [
    { drugs: ["rifampicin", "dolutegravir"], description: "Rifampicin lowers dolutegravir exposure; TB/HIV treatment must be coordinated by a practitioner.", severity: "high" as const },
    { drugs: ["warfarin", "metronidazole"], description: "Metronidazole can increase anticoagulant effect and bleeding risk.", severity: "high" as const },
    { drugs: ["ace inhibitor", "nsaid"], description: "The ACE inhibitor/NSAID combination can worsen kidney function, especially with dehydration or a diuretic.", severity: "high" as const },
    { drugs: ["tramadol", "sertraline"], description: "Combined serotonergic effects may cause serotonin toxicity and excess sedation.", severity: "moderate" as const },
  ];

  private certifiedHerbDrugInteractions: HerbDrugInteractionRule[] = [
    {
      herb: "Tena Adam",
      scientificName: "Ruta chalepensis",
      drug: "Warfarin / Aspirin",
      targetDrugClass: "Anticoagulants / Antiplatelets",
      interaction: "Additive platelet aggregation inhibition and CYP3A4 suppression markedly elevate bleeding and hemorrhage risk",
      severity: "critical",
      mechanism: "Furanocoumarins and rutin exert potent antithrombotic effects while inhibiting drug clearance pathways",
      ethiopian_context: "Tena Adam is frequently added to coffee or morning tea, creating widespread hidden interaction risks with blood thinners",
      recommendation: "DO NOT combine Tena Adam with prescription anticoagulants or antiplatelet drugs. Discontinue herb immediately and consult your physician.",
    },
    {
      herb: "Kosso",
      scientificName: "Hagenia abyssinica",
      drug: "Warfarin / Anticoagulants",
      targetDrugClass: "Anticoagulants / Antiplatelets",
      interaction: "Severe mucosal gastrointestinal erosion combined with anticoagulant action precipitates acute upper GI bleeding",
      severity: "critical",
      mechanism: "Kosotoxin causes direct gastric mucosal damage and hepatic metabolic stress",
      ethiopian_context: "Traditional anthelmintic purging remedy; historically known for narrow therapeutic index and acute toxicity",
      recommendation: "ABSOLUTELY CONTRAINDICATED with anticoagulants, antiplatelets, or NSAIDs. Seek certified medical anthelmintics (Albendazole) instead.",
    },
    {
      herb: "Kosso",
      scientificName: "Hagenia abyssinica",
      drug: "Metformin",
      targetDrugClass: "Hypoglycemics",
      interaction: "Severe systemic acid-base disruption and compounded metabolic strain",
      severity: "critical",
      mechanism: "Kosotoxin-induced hepatic and gastrointestinal toxicity compounds biguanide metabolic burden, precipitating lactic acidosis risk",
      ethiopian_context: "Traditional tapeworm purge remedy that should never be used concurrently with metabolic medications",
      recommendation: "STRICTLY CONTRAINDICATED. Never consume Kosso while taking diabetic medications.",
    },
    {
      herb: "Tikur Azmud",
      scientificName: "Nigella sativa (Black Seed)",
      drug: "Metformin / Glibenclamide / Insulin",
      targetDrugClass: "Hypoglycemics",
      interaction: "Synergistic enhancement of pancreatic insulin sensitivity and secretion risking severe nocturnal hypoglycemia",
      severity: "high",
      mechanism: "Thymoquinone activates AMPK pathways and stimulates beta-cell insulin release additively with oral hypoglycemic agents",
      ethiopian_context: "Tikur Azmud oil or seeds are widely consumed as a panacea for immune and metabolic wellbeing",
      recommendation: "If consuming black seed preparations, close blood glucose self-monitoring is essential. Medication doses may require physician titration.",
    },
    {
      herb: "Damakesse",
      scientificName: "Ocimum lamiifolium",
      drug: "Enalapril / Amlodipine / Hydrochlorothiazide",
      targetDrugClass: "Antihypertensives",
      interaction: "Synergistic systemic vasodilation causing acute orthostatic hypotension, syncope, and dizziness",
      severity: "moderate",
      mechanism: "Volatile monoterpenes and flavonoids promote nitric oxide-mediated vascular smooth muscle relaxation",
      ethiopian_context: "Ubiquitous traditional remedy for fever, common cold, and headache consumed as hot steam inhalation or tea",
      recommendation: "Monitor blood pressure when using Damakesse tea; avoid sudden standing from seated or recumbent positions.",
    },
    {
      herb: "Garlic (Nech Shinkurt)",
      scientificName: "Allium sativum",
      drug: "Warfarin / Aspirin",
      targetDrugClass: "Anticoagulants / Antiplatelets",
      interaction: "Inhibition of cyclooxygenase and platelet thromboxane A2 synthesis increases bleeding time and bruising",
      severity: "high",
      mechanism: "Allicin and ajoene inhibit platelet aggregation synergistically with anticoagulants",
      ethiopian_context: "Raw garlic crushed in honey is commonly taken for respiratory infections and cardiovascular protection",
      recommendation: "Avoid medicinal or concentrated garlic extracts while on blood thinners. Normal culinary use in cooked dishes is acceptable.",
    },
  ];

  private drugNutrientInteractions = [
    {
      drug: "Antimalarials (Artemisinins)",
      nutrient: "High-Dose Supplemental Iron",
      interaction: "Excess unbound circulating iron can feed Plasmodium replication and exacerbate oxidative stress during acute malarial parasitemia",
      severity: "high",
      recommendation: "Withhold high-dose therapeutic iron supplements until malaria treatment is completed and blood smears are cleared.",
      ethiopian_context: "Common overlap in malaria-endemic lowland regions where childhood iron deficiency anemia is simultaneously prevalent.",
    },
    {
      drug: "Antibiotics (Tetracyclines, Ciprofloxacin)",
      nutrient: "Calcium & Dairy (Ayib, Ergo)",
      interaction: "Polyvalent calcium ions form insoluble chelates with antibiotic molecules, reducing oral bioavailability by up to 60-80%",
      severity: "high",
      recommendation: "Separate dairy, Ayib, calcium supplements, or antacids by at least 2 hours before or 4 hours after taking these antibiotics.",
      ethiopian_context: "High dairy intake in pastoralist and highland zones can lead to unrecognized antibiotic treatment failure.",
    },
    {
      drug: "Metformin",
      nutrient: "Vitamin B12 (Cobalamin)",
      interaction: "Long-term metformin therapy interferes with calcium-dependent membrane action in the terminal ileum, decreasing Vitamin B12 absorption",
      severity: "moderate",
      recommendation: "Screen serum B12 annually for patients on chronic metformin, especially during Ethiopian religious fasting periods.",
      ethiopian_context: "Orthodox fasting already limits animal source B12; combining with metformin accelerates neuropathic deficiency symptoms.",
    },
    {
      drug: "ACE Inhibitors (Enalapril, Lisinopril)",
      nutrient: "Potassium (K+)",
      interaction: "Aldosterone suppression reduces renal potassium excretion, risking life-threatening hyperkalemia if paired with potassium supplements",
      severity: "high",
      recommendation: "Avoid potassium salt substitutes and high-dose potassium supplements without frequent electrolyte lab checks.",
      ethiopian_context: "Commonly used in cardiovascular care in urban centers.",
    },
  ];

  private adverseReactions = [
    {
      reaction: "Hepatotoxicity",
      drugs: ["Isoniazid", "Rifampin", "Pyrazinamide", "Paracetamol", "Fluconazole"],
      symptoms: ["jaundice", "dark urine", "nausea", "abdominal pain", "fatigue"],
      recommendation: "Seek urgent scientific review for jaundice, dark urine, severe nausea, or abdominal pain while taking these medicines.",
    },
    {
      reaction: "Nephrotoxicity",
      drugs: ["Tenofovir", "Aminoglycosides", "Amphotericin B", "NSAIDs"],
      symptoms: ["reduced urine", "oedema", "swelling", "elevated creatinine"],
      recommendation: "Report reduced urine, swelling, or dehydration promptly and ask about kidney-function monitoring.",
    },
    {
      reaction: "Hypoglycaemia",
      drugs: ["Glibenclamide", "Insulin"],
      symptoms: ["sweating", "tremor", "confusion", "headache", "fainting"],
      recommendation: "Fasting or irregular meals can increase risk; follow the prescribed glucose plan and seek urgent care for severe symptoms.",
    },
  ];

  private normalizeQuery(query: string) {
    return query.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
  }

  private hasAlias(normalized: string, alias: string) {
    return this.queryAliases[alias]?.some((term) => normalized.includes(term)) ?? false;
  }

  private userMedications(userProfile: UserProfile) {
    return [...(userProfile.medications || []), ...(userProfile.wellbeing?.medications || [])].map(String);
  }

  // Database-backed herb-drug interaction rules take precedence over the static
  // offline list above when reachable (spec: DB evidence is authoritative when
  // available; the static list remains a fallback for offline/DB-unavailable use).
  private static dbRuleCache: { rules: HerbDrugInteractionRule[] | null; fetchedAt: number } | null = null;
  private static readonly DB_RULE_CACHE_TTL_MS = 10 * 60 * 1000;
  private static readonly DB_RULE_FAILURE_CACHE_TTL_MS = 60 * 1000;
  private static readonly DB_QUERY_TIMEOUT_MS = 1200;

  private async getHerbDrugRules(): Promise<HerbDrugInteractionRule[]> {
    const cached = MedicationKnowledgeStrand.dbRuleCache;
    const ttl = cached?.rules ? MedicationKnowledgeStrand.DB_RULE_CACHE_TTL_MS : MedicationKnowledgeStrand.DB_RULE_FAILURE_CACHE_TTL_MS;
    if (cached && Date.now() - cached.fetchedAt < ttl) {
      return cached.rules || this.certifiedHerbDrugInteractions;
    }
    try {
      const rows = await Promise.race([
        db
          .select({
            nameVernacular: herbsTable.nameVernacular,
            nameScientific: herbsTable.nameScientific,
            drugClass: herbDrugInteractionsTable.drugClass,
            drugNameExample: herbDrugInteractionsTable.drugNameExample,
            interactionSeverity: herbDrugInteractionsTable.interactionSeverity,
            mechanism: herbDrugInteractionsTable.mechanism,
            physiologicalEffect: herbDrugInteractionsTable.physiologicalEffect,
            ethiopianContext: herbDrugInteractionsTable.ethiopianContext,
            recommendation: herbDrugInteractionsTable.recommendation,
          })
          .from(herbDrugInteractionsTable)
          .innerJoin(herbsTable, eq(herbDrugInteractionsTable.herbId, herbsTable.id)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("herb-drug DB lookup timed out")), MedicationKnowledgeStrand.DB_QUERY_TIMEOUT_MS),
        ),
      ]);

      if (!rows.length) throw new Error("No herb-drug interaction rows in database");

      const validSeverities = new Set(["critical", "high", "moderate", "low"]);
      const rules: HerbDrugInteractionRule[] = rows.map((row) => ({
        herb: row.nameVernacular,
        scientificName: row.nameScientific,
        drug: row.drugNameExample || row.drugClass,
        targetDrugClass: row.drugClass,
        interaction: row.physiologicalEffect,
        severity: validSeverities.has(row.interactionSeverity) ? (row.interactionSeverity as HerbDrugInteractionRule["severity"]) : "moderate",
        mechanism: row.mechanism,
        ethiopian_context: row.ethiopianContext || "",
        recommendation: row.recommendation || `Consult a practitioner or pharmacist before combining ${row.nameVernacular} with ${row.drugClass}.`,
      }));

      MedicationKnowledgeStrand.dbRuleCache = { rules, fetchedAt: Date.now() };
      return rules;
    } catch {
      // Database unavailable, unseeded, or slow; use the offline safety list and
      // cache the miss briefly so a slow/unreachable DB doesn't cost every call.
      MedicationKnowledgeStrand.dbRuleCache = { rules: null, fetchedAt: Date.now() };
      return this.certifiedHerbDrugInteractions;
    }
  }

  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const userMeds = this.userMedications(userProfile);
    const userHerbs = (userProfile.herbUsage || []).map(String);
    const fasting = this.hasAlias(normalized, "fasting") || Boolean(userProfile.cultural?.fasting || userProfile.lifestyle?.fasting);

    // 1. Search Drug Database
    for (const [key, data] of Object.entries(this.drugDatabase)) {
      let score = 0;
      const matches: string[] = [];

      if (data.name.toLowerCase().includes(normalized) || normalized.includes(key.replace(/_/g, " "))) {
        score += 35;
        matches.push("drug_category_match");
      }
      if (this.hasAlias(normalized, key)) {
        score += 25;
        matches.push(`alias_${key}`);
      }

      for (const term of terms) {
        if (data.drugs.some((d) => d.toLowerCase().includes(term))) {
          score += 25;
          matches.push(`drug_${term}`);
        }
        if (data.indications.some((ind) => ind.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`indication_${term}`);
        }
        if (data.common_side_effects.some((se) => se.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`side_effect_${term}`);
        }
      }

      // Match against user medications
      if (userMeds.length) {
        for (const userMed of userMeds) {
          if (data.drugs.some((d) => d.toLowerCase().includes(userMed.toLowerCase()) || userMed.toLowerCase().includes(d.toLowerCase()))) {
            score += 40;
            matches.push(`active_user_medication_${userMed}`);
          }
        }
      }

      if (score > 15) {
        results.push({
          type: "medication_class",
          strand: this.strandName,
          domain: "wellbeing",
          name: data.name.toUpperCase(),
          description: `Formulations: ${data.drugs.join(", ")}. Primary indications: ${data.indications.join("; ")}.`,
          evidence: `Recognized side effects: ${data.common_side_effects.join("; ")}. Known interactions: ${data.interactions.join("; ")}.`,
          ethiopian_context: data.ethiopian_context,
          relevanceScore: Math.min(score / 55, 0.98),
          confidence: 0.95,
          matches,
          recommendations: [
            "Take medications strictly as directed by your prescribing healthcare provider",
            "Report any adverse symptoms or sudden side effects promptly to a scientific pharmacist or physician",
          ],
          management: data.interactions,
          sources: ["Ethiopian Food and Drug Authority (EFDA) Essential Medicines List", "WHO Model Formulary"],
          details: { fasting, userMedications: userMeds },
        });
      }
    }

    for (const profile of this.essentialMedicineProfiles) {
      const profileTerms = [profile.name, profile.brand || "", profile.className, ...profile.indications]
        .map((value) => value.toLowerCase());
      const medicationMatch = userMeds.some((medication) => profileTerms.some((term) => term.includes(medication.toLowerCase()) || medication.toLowerCase().includes(term)));
      const queryMatch = profileTerms.some((term) => terms.some((termPart) => term.includes(termPart))) ||
        normalized.includes(profile.name.toLowerCase());
      if (!medicationMatch && !queryMatch) continue;

      results.push({
        type: "essential_medicine_profile",
        strand: this.strandName,
        domain: "wellbeing",
        name: profile.name.toUpperCase(),
        description: `${profile.className}: ${profile.indications.join("; ")}. Mechanism: ${profile.mechanism}`,
        evidence: `Common effects: ${profile.commonSideEffects.join("; ")}. Serious warning signals: ${profile.seriousSideEffects.join("; ")}.`,
        ethiopian_context: [profile.availability, profile.costContext, profile.resistanceContext].filter(Boolean) as string[],
        relevanceScore: medicationMatch ? 0.98 : 0.82,
        confidence: 0.9,
        matches: [medicationMatch ? "active_user_medication" : "medicine_query"],
        recommendations: profile.safetyNotes,
        management: profile.interactions,
        sources: ["Ethiopian Essential Medicines List", "WHO Model List of Essential Medicines"],
        category: "Domain A",
        severity: profile.seriousSideEffects.length > 2 ? "high" : "moderate",
        safetyAlerts: profile.safetyNotes,
        risk_assessment: {
          level: profile.seriousSideEffects.length > 2 ? "high" : "moderate",
          risk_factors: profile.contraindications,
          recommendations: profile.safetyNotes,
        },
        details: {
          brand: profile.brand,
          pregnancyCategory: profile.pregnancyCategory,
          lactation: profile.lactation,
          interactions: profile.interactions,
        },
      });
    }

    for (const context of this.pharmacokineticContext) {
      if (!context.terms.some((term) => normalized.includes(term))) continue;
      results.push({
        type: "pharmacokinetic_safety",
        strand: this.strandName,
        domain: "wellbeing",
        name: context.title,
        description: context.description,
        evidence: "Medication exposure is affected by patient-specific physiology and interacting substances.",
        relevanceScore: 0.78,
        confidence: 0.9,
        matches: ["pharmacokinetic_context"],
        recommendations: [context.recommendation],
        safetyAlerts: [context.recommendation],
        sources: ["WHO medication safety guidance", "clinical pharmacology principles"],
      });
    }

    for (const guidance of this.antimicrobialResistanceGuidance) {
      if (!guidance.terms.some((term) => normalized.includes(term))) continue;
      results.push({
        type: "antimicrobial_resistance_guidance",
        strand: this.strandName,
        domain: "wellbeing",
        name: guidance.title,
        description: guidance.advice,
        evidence: "Inappropriate antimicrobial exposure increases the risk of treatment failure and resistance.",
        ethiopian_context: "Resistance patterns and medicine availability vary by region; local testing and treatment guidance should be followed.",
        relevanceScore: 0.84,
        confidence: 0.93,
        matches: ["amr_context"],
        recommendations: [guidance.advice],
        prevention: [guidance.advice],
        sources: ["Ethiopian national treatment guidance", "WHO antimicrobial-resistance guidance"],
      });
    }

    // 2. Check Herb-Drug Interactions (database-backed when reachable, offline list otherwise)
    // Also scan query text for mentioned herbs and drugs
    const herbDrugRules = await this.getHerbDrugRules();
    for (const rule of herbDrugRules) {
      let matched = false;
      // rule.drug lists one or more specific drug names (e.g. "Warfarin / Aspirin");
      // match against each individually rather than the whole joined string.
      const ruleDrugNames = rule.drug.split("/").map((d) => d.trim().toLowerCase()).filter(Boolean);
      const herbInQuery = normalized.includes(rule.herb.toLowerCase()) || normalized.includes(rule.scientificName.toLowerCase());
      const drugInQuery = ruleDrugNames.some((d) => normalized.includes(d)) || normalized.includes(rule.targetDrugClass.toLowerCase());
      const herbInProfile = userHerbs.some((h) => h.toLowerCase().includes(rule.herb.toLowerCase()) || rule.herb.toLowerCase().includes(h.toLowerCase()));
      const drugInProfile = userMeds.some((m) => ruleDrugNames.some((d) => d.includes(m.toLowerCase()) || m.toLowerCase().includes(d)));

      if ((herbInQuery && drugInQuery) || (herbInProfile && drugInProfile) || (herbInProfile && drugInQuery) || (herbInQuery && drugInProfile)) {
        matched = true;
      } else if (herbInQuery || herbInProfile) {
        // Provide awareness even if drug is not currently listed
        results.push({
          type: "herb_drug_safety_advisory",
          strand: this.strandName,
          domain: "wellbeing",
          name: `SAFETY ALERT: ${rule.herb.toUpperCase()} × ${rule.targetDrugClass.toUpperCase()}`,
          description: rule.interaction,
          evidence: `Pharmacological mechanism: ${rule.mechanism}`,
          ethiopian_context: rule.ethiopian_context,
          relevanceScore: 0.85,
          confidence: 0.96,
          severity: rule.severity,
          matches: ["herb_usage_flagged"],
          recommendations: [rule.recommendation],
          sources: ["ETM-DB Safety Matrix", "Fullas, F. 'Interactions of Ethiopian Herbal Medicines'"],
        });
      }

      if (matched) {
        results.unshift({
          type: "herb_drug_interaction_critical",
          strand: this.strandName,
          domain: "wellbeing",
          name: `CRITICAL INTERCEPT: ${rule.herb.toUpperCase()} + ${rule.drug.toUpperCase()}`,
          description: rule.interaction,
          evidence: `Mechanism: ${rule.mechanism}. Severity rating: ${rule.severity.toUpperCase()}.`,
          ethiopian_context: rule.ethiopian_context,
          relevanceScore: 1.0,
          confidence: 0.99,
          severity: rule.severity,
          matches: ["active_herb_drug_conflict"],
          recommendations: [rule.recommendation],
          management: [rule.recommendation],
          sources: ["ETM-DB scientific Safety Gate", "Ethiopian Ministry of health Pharmacovigilance"],
        });
      }
    }

    // 3. Check Drug-Nutrient Interactions
    for (const dni of this.drugNutrientInteractions) {
      const drugMatched = userMeds.some((m) => dni.drug.toLowerCase().includes(m.toLowerCase())) || normalized.includes(dni.drug.toLowerCase().split(" ")[0]);
      const nutrientMatched = normalized.includes(dni.nutrient.toLowerCase().split(" ")[0]);

      if (drugMatched || (drugMatched && nutrientMatched)) {
        results.push({
          type: "drug_nutrient_interaction",
          strand: this.strandName,
          domain: "wellbeing",
          name: `NUTRIENT TIMING: ${dni.drug.toUpperCase()} & ${dni.nutrient.toUpperCase()}`,
          description: dni.interaction,
          evidence: `Severity: ${dni.severity.toUpperCase()}.`,
          ethiopian_context: dni.ethiopian_context,
          relevanceScore: drugMatched && nutrientMatched ? 0.95 : 0.82,
          confidence: 0.92,
          recommendations: [dni.recommendation],
          management: [dni.recommendation],
          sources: ["scientific Pharmacokinetics - Drug Nutrient Timing Protocols"],
        });
      }
    }

    for (const reaction of this.adverseReactions) {
      const drugMatch = reaction.drugs.some((drug) => userMeds.some((medication) => medication.toLowerCase().includes(drug.toLowerCase())) || normalized.includes(drug.toLowerCase()));
      const symptomMatch = reaction.symptoms.some((symptom) => normalized.includes(symptom));
      if (!drugMatch || !symptomMatch) continue;
      results.unshift({
        type: "adverse_drug_reaction",
        strand: this.strandName,
        domain: "wellbeing",
        name: `ADVERSE REACTION: ${reaction.reaction.toUpperCase()}`,
        description: `Possible ${reaction.reaction.toLowerCase()} context associated with the reported medicine and symptom pattern.`,
        evidence: `Relevant medicines: ${reaction.drugs.join(", ")}. Reported signals: ${reaction.symptoms.join(", ")}.`,
        relevanceScore: 1,
        confidence: 0.88,
        severity: "high",
        safetyAlerts: [reaction.recommendation],
        recommendations: [reaction.recommendation],
        sources: ["Medication safety monitoring guidance"],
      });
    }

    for (const interaction of this.drugDrugInteractions) {
      const interactionMatch = interaction.drugs.every((term) => normalized.includes(term) || userMeds.some((medication) => medication.toLowerCase().includes(term)));
      if (!interactionMatch) continue;
      results.unshift({
        type: "drug_drug_interaction",
        strand: this.strandName,
        domain: "wellbeing",
        name: `DRUG INTERACTION: ${interaction.drugs.join(" + ").toUpperCase()}`,
        description: interaction.description,
        relevanceScore: 0.99,
        confidence: 0.93,
        severity: interaction.severity,
        safetyAlerts: ["Do not start, stop, or adjust either medicine without a prescriber or pharmacist review."],
        recommendations: [interaction.description],
        sources: ["Ethiopian national treatment guidance", "WHO Model Formulary"],
      });
    }

    if (fasting && (userMeds.length > 0 || /medication|medicine|drug/.test(normalized))) {
      results.push({
        type: "fasting_medication_safety",
        strand: this.strandName,
        domain: "wellbeing",
        name: "MEDICATION SAFETY DURING FASTING",
        description: "Fasting changes meal timing, hydration, and glucose risk; the safest schedule depends on the medicine and the person.",
        relevanceScore: 0.9,
        confidence: 0.95,
        severity: "high",
        recommendations: this.getFastingMedicationAdvice(userMeds),
        sources: ["Medication fasting safety guidance"],
      });
    }

    if ((userProfile.pregnant || userProfile.wellbeing?.pregnant || this.hasAlias(normalized, "pregnancy"))) {
      results.push({
        type: "pregnancy_lactation_safety",
        strand: this.strandName,
        domain: "wellbeing",
        name: "PREGNANCY AND LACTATION MEDICATION REVIEW",
        description: "Pregnancy and breastfeeding change medication risk and require an individualized medicine reconciliation.",
        relevanceScore: 0.92,
        confidence: 0.98,
        severity: "high",
        safetyAlerts: ["Do not begin, stop, or substitute a medicine or herbal product during pregnancy or lactation without practitioner/pharmacist review."],
        recommendations: ["Provide the full medicine, supplement, and herb list to antenatal or pharmacy staff.", "Seek urgent care for bleeding, severe vomiting, breathing difficulty, or reduced fetal movement."],
        sources: ["EFDA essential medicines guidance", "WHO pregnancy medication safety guidance"],
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  getCertifiedInteractions(): HerbDrugInteractionRule[] {
    return this.certifiedHerbDrugInteractions;
  }

  getEssentialMedicineProfile(name: string): EssentialMedicineProfile | null {
    const normalized = this.normalizeQuery(name);
    return this.essentialMedicineProfiles.find((profile) =>
      [profile.name, profile.brand || "", profile.className].some((value) => this.normalizeQuery(value).includes(normalized) || normalized.includes(this.normalizeQuery(value))),
    ) ?? null;
  }

  getAntimicrobialResistanceAdvice(query: string): string[] {
    const normalized = this.normalizeQuery(query);
    return this.antimicrobialResistanceGuidance
      .map((guidance) => ({ guidance, matchCount: guidance.terms.filter((term) => normalized.includes(term)).length }))
      .filter(({ matchCount }) => matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .map(({ guidance }) => guidance.advice);
  }

  getPregnancyLactationSafety(name: string): { pregnancy: string; lactation: string } | null {
    const profile = this.getEssentialMedicineProfile(name);
    return profile ? { pregnancy: profile.pregnancyCategory, lactation: profile.lactation } : null;
  }

  getMedicationAvailability(query: string): Array<{ medication: string; context: string }> {
    const normalized = this.normalizeQuery(query);
    return Object.values(this.drugDatabase)
      .filter((group) => group.drugs.some((drug) => normalized.includes(drug.toLowerCase().split(" ")[0])))
      .map((group) => ({ medication: group.name, context: group.ethiopian_context.join(" ") }));
  }

  getFastingMedicationAdvice(medications: string[]): string[] {
    const normalized = medications.map((medication) => medication.toLowerCase()).join(" ");
    const advice = ["Do not change, skip, or double a prescribed medicine without the prescribing practitioner."];
    if (/insulin|glibenclamide|gliclazide/.test(normalized)) advice.push("Fasting can cause hypoglycaemia; arrange an individualized glucose and dose plan before fasting.");
    if (normalized.includes("metformin")) advice.push("Discuss meal timing, kidney function, and B12 monitoring during prolonged fasting.");
    if (/rifampin|isoniazid|pyrazinamide/.test(normalized)) advice.push("Continue TB treatment exactly as prescribed and ask about food timing and pyridoxine.");
    return advice;
  }
}
