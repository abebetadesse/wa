import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile, DomainType } from "../types";

type TextMap = Record<string, unknown>;

interface EpidemiologyRecord {
  disease: string;
  pathogens?: string[];
  pathogen?: string;
  endemic_regions?: string[];
  seasonal_dynamics?: string[] | string;
  transmission?: string;
  incidence_mortality?: {
    annual_cases?: string;
    annual_deaths?: string;
    trend?: string;
  };
  incidence_prevalence?: TextMap;
  high_risk_groups?: string[];
  risk_factors?: string[];
  physiological_hallmarks?: string[] | TextMap;
  prevention_protocols?: string[];
  first_line_standard_treatment?: string | TextMap;
  emergency_treatment?: string;
  ethiopian_context?: string;
  ecological_links?: string[];
  definition?: string;
  prevalence?: string;
  complications?: string[];
  etiology?: string;
  causes?: string[] | TextMap;
  rate?: string;
  ratio?: string;
  main_causes?: string[];
}

function textList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (value && typeof value === "object") {
    return Object.values(value as TextMap).filter((item): item is string => typeof item === "string");
  }
  return [];
}

function treatmentText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return undefined;
  return Object.entries(value as TextMap)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .join("; ");
}

/**
 * Enhanced Epidemiological Knowledge Strand
 *
 * Integrates:
 * - Communicable diseases: Malaria, Tuberculosis, HIV/AIDS, Diarrhoeal diseases, Hepatitis, Meningitis, COVID-19, Leishmaniasis, Schistosomiasis
 * - Non-communicable diseases: Hypertension, Diabetes, Cardiovascular disease, Cancers (cervical, breast, liver), Mental wellbeing disorders
 * - Nutritional deficiencies: Anaemia, Vitamin A deficiency, Iodine deficiency, Stunting, Wasting
 * - Injuries & accidents: Road traffic accidents, Falls, Burns
 * - Maternal & child wellbeing: Maternal mortality, Neonatal mortality, Preterm birth
 * - Detailed epidemiological data: Incidence, prevalence, mortality, DALYs
 * - Seasonal & regional patterns
 * - High‑risk groups & scientific hallmarks
 * - Prevention & control protocols
 * - First‑line treatment & management
 * - Ethiopian Ministry of health priorities & targets
 * - Cross‑strand linking (Ecological, Dietary, Medication, Socioeconomic)
 * - Domain A (scientific) with severity and risk assessment
 * - Evidence‑weighted confidence scoring
 * - User‑specific region/age/condition matching
 */
export class EpidemiologicalKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "epidemiological";
  readonly domain: DomainType = "wellbeing";

  // --- Alias registry for query expansion ---
  private queryAliases: Record<string, string[]> = {
    malaria: ["malaria", "plasmodium", "fever", "chills", "anopheles", "mosquito", "parasite", "coartem"],
    tuberculosis: ["tb", "tuberculosis", "cough", "hemoptysis", "night sweats", "weight loss", "bcg", "dots"],
    hiv: ["hiv", "aids", "retrovirus", "antiretroviral", "cd4", "p24"],
    diarrhoea: ["diarrhoea", "diarrhea", "cholera", "rotavirus", "shigella", "e coli", "vomiting", "dehydration"],
    hepatitis: ["hepatitis", "jaundice", "liver", "a", "b", "c", "cirrhosis"],
    meningitis: ["meningitis", "nuchal rigidity", "fever", "headache", "petechiae", "neisseria"],
    covid: ["covid", "sars", "coronavirus", "pandemic", "vaccine", "oximetry"],
    leishmaniasis: ["leishmaniasis", "kala-azar", "sandfly", "visceral", "cutaneous"],
    schistosomiasis: ["schistosomiasis", "bilharzia", "snail", "hematuria", "endod"],
    hypertension: ["hypertension", "high blood pressure", "bp", "stroke", "cardiovascular", "heart"],
    diabetes: ["diabetes", "hyperglycaemia", "insulin", "sugar", "metformin"],
    cancer: ["cancer", "tumour", "malignancy", "cervical", "breast", "liver", "prostate"],
    mental_wellbeing: ["mental", "depression", "anxiety", "psychosis", "ptsd", "suicide"],
    anemia: ["anaemia", "anemia", "hemoglobin", "iron", "pale", "fatigue"],
    stunting: ["stunting", "malnutrition", "wasting", "underweight", "growth"],
    maternal: ["maternal", "pregnancy", "eclampsia", "haemorrhage", "postpartum"],
    road_traffic: ["road", "traffic", "accident", "crash", "injury", "driving"],
  };

  // -------------------------------------------------------------------------
  // COMMUNICABLE DISEASES (expanded)
  // -------------------------------------------------------------------------
  private communicableDiseases = {
    malaria: {
      disease: "Malaria (ወባ / Plasmodium Infection)",
      pathogens: [
        "Plasmodium falciparum (60-70% of cases; carries life‑threatening cerebral and haemolytic risks)",
        "Plasmodium vivax (30-40% of cases; hypnozoite liver relapse potential)",
        "Plasmodium ovale and malariae (rare, but present)"
      ],
      endemic_regions: [
        "Lowlands below 2,000m: Gambella, Benishangul-Gumuz, Afar, Somali",
        "River valleys in Amhara and Oromia",
        "Southern Nations (SNNPR) lowland areas",
        "Highland fringe (seasonal transmission, increasing due to climate change)"
      ],
      seasonal_dynamics: [
        "Major epidemic transmission wave follows Kiremt rains (September – December)",
        "Minor wave post‑Belg (April – June)",
        "In lowlands: perennial transmission with seasonal peaks"
      ],
      incidence_mortality: {
        annual_cases: "Estimated 1–2 million scientific cases per year",
        annual_deaths: "Approximately 5,000–10,000 deaths (mostly children <5)",
        trend: "Decreasing but still a major public health challenge"
      },
      high_risk_groups: [
        "Children under 5 years",
        "Pregnant women (placental parasitemia, severe maternal anaemia, low birth weight)",
        "Highland residents visiting lowland areas lacking semi‑immunity",
        "Refugees and internally displaced persons (IDPs)"
      ],
      physiological_hallmarks: [
        "Paroxysmal high fever, rigors, and profuse diaphoresis",
        "Severe throbbing frontal headache",
        "Splenomegaly",
        "Haemolytic jaundice and dark urine ('blackwater') in complicated cases",
        "Cerebral malaria: altered consciousness, seizures, coma"
      ],
      prevention_protocols: [
        "Long‑Lasting Insecticidal Nets (LLINs) – universal coverage target",
        "Indoor Residual Spraying (IRS) in high‑transmission areas",
        "Eliminating peri‑domestic stagnant water",
        "Intermittent Preventive Treatment in pregnancy (IPTp) with sulfadoxine‑pyrimethamine",
        "Seasonal Malaria Chemoprevention (SMC) for children in highly seasonal areas"
      ],
      first_line_standard_treatment: "Artemether‑Lumefantrine (Coartem) for confirmed uncomplicated P. falciparum; Chloroquine + 14‑day Primaquine for P. vivax (if G6PD normal)",
      emergency_treatment: "IV Artesunate or Quinine for severe malaria, with supportive care",
      ethiopian_context: "Malaria is a major priority in the wellbeing Sector Transformation Plan; drug resistance and climate change are emerging challenges",
      ecological_links: ["Flooding after Kiremt increases breeding sites", "Land use (irrigation) expands mosquito habitats"],
    },
    tuberculosis: {
      disease: "Tuberculosis (ቲቢ / Mycobacterium tuberculosis & bovis)",
      pathogens: ["Mycobacterium tuberculosis (human TB)", "Mycobacterium bovis (zoonotic TB via unpasteurised dairy)"],
      endemic_regions: [
        "Dense urban settlements (Addis Ababa, Adama, Bahir Dar, Mekelle)",
        "Peri‑urban zones with overcrowding",
        "Pastoralist communities with livestock contact",
        "Prisons and military barracks"
      ],
      transmission: "Airborne droplet nuclei from active pulmonary cases; also zoonotic transmission via unpasteurised dairy consumption (M. bovis)",
      incidence_mortality: {
        annual_cases: "Estimated 150,000–200,000 new cases annually",
        annual_deaths: "Approximately 20,000–30,000 deaths",
        trend: "Slowly declining but MDR‑TB is emerging (5-10% of new cases in some regions)"
      },
      high_risk_groups: [
        "HIV‑seropositive individuals (exponentially higher reactivation risk)",
        "Diabetic patients",
        "Undernourished individuals (BMI < 18.5)",
        "Household contacts of active smear‑positive cases",
        "Children <5 years (progressive primary TB)",
        "health workers"
      ],
      physiological_hallmarks: [
        "Persistent cough productive of sputum lasting > 2 weeks",
        "Haemoptysis (coughing blood)",
        "Nocturnal drenching diaphoresis",
        "Unexplained progressive weight loss",
        "Low‑grade evening fever",
        "Cervical lymphadenopathy ('Kintir / Scrophula')",
        "Pleuritic chest pain in pleural TB"
      ],
      prevention_protocols: [
        "Neonatal BCG vaccination (coverage ~85%)",
        "Active contact tracing and symptom screening",
        "Well‑ventilated household living quarters",
        "Boiling raw milk to eradicate M. bovis",
        "Isoniazid Preventive Therapy (IPT) for HIV‑positive contacts",
        "Infection control in health facilities"
      ],
      first_line_standard_treatment: "Directly Observed Treatment Short‑Course (DOTS): 2 months Rifampicin + Isoniazid + Pyrazinamide + Ethambutol, followed by 4 months Rifampicin + Isoniazid",
      second_line_therapy: "For MDR‑TB: bedaquiline, linezolid, levofloxacin, etc. under expert supervision",
      ethiopian_context: "TB is the leading cause of death in HIV‑positive individuals; MDR‑TB is increasing, requiring strengthened diagnostic capacity",
      ecological_links: ["Malnutrition and overcrowding are social determinants", "Seasonal: crowding in rainy season increases transmission"],
    },
    hiv_aids: {
      disease: "HIV/AIDS (ኤችአይቪ / Human Immunodeficiency Virus)",
      transmission: "Sexual contact, mother‑to‑child, blood exposure, intravenous drug use",
      endemic_regions: [
        "Urban areas (Addis Ababa, Awasa, Jimma)",
        "Transport corridors (along highways)",
        "Sugar plantations and other labour‑intensive agricultural zones"
      ],
      incidence_prevalence: {
        adult_prevalence: "~1.2-1.5% (ranges from 0.5% in some regions to >5% in high‑risk urban areas)",
        new_infections_annual: "~30,000",
        deaths_annual: "~15,000 (declining with ART expansion)"
      },
      high_risk_groups: [
        "Sex workers and their clients",
        "Long‑distance truck drivers",
        "Young women (15‑24 years) with older partners",
        "Fisherfolk along lakes (e.g., Lake Tana)",
        "HIV‑discordant couples",
        "Injection drug users (limited data)"
      ],
      physiological_hallmarks: [
        "Acute HIV seroconversion: fever, rash, lymphadenopathy (2‑6 weeks post‑exposure)",
        "Chronic phase: persistent generalized lymphadenopathy, weight loss, recurrent fevers",
        "AIDS‑defining illnesses: pulmonary TB, pneumocystis pneumonia (PCP), oesophageal candidiasis, cryptococcal meningitis, Kaposi's sarcoma, toxoplasmosis"
      ],
      prevention_protocols: [
        "Condom use (male and female condoms)",
        "Voluntary Medical Male Circumcision (VMMC)",
        "Pre‑exposure Prophylaxis (PrEP) for high‑risk individuals",
        "Post‑exposure Prophylaxis (PEP) for occupational exposures",
        "Prevention of Mother‑to‑Child Transmission (PMTCT) with antiretroviral therapy",
        "HIV testing and counselling (HTC) scale‑up"
      ],
      first_line_standard_treatment: "Antiretroviral Therapy (ART): TDF (Tenofovir) + 3TC (Lamivudine) + DTG (Dolutegravir) or EFV (Efavirenz) – universal test‑and‑treat strategy",
      ethiopian_context: "Ethiopia has made significant progress towards 95‑95‑95 targets; focus on reaching key populations and improving retention in care",
      ecological_links: ["Migration and mobility drive transmission along transport corridors", "Fishing communities have high prevalence"],
    },
    diarrhoeal_diseases: {
      disease: "Diarrhoeal Diseases (የተቅማጥ በሽታዎች)",
      pathogens: ["Vibrio cholerae (cholera)", "Escherichia coli (ETEC, EPEC)", "Shigella spp.", "Salmonella spp.", "Campylobacter jejuni", "Rotavirus", "Giardia intestinalis", "Cryptosporidium"],
      endemic_regions: ["Nationwide, with peaks during rainy seasons (Kiremt) and in flood‑prone areas (Awash, Somali, Gambella)"],
      transmission: "Faecal‑oral route; contaminated water and food, poor sanitation and hygiene",
      incidence_mortality: {
        annual_cases: "~5‑10 million episodes in under‑5s",
        under5_deaths: "Approximately 10,000‑15,000 deaths annually (major cause of child mortality)"
      },
      high_risk_groups: ["Children under 5", "Elderly", "Immunocompromised (HIV)", "Malnourished children", "IDPs and refugees"],
      physiological_hallmarks: [
        "Acute watery diarrhoea (cholera: rice‑water stools)",
        "Bloody diarrhoea (shigellosis)",
        "Vomiting and dehydration",
        "Abdominal cramps",
        "Fever"
      ],
      prevention_protocols: [
        "Safe drinking water (chlorination, boiling, filtration)",
        "Hand washing with soap",
        "Proper sanitation (latrines, sewage disposal)",
        "Rotavirus vaccination in children",
        "Food safety (thorough cooking, avoid raw foods)",
        "Oral cholera vaccine (OCV) in outbreak settings"
      ],
      first_line_standard_treatment: "Oral Rehydration Solution (ORS) + Zinc supplementation (for children); antibiotics for bloody diarrhoea or cholera (azithromycin, ciprofloxacin) based on sensitivity",
      ethiopian_context: "Diarrhoeal diseases are a major cause of outpatient visits and hospital admissions, especially during the rainy season and in refugee camps",
      ecological_links: ["Flooding and poor sanitation exacerbate transmission", "Seasonal peaks during Kiremt"],
    },
    viral_hepatitis: {
      disease: "Viral Hepatitis (ቫይራል ሄፓታይተስ)",
      types: ["Hepatitis A (faecal‑oral)", "Hepatitis B (blood‑borne, sexual, perinatal)", "Hepatitis C (blood‑borne, intravenous drug use)", "Hepatitis E (water‑borne, outbreaks)"],
      endemic_regions: ["Hepatitis B: high endemicity (8‑10% HBsAg positive)", "Hepatitis E: outbreaks in refugee camps and flood‑affected areas"],
      transmission_factors: {
        hepb: ["Perinatal transmission", "Unsafe injections", "Unprotected sex", "Needle sharing"],
        hepc: ["Blood transfusions (un‑screened)", "Injecting drug use", "healthcare exposure"],
        hepa_hepe: ["Contaminated food/water", "Poor sanitation"]
      },
      high_risk_groups: ["healthcare workers (HepB)", "Infants of HBsAg+ mothers", "Injection drug users (HepC)", "IDPs (HepE)"],
      physiological_hallmarks: ["Jaundice", "Dark urine", "Nausea/vomiting", "Abdominal pain", "Hepatomegaly", "Fever (acute)"],
      prevention_protocols: [
        "Hepatitis B vaccination (infant immunisation programme)",
        "Safe injection practices",
        "Blood screening for HBV and HCV",
        "Safe water and food hygiene (HepA/E)",
        "Harm reduction for injection drug users"
      ],
      first_line_standard_treatment: {
        hepb: "TDF or entecavir for chronic hepatitis B; pegylated interferon and entecavir for co‑infection with HIV",
        hepc: "Direct‑acting antivirals (DAAs) – sofosbuvir‑based regimens (curative for most genotypes)"
      },
      ethiopian_context: "Hepatitis B is endemic; vaccination coverage is increasing. Hepatitis C is less prevalent but still a concern. Hepatitis E outbreaks occur during floods.",
      ecological_links: ["Flooding and displacement increase Hepatitis E risk", "Sanitation infrastructure reduces HepA/E"],
    },
    meningitis: {
      disease: "Meningitis (ማንኛውም የማጠፊያ በሽታ)",
      pathogens: ["Neisseria meningitidis (meningococcus) – serogroups A, C, W, X, Y", "Streptococcus pneumoniae (pneumococcus)", "Haemophilus influenzae type b (Hib)", "Mycobacterium tuberculosis (TB meningitis)"],
      endemic_regions: ["High‑risk in the African meningitis belt (parts of Amhara, Tigray, Afar, Somali) during dry season"],
      seasonal_dynamics: "Outbreaks occur during dry, dusty months (Bega: November – April) due to aerosol transmission and crowding",
      high_risk_groups: ["Children under 5", "Adolescents and young adults", "Religious pilgrims", "IDPs in crowded camps"],
      physiological_hallmarks: [
        "Sudden high fever",
        "Severe headache",
        "Nuchal rigidity (stiff neck)",
        "Photophobia",
        "Petechial rash (meningococcal)",
        "Altered consciousness (confusion, coma)",
        "Brudzinski/Kernig signs (positive)"
      ],
      prevention_protocols: [
        "Vaccination: meningococcal conjugate vaccine (MenAfriVac), pneumococcal conjugate vaccine (PCV), Hib vaccine",
        "Prophylactic rifampicin for close contacts",
        "Avoid overcrowding and improve indoor ventilation",
        "Early warning and outbreak response"
      ],
      first_line_standard_treatment: "Empiric IV ceftriaxone + vancomycin + ampicillin; specific therapy based on CSF culture/sensitivity (penicillin/chloramphenicol for meningococcus)",
      ethiopian_context: "Meningitis outbreaks remain a threat; MenAfriVac campaigns have reduced serogroup A but other serogroups (C, W, X) are emerging.",
      ecological_links: ["Dry dusty winds facilitate transmission", "Crowding during dry season increases contact"],
    },
    covid_19: {
      disease: "COVID-19 (SARS-CoV-2 infection)",
      endemic_regions: ["Global pandemic; Ethiopia experienced waves with varying intensity"],
      transmission: "Respiratory droplets, aerosols, surface contamination",
      high_risk_groups: ["Elderly (>60 years)", "Hypertension, diabetes, obesity, chronic respiratory/cardiovascular disease", "Immunocompromised"],
      physiological_hallmarks: ["Fever", "Cough", "Shortness of breath", "Loss of taste/smell", "Fatigue", "Pneumonia, ARDS in severe cases"],
      prevention_protocols: [
        "Vaccination (multiple platforms: AstraZeneca, Sinopharm, Pfizer, Johnson & Johnson)",
        "Mask wearing, physical distancing, hand hygiene",
        "Testing, isolation, contact tracing",
        "Oxygen therapy for severe cases",
        "Dexamethasone and remdesivir for hospitalized patients"
      ],
      ethiopian_context: "Pandemic disrupted health services; vaccination coverage remains low in many areas.",
      ecological_links: ["Urban crowding and mobility patterns drove spread"],
    },
    visceral_leishmaniasis: {
      disease: "Visceral Leishmaniasis (Kala‑azar)",
      pathogen: "Leishmania donovani complex",
      vector: "Phlebotomus sandflies",
      endemic_regions: ["Lowland arid areas: Afar, Somali, Gambella, lower Omo valley"],
      transmission: "Sandfly bites, zoonotic (dogs, rodents)",
      high_risk_groups: ["Rural populations, agricultural workers", "Children", "Immunocompromised", "Malnourished"],
      physiological_hallmarks: ["Chronic fever (hectic, intermittent)", "Progressive weight loss", "Splenomegaly and hepatomegaly", "Pan Cytopenia (anaemia, leucopenia, thrombocytopenia)", "Hypergammaglobulinaemia"],
      prevention_protocols: ["Insect repellent, protective clothing", "Bed nets (sandflies are small; fine nets needed)", "Environmental management (reduce sandfly breeding sites)"],
      first_line_standard_treatment: "Liposomal amphotericin B (AmBisome) or pentavalent antimonials (sodium stibogluconate) – but resistance increasing",
      ethiopian_context: "Kala‑azar is a neglected tropical disease (NTD) affecting the poorest populations in the lowlands.",
      ecological_links: ["Arid ecosystems and pastoral livelihoods", "Deforestation may increase sandfly habitats"],
    },
  };

  // -------------------------------------------------------------------------
  // NON-COMMUNICABLE DISEASES (NCDs)
  // -------------------------------------------------------------------------
  private nonCommunicableDiseases = {
    hypertension: {
      disease: "Hypertension (የደም ግፊት / High Blood Pressure)",
      definition: "Persistent systolic BP ≥ 140 mmHg and/or diastolic ≥ 90 mmHg",
      prevalence: "Estimated 20‑30% of adults (increasing with urbanisation)",
      risk_factors: [
        "High dietary sodium (salt >5g/day)",
        "Physical inactivity",
        "Obesity",
        "Stress and mental wellbeing disorders",
        "Khat use (sympathomimetic effect)",
        "Family history",
        "Age > 35"
      ],
      regional_patterns: ["Highest in urban areas (Addis Ababa, Dire Dawa, Hawassa)", "Rising in rural areas with transition"],
      physiological_hallmarks: [
        "Often scientificly silent ('Silent Killer')",
        "Occipital early‑morning headaches",
        "Exertional dyspnoea",
        "Epistaxis",
        "Blurred vision",
        "Hypertensive retinopathy",
        "Left ventricular hypertrophy on ECG"
      ],
      complications: ["Stroke", "Ischaemic heart disease", "Heart failure", "Chronic kidney disease", "Peripheral vascular disease"],
      prevention_protocols: [
        "Reduce salt intake to <5g/day (DASH diet)",
        "Regular aerobic physical activity (≥150 minutes/week)",
        "Maintain healthy weight (BMI <25)",
        "Limit alcohol and tobacco",
        "Stress reduction (community support, relaxation)",
        "Screening in adults >30 years"
      ],
      first_line_standard_treatment: "Lifestyle modification + pharmacotherapy (ACE inhibitors, ARBs, CCBs, diuretics, beta‑blockers)",
      ethiopian_context: "Hypertension is the leading cardiovascular risk factor; awareness and control remain low.",
      ecological_links: ["Urbanisation and dietary changes drive prevalence", "Salt consumption is high in traditional cuisine"],
    },
    diabetes_mellitus: {
      disease: "Type 2 Diabetes Mellitus (የስኳር በሽታ)",
      definition: "Fasting blood glucose ≥ 126 mg/dL or HbA1c ≥ 6.5%",
      prevalence: "Estimated 5‑8% of adults (rapidly increasing)",
      risk_factors: [
        "Obesity (especially central adiposity)",
        "Sedentary lifestyle",
        "High intake of refined carbohydrates (white bread, sugar)",
        "Family history",
        "Gestational diabetes",
        "Polycystic ovary syndrome",
        "Age >40"
      ],
      regional_patterns: ["Urban higher than rural; alarming rise in young adults"],
      physiological_hallmarks: [
        "Polyuria (frequent urination, particularly nocturia)",
        "Polydipsia (unquenchable thirst)",
        "Polyphagia with paradoxical weight loss",
        "Non‑healing lower extremity wounds",
        "Peripheral neuropathic tingling or burning in feet",
        "Blurred vision",
        "Recurrent infections (urinary, skin)"
      ],
      complications: ["Retinopathy", "Nephropathy", "Neuropathy", "Cardiovascular disease", "Peripheral arterial disease"],
      prevention_protocols: [
        "Preserve traditional high‑fibre teff injera over refined wheat/flour",
        "Daily physical exertion (walking, farming, sports)",
        "Maintain healthy weight",
        "Early glycemic screening in high‑risk groups",
        "Limit sugar‑sweetened beverages"
      ],
      first_line_standard_treatment: "Structured medical nutrition therapy + Metformin (first‑line oral biguanide); add sulfonylureas, DPP‑4 inhibitors, SGLT‑2 inhibitors, or insulin as needed",
      ethiopian_context: "Diabetes is a growing burden; urbanisation and dietary transition are key drivers; complications lead to significant morbidity.",
      ecological_links: ["Dietary patterns shift with urbanisation", "Fasting periods (Tsome) may affect glycemic control"],
    },
    cardiovascular_disease: {
      disease: "Cardiovascular Disease (CVD) – Ischaemic Heart Disease & Stroke",
      definition: "Includes coronary artery disease, myocardial infarction, stroke, and peripheral vascular disease",
      prevalence: "CVD is the leading cause of death globally; rising in Ethiopia",
      risk_factors: ["Hypertension", "Diabetes", "Dyslipidemia", "Smoking", "Obesity", "Physical inactivity", "Unhealthy diet", "Stress"],
      physiological_hallmarks: [
        "Chest pain (angina / MI)", "Shortness of breath", "Palpitations",
        "Stroke: sudden weakness, speech difficulty, facial droop, confusion"
      ],
      prevention_protocols: [
        "Population‑level salt reduction",
        "Tobacco control",
        "healthy eating (Mediterranean/Ethiopian traditional diet)",
        "Physical activity promotion",
        "Screening and treatment of hypertension, diabetes, high cholesterol"
      ],
      first_line_standard_treatment: "Lifestyle modification, statins, antihypertensives, antiplatelets (aspirin), revascularisation for acute events",
      ethiopian_context: "CVD is increasing; many patients present late with severe complications.",
      ecological_links: ["Dietary changes and sedentarism due to urbanisation"],
    },
    cervical_cancer: {
      disease: "Cervical Cancer (የማህፀን በር ካንሰር)",
      etiology: "Human papillomavirus (HPV) – types 16 and 18",
      prevalence: "Cervical cancer is the second most common cancer among Ethiopian women",
      high_risk_groups: ["Women who have never been screened", "HIV‑positive women (higher risk)", "Women with early sexual debut, multiple partners"],
      physiological_hallmarks: ["Abnormal vaginal bleeding (post‑coital, intermenstrual, post‑menopausal)", "Pelvic pain", "Foul‑smelling discharge", "Advanced: weight loss, pelvic mass"],
      prevention_protocols: [
        "HPV vaccination for girls (9‑14 years)",
        "Cervical cancer screening (VIA/VILI or HPV DNA test)",
        "Treatment of pre‑cancerous lesions (cryotherapy, LEEP)",
        "wellbeing education on risk factors"
      ],
      first_line_standard_treatment: "Surgery (hysterectomy), radiotherapy, chemotherapy for invasive disease",
      ethiopian_context: "Screening is limited; many cases present at advanced stage. Vaccination is being rolled out.",
      ecological_links: ["HIV co‑infection increases risk", "Lack of wellbeing infrastructure contributes to late diagnosis"],
    },
    breast_cancer: {
      disease: "Breast Cancer (የጡት ካንሰር)",
      prevalence: "Increasing incidence in Ethiopia; now among top three cancers in women",
      high_risk_groups: ["Age >40", "Family history", "Early menarche / late menopause", "Nulliparity", "BRCA1/2 mutations (rare)"],
      physiological_hallmarks: ["Palpable breast lump (usually painless)", "Skin changes (peau d'orange, dimpling)", "Nipple discharge or inversion", "Axillary lymphadenopathy"],
      prevention_protocols: ["Breast self‑examination", "scientific breast examination", "Mammography (where available)", "Risk reduction: healthy weight, physical activity, limit alcohol"],
      first_line_standard_treatment: "Surgery, chemotherapy, radiotherapy, hormonal therapy, targeted therapy (depending on subtype and stage)",
      ethiopian_context: "Late presentation is common; awareness and early detection are critical.",
      ecological_links: ["Urbanisation associated with lifestyle changes"],
    },
    mental_wellbeing_disorders: {
      disease: "Mental wellbeing Disorders (የአእምሮ ጤና ችግሮች)",
      categories: ["Depression", "Anxiety disorders", "Bipolar disorder", "Schizophrenia", "Post‑traumatic stress disorder (PTSD)", "Substance use disorders (khat, alcohol)"],
      prevalence: "Depression: 5‑10%; anxiety: 5‑8%; schizophrenia: ~1%; PTSD: higher in conflict‑affected areas",
      risk_factors: ["Poverty", "Conflict and displacement", "Gender‑based violence", "Substance use (khat/alcohol)", "Trauma", "Loss of social support"],
      physiological_hallmarks: [
        "Depression: persistent low mood, anhedonia, fatigue, sleep/appetite changes, suicidal ideation",
        "Anxiety: excessive worry, panic attacks, avoidance",
        "PTSD: flashbacks, hypervigilance, avoidance of reminders",
        "Psychosis: hallucinations, delusions, disorganised thinking"
      ],
      prevention_protocols: [
        "Strengthen community and family support networks",
        "Reduce stigma through wellbeing education",
        "Integrate mental wellbeing into primary care (WHO mhGAP)",
        "Provide psychosocial support in conflict‑affected areas"
      ],
      first_line_standard_treatment: "Psychotherapy (CBT, IPT), antidepressants (SSRIs), antipsychotics, mood stabilisers – guided by diagnosis",
      ethiopian_context: "Mental health services are limited; treatment gap >90%. Cultural expression often involves somatic complaints.",
      ecological_links: ["Conflict, displacement, and drought increase mental wellbeing burden"],
    },
  };

  // -------------------------------------------------------------------------
  // NUTRITIONAL DEFICIENCIES
  // -------------------------------------------------------------------------
  private nutritionalDeficiencies = {
    anemia: {
      disease: "Anaemia (ደም ማነስ / Iron‑Deficiency Anaemia)",
      definition: "Haemoglobin < 11 g/dL in children and pregnant women; < 12 g/dL in non‑pregnant women; < 13 g/dL in men",
      prevalence: "57% in children under 5; 30‑40% in women of reproductive age",
      risk_factors: [
        "Low dietary iron bioavailability (high phytate diet)",
        "Menstrual blood loss",
        "Pregnancy (increased demand)",
        "Malaria (haemolysis)",
        "Hookworm infection",
        "Poor dietary diversity"
      ],
      physiological_hallmarks: ["Pale conjunctiva and palms", "Fatigue, weakness", "Koilonychia (spoon nails)", "Restless legs", "Cognitive impairment in children"],
      prevention_protocols: [
        "Iron‑rich foods: teff, meat, pulses, green leafy vegetables",
        "Enhanced absorption with vitamin C (lemon, tomatoes)",
        "Fermentation of teff (injera) to reduce phytates",
        "Iron supplementation for pregnant women and children",
        "Deworming (prevent helminth‑induced blood loss)"
      ],
      first_line_standard_treatment: "Oral iron supplements (ferrous sulphate) + vitamin C; treat underlying cause (malaria, hookworm)",
      ethiopian_context: "Anaemia is a major public health problem, contributing to maternal and child mortality.",
      ecological_links: ["Malaria and hookworm endemic areas increase anaemia burden", "Dietary patterns affect iron absorption"],
    },
    vitaminA_deficiency: {
      disease: "Vitamin A Deficiency (ቫይታሚን ኤ እጥረት)",
      definition: "Serum retinol < 0.70 µmol/L",
      prevalence: "Moderate public health problem in many regions",
      risk_factors: ["Low intake of animal foods and yellow‑orange fruits/vegetables", "Poverty", "Food insecurity"],
      physiological_hallmarks: ["Night blindness", "Xerophthalmia (dry eyes)", "Bitot's spots", "Corneal ulceration", "Increased infection risk (measles, diarrhoea)"],
      prevention_protocols: ["Vitamin A supplementation (children 6‑59 months)", "Dietary diversity (eggs, dairy, orange‑fleshed sweet potatoes, dark leafy greens)", "Fortification of oils and sugar"],
      first_line_standard_treatment: "High‑dose oral vitamin A supplements (200,000 IU for children >12 months, repeated every 6 months)",
      ethiopian_context: "Vitamin A deficiency contributes to child mortality and blindness; supplementation programmes are ongoing.",
      ecological_links: ["Seasonal food availability affects intake", "Stunting and poverty drive deficiency"],
    },
    iodine_deficiency: {
      disease: "Iodine Deficiency (የአዮዲን እጥረት)",
      definition: "Urinary iodine < 100 µg/L",
      prevalence: "Historically high in highland areas, but improved with salt iodisation",
      risk_factors: ["Living in iodine‑depleted highland soils", "Lack of iodised salt", "Goitrogenic foods (cassava, cabbage)"],
      physiological_hallmarks: ["Goitre (enlarged thyroid)", "Hypothyroidism (fatigue, cold intolerance, weight gain)", "Cretinism (congenital iodine deficiency) – mental retardation, deaf‑mutism"],
      prevention_protocols: ["Universal salt iodisation (must be <15 ppm iodine)", "Promotion of iodised salt in highland areas", "Early screening for congenital hypothyroidism"],
      first_line_standard_treatment: "Iodised salt, iodine supplements for pregnant and lactating women; levothyroxine for hypothyroidism",
      ethiopian_context: "Goitre is still endemic in some highland regions; salt iodisation coverage is improving.",
      ecological_links: ["Highland soils are iodine‑poor", "Goitrogens in cabbage family can worsen deficiency"],
    },
    stunting_wasting: {
      disease: "Stunting & Wasting (መቀንጨር እና መቅለጥ)",
      definition: {
        stunting: "Height‑for‑age < -2 SD",
        wasting: "Weight‑for‑height < -2 SD or MUAC < 11.5 cm"
      },
      prevalence: "Stunting ~37% (under‑5), wasting ~10% (under‑5)",
      risk_factors: [
        "Inadequate dietary diversity",
        "Low breastfeeding duration",
        "Frequent infections (diarrhoea, pneumonia)",
        "Food insecurity",
        "Poor water, sanitation, and hygiene (WASH)",
        "Maternal education and nutrition"
      ],
      physiological_hallmarks: {
        stunting: "Chronic linear growth failure, delayed development, cognitive deficits",
        wasting: "Acute weight loss, emaciation, apathy, oedema (kwashiorkor)"
      },
      prevention_protocols: [
        "Exclusive breastfeeding for 6 months",
        "Timely introduction of complementary feeding (fermented teff, pulses, eggs)",
        "Micronutrient powders (MNPs) for children 6‑23 months",
        "Growth monitoring and promotion",
        "WASH interventions to reduce infections",
        "Social protection (food aid, cash transfers)"
      ],
      first_line_standard_treatment: "Ready‑to‑Use Therapeutic Food (RUTF) for severe wasting; management of associated conditions (infections, micronutrient deficiencies)",
      ethiopian_context: "Stunting remains a major public health challenge; the Seqota Declaration aims to end stunting by 2030.",
      ecological_links: ["Food insecurity during dry seasons worsens acute malnutrition", "Seasonal agricultural cycles affect food availability"],
    },
  };

  // -------------------------------------------------------------------------
  // INJURIES & ACCIDENTS
  // -------------------------------------------------------------------------
  private injuries = {
    road_traffic_accidents: {
      disease: "Road Traffic Accidents (የመንገድ አደጋዎች)",
      definition: "Injuries from motor vehicle, pedestrian, and cyclist collisions",
      prevalence: "Rapidly increasing with motorisation; leading cause of death in young adults",
      risk_factors: ["Speeding", "Drunk driving", "Lack of seatbelt use", "Distracted driving", "Poor road infrastructure", "Fatigue"],
      physiological_hallmarks: ["Traumatic brain injury", "Fractures", "Internal bleeding", "Spinal cord injury", "Polytrauma"],
      prevention_protocols: [
        "Enforce speed limits and seatbelt laws",
        "Mandatory helmet use for motorcyclists",
        "Pedestrian‑friendly infrastructure",
        "Public education on road safety",
        "Vehicle inspections",
        "Post‑crash care (pre‑hospital emergency services)"
      ],
      first_line_standard_treatment: "Emergency trauma care, surgery, rehabilitation",
      ethiopian_context: "Road traffic injuries are a major and growing public health problem; trauma care is often limited.",
      ecological_links: ["Urbanisation and road expansion increase exposure", "Poor road conditions contribute"],
    },
    burns: {
      disease: "Burns (ቃጠሎች)",
      etiology: ["Domestic fires (open cooking), electrical burns, scald burns (hot liquids)", "Childhood accidents"],
      risk_factors: ["Open flame cooking", "Lack of smoke/fire alarms", "Child supervision gaps", "Alcohol use"],
      physiological_hallmarks: ["Skin blistering, necrosis, oedema, hypovolaemia, sepsis", "Airway injury from smoke inhalation"],
      prevention_protocols: ["Safe cooking practices", "Childproofing", "Smoke detectors", "First‑aid education"],
      first_line_standard_treatment: "Burn wound care, fluid resuscitation, infection control, skin grafting",
      ethiopian_context: "Burns are common in households using open fire; often lead to severe disability.",
      ecological_links: ["Biomass cooking and kerosene use increase burn risk"],
    },
  };

  // -------------------------------------------------------------------------
  // MATERNAL & CHILD wellbeing
  // -------------------------------------------------------------------------
  private maternalChildwellbeing = {
    maternal_mortality: {
      disease: "Maternal Mortality (የእናቶች ሞት)",
      definition: "Death during pregnancy, childbirth, or within 42 days postpartum",
      ratio: "Approximately 412 per 100,000 live births (2020 estimate) – declining but still high",
      causes: ["Post‑partum haemorrhage", "Eclampsia / pre‑eclampsia", "Sepsis", "Obstructed labour", "Unsafe abortion"],
      risk_factors: ["Low antenatal care coverage", "Home delivery without skilled attendant", "Malnutrition", "Anaemia", "Distance to facility"],
      prevention_protocols: [
        "Antenatal care (ANC) visits (at least 4)",
        "Skilled birth attendance (health facility delivery)",
        "Emergency obstetric care (EmOC) availability",
        "Family planning to reduce high‑risk pregnancies",
        "Iron‑folate supplementation during pregnancy",
        "Interventions for hypertensive disorders"
      ],
      first_line_standard_treatment: "Timely EmOC, blood transfusion, antibiotics, caesarean section, magnesium sulphate for eclampsia",
      ethiopian_context: "Maternal mortality has halved since 2000 but remains high; focus on increasing facility deliveries and EmOC.",
      ecological_links: ["Distance and transport barriers in rural areas", "Drought affects food security and nutrition"],
    },
    neonatal_mortality: {
      disease: "Neonatal Mortality (የአራስ ሞት)",
      definition: "Death within the first 28 days of life",
      rate: "Approximately 30 per 1,000 live births",
      causes: ["Preterm birth", "Birth asphyxia", "Neonatal infections (sepsis, pneumonia)", "Congenital anomalies"],
      risk_factors: ["Preterm labour", "Low birth weight", "Home delivery", "Maternal infections", "Poor newborn care (hypothermia, delayed breastfeeding)"],
      prevention_protocols: [
        "Quality antenatal care",
        "Skilled delivery care with neonatal resuscitation",
        "Kangaroo Mother Care (KMC) for preterm infants",
        "Promote early and exclusive breastfeeding",
        "Infection prevention (clean cord care, immunisations)"
      ],
      first_line_standard_treatment: "Neonatal resuscitation, antibiotics, thermoregulation, respiratory support",
      ethiopian_context: "Neonatal deaths now account for a large proportion of under‑5 mortality; interventions are cost‑effective.",
      ecological_links: ["Maternal nutrition and wellbeing affect birth outcomes", "Seasonal food shortages affect birth weight"],
    },
    child_wellbeing: {
      disease: "Child wellbeing – Under‑5 Mortality",
      definition: "Death of children under 5 years of age",
      rate: "Approximately 55 per 1,000 live births (declining)",
      main_causes: ["Pneumonia", "Diarrhoea", "Malaria", "Malnutrition", "Preterm complications"],
      prevention_protocols: [
        "Immunisation (EPI: BCG, polio, DPT, measles, PCV, rotavirus)",
        "Integrated Management of Childhood Illness (IMCI)",
        "Promote exclusive breastfeeding and complementary feeding",
        "Malaria prevention (ITNs, IPTp)",
        "Vitamin A supplementation",
        "Zinc for diarrhoea"
      ],
      first_line_standard_treatment: "Antibiotics for pneumonia, ORS for diarrhoea, antimalarials, RUTF for malnutrition",
      ethiopian_context: "Child mortality has dropped sharply but still above SDG targets.",
      ecological_links: ["Malaria seasonality", "Food security and hygiene practices"],
    },
  };

  // -------------------------------------------------------------------------
  // Helper methods
  // -------------------------------------------------------------------------
  private normalizeQuery(query: string): string {
    return query
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private hasAlias(normalized: string, alias: string): boolean {
    return this.queryAliases[alias]?.some((term) => normalized.includes(term)) ?? false;
  }

  private getRegion(userProfile: UserProfile): string | undefined {
    return userProfile.region || userProfile.location?.region;
  }

  private getAge(userProfile: UserProfile): number | undefined {
    return userProfile.age || userProfile.wellbeing?.age;
  }

  private isPregnant(userProfile: UserProfile): boolean {
    return userProfile.pregnant || userProfile.wellbeing?.pregnant || false;
  }

  // -------------------------------------------------------------------------
  // Main query method
  // -------------------------------------------------------------------------
  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const userRegion = this.getRegion(userProfile);
    const userAge = this.getAge(userProfile);
    const pregnant = this.isPregnant(userProfile);

    // ---- 1. Communicable Diseases ----
    for (const [key, disease] of Object.entries(this.communicableDiseases) as [string, EpidemiologyRecord][]) {
      let score = 0;
      const matches: string[] = [];

      if (
        normalized.includes(key) ||
        disease.disease.toLowerCase().includes(normalized) ||
        this.hasAlias(normalized, key as keyof typeof this.queryAliases)
      ) {
        score += 35;
        matches.push("disease_name_match");
      }

      // Regional endemicity
      if (userRegion && disease.endemic_regions?.some((r) => r.toLowerCase().includes(userRegion.toLowerCase()))) {
        score += 25;
        matches.push(`regional_endemicity_${userRegion}`);
      }

      // Risk groups: check if user belongs
      if (disease.high_risk_groups) {
        for (const group of disease.high_risk_groups) {
          if (group.toLowerCase().includes("children") && userAge !== undefined && userAge < 5) {
            score += 15;
            matches.push("user_child");
          }
          if (group.toLowerCase().includes("pregnant") && pregnant) {
            score += 15;
            matches.push("user_pregnant");
          }
          if (group.toLowerCase().includes("elderly") && userAge !== undefined && userAge > 60) {
            score += 15;
            matches.push("user_elderly");
          }
          if (group.toLowerCase().includes("hiv") && userProfile.hivStatus === "positive") {
            score += 20;
            matches.push("user_hiv_positive");
          }
        }
      }

      // Keyword scoring
      for (const term of terms) {
        if (textList(disease.physiological_hallmarks).some((h: string) => h.toLowerCase().includes(term))) {
          score += 20;
          matches.push(`symptom_${term}`);
        }
        if (disease.prevention_protocols?.some((p) => p.toLowerCase().includes(term))) {
          score += 10;
          matches.push(`prevent_${term}`);
        }
        if (disease.ethiopian_context?.toLowerCase().includes(term)) {
          score += 10;
          matches.push(`ethio_${term}`);
        }
      }

      if (score > 15) {
        const isSevere = (key === "malaria" && normalized.includes("cerebral")) ||
          (key === "tuberculosis" && normalized.includes("mdr")) ||
          (key === "hiv" && normalized.includes("aids"));
        const cureStr = treatmentText((disease as unknown as Record<string, unknown>).first_line_standard_treatment) || "Refer for specialised care";

        results.push({
          type: "epidemiological_disease_profile",
          strand: this.strandName,
          domain: "wellbeing",
          name: disease.disease.toUpperCase(),
          description: `Pathogens: ${((disease as any).pathogens || ((disease as any).pathogen ? [(disease as any).pathogen] : [])).join("; ") || (disease as any).transmission || "N/A"}. Endemic regions: ${disease.endemic_regions?.join("; ") || "N/A"}.`,
          evidence: `scientific hallmarks: ${textList(disease.physiological_hallmarks).join("; ") || "N/A"}. Standard scientific protocol: ${cureStr}.`,
          ethiopian_context: disease.ethiopian_context || "Major public health concern in Ethiopia",
          relevanceScore: Math.min(score / 60, 0.98),
          confidence: 0.92,
          matches,
          recommendations: disease.prevention_protocols || [],
          management: [cureStr],
          sources: ["EPHI National Disease Surveillance", "WHO Global wellbeing Observatory"],
          category: "Domain A",
          severity: isSevere ? "critical" : score > 40 ? "high" : "moderate",
          risk_assessment: {
            level: score > 40 ? "high" : "moderate",
            risk_factors: disease.high_risk_groups?.slice(0, 3) || [],
            recommendations: disease.prevention_protocols?.slice(0, 3) || [],
          },
          details: {
            incidence_mortality: disease.incidence_mortality,
            seasonal: disease.seasonal_dynamics,
            emergency_treatment: (disease as any).emergency_treatment,
          },
        });
      }
    }

    // ---- 2. Non-Communicable Diseases ----
    for (const [key, disease] of Object.entries(this.nonCommunicableDiseases) as [string, EpidemiologyRecord][]) {
      let score = 0;
      const matches: string[] = [];

      if (
        normalized.includes(key.replace(/_/g, " ")) ||
        disease.disease.toLowerCase().includes(normalized) ||
        this.hasAlias(normalized, key as keyof typeof this.queryAliases)
      ) {
        score += 30;
        matches.push("ncd_name_match");
      }

      // Risk factor matching from user profile
      if (disease.risk_factors) {
        for (const risk of disease.risk_factors) {
          if (risk.toLowerCase().includes("obesity") && userProfile.bmi && userProfile.bmi >= 30) {
            score += 15;
            matches.push("user_obese");
          }
          if (risk.toLowerCase().includes("salt") && userProfile.diet?.saltIntake === "high") {
            score += 10;
            matches.push("user_high_salt");
          }
          if (risk.toLowerCase().includes("physical inactivity") && userProfile.lifestyle?.activity === "low") {
            score += 10;
            matches.push("user_sedentary");
          }
          if (risk.toLowerCase().includes("age") && userAge !== undefined && userAge > 40) {
            score += 10;
            matches.push("user_older");
          }
        }
      }

      // User already has condition?
      if (userProfile.conditions && userProfile.conditions.some((c) => disease.disease.toLowerCase().includes(c.toLowerCase()))) {
        score += 30;
        matches.push("user_has_condition");
      }

      for (const term of terms) {
        if (textList(disease.physiological_hallmarks).some((h: string) => h.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`symptom_${term}`);
        }
        if (disease.prevention_protocols?.some((p) => p.toLowerCase().includes(term))) {
          score += 10;
          matches.push(`prevent_${term}`);
        }
        if (disease.ethiopian_context?.toLowerCase().includes(term)) {
          score += 10;
          matches.push(`ethio_${term}`);
        }
      }

      if (score > 15) {
        results.push({
          type: "epidemiological_ncd_profile",
          strand: this.strandName,
          domain: "wellbeing",
          name: disease.disease.toUpperCase(),
          description: `Definition: ${disease.definition || "N/A"}. Prevalence: ${disease.prevalence || "N/A"}.`,
          evidence: `Risk factors: ${disease.risk_factors?.join("; ") || "N/A"}. Complications: ${disease.complications?.join("; ") || "N/A"}.`,
          ethiopian_context: disease.ethiopian_context || "Rising non‑communicable disease burden in Ethiopia",
          relevanceScore: Math.min(score / 50, 0.95),
          confidence: 0.88,
          matches,
          recommendations: disease.prevention_protocols || [],
          management: [treatmentText(disease.first_line_standard_treatment) || "Lifestyle modification + pharmacotherapy"],
          sources: ["EPHI NCD Surveillance", "WHO NCD Country Profiles"],
          category: "Domain A",
          severity: "moderate",
          risk_assessment: {
            level: score > 30 ? "moderate" : "low",
            risk_factors: disease.risk_factors?.slice(0, 3) || [],
            recommendations: disease.prevention_protocols?.slice(0, 3) || [],
          },
        });
      }
    }

    // ---- 3. Nutritional Deficiencies ----
    if (this.hasAlias(normalized, "anemia") || this.hasAlias(normalized, "vitamin") || this.hasAlias(normalized, "iodine") || this.hasAlias(normalized, "stunting")) {
      for (const [key, def] of Object.entries(this.nutritionalDeficiencies) as [string, EpidemiologyRecord][]) {
        let score = 0;
        const matches: string[] = [];

        if (
          normalized.includes(key) ||
          def.disease.toLowerCase().includes(normalized) ||
          this.hasAlias(normalized, key as keyof typeof this.queryAliases)
        ) {
          score += 30;
          matches.push("nutritional_match");
        }

        // User-specific risk
        if (userAge !== undefined && userAge < 5) {
          if (key === "anemia" || key === "vitaminA_deficiency" || key === "stunting_wasting") {
            score += 20;
            matches.push("user_child");
          }
        }
        if (pregnant && (key === "anemia" || key === "iodine_deficiency")) {
          score += 20;
          matches.push("user_pregnant");
        }

        for (const term of terms) {
          if (textList(def.physiological_hallmarks).some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`symptom_${term}`);
          }
          if (def.prevention_protocols?.some((p) => p.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`prevent_${term}`);
          }
          if (def.ethiopian_context?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "nutritional_deficiency",
            strand: this.strandName,
            domain: "wellbeing",
            name: def.disease.toUpperCase(),
            description: `Definition: ${def.definition || "N/A"}. Prevalence: ${def.prevalence || "N/A"}.`,
            evidence: `Risk factors: ${def.risk_factors?.join("; ") || "N/A"}. scientific hallmarks: ${textList(def.physiological_hallmarks).join("; ") || "N/A"}.`,
            ethiopian_context: def.ethiopian_context || "Public health nutrition priority in Ethiopia",
            relevanceScore: Math.min(score / 50, 0.92),
            confidence: 0.88,
            matches,
            recommendations: def.prevention_protocols || [],
            management: [treatmentText(def.first_line_standard_treatment) || "Supplementation and dietary improvement"],
            sources: ["EPHI Nutritional Surveillance", "WHO Nutrition Landscape"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 4. Injuries ----
    if (this.hasAlias(normalized, "road") || normalized.includes("accident") || normalized.includes("injury") || normalized.includes("burn")) {
      for (const [key, inj] of Object.entries(this.injuries) as [string, EpidemiologyRecord][]) {
        let score = 0;
        const matches: string[] = [];

        if (
          normalized.includes(key) ||
          inj.disease.toLowerCase().includes(normalized)
        ) {
          score += 30;
          matches.push("injury_match");
        }

        for (const term of terms) {
          if (inj.risk_factors?.some((r) => r.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`risk_${term}`);
          }
          if (textList(inj.physiological_hallmarks).some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`scientific_${term}`);
          }
          if (inj.ethiopian_context?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "injury_profile",
            strand: this.strandName,
            domain: "wellbeing",
            name: inj.disease.toUpperCase(),
            description: `Etiology: ${inj.etiology || "N/A"}. Risk factors: ${inj.risk_factors?.join("; ") || "N/A"}.`,
            evidence: `scientific hallmarks: ${textList(inj.physiological_hallmarks).join("; ") || "N/A"}.`,
            ethiopian_context: inj.ethiopian_context || "Preventable injury burden in Ethiopia",
            relevanceScore: Math.min(score / 50, 0.85),
            confidence: 0.80,
            matches,
            recommendations: inj.prevention_protocols || [],
            management: [treatmentText(inj.first_line_standard_treatment) || "Emergency care and rehabilitation"],
            sources: ["WHO Injury Surveillance", "EPHI Trauma Data"],
            category: "Domain A",
            severity: "high",
          });
        }
      }
    }

    // ---- 5. Maternal & Child wellbeing ----
    if (pregnant || normalized.includes("maternal") || normalized.includes("child") || normalized.includes("neonatal") || normalized.includes("childbirth")) {
      for (const [key, mch] of Object.entries(this.maternalChildwellbeing) as [string, EpidemiologyRecord][]) {
        let score = 0;
        const matches: string[] = [];

        if (
          normalized.includes(key) ||
          mch.disease.toLowerCase().includes(normalized)
        ) {
          score += 30;
          matches.push("mch_match");
        }

        if (pregnant) {
          score += 20;
          matches.push("user_pregnant");
        }

        for (const term of terms) {
          if (textList(mch.causes).some((c: string) => c.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`cause_${term}`);
          }
          if (mch.prevention_protocols?.some((p) => p.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`prevent_${term}`);
          }
          if (mch.ethiopian_context?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "maternal_child_wellbeing",
            strand: this.strandName,
            domain: "wellbeing",
            name: mch.disease.toUpperCase(),
            description: `Definition: ${mch.definition || "N/A"}. Rate: ${mch.rate || mch.ratio || "N/A"}.`,
            evidence: `Causes: ${textList(mch.causes).join("; ") || "N/A"}. Risk factors: ${mch.risk_factors?.join("; ") || "N/A"}.`,
            ethiopian_context: mch.ethiopian_context || "Maternal and child wellbeing is a priority for Ethiopia",
            relevanceScore: Math.min(score / 50, 0.92),
            confidence: 0.88,
            matches,
            recommendations: mch.prevention_protocols || [],
            management: [treatmentText(mch.first_line_standard_treatment) || "Skilled care and referral"],
            sources: ["EPHI Maternal and Child wellbeing Reports", "WHO Maternal Mortality"],
            category: "Domain A",
            severity: "high",
          });
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // -------------------------------------------------------------------------
  // Helper methods for integration
  // -------------------------------------------------------------------------

  /**
   * Get disease risk for a given region
   */
  getDiseaseRisksForRegion(region: string): string[] {
    const risks: string[] = [];
    for (const [key, disease] of Object.entries(this.communicableDiseases) as [string, EpidemiologyRecord][]) {
      if (disease.endemic_regions?.some((r) => r.toLowerCase().includes(region.toLowerCase()))) {
        risks.push(`${disease.disease}: endemic in this region`);
      }
    }
    return risks;
  }

  /**
   * Get prevention recommendations for a specific disease
   */
  getPreventionForDisease(diseaseName: string): string[] {
    const search = diseaseName.toLowerCase();
    const all = { ...this.communicableDiseases, ...this.nonCommunicableDiseases, ...this.nutritionalDeficiencies, ...this.injuries, ...this.maternalChildwellbeing };
    for (const [key, data] of Object.entries(all) as [string, EpidemiologyRecord][]) {
      if (data.disease.toLowerCase().includes(search) || key.includes(search)) {
        return data.prevention_protocols || [];
      }
    }
    return ["Consult your healthcare provider for personalized advice."];
  }

  /**
   * Get high‑risk groups for a disease
   */
  getHighRiskGroupsForDisease(diseaseName: string): string[] {
    const search = diseaseName.toLowerCase();
    const all = { ...this.communicableDiseases, ...this.nonCommunicableDiseases };
    for (const [key, data] of Object.entries(all) as [string, EpidemiologyRecord][]) {
      if (data.disease.toLowerCase().includes(search) || key.includes(search)) {
        return data.high_risk_groups || [];
      }
    }
    return [];
  }

  /**
   * Get scientific hallmarks for a disease
   */
  getScientificHallmarks(diseaseName: string): string[] {
    const search = diseaseName.toLowerCase();
    const all = { ...this.communicableDiseases, ...this.nonCommunicableDiseases, ...this.nutritionalDeficiencies };
    for (const [key, data] of Object.entries(all) as [string, EpidemiologyRecord][]) {
      if (data.disease.toLowerCase().includes(search) || key.includes(search)) {
        return textList(data.physiological_hallmarks);
      }
    }
    return [];
  }

  /**
   * Get treatment options for a disease
   */
  getTreatmentForDisease(diseaseName: string): string[] {
    const search = diseaseName.toLowerCase();
    const all = { ...this.communicableDiseases, ...this.nonCommunicableDiseases, ...this.nutritionalDeficiencies, ...this.injuries, ...this.maternalChildwellbeing };
    for (const [key, data] of Object.entries(all) as [string, EpidemiologyRecord][]) {
      if (data.disease.toLowerCase().includes(search) || key.includes(search)) {
        const treatments: string[] = [];
        const firstLine = treatmentText(data.first_line_standard_treatment);
        if (firstLine) treatments.push(`First‑line: ${firstLine}`);
        if (data.emergency_treatment) treatments.push(`Emergency: ${data.emergency_treatment}`);
        return treatments;
      }
    }
    return ["Consult a healthcare provider for appropriate management."];
  }

  /**
   * Get country‑level epidemiological statistics for a disease
   */
  getEpidemiologyStats(diseaseName: string): { incidence?: string; prevalence?: string; mortality?: string } | null {
    const search = diseaseName.toLowerCase();
    const all = { ...this.communicableDiseases, ...this.nonCommunicableDiseases, ...this.nutritionalDeficiencies, ...this.maternalChildwellbeing };
    for (const [key, data] of Object.entries(all) as [string, EpidemiologyRecord][]) {
      if (data.disease.toLowerCase().includes(search) || key.includes(search)) {
        if (data.incidence_mortality) {
          return {
            incidence: (data.incidence_mortality as any).annual_cases,
            prevalence: (data as any).prevalence,
            mortality: (data.incidence_mortality as any).annual_deaths,
          };
        }
        if (data.ratio) {
          return { prevalence: data.ratio };
        }
        if (data.rate) {
          return { prevalence: data.rate };
        }
      }
    }
    return null;
  }
}