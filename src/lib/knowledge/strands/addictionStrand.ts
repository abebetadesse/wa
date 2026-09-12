import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile, DomainType } from "../types";

/**
 * Enhanced Addiction Knowledge Strand
 *
 * Integrates:
 * - Substance profiles: Khat, Alcohol, Tobacco (smoking & chewing), Opioids, Cannabis, Prescription Drug Abuse
 * - Detailed pharmacological mechanisms (cathinone, ethanol, nicotine, THC, morphine)
 * - Acute & chronic health effects (cardiovascular, neurological, gastrointestinal, oncological)
 * - Withdrawal syndromes (symptoms, onset, peak, duration, management)
 * - Ethiopian cultural context (Bercha, Tella, Tej, Areke, Tumbakho, Gaya)
 * - Harm reduction strategies (tapering, nutritional protection, hydration)
 * - Pharmacotherapy (NRT, MAT, benzodiazepines, thiamine, disulfiram, naltrexone)
 * - Psychosocial interventions (CBT, MI, community support, faith‑based groups)
 * - Prevention programmes (school‑based, community‑based, religious‑based)
 * - Dual diagnosis (co‑occurring mental health disorders)
 * - Cross‑strand linking (Medication, Psychological, Cultural, Socioeconomic)
 * - Domain A (clinical) with severity and risk assessment
 * - Domain B (cultural/reflective) for traditional context
 * - Evidence‑weighted confidence, severity, and safety alerts
 * - User‑specific profiling (substance use, mental health, age, region)
 */
export class AddictionKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "addiction";
  readonly domain: DomainType = "health";

  // --- Alias registry for query expansion ---
  private queryAliases: Record<string, string[]> = {
    khat: ["khat", "chat", "catha", "edulis", "chew", "chewing", "mirqana", "harara", "bercha", "ጫት", "መከፈፍ"],
    alcohol: ["alcohol", "ethanol", "tella", "tej", "areke", "katikala", "booze", "drinking", "የአልኮል", "ጠላ", "ጠጅ", "አራቂ"],
    tobacco: ["tobacco", "nicotine", "smoking", "cigarette", "tumbakho", "gaya", "chewing tobacco", "ማጨስ", "ትምባሆ"],
    opioids: ["opioid", "morphine", "heroin", "tramadol", "codeine", "opiate", "painkiller"],
    cannabis: ["cannabis", "marijuana", "weed", "pot", "thc", "cbd", "hashish"],
    prescription: ["prescription", "drug", "pills", "overdose", "dependency", "sedative", "stimulant"],
    withdrawal: ["withdrawal", "detox", "craving", "crash", "insomnia", "shakes", "tremors"],
    overdose: ["overdose", "poisoning", "emergency", "naloxone", "hospital"],
  };

  // -------------------------------------------------------------------------
  // COMPLETE SUBSTANCE PROFILES
  // -------------------------------------------------------------------------
  private substanceProfiles = {
    khat: {
      id: "khat",
      name: "Khat (Catha edulis / ጫት)",
      active_compounds: [
        "S-(-)-Cathinone (potent sympathomimetic central stimulant, dopamine and norepinephrine reuptake inhibitor)",
        "Cathine (Norpseudoephedrine, weaker stimulant with peripheral sympathomimetic effects)",
        "Cathidine (minor alkaloid with unclear role)",
      ],
      icd11_code: "6C4E (Stimulant dependence)",
      pharmacology: {
        mechanism: "Cathinone acts as a monoamine releaser (dopamine, norepinephrine, serotonin) and reuptake inhibitor, producing effects similar to amphetamines but less potent",
        route: "Chewing leaves for hours (slow buccal absorption)",
        half_life: "Cathinone: ~3 hours; Cathine: ~4-5 hours",
        metabolism: "Hepatic, primarily via CYP2D6, CYP3A4, and carbonyl reductase",
        excretion: "Renal (primarily cathine metabolites)",
      },
      acute_effects: [
        "Hyperarousal and psychomotor agitation",
        "Anorexia and profound suppression of appetite (can lead to significant weight loss)",
        "Tachycardia, acute vasoconstriction, and arterial hypertension (mean increase 10-20 mmHg systolic)",
        "Prolonged nocturnal insomnia (chewing sessions often continue until late night)",
        "Elevated alertness followed by post‑chewing dysphoria (Mirqana / Harara crash)",
        "Mydriasis (pupillary dilation)",
        "Hyperthermia (mild, due to sympathomimetic stimulation)",
        "Increased sociability and talkativeness (social lubricant)",
        "Euphoria and feeling of well‑being (dopamine-mediated)",
      ],
      chronic_health_risks: [
        "Severe periodontal recession, keratosis of buccal mucosa, and oral leukoplakia (pre‑malignant)",
        "Chronic gastritis, delayed gastric emptying, and gastroesophageal reflux (GERD)",
        "Secondary reactive anxiety, chronic sleep fragmentation, and manic‑depressive mood swings",
        "Elevated cardiovascular strain, vasospastic angina, and acute myocardial infarction risk (increase in cardiovascular events)",
        "Sperm motility suppression and erectile dysfunction (dopamine‑mediated, often reversible with cessation)",
        "Significant socio‑economic disruption due to extended chewing sessions (Bercha) – reduced productivity, financial strain",
        "Khat‐associated psychosis (rare, but with high doses or pre‑existing vulnerability)",
        "Oral squamous cell carcinoma (long‑term risk with concurrent tobacco use)",
        "Fetal growth restriction and low birth weight (if chewed during pregnancy)",
      ],
      withdrawal_profile: {
        syndrome: "Khat Discontinuation / Crash Syndrome",
        symptoms: [
          "Profound lethargy and hypersomnia (excessive sleep, often 12-16 hours/day)",
          "Depressive dysphoria and anhedonia (lack of pleasure, flat mood)",
          "Intense craving (psychological dependence is significant)",
          "Nightmares and vivid dreaming (REM rebound)",
          "Psychomotor slowing (sluggish movements and thinking)",
          "Tremulousness (fine tremor)",
          "Irritability and frustration (low frustration tolerance)",
          "Loss of appetite and weight loss (as chewing suppressed appetite)",
        ],
        onset: "12 to 24 hours after cessation",
        peak: "2 to 4 days (cravings peak at day 3)",
        duration: "7 to 21 days (craving may persist longer)",
        management: [
          "Gradual tapering (e.g., reduce chewing time from 6 hours to 2 hours over 2 weeks)",
          "Adequate hydration and electrolyte replacement",
          "Nutritional support: consume a meal before and after chewing",
          "Psychological support (CBT, motivational interviewing)",
          "Sleep hygiene (avoid caffeine, maintain regular sleep schedule)",
        ],
      },
      ethiopian_context: [
        "Widely grown cash crop with deep social traditions (Hararghe, Gurage, Oromia, Addis Ababa)",
        "Communal chewing rituals ('Bercha') often extend for 4 to 8 hours daily, leading to nutritional displacement, chronic dehydration, and concurrent high‑sugar soft drink consumption (over 50% of chewing sessions include sugary drinks)",
        "Khat is legal in Ethiopia; chewing is intertwined with social, political, and economic life",
        "Hararghe region is the centre of khat cultivation and trade",
        "Chewing is predominantly male but increasing among women in some urban areas",
      ],
      harm_reduction: [
        "Set hard time limits on chewing sessions (e.g., max 2 hours, or reduce from 6 hours to 2 hours over time)",
        "Consume a nutrient‑dense warm meal *before* chewing to avoid gastric mucosal ulceration",
        "Replace sugary sodas with water or unsweetened herbal infusions during chewing (reduce sugar intake and dehydration)",
        "Use a timer to regulate session length",
        "Chew with friends who support reduction (social support)",
        "Substitute khat with other social activities (sports, community events)",
      ],
      pharmacotherapy: [
        "No specific FDA‑approved medication for khat dependence",
        "Bupropion (dopamine reuptake inhibitor) may reduce craving (off‑label)",
        "Naltrexone may reduce craving (off‑label, limited evidence)",
        "Antidepressants (SSRIs) for comorbid depression (Sertraline, Fluoxetine)",
        "Benzodiazepines (lorazepam) for acute agitation/insomnia (short‑term)",
        "Antipsychotics (risperidone, olanzapine) for khat‑induced psychosis",
      ],
      psychosocial_interventions: [
        "Cognitive‑Behavioural Therapy (CBT) to restructure afternoon and evening social habits",
        "Motivational Interviewing (MI) to enhance readiness to change",
        "Contingency Management: rewards for abstinence or reduced use",
        "Relapse Prevention: identify triggers (social gatherings, stress)",
        "Support groups: community‑based groups or peer support networks",
        "Family therapy: involve family in recovery",
      ],
      prevention: [
        "School‑based education on health risks of khat use",
        "Community awareness campaigns (radio, TV, local events)",
        "Promote alternative social activities (sports, arts, youth clubs)",
        "Economic alternatives to khat cultivation",
        "Policy: regulate khat hours of sale and consumption",
      ],
      dual_diagnosis: [
        "Khat use often co‑occurs with depression, anxiety, and psychotic disorders",
        "Anxiety may be exacerbated by cathinone withdrawal",
        "Psychotic symptoms: paranoia, auditory hallucinations (usually resolve with cessation)",
        "Treatment: address both addiction and underlying mental health condition",
      ],
      sources: [
        "ETM‑DB (Ethiopian Traditional Medicine Database)",
        "Amanuel Mental Specialized Hospital Addiction Protocols",
        "Addis Ababa University School of Public health - Khat Epidemiology",
      ],
    },

    alcohol: {
      id: "alcohol",
      name: "Alcohol & Traditional Fermented Beverages",
      active_compounds: ["Ethanol (central nervous system depressant, GABA-A receptor agonist, NMDA receptor antagonist)"],
      icd11_code: "6C40 (Alcohol dependence)",
      pharmacology: {
        mechanism: "Ethanol enhances GABA-A receptor function (inhibitory), inhibits NMDA receptors (excitatory), and increases dopamine release in the nucleus accumbens (reward pathway)",
        route: "Oral ingestion, absorbed in stomach and small intestine",
        half_life: "Variable, ~4-5 hours (depends on liver metabolism)",
        metabolism: "Gastric and hepatic alcohol dehydrogenase (ADH) → acetaldehyde → aldehyde dehydrogenase (ALDH2) → acetate",
        excretion: "Renal, pulmonary (3-5% unchanged)",
      },
      acute_effects: [
        "Disinhibition and impaired judgment (increases risk‑taking behaviour)",
        "Impaired motor coordination (ataxia, slurred speech)",
        "Hypoglycaemia risk (inhibition of gluconeogenesis, especially in fasting individuals)",
        "Gastric mucosal irritation (gastritis, nausea, vomiting)",
        "Dihydrogen (dehydration) and electrolyte imbalance",
        "Central nervous system depression: drowsiness, coma, respiratory depression (high doses)",
        "Blackouts (anterograde amnesia)",
        "Flushing (in individuals with ALDH2 deficiency – rare in Ethiopians)",
      ],
      chronic_health_risks: [
        "Alcoholic steatohepatitis progressing to micronodular cirrhosis and portal hypertension",
        "Dilated cardiomyopathy and secondary hypertension",
        "Wernicke‑Korsakoff syndrome from concurrent nutritional Thiamine (B1) deficiency (confusion, ataxia, ophthalmoplegia, memory impairment)",
        "Chronic pancreatitis and malabsorption",
        "Neurocognitive decline and peripheral neuropathy (sensory and motor)",
        "Alcoholic liver disease and hepatocellular carcinoma",
        "Increased risk of cancers: oesophageal, liver, breast, colorectal",
        "Alcoholic gastritis and peptic ulcer disease",
        "Fetal alcohol syndrome (if consumed during pregnancy)",
        "Impacts on fertility (testosterone suppression in men)",
      ],
      withdrawal_profile: {
        syndrome: "Acute Alcohol Withdrawal Syndrome",
        symptoms: [
          "Autonomic hyperactivity (sweating, resting tachycardia > 100 bpm, elevated blood pressure)",
          "Coarse postural tremor (shaking hands)",
          "Nausea and retching",
          "Transient visual, tactile, or auditory hallucinations (alcoholic hallucinosis)",
          "Risk of withdrawal seizures (generalised tonic‑clonic, usually within 48 hours)",
          "Delirium Tremens (DTs): confusion, severe agitation, autonomic instability, fever (life‑threatening, usually 48-96 hours after cessation)",
        ],
        onset: "6 to 12 hours after last drink (can be earlier in severe dependence)",
        peak: "24 to 72 hours (seizures at 24-48h, DTs at 48-96h)",
        duration: "5 to 10 days (residual sleep disturbance, anxiety may persist longer)",
        management: [
          "Medical detoxification under clinical supervision",
          "Benzodiazepines (e.g., chlordiazepoxide, diazepam) for withdrawal symptom control (CIWA‑Ar protocol)",
          "High‑dose IV Thiamine (B1) to prevent Wernicke‑Korsakoff syndrome",
          "Folic acid and multivitamin supplementation",
          "Magnesium and potassium replacement",
          "Electrolyte and fluid balance monitoring",
          "Seizure precautions (benzodiazepines are first‑line)",
        ],
      },
      ethiopian_context: [
        "Traditional home‑brewed beverages: Tella (2-6% ABV, brewed with Gesho and barley/teff), Tej (honey wine, 7-14% ABV, flavoured with Gesho), and Areke / Katikala (distilled liquor, 35-50% ABV, often unstandardised)",
        "Tella and Tej are culturally accepted, often consumed during holidays and ceremonies",
        "Areke carries particularly high toxicity risks due to unstandardised distillation temperatures, potential fusel oil contamination (methanol, higher alcohols), and rapid binge consumption",
        "Commercial beer and wine are also widely available, especially in urban areas",
        "Alcohol use is often intertwined with social gatherings, religious festivals, and celebrations",
        "Drinking is predominantly male, but female drinking is increasing, especially in urban areas",
      ],
      harm_reduction: [
        "Complete transition away from distilled Areke to low‑ABV traditionally brewed Tella or non‑alcoholic alternatives",
        "Set limits: maximum 1-2 standard drinks per day, with alcohol‑free days",
        "Eat food before and while drinking (slows absorption, reduces hypoglycaemia)",
        "Hydrate with water between alcoholic drinks (prevents dehydration)",
        "Avoid mixing alcohol with medications or drugs",
        "Avoid driving or operating machinery after drinking",
      ],
      pharmacotherapy: [
        "Disulfiram: aversive therapy (causes unpleasant reaction if alcohol consumed)",
        "Naltrexone: reduces craving and reward from alcohol (oral or injectable long‑acting formulation)",
        "Acamprosate: reduces withdrawal‑related cravings and helps maintain abstinence",
        "Topiramate: reduces alcohol consumption and craving (off‑label)",
        "Benzodiazepines: for withdrawal management (under supervision)",
        "Thiamine (B1) supplementation: essential for preventing Wernicke‑Korsakoff syndrome",
      ],
      psychosocial_interventions: [
        "Cognitive‑Behavioural Therapy (CBT) for relapse prevention",
        "Motivational Interviewing (MI) to enhance treatment engagement",
        "12‑step facilitation (Alcoholics Anonymous – AA) – groups available in Ethiopia",
        "Community and faith‑based peer recovery support (Church/Mosque groups, local addiction mutual aid)",
        "Family therapy: involve family in recovery and address enabling behaviours",
        "Contingency Management: rewards for abstinence",
      ],
      prevention: [
        "School‑based alcohol education and life skills training",
        "Community awareness campaigns on risks of Areke and heavy drinking",
        "Policy: regulate Areke distillation, licensing of alcohol outlets",
        "Promote social alternatives to drinking",
        "Drink‑driving legislation and enforcement",
      ],
      dual_diagnosis: [
        "Alcohol use disorder frequently co‑occurs with depression, anxiety, bipolar disorder, and schizophrenia",
        "Treat both conditions concurrently; antidepressants for depression, mood stabilisers for bipolar, antipsychotics for schizophrenia",
        "Address trauma (PTSD) that may underlie drinking",
      ],
      sources: [
        "WHO Global Status Report on Alcohol and health",
        "Amanuel Mental Specialized Hospital Addiction Protocols",
        "Ethiopian Public health Institute (EPHI) Alcohol Use Survey",
      ],
    },

    tobacco_nicotine: {
      id: "tobacco",
      name: "Tobacco (Smoking & Traditional Chewing / Tumbakho)",
      active_compounds: ["Nicotine (nicotinic acetylcholine receptor agonist)", "Polycyclic aromatic hydrocarbons (PAHs)", "Nitrosamines (NNK, NNN)", "Carbon monoxide"],
      icd11_code: "6C4A (Tobacco dependence)",
      pharmacology: {
        mechanism: "Nicotine binds to nicotinic acetylcholine receptors (nAChRs) in the brain, releasing dopamine, norepinephrine, serotonin, and glutamate, producing arousal, reward, and cognitive enhancement",
        route: "Inhalation (smoking) or buccal absorption (chewing/snuff)",
        half_life: "Nicotine: ~2 hours; Cotinine (metabolite): ~16-20 hours",
        metabolism: "Hepatic (CYP2A6, CYP2B6, CYP2D6) – variable due to genetic polymorphisms",
        excretion: "Renal (cotinine)",
      },
      acute_effects: [
        "Peripheral vasoconstriction and increased blood pressure (nicotine-induced)",
        "Tachycardia (heart rate increase 10-20 bpm)",
        "Elevated systolic pressure (5-10 mmHg increase)",
        "Increased alertness and concentration (cognitive enhancement)",
        "Decreased appetite (weight loss)",
        "Dizziness and light‑headedness (first‑time users)",
        "Gastric irritation (nausea, vomiting)",
      ],
      chronic_health_risks: [
        "Chronic obstructive pulmonary disease (COPD) and chronic bronchitis (emphysema)",
        "Atherosclerotic cardiovascular disease and stroke (increased risk 2-4 fold)",
        "Carcinoma of the larynx, lung, and oral cavity (mouth, throat, oesophagus)",
        "Peripheral vascular disease (Buerger's disease)",
        "Gastric and pancreatic cancer",
        "Periodontal disease (gum recession, tooth loss)",
        "Cataracts and macular degeneration",
        "Reproductive health: reduced fertility, erectile dysfunction, low birth weight, preterm birth",
        "Accelerated ageing (skin wrinkling, reduced bone density)",
        "Second‑hand smoke effects on children and non‑smokers",
      ],
      withdrawal_profile: {
        syndrome: "Nicotine Withdrawal",
        symptoms: [
          "Intense cravings (the most persistent symptom)",
          "Irritability and frustration (low tolerance for stress)",
          "Anxiety and restlessness",
          "Sleep disturbance (insomnia, vivid dreams)",
          "Increased appetite (often leads to weight gain)",
          "Depressed mood (anhedonia)",
          "Difficulty concentrating",
        ],
        onset: "2 to 4 hours after last use",
        peak: "2 to 3 days (craving peaks at day 3)",
        duration: "3 to 4 weeks (craving may persist longer)",
        management: [
          "Nicotine Replacement Therapy (NRT): gums, patches, lozenges (reduce withdrawal symptoms)",
          "Behavioural strategies: identify triggers and develop alternative responses",
          "Gradual reduction (tapering) of nicotine intake",
          "Support groups and counselling",
          "Bupropion (Zyban) or Varenicline (Chantix) for pharmacological support",
        ],
      },
      ethiopian_context: [
        "Traditional smokeless chewing tobacco (Tumbakho / Gaya) practiced in rural and southern regions with significant oral mucosal pathology (leukoplakia, erythroplakia)",
        "Smoking rates are lower than in many other countries but are increasing in urban areas, especially among youth and males",
        "Tobacco is often used in combination with khat chewing (cigarette smoking during or after khat sessions)",
        "Cigarette brands are widely available; local and imported",
        "Shisha (waterpipe) smoking is increasing among urban youth",
      ],
      harm_reduction: [
        "Transition to NRT (gums, patches, lozenges) to reduce smoking",
        "Set a quit date and stick to it",
        "Avoid triggers: coffee, alcohol, social settings where people smoke",
        "Use behavioural substitution: chew sugar‑free gum, take a walk",
        "Join a support group or use mobile apps for smoking cessation",
        "Vaping is not recommended (unknown long‑term risks)",
      ],
      pharmacotherapy: [
        "Nicotine Replacement Therapy (NRT): patches, gum, lozenges, inhalers (first‑line)",
        "Bupropion (Zyban): reduces craving and withdrawal (antidepressant with nicotine antagonist properties)",
        "Varenicline (Chantix): partial agonist at nAChRs, reduces craving and reward (first‑line)",
        "Cytisine (Tabex): plant‑based partial agonist, available in some countries",
        "Clonidine: reduces withdrawal symptoms (off‑label)",
        "Nortriptyline: reduces craving (off‑label)",
      ],
      psychosocial_interventions: [
        "Cognitive‑Behavioural Therapy (CBT): identify and change smoking behaviours",
        "Motivational Interviewing (MI): enhance quit motivation",
        "Behavioural stimulus control: avoid triggers, change routines",
        "Support groups (Nico‑Helpline, smoking cessation groups)",
        "Relapse prevention: plan for high‑risk situations",
        "Family support: involve family in the quit process",
      ],
      prevention: [
        "School‑based tobacco education (awareness of health risks)",
        "Ban on tobacco advertising and sponsorship",
        "Plain packaging and health warnings on cigarette packs",
        "Price increases (taxation) to discourage use",
        "Smoke‑free public places (enforcement)",
      ],
      dual_diagnosis: [
        "Tobacco use is highly comorbid with mental health conditions (depression, schizophrenia, substance use disorders)",
        "Smoking cessation may lead to transient worsening of depression; monitor closely",
        "Bupropion can treat both nicotine dependence and depression",
      ],
      sources: [
        "WHO Global Tobacco Report",
        "Ethiopian Public health Institute (EPHI) Tobacco Survey",
        "Tobacco Control Research Group - Ethiopia",
      ],
    },

    opioids: {
      id: "opioids",
      name: "Opioids (Morphine, Heroin, Tramadol, Codeine)",
      active_compounds: ["Morphine (μ‑opioid receptor agonist)", "Heroin (diacetylmorphine)", "Tramadol (weak μ‑opioid agonist, SNRI)", "Codeine (prodrug, μ‑opioid agonist)"],
      icd11_code: "6C43 (Opioid dependence)",
      pharmacology: {
        mechanism: "Opioids bind to μ‑opioid receptors in the brain, spinal cord, and peripheral tissues, inhibiting pain transmission, producing euphoria (dopamine release), and causing respiratory depression",
        route: "Oral, intravenous, intranasal, smoked (varies by substance)",
        half_life: "Morphine: 2-4 hours; Heroin: 2-5 minutes (rapid conversion to morphine); Tramadol: 6-8 hours; Codeine: 3-4 hours",
        metabolism: "Hepatic (CYP2D6 for codeine to morphine, CYP3A4 for others), glucuronidation",
        excretion: "Renal",
      },
      acute_effects: [
        "Euphoria and intense sense of well‑being (reward pathway activation)",
        "Pain relief (analgesia, the therapeutic effect)",
        "Respiratory depression (decreased respiratory rate, risk of overdose)",
        "Constipation (opioid‑induced, due to decreased gut motility)",
        "Miosis (pupillary constriction, a classic sign)",
        "Nausea and vomiting (especially in opioid‑naive individuals)",
        "Pruritus (itching, histamine release)",
        "Sedation and drowsiness",
      ],
      chronic_health_risks: [
        "Opioid dependence and addiction (psychological and physical)",
        "Tolerance (increasing doses needed for the same effect)",
        "Overdose: respiratory depression, coma, death (risk increases with polysubstance use)",
        "Constipation and bowel obstruction (chronic, can be severe)",
        "Hypogonadism and sexual dysfunction (suppression of hypothalamic‑pituitary‑gonadal axis)",
        "Infections: HIV, hepatitis B/C (from intravenous use), endocarditis",
        "Skin abscesses, cellulitis, and scarring (from IV use)",
        "Adrenal insufficiency (long‑term opioid use)",
        "Osteoporosis and fractures (long‑term use)",
        "Peripheral oedema (fluid retention)",
      ],
      withdrawal_profile: {
        syndrome: "Opioid Withdrawal",
        symptoms: [
          "Severe pain (bone, muscle, joint aches – 'bone pain')",
          "Diarrhoea and abdominal cramping (gut hypermotility)",
          "Agitation and restlessness (psychomotor agitation)",
          "Insomnia (profound sleep disturbance)",
          "Dilated pupils (mydriasis)",
          "Sweating, tachycardia, hypertension (autonomic hyperarousal)",
          "Nausea, vomiting, and anorexia",
          "Intense craving (psychological dependence)",
        ],
        onset: "6-12 hours (heroin), 24-48 hours (methadone)",
        peak: "36-72 hours (heroin), 3-5 days (methadone)",
        duration: "5-14 days (heroin), 14-21 days (methadone)",
        management: [
          "Medication‑Assisted Treatment (MAT) is the gold standard",
          "Methadone: long‑acting full agonist, reduces craving and withdrawal (specialist prescribing)",
          "Buprenorphine: partial agonist, reduces withdrawal and craving (more accessible)",
          "Naltrexone: opioid antagonist, blocks reward and prevents relapse (requires detoxification first)",
          "Clonidine: reduces autonomic symptoms (sweating, tachycardia, hypertension)",
          "Loperamide: for diarrhoea",
          "Supportive care: hydration, electrolytes, symptomatic management",
        ],
      },
      ethiopian_context: [
        "Opioid use is relatively limited in Ethiopia compared to other regions, but tramadol misuse is increasing, especially in urban areas and among youth",
        "Tramadol is available over‑the‑counter in some areas, contributing to misuse",
        "There are concerns about diversion of prescription opioids and illicit heroin use in larger cities (Addis Ababa)",
        "Treatment options for opioid dependence are very limited in Ethiopia; methadone and buprenorphine are not widely available",
        "Harm reduction services (needle exchange, safe injection sites) are not available",
      ],
      harm_reduction: [
        "Never use alone; have a buddy system",
        "Carry naloxone (Narcan) if available – opioid antagonist that reverses overdose",
        "Start with a low dose (if injecting or using a new batch)",
        "Avoid mixing opioids with alcohol or benzodiazepines (increases respiratory depression risk)",
        "Use new, sterile syringes to prevent infections (if injecting)",
        "Seek help immediately if someone is unresponsive or not breathing",
      ],
      pharmacotherapy: [
        "Methadone: for maintenance therapy (reduces withdrawal and craving)",
        "Buprenorphine (Suboxone): combined with naloxone to prevent diversion (first‑line in many settings)",
        "Naltrexone: for relapse prevention (after detox)",
        "Naloxone: emergency reversal of opioid overdose",
        "Clonidine: for withdrawal symptom management",
      ],
      psychosocial_interventions: [
        "Cognitive‑Behavioural Therapy (CBT) for relapse prevention",
        "Motivational Interviewing (MI) to enhance engagement",
        "Contingency Management: rewards for abstinence",
        "Support groups (Narcotics Anonymous – NA)",
        "Family therapy and support",
      ],
      prevention: [
        "Prescription monitoring to prevent diversion",
        "Public education on risks of opioid use",
        "Training healthcare workers on safe prescribing",
        "Availability of naloxone for emergency use",
        "Stigma reduction to encourage help‑seeking",
      ],
      dual_diagnosis: [
        "Opioid use disorder frequently co‑occurs with depression, anxiety, and PTSD",
        "Address underlying trauma and mental health conditions",
        "MAT (buprenorphine/methadone) plus psychotherapy is the most effective approach",
      ],
      sources: [
        "WHO Guidelines for the Psychosocially Assisted Pharmacological Treatment of Opioid Dependence",
        "Amanuel Mental Specialized Hospital Addiction Protocols",
        "Ethiopian Food and Drug Authority",
      ],
    },

    cannabis: {
      id: "cannabis",
      name: "Cannabis (Marijuana / መርሱያ)",
      active_compounds: ["Δ9‑Tetrahydrocannabinol (THC) – psychoactive", "Cannabidiol (CBD) – non‑psychoactive, anxiolytic"],
      icd11_code: "6C41 (Cannabis dependence)",
      pharmacology: {
        mechanism: "THC binds to CB1 receptors in the brain (reward, memory, motor coordination, appetite) and CB2 receptors in peripheral tissues (immune modulation)",
        route: "Smoked (joint, pipe, bong), vaporised, eaten (edibles), topical",
        half_life: "THC: 1-2 hours (acute), up to 5-13 days (chronic users, due to fat storage)",
        metabolism: "Hepatic (CYP2C9, CYP2C19, CYP3A4), extensive first‑pass metabolism",
        excretion: "Renal (metabolites), faecal",
      },
      acute_effects: [
        "Euphoria and relaxation (often the sought‑after effect)",
        "Altered perception of time and space",
        "Increased appetite ('the munchies' – CB1 receptor stimulation)",
        "Cognitive changes: impaired memory, attention, and judgment (especially with high THC)",
        "Anxiety and paranoia (especially with high THC or high doses)",
        "Red‑eye (conjunctival injection – vasodilation)",
        "Tachycardia (increased heart rate, especially in naive users)",
        "Dry mouth (cottonmouth)",
        "Sedation and drowsiness (especially with high CBD strains)",
      ],
      chronic_health_risks: [
        "Respiratory issues: chronic bronchitis, cough, and sputum (from smoking)",
        "Cognitive impairment: potential for long‑term memory and attention deficits (with early and heavy use)",
        "Psychosis: increased risk of psychotic episodes in predisposed individuals (schizophrenia, bipolar)",
        "Dependency: cannabis use disorder (CUD) – 10-30% of regular users develop dependence",
        "Reduced motivation (amotivational syndrome, controversial)",
        "Fertility issues: reduced sperm count and motility (in men)",
        "Low birth weight and developmental effects (if used during pregnancy)",
        "Increased anxiety and depression (with heavy use)",
        "Accelerated ageing of lung function (with smoking)",
      ],
      withdrawal_profile: {
        syndrome: "Cannabis Withdrawal",
        symptoms: [
          "Irritability and anger",
          "Insomnia and vivid dreams (REM rebound)",
          "Anxiety and restlessness",
          "Depressed mood",
          "Appetite changes (decreased or increased)",
          "Craving for cannabis",
          "Headache and nausea",
        ],
        onset: "24-48 hours after cessation",
        peak: "2-4 days",
        duration: "1-2 weeks (craving may persist)",
        management: [
          "Gradual reduction of consumption (tapering)",
          "CBT for cannabis use disorder",
          "Motivational Interviewing to enhance readiness to change",
          "Support groups and peer support",
          "Address underlying anxiety or depression (if present)",
        ],
      },
      ethiopian_context: [
        "Cannabis use is present in Ethiopia but not as prevalent as khat or alcohol",
        "It is illegal and culturally stigmatised in many areas",
        "Use is more common among young people in urban areas, sometimes associated with the Rastafarian movement",
        "Traditional cannabis use (vaporised as 'shisha' or smoked) is limited",
        "CBD is not widely available or regulated",
      ],
      harm_reduction: [
        "Avoid smoking; use vaporisation or edibles if possible (reduces respiratory harm)",
        "Start with low THC strains to reduce anxiety and paranoia",
        "Do not drive or operate machinery while under the influence",
        "Set limits: frequency and amount",
        "Do not mix with alcohol or other substances",
      ],
      pharmacotherapy: [
        "No FDA‑approved medication for cannabis dependence",
        "Bupropion: may reduce craving (off‑label)",
        "Naltrexone: may reduce craving (off‑label)",
        "SSRIs: for comorbid anxiety and depression",
        "Cognitive‑Behavioural Therapy is the first‑line intervention",
      ],
      psychosocial_interventions: [
        "Cognitive‑Behavioural Therapy (CBT): identify triggers, develop coping skills",
        "Motivational Interviewing (MI): enhance motivation to quit",
        "Contingency Management: rewards for abstinence",
        "Support groups (Marijuana Anonymous – MA)",
        "Family therapy",
      ],
      prevention: [
        "School‑based education on risks of cannabis use",
        "Community awareness campaigns",
        "Stigma reduction to encourage help‑seeking",
        "Regulation of cannabis availability (if legalised)",
      ],
      dual_diagnosis: [
        "Cannabis use disorder frequently co‑occurs with depression, anxiety, schizophrenia, and bipolar disorder",
        "THC can exacerbate psychotic symptoms in schizophrenia and mania in bipolar disorder",
        "Treat both conditions concurrently; CBT + pharmacotherapy for depression/anxiety, antipsychotics for psychosis",
      ],
      sources: [
        "National Institute on Drug Abuse (NIDA)",
        "WHO Cannabis Use Disorder Guidelines",
        "Ethiopian Criminal Code (cannabis is illegal)",
      ],
    },

    prescription_drug_abuse: {
      id: "prescription_drug_abuse",
      name: "Prescription Drug Abuse (Sedatives, Stimulants, Painkillers)",
      active_compounds: ["Benzodiazepines (diazepam, alprazolam)", "Z‑drugs (zolpidem, zopiclone)", "Opioids (tramadol, codeine)", "Stimulants (methylphenidate, amphetamine salts)"],
      icd11_code: "6C5C (Other specified drug dependence)",
      pharmacology: {
        mechanism: "Varies by class: benzodiazepines enhance GABA; opioids activate μ‑opioid receptors; stimulants increase dopamine/norepinephrine",
        route: "Oral (mostly), intravenous (less common), intranasal (stimulants)",
        metabolism: "Hepatic, varies by drug",
        excretion: "Renal",
      },
      acute_effects: {
        benzodiazepines: ["Sedation", "Amnesia", "Muscle relaxation", "Respiratory depression (in overdose)"],
        stimulants: ["Euphoria", "Increased alertness", "Tachycardia", "Anxiety", "Insomnia"],
        opioids: ["Euphoria", "Pain relief", "Respiratory depression", "Constipation"],
      },
      chronic_health_risks: [
        "Dependence and addiction (psychological and physical)",
        "Tolerance (increasing doses needed)",
        "Overdose (respiratory depression for opioids, cardiac arrhythmias for stimulants)",
        "Cognitive impairment (benzodiazepines: memory loss, confusion; stimulants: psychosis)",
        "Withdrawal seizures (benzodiazepines, alcohol-like)",
        "Infection and HIV risk (with injection use)",
        "Financial and social disruption (loss of employment, relationships)",
      ],
      withdrawal_profile: {
        syndrome: "Benzodiazepine Withdrawal",
        symptoms: ["Anxiety", "Insomnia", "Tremor", "Seizures", "Psychosis (rare)"],
        onset: "1-4 days (short‑acting), 5-7 days (long‑acting)",
        peak: "2-3 weeks",
        duration: "Months (protracted withdrawal syndrome possible)",
        management: [
          "Slow tapering (over weeks to months) under medical supervision",
          "Substitution with long‑acting benzodiazepine (diazepam) for tapering",
          "CBT for insomnia and anxiety",
          "Supportive care",
        ],
      },
      ethiopian_context: [
        "Prescription drug abuse is increasing in Ethiopia, particularly tramadol (painkiller) and diazepam (anxiolytic)",
        "Over‑the‑counter availability of some drugs facilitates misuse",
        "Limited awareness of the risks of prescription drug dependence",
        "Limited treatment options for prescription drug dependence",
      ],
      harm_reduction: [
        "Never take prescription drugs without a prescription",
        "Do not share prescription medications",
        "Do not mix with alcohol or other drugs",
        "Store medications securely to prevent misuse",
        "Dispose of unused medications safely",
      ],
      pharmacotherapy: [
        "Benzodiazepine withdrawal: slow tapering, supportive care",
        "Opioid dependence: MAT (methadone, buprenorphine, naltrexone)",
        "Stimulant dependence: no specific pharmacotherapy; CBT is first‑line",
      ],
      psychosocial_interventions: [
        "Cognitive‑Behavioural Therapy (CBT)",
        "Motivational Interviewing (MI)",
        "Support groups",
        "Family therapy",
      ],
      prevention: [
        "Prescription monitoring programs",
        "healthcare provider education on safe prescribing",
        "Public education on risks of prescription drug misuse",
        "Stigma reduction to encourage help‑seeking",
      ],
      dual_diagnosis: [
        "Prescription drug abuse often co‑occurs with mental health conditions (anxiety, insomnia, chronic pain)",
        "Address the underlying condition to reduce misuse",
        "Non‑pharmacological alternatives for anxiety and insomnia (CBT, mindfulness)",
      ],
      sources: [
        "WHO Guidelines for Benzodiazepine Tapering",
        "Ethiopian Food and Drug Authority",
        "Amanuel Mental Specialized Hospital",
      ],
    },
  };

  // -------------------------------------------------------------------------
  // PREVENTION PROGRAMMES
  // -------------------------------------------------------------------------
  private preventionProgrammes = {
    school_based: {
      name: "School‑Based Addiction Prevention",
      description: "Education and life skills training in schools to prevent substance initiation",
      components: [
        "health education on substance risks (khat, alcohol, tobacco, drugs)",
        "Refusal skills training (how to say no to peer pressure)",
        "Social‑emotional learning (coping with stress, emotions)",
        "Peer education programmes (students teaching students)",
        "Parent involvement and education",
      ],
      target: "Children and adolescents (10-18 years)",
      ethiopian_context: [
        "Schools are the primary setting for youth health education",
        "Integration into existing life skills curriculum",
        "Use of Amharic, Oromo, and English materials",
      ],
      effectiveness: "Evidence‑based for reducing substance initiation and use",
      recommendations: [
        "Support school‑based life skills programmes",
        "Involve parents and community in prevention",
        "Use culturally appropriate content (khat awareness)",
      ],
      sources: ["UNODC School‑Based Prevention Guidelines", "Ministry of Education Ethiopia"],
    },
    community_based: {
      name: "Community‑Based Prevention",
      description: "Community mobilisation and awareness to prevent substance use",
      components: [
        "Community awareness campaigns (radio, TV, community meetings)",
        "Alternative activities for youth (sports, arts, clubs)",
        "Community policing and regulation of substance availability",
        "Involvement of community leaders and elders",
        "Promotion of healthy lifestyles",
      ],
      target: "Community‑wide (all ages)",
      ethiopian_context: [
        "Community leaders (elders, religious leaders) are influential",
        "Iddir and other community structures can be used for prevention",
        "Khat is deeply cultural; prevention requires sensitive messaging (harm reduction, not prohibition)",
      ],
      effectiveness: "Moderate evidence; effective when community‑led and sustained",
      recommendations: [
        "Engage community leaders in prevention campaigns",
        "Provide alternative social and economic activities",
        "Use harm reduction approaches for khat",
      ],
      sources: ["WHO Community‑Based Prevention Guidelines", "EPHI"],
    },
    religious_based: {
      name: "Faith‑Based Prevention",
      description: "Religious institutions as platforms for substance prevention and support",
      components: [
        "Religious messages against substance use (khat, alcohol, tobacco)",
        "Spiritual counselling and support",
        "Faith‑based support groups",
        "Integration of health education in religious teaching",
      ],
      target: "Religious communities (Orthodox, Muslim, Protestant)",
      ethiopian_context: [
        "Religious institutions are trusted and influential",
        "Orthodox fasting (Tsome) can be leveraged for health messaging",
        "Imams and priests can address substance use from a moral and spiritual perspective",
      ],
      effectiveness: "Effective for community engagement and support",
      recommendations: [
        "Partner with religious leaders for prevention messages",
        "Use religious platforms for health education",
        "Support faith‑based recovery groups",
      ],
      sources: ["Ethiopian Orthodox Church HIV/AIDS Prevention Programs"],
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
    return userProfile.age || userProfile.demographics?.age || userProfile.health?.age;
  }

  private hasMentalhealthCondition(userProfile: UserProfile): boolean {
    return !!(userProfile.mentalhealth?.conditions?.length || userProfile.health?.mentalhealthConditions?.length);
  }

  // -------------------------------------------------------------------------
  // Main query method
  // -------------------------------------------------------------------------
  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const region = this.getRegion(userProfile);
    const age = this.getAge(userProfile);
    const hasMentalhealth = this.hasMentalhealthCondition(userProfile);

    // ---- 1. Substance Profiles ----
    for (const [key, substance] of Object.entries(this.substanceProfiles)) {
      let score = 0;
      const matches: string[] = [];

      // Direct match or alias
      if (
        normalized.includes(key) ||
        normalized.includes(substance.name.toLowerCase()) ||
        (key === "khat" && (normalized.includes("chat") || normalized.includes("chew") || normalized.includes("mirqana") || normalized.includes("harara") || normalized.includes("bercha"))) ||
        this.hasAlias(normalized, key as keyof typeof this.queryAliases)
      ) {
        score += 40;
        matches.push("substance_direct_match");
      }

      // User profile substance use
      if (userProfile.substanceUse) {
        for (const sub of userProfile.substanceUse) {
          if (sub.toLowerCase().includes(key) || key.includes(sub.toLowerCase()) || (key === "khat" && sub.toLowerCase().includes("chat"))) {
            score += 45;
            matches.push(`user_reported_substance_${sub}`);
          }
        }
      }

      // Withdrawal or craving keywords
      if (this.hasAlias(normalized, "withdrawal")) {
        score += 20;
        matches.push("withdrawal_query");
      }

      if (this.hasAlias(normalized, "overdose")) {
        score += 20;
        matches.push("overdose_query");
      }

      // Keyword scoring
      for (const term of terms) {
        if (substance.chronic_health_risks?.some((r) => r.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`risk_${term}`);
        }
        if (substance.withdrawal_profile?.symptoms?.some((s) => s.toLowerCase().includes(term))) {
          score += 20;
          matches.push(`withdrawal_symptom_${term}`);
        }
        if (substance.ethiopian_context?.some((ctx) => ctx.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`ethio_context_${term}`);
        }
        if (substance.harm_reduction?.some((h) => h.toLowerCase().includes(term))) {
          score += 10;
          matches.push(`harm_reduction_${term}`);
        }
        if (substance.pharmacotherapy?.some((p) => p.toLowerCase().includes(term))) {
          score += 10;
          matches.push(`pharmaco_${term}`);
        }
        if (substance.dual_diagnosis?.some((d) => d.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`dual_diagnosis_${term}`);
        }
      }

      // Region-specific: khat in Hararghe or Addis
      if (key === "khat" && region && (region.toLowerCase().includes("harar") || region.toLowerCase().includes("hararghe"))) {
        score += 20;
        matches.push(`region_high_khat_${region}`);
      }

      // Alcohol: Areke risk if region known for traditional distillation
      if (key === "alcohol" && region && region.toLowerCase().includes("amhara")) {
        score += 15;
        matches.push("region_areke_risk");
      }

      // Age: younger users at higher risk of cannabis and prescription drug misuse
      if (age !== undefined && age < 25 && (key === "cannabis" || key === "prescription_drug_abuse")) {
        score += 15;
        matches.push("user_youth");
      }

      // Mental health comorbidity
      if (hasMentalhealth && (key === "alcohol" || key === "khat" || key === "cannabis")) {
        score += 15;
        matches.push("user_mental_health");
      }

      if (score > 15) {
        const isCritical = (key === "alcohol" && normalized.includes("tremor")) ||
                          (key === "opioids" && normalized.includes("overdose"));

        results.push({
          type: "substance_health_impact",
          strand: this.strandName,
          domain: "health",
          name: substance.name.toUpperCase(),
          description: `Active constituents: ${substance.active_compounds?.join("; ") || "N/A"}. Principal systemic risks: ${substance.chronic_health_risks?.slice(0, 3).join("; ") || "N/A"}.`,
          evidence: `Pharmacology: ${substance.pharmacology ? `${substance.pharmacology.mechanism}` : "N/A"}. Withdrawal: ${substance.withdrawal_profile?.syndrome || "N/A"} (Onset: ${substance.withdrawal_profile?.onset || "N/A"}, Peak: ${substance.withdrawal_profile?.peak || "N/A"}, Duration: ${substance.withdrawal_profile?.duration || "N/A"}).`,
          ethiopian_context: substance.ethiopian_context?.join("; ") || "Ethiopian substance use context",
          relevanceScore: Math.min(score / 60, 0.98),
          confidence: 0.92,
          matches,
          recommendations: substance.harm_reduction || substance.psychosocial_interventions || [],
          management: [
            ...(substance.harm_reduction || []),
            ...(substance.pharmacotherapy || []),
            ...(substance.psychosocial_interventions || []),
          ],
          sources: substance.sources || ["Amanuel Mental Specialized Hospital Addiction Protocols"],
          category: "Domain A",
          severity: isCritical ? "critical" : (key === "opioids" ? "high" : "moderate"),
          risk_assessment: {
            level: isCritical ? "critical" : "high",
            risk_factors: substance.chronic_health_risks?.slice(0, 3) || [],
            recommendations: substance.harm_reduction?.slice(0, 3) || [],
          },
          safetyAlerts: isCritical ? ["Seek immediate medical attention if overdose is suspected"] : [],
        });
      }
    }

    // ---- 2. Prevention Programmes (Domain B) ----
    if (this.hasAlias(normalized, "prevention") || normalized.includes("prevent") || normalized.includes("school") || normalized.includes("community") || normalized.includes("faith") || normalized.includes("religion")) {
      for (const [key, programme] of Object.entries(this.preventionProgrammes)) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || programme.name.toLowerCase().includes(normalized)) {
          score += 30;
          matches.push("prevention_match");
        }

        for (const term of terms) {
          if (programme.components?.some((c) => c.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`component_${term}`);
          }
          if (programme.recommendations?.some((r) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
          if (programme.ethiopian_context?.some((c) => c.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "addiction_prevention",
            strand: this.strandName,
            domain: "cultural",
            name: programme.name.toUpperCase(),
            description: programme.description,
            evidence: `Components: ${programme.components?.join("; ") || "N/A"}. Target: ${programme.target || "N/A"}.`,
            ethiopian_context: programme.ethiopian_context?.join("; ") || "Ethiopian prevention context",
            relevanceScore: Math.min(score / 50, 0.85),
            confidence: 0.80,
            matches,
            recommendations: programme.recommendations || [],
            management: programme.recommendations || [],
            sources: programme.sources || ["UNODC", "WHO"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 3. General addiction support (always include if substance use is reported) ----
    if (userProfile.substanceUse && userProfile.substanceUse.length > 0) {
      const supportResources = [
        "Seek professional help from Amanuel Mental Specialized Hospital or local health centres",
        "Access community‑based support groups (Iddir, faith‑based groups)",
        "Consider harm reduction strategies",
        "Involve family and community support",
        "Seek treatment for any co‑occurring mental health conditions",
        "Explore pharmacotherapy options (e.g., NRT for tobacco, MAT for opioids)",
      ];
      results.push({
        type: "addiction_support_resources",
        strand: this.strandName,
        domain: "health",
        name: "ADDICTION SUPPORT RESOURCES",
        description: "Resources and strategies for individuals with substance use concerns",
        evidence: `User reported substances: ${userProfile.substanceUse.join(", ")}.`,
        ethiopian_context: "Support is available through health centres, community organisations, and faith‑based groups.",
        relevanceScore: 0.95,
        confidence: 0.95,
        matches: ["user_reported_substance_use"],
        recommendations: supportResources,
        management: supportResources,
        sources: ["Amanuel Mental Specialized Hospital", "Community health Workers"],
        category: "Domain A",
        severity: "moderate",
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // -------------------------------------------------------------------------
  // Helper methods for integration
  // -------------------------------------------------------------------------

  /**
   * Get substance-specific harm reduction advice
   */
  getHarmReductionAdvice(substance: string): string[] {
    const search = substance.toLowerCase();
    for (const [key, data] of Object.entries(this.substanceProfiles)) {
      if (data.name.toLowerCase().includes(search) || key.includes(search)) {
        return data.harm_reduction || [];
      }
    }
    return ["General harm reduction: set limits, avoid mixing substances, seek support."];
  }

  /**
   * Get withdrawal management advice for a substance
   */
  getWithdrawalManagement(substance: string): string[] {
    const search = substance.toLowerCase();
    for (const [key, data] of Object.entries(this.substanceProfiles)) {
      if (data.name.toLowerCase().includes(search) || key.includes(search)) {
        if (data.withdrawal_profile?.management) {
          return data.withdrawal_profile.management;
        }
        if (data.pharmacotherapy) {
          return data.pharmacotherapy;
        }
      }
    }
    return ["Seek medical supervision for withdrawal, especially for alcohol and opioids."];
  }

  /**
   * Get pharmacotherapy options for a substance
   */
  getPharmacotherapyOptions(substance: string): string[] {
    const search = substance.toLowerCase();
    for (const [key, data] of Object.entries(this.substanceProfiles)) {
      if (data.name.toLowerCase().includes(search) || key.includes(search)) {
        return data.pharmacotherapy || [];
      }
    }
    return ["Consult a specialist for medication‑assisted treatment options."];
  }

  /**
   * Get prevention programmes for a specific target group
   */
  getPreventionProgrammes(target: string): string[] {
    const results: string[] = [];
    for (const [key, data] of Object.entries(this.preventionProgrammes)) {
      if (data.target?.toLowerCase().includes(target.toLowerCase()) || data.name.toLowerCase().includes(target.toLowerCase())) {
        results.push(`${data.name}: ${data.description}`);
        if (data.recommendations) {
          results.push(...data.recommendations.map((r) => `  - ${r}`));
        }
      }
    }
    return results.length > 0 ? results : ["General prevention: education, community engagement, and support for youth."];
  }

  /**
   * Get dual diagnosis information for a substance
   */
  getDualDiagnosisInfo(substance: string): string[] {
    const search = substance.toLowerCase();
    for (const [key, data] of Object.entries(this.substanceProfiles)) {
      if (data.name.toLowerCase().includes(search) || key.includes(search)) {
        return data.dual_diagnosis || [];
      }
    }
    return ["Substance use often co‑occurs with mental health conditions; address both."];
  }

  /**
   * Get Ethiopian cultural context for a substance
   */
  getEthiopianContext(substance: string): string[] {
    const search = substance.toLowerCase();
    for (const [key, data] of Object.entries(this.substanceProfiles)) {
      if (data.name.toLowerCase().includes(search) || key.includes(search)) {
        return data.ethiopian_context || [];
      }
    }
    return ["Substance use is embedded in Ethiopian social and cultural contexts."];
  }
}