import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile, DomainType } from "../types";

/**
 * Enhanced Psychological Knowledge Strand
 *
 * Integrates:
 * - Major mental wellbeing conditions: Depression, Anxiety, PTSD, Bipolar, Schizophrenia, OCD, Substance Use Disorders
 * - Cultural idioms of distress (somatization, thinking too much, heart fluttering, etc.)
 * - Child & adolescent mental wellbeing (ADHD, conduct disorder, developmental delay)
 * - Suicide prevention and self-harm
 * - Coping mechanisms & resilience (problem‑focused, emotion‑focused, community‑based)
 * - Ethiopian mental health services & policy (Amanuel, EPHI, WHO mhGAP)
 * - Traditional healing & community support (Iddir, Iqub, Mahber, Debtera, Zar)
 * - Stigma, help‑seeking, and cultural barriers
 * - Cross‑strand linking (Cultural, Epidemiological, Socioeconomic, Medication)
 * - Domain B (cultural/reflective) and Domain A (Scientific) tagging
 * - Evidence‑weighted confidence and severity
 * - User‑specific risk profiling (age, trauma history, substance use)
 */
export class PsychologicalKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "psychological";
  readonly domain: DomainType = "wellbeing";

  // --- Alias registry for query expansion ---
  private queryAliases: Record<string, string[]> = {
    depression: ["depression", "sad", "low mood", "hopeless", "anhedonia", "thinking too much", "አስተሳሰብ", "ሀሳብ"],
    anxiety: ["anxiety", "worry", "panic", "heart fluttering", "nervous", "fear", "ልብ ምት", "ጭንቀት"],
    ptsd: ["ptsd", "trauma", "flashback", "nightmare", "shock", "violence", "ጉዳት", "ድንጋጤ"],
    bipolar: ["bipolar", "mania", "hypomania", "depression", "mood swings", "ስሜት"],
    schizophrenia: ["schizophrenia", "psychosis", "hallucination", "delusion", "paranoid", "ስኪዞ", "የአዕምሮ"],
    ocd: ["ocd", "obsessive", "compulsive", "repetitive", "intrusive", "ልማዳዊ"],
    substance_use: ["substance", "addiction", "khat", "alcohol", "drugs", "dependence", "ሱስ", "አልኮል"],
    child_mental_wellbeing: ["child", "adolescent", "adhd", "conduct", "developmental", "ህፃን"],
    suicide: ["suicide", "self-harm", "kill", "end life", "የራስ ጉዳት", "ራስን መግደል"],
    stress: ["stress", "burnout", "overwhelmed", "pressure", "ጭንቀት", "ውጥረት"],
    coping: ["coping", "resilience", "support", "community", "iddir", "iqub", "mahber", "እድር", "እቁብ", "ማህበር"],
    trauma: ["trauma", "abuse", "violence", "conflict", "displacement", "ጉዳት", "ፆታዊ ጥቃት"],
  };

  // -------------------------------------------------------------------------
  // MAJOR MENTAL wellbeing CONDITIONS
  // -------------------------------------------------------------------------
  private mentalwellbeingConditions = {
    depression_major: {
      id: "depression_major",
      name: "Major Depressive Disorder (ከፍተኛ የድብርት በሽታ)",
      description: "Persistent low mood, anhedonia, cognitive slowing, and somatic conversion symptoms reflecting deep emotional distress",
      icd11_code: "6A70",
      physiological_symptoms: [
        "Persistent depressed mood most of the day, nearly every day",
        "Anhedonia (markedly diminished interest or pleasure in all activities)",
        "Significant weight loss or gain, or change in appetite",
        "Insomnia or hypersomnia nearly every day",
        "Psychomotor agitation or retardation (observable by others)",
        "Fatigue or loss of energy nearly every day",
        "Feelings of worthlessness or excessive/inappropriate guilt",
        "Diminished ability to think, concentrate, or make decisions",
        "Recurrent thoughts of death, suicidal ideation, or suicide attempt",
      ],
      cultural_idioms_of_distress: [
        "'Haseb Mabzat' (ሀሳብ ማብዛት) – Thinking too much / uncontrollable mental rumination",
        "'Ye-Aemro Chinket' (የአእምሮ ጭንቀት) – Constriction or tension of the mind",
        "'Ras Mehaz' (ራስ መያዝ) – Constricting head tension without physical lesion",
        "'Hode Basaheshegn' (ሆዴ ባሰሸኝ) – Sensation of abdominal sinking or visceral unease",
        "'Tikur Bota' (ጥቁር ቦታ) – Dark place / feeling of being trapped",
        "'Mind of Darkness' – Feeling of hopelessness and despair",
      ],
      risk_factors: [
        "Family history of depression or suicide",
        "Chronic physical illness (diabetes, HIV, cancer)",
        "Severe psychosocial stress (poverty, unemployment, loss)",
        "Trauma and abuse (childhood or adult)",
        "Postpartum period (postnatal depression)",
        "Substance use (khat, alcohol) – both cause and consequence",
        "Social isolation (migration, displacement)",
        "Neurochemical serotonin-norepinephrine imbalance",
      ],
      ethiopian_context: [
        "Depression frequently presents primarily through somatic complaints: burning body sensations, migrating headaches, epigastric tightness, rather than direct affective admissions",
        "Patients commonly consult traditional or spiritual healers (Debtera, Zar) before presenting to medical Debrs",
        "Stigma is significant; many hide symptoms or use idioms of distress",
        "Higher prevalence in women, refugees, and conflict‑affected populations",
        "Amanuel Mental Specialized Hospital reports depression as the most common diagnosis in outpatient Debrs",
      ],
      management: [
        "Culturally adapted cognitive‑behavioral therapy (CBT) validating somatic reality while exploring emotional triggers",
        "Interpersonal therapy (IPT) for grief and role transitions",
        "Community support through Iddir, family networks, and trusted spiritual elders",
        "Judicious pharmacotherapy: SSRIs (Sertraline, Fluoxetine, Escitalopram) under psychiatric guidance for moderate‑to‑severe symptoms",
        "Address comorbid substance use (khat, alcohol) to improve treatment response",
        "Psychoeducation for families to reduce stigma and support recovery",
      ],
      severity: "moderate to severe",
      sources: ["Amanuel Mental Specialized Hospital Scientific Protocols", "WHO mhGAP Intervention Guide"],
    },

    persistent_depression: {
      id: "persistent_depression",
      name: "Persistent Depressive Disorder (Dysthymia)",
      description: "Chronic low‑grade depression lasting at least 2 years, with periods of normal mood rarely lasting more than 2 months",
      icd11_code: "6A72",
      physiological_symptoms: [
        "Depressed mood for most of the day, more days than not, for at least 2 years",
        "Poor appetite or overeating",
        "Insomnia or hypersomnia",
        "Low energy or fatigue",
        "Low self‑esteem",
        "Poor concentration or difficulty making decisions",
        "Feelings of hopelessness",
      ],
      cultural_idioms_of_distress: [
        "'Haseb Mabzat' (ሀሳብ ማብዛት) – Thinking too much",
        "'Ye-Aemro Chinket' (የአእምሮ ጭንቀት) – Mind tension",
      ],
      risk_factors: ["Chronic stress", "Low social support", "Childhood adversity", "Personality factors (neuroticism)"],
      ethiopian_context: [
        "Often overlooked because symptoms are not acute; patients may be seen as 'weak' or 'lazy'",
        "Common in women with multiple caregiving responsibilities",
        "May be attributed to 'bad luck' or spiritual causes",
      ],
      management: [
        "Psychotherapy (CBT, IPT)",
        "SSRIs or SNRIs for persistent symptoms",
        "Address underlying stressors (poverty, housing, work)",
        "Community support and psychoeducation",
      ],
      severity: "moderate",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    anxiety_generalized: {
      id: "anxiety_generalized",
      name: "Generalized Anxiety Disorder (ሰፊ የጭንቀት በሽታ)",
      description: "Excessive, uncontrollable worry about various events and activities, with autonomic nervous system hyperarousal",
      icd11_code: "6B00",
      physiological_symptoms: [
        "Excessive anxiety and worry occurring more days than not for at least 6 months",
        "Difficulty controlling the worry",
        "Restlessness or feeling on edge",
        "Being easily fatigued",
        "Difficulty concentrating or mind going blank",
        "Irritability",
        "Muscle tension",
        "Sleep disturbance (difficulty falling or staying asleep, restless sleep)",
      ],
      cultural_idioms_of_distress: [
        "'Leb Medekam' (ልብ መድከም) – Heart weakness or sinking heart",
        "'Leb Mergade' (ልብ መርገብገብ) – Heart fluttering out of control",
        "'Bibirta' (ብብርታ) – Sudden visceral fright/tremor",
        "'Ye-Asab Chinket' (የአሳብ ጭንቀት) – Worry constriction",
        "'Meden' (መደን) – Tension/restlessness",
      ],
      risk_factors: [
        "High coffee consumption (excessive strong coffee – Buna – can trigger acute panic in slow caffeine metabolizers)",
        "Khat chewing (sympathomimetic effects)",
        "Unresolved chronic trauma",
        "Personality traits (neuroticism, harm avoidance)",
        "Life stressors (poverty, unemployment, family conflict)",
      ],
      ethiopian_context: [
        "Coffee consumption is culturally embedded (3‑4 cups during extended Buna ceremonies); many Ethiopians are slow caffeine metabolizers due to CYP1A2 polymorphisms",
        "Khat use is common in certain regions and can exacerbate anxiety",
        "Anxiety often presents with somatic symptoms: palpitations, chest tightness, sweating",
        "Stigma may prevent help‑seeking; patients often consult traditional healers",
      ],
      management: [
        "Restrict sympathomimetics (reduce coffee, stop khat chewing)",
        "Diaphragmatic pacing and relaxation exercises (breathing techniques)",
        "Cognitive‑behavioral therapy (CBT) for worry management",
        "Traditional calming herbal teas (Chamomile, Tena Adam, Peppermint) for mild nervous tension",
        "Pharmacotherapy: SSRIs (Sertraline, Escitalopram) or SNRIs (Duloxetine) for moderate‑to‑severe cases",
        "Buspirone as an alternative (non‑sedating)",
      ],
      severity: "moderate to severe",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    panic_disorder: {
      id: "panic_disorder",
      name: "Panic Disorder (የልብ ምት መጨመር / Panic Attacks)",
      description: "Recurrent, unexpected panic attacks followed by at least 1 month of persistent concern about having another attack or significant maladaptive change in behaviour",
      icd11_code: "6B01",
      physiological_symptoms: [
        "Palpitations, pounding heart, or accelerated heart rate",
        "Sweating",
        "Trembling or shaking",
        "Sensations of shortness of breath or smothering",
        "Feeling of choking",
        "Chest pain or discomfort",
        "Nausea or abdominal distress",
        "Dizziness, unsteadiness, or faintness",
        "Chills or heat sensations",
        "Paresthesias (numbness or tingling)",
        "Derealization or depersonalization",
        "Fear of losing control or 'going crazy'",
        "Fear of dying",
      ],
      cultural_idioms_of_distress: [
        "'Leb Mergade' (ልብ መርገብገብ) – Heart fluttering out of control",
        "'Mota Feleg' (ሞት ፍላጎት) – Fear of dying",
        "'Ye-Sira Chinket' (የስራ ጭንቀት) – Work pressure / anxiety",
      ],
      risk_factors: [
        "High caffeine intake (coffee, tea)",
        "Khat and other stimulant use",
        "Chronic stress and sleep deprivation",
        "Family history",
        "Major life transitions (migration, loss)",
      ],
      ethiopian_context: [
        "Panic attacks may be misinterpreted as 'heart disease' or 'spiritual attack'",
        "Patients often present to emergency departments with cardiac symptoms",
        "Khat use can precipitate panic attacks in susceptible individuals",
      ],
      management: [
        "Psychoeducation about the nature of panic attacks (benign, even if distressing)",
        "CBT for panic disorder (interoceptive exposure, cognitive restructuring)",
        "Relaxation techniques and breathing exercises",
        "Pharmacotherapy: SSRIs or SNRIs as first line; benzodiazepines for acute crisis (limited use)",
      ],
      severity: "moderate to severe",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    ptsd: {
      id: "ptsd",
      name: "Post‑Traumatic Stress Disorder (PTSD / የድንጋጤ ጉዳት)",
      description: "Severe protracted psychological and neurobiological reaction following exposure to life‑threatening events, violence, or displacement",
      icd11_code: "6B40",
      physiological_symptoms: [
        "Intrusive distressing memories and daytime flashbacks",
        "Terrifying nightmares related to the trauma",
        "Hypervigilance and exaggerated startle response",
        "Emotional numbness and social detachment",
        "Avoidance of reminders of the trauma",
        "Negative alterations in cognitions and mood",
        "Alterations in arousal and reactivity (irritability, reckless behaviour)",
        "Dissociative symptoms (depersonalization, derealization)",
      ],
      cultural_idioms_of_distress: [
        "'Ye-Dingate Shikmet' (የድንጋጤ ሸክም) – Burden of sudden terrifying shock",
        "'Metfo Hilm' (መጥፎ ህልም) – Persistent nightmare terror",
        "'Ye-Wedede Chinket' (የወደደ ጭንቀት) – Pain of loss",
        "'Tikur Bota' (ጥቁር ቦታ) – Dark place / feeling trapped",
      ],
      causes: [
        "Exposure to armed conflict and war",
        "Forced displacement and loss of home",
        "Severe motor vehicle trauma",
        "Gender‑based violence (sexual violence, domestic abuse)",
        "Childhood abuse (physical, emotional, sexual)",
        "Witnessing violence or death",
        "Torture or detention",
      ],
      ethiopian_context: [
        "Significant public health priority in regions recovering from conflict and displacement (Tigray, Amhara, Afar, Oromia)",
        "Traditional communal reconciliation and group storytelling rituals play a vital role in psychological re‑anchoring",
        "Women and children are disproportionately affected",
        "Stigma around mental wellbeing may prevent disclosure of trauma",
        "Debtera and Zar practitioners often consulted for trauma‑related symptoms",
      ],
      management: [
        "Trauma‑Focused Cognitive Behavioral Therapy (TF‑CBT)",
        "Eye Movement Desensitization and Reprocessing (EMDR)",
        "Establishment of physical safety, basic shelter, and predictable daily routines",
        "Communal healing circles fostering collective resilience and dignity restoration",
        "Pharmacotherapy: SSRIs (Sertraline, Paroxetine) as adjunctive",
        "Prazosin for trauma‑related nightmares",
        "Community‑based psychosocial support",
      ],
      severity: "severe to critical",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    bipolar_disorder: {
      id: "bipolar_disorder",
      name: "Bipolar Disorder (የስሜት መወዛወዝ)",
      description: "Recurrent episodes of mania (elevated or irritable mood) and depression, with significant impairment in functioning",
      icd11_code: "6A60",
      physiological_symptoms_mania: [
        "Elevated, expansive, or irritable mood",
        "Increased goal‑directed activity or psychomotor agitation",
        "Grandiosity or inflated self‑esteem",
        "Decreased need for sleep",
        "Rapid or pressured speech",
        "Flight of ideas or racing thoughts",
        "Distractibility",
        "Excessive involvement in high‑risk activities (spending, sexual indiscretion)",
      ],
      physiological_symptoms_depression: [
        "Depressed mood, anhedonia, fatigue, guilt, suicidal ideation (as in major depression)",
      ],
      cultural_idioms_of_distress: [
        "'Ye-Mirkat Chinket' (የምርካት ጭንቀት) – Mood disturbance",
        "'Ertat' (ዕርታት) – Agitation / restlessness",
      ],
      risk_factors: [
        "Family history of bipolar disorder",
        "Substance use (khat, alcohol, cannabis) – often triggers mania",
        "Stressful life events",
        "Sleep deprivation (can precipitate mania)",
      ],
      ethiopian_context: [
        "Often misdiagnosed as schizophrenia or depression due to lack of longitudinal observation",
        "Family support is critical for adherence to mood stabilisers",
        "Khat use can precipitate manic episodes",
      ],
      management: [
        "Mood stabilisers: Lithium, Valproate, Lamotrigine",
        "Atypical antipsychotics for acute mania (Olanzapine, Quetiapine)",
        "Psychoeducation for patients and families",
        "Avoid stimulants (coffee, khat) which can worsen mania",
        "Psychotherapy (CBT, interpersonal and social rhythm therapy)",
        "Regular monitoring of lithium levels and renal/thyroid function",
      ],
      severity: "severe",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    schizophrenia: {
      id: "schizophrenia",
      name: "Schizophrenia (የስኪዞፍሬንያ በሽታ)",
      description: "Chronic psychotic disorder with positive symptoms (hallucinations, delusions), negative symptoms, and cognitive impairment",
      icd11_code: "6A20",
      physiological_symptoms: [
        "Delusions (fixed false beliefs, often persecutory or grandiose)",
        "Hallucinations (auditory most common, may be visual)",
        "Disorganized thinking (incoherent speech, loose associations)",
        "Disorganized or catatonic behaviour",
        "Negative symptoms: blunted affect, alogia, avolition, anhedonia",
        "Cognitive impairment (attention, working memory, executive function)",
      ],
      cultural_idioms_of_distress: [
        "'Ye-Aemro Ferag' (የአእምሮ ፍራግ) – Mind disturbance / psychosis",
        "'Yemata' (የማታ) – Night‑time disturbance / sleep terror",
        "'Tejereb' (ተገረብ) – Bewilderment / confusion",
      ],
      risk_factors: [
        "Family history of schizophrenia",
        "Complications during pregnancy or birth",
        "Cannabis use in adolescence",
        "Migration and urbanicity",
        "Social adversity and trauma",
      ],
      ethiopian_context: [
        "Significant stigma; families may hide affected individuals",
        "Often diagnosed late; community‑based care is limited",
        "Debtera and Zar practitioners may be consulted for 'spiritual' causes",
        "Amanuel Hospital provides specialised care, but resources are limited",
      ],
      management: [
        "Antipsychotics: Risperidone, Olanzapine, Aripiprazole (first‑line)",
        "Clozapine for treatment‑resistant cases (requires blood monitoring)",
        "Psychosocial interventions: family psychoeducation, social skills training, vocational rehabilitation",
        "Assertive community treatment (ACT) for severe cases",
        "Address comorbidities (substance use, depression)",
        "Long‑acting injectable antipsychotics for non‑adherence",
      ],
      severity: "severe",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    obsessive_compulsive_disorder: {
      id: "obsessive_compulsive_disorder",
      name: "Obsessive‑Compulsive Disorder (OCD / የልማዳዊ አስተሳሰብ በሽታ)",
      description: "Recurrent obsessions (intrusive thoughts/urges) and/or compulsions (repetitive behaviours) causing significant distress",
      icd11_code: "6B20",
      physiological_symptoms: [
        "Obsessions: intrusive, unwanted thoughts, images, or urges (contamination, symmetry, harm, aggression, sexual)",
        "Compulsions: repetitive behaviours (washing, checking, counting, ordering) performed to reduce anxiety",
        "Time‑consuming (more than 1 hour/day)",
        "Significant distress or functional impairment",
      ],
      cultural_idioms_of_distress: [
        "'Guday' (ጉዳይ) – Problem / issue (referring to obsession)",
        "'Tikur Bota' (ጥቁር ቦታ) – Dark place / trapped",
      ],
      risk_factors: [
        "Family history of OCD",
        "Trauma or stressful life events",
        "Personality factors (perfectionism)",
        "Pregnancy and postpartum period",
      ],
      ethiopian_context: [
        "Often hidden due to shame; patients may have extensive rituals that are not disclosed",
        "May present as 'excessive cleanliness' or 'perfectionism' which is culturally valued, masking OCD",
        "Treatment-seeking is low due to stigma",
      ],
      management: [
        "Cognitive‑behavioral therapy with exposure and response prevention (ERP) – gold standard",
        "Pharmacotherapy: SSRIs (Fluoxetine, Sertraline) at higher doses",
        "Clomipramine (tricyclic) as second‑line",
        "Psychoeducation for families",
      ],
      severity: "moderate to severe",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    substance_use_disorder_khat: {
      id: "substance_use_disorder_khat",
      name: "Khat Use Disorder (የጣት ሱስ)",
      description: "Pattern of khat (Catha edulis) use leading to scientificly significant impairment or distress",
      icd11_code: "6C4E",
      substance: "Khat (Catha edulis) – active compounds: cathinone, cathine",
      physiological_symptoms: [
        "Craving for khat",
        "Loss of control over use (using more or longer than intended)",
        "Continued use despite negative consequences (wellbeing, social, financial)",
        "Withdrawal symptoms: depressed mood, fatigue, irritability, insomnia",
        "Tolerance: needing more to achieve the same effect",
        "Neglect of responsibilities (work, family, social)",
      ],
      wellbeing_consequences: [
        "Cardiovascular: tachycardia, hypertension, increased risk of MI",
        "Dental: gum disease, tooth decay, oral cancer risk",
        "Mental wellbeing: anxiety, depression, psychosis (rare, with high doses)",
        "GI: constipation, gastritis, oesophageal irritation",
        "Reproductive: decreased fertility, low birth weight in babies",
      ],
      cultural_idioms_of_distress: [
        "'Chat' (ጣት) – Khat leaf",
        "'Mekfef' (መክፈፍ) – Chewing session",
        "'Meshenger' (መሸንገር) – Social chewing gathering",
      ],
      risk_factors: [
        "Cultural availability (common in Harar, Dire Dawa, and other regions)",
        "Social pressure (chewing is a social activity)",
        "Poverty and unemployment (used to alleviate boredom/hunger)",
        "Genetics (cathinone affects dopamine pathways)",
      ],
      ethiopian_context: [
        "Khat is legal and widely used; it is a deeply ingrained cultural practice",
        "Harm reduction approaches are more acceptable than prohibition",
        "Khat use is associated with poverty and food insecurity (appetite suppression)",
        "Chewing is often accompanied by smoking cigarettes",
      ],
      management: [
        "Cognitive‑behavioral therapy (CBT) for substance use",
        "Motivational interviewing to enhance readiness to change",
        "Support groups (community‑based, religious organisations)",
        "Address underlying mental wellbeing conditions (depression, anxiety)",
        "Gradual reduction rather than abrupt cessation (withdrawal can be severe)",
        "Pharmacotherapy: none specifically approved; may require antidepressants for comorbid depression",
      ],
      severity: "moderate to severe",
      sources: ["Amanuel Mental Specialized Hospital", "ETM-DB"],
    },

    substance_use_disorder_alcohol: {
      id: "substance_use_disorder_alcohol",
      name: "Alcohol Use Disorder (የአልኮል ሱስ)",
      description: "Pattern of alcohol use leading to scientificly significant impairment or distress",
      icd11_code: "6C40",
      physiological_symptoms: [
        "Craving for alcohol",
        "Loss of control over drinking",
        "Continued use despite wellbeing, social, or legal problems",
        "Withdrawal symptoms: tremors, anxiety, sweating, nausea, seizures, delirium tremens",
        "Tolerance",
        "Neglect of responsibilities",
      ],
      wellbeing_consequences: [
        "Liver disease (cirrhosis, hepatitis)",
        "Cardiovascular: cardiomyopathy, hypertension",
        "Cancer: oesophageal, liver, breast",
        "Mental wellbeing: depression, anxiety, psychosis",
        "Pancreatitis, gastritis, neuropathy",
        "Accidents and injuries (falls, RTAs, violence)",
      ],
      cultural_idioms_of_distress: [
        "'Tella' (ጠላ) – Traditional honey beer",
        "'Tej' (ጠጅ) – Traditional mead (honey wine)",
        "'Araki' (አራቂ) – Distilled spirits",
      ],
      risk_factors: [
        "Cultural acceptance (Tella, Tej are traditional drinks)",
        "Poverty and unemployment",
        "Mental wellbeing conditions (depression, PTSD)",
        "Family history of alcohol use disorder",
        "Peer pressure",
      ],
      ethiopian_context: [
        "Traditional alcohol is widely consumed; commercial alcohol is also popular in urban areas",
        "Alcohol is often used in social and religious ceremonies",
        "Harm reduction (reducing consumption) may be more culturally acceptable than abstinence",
      ],
      management: [
        "Detoxification under medical supervision for severe withdrawal",
        "CBT for substance use",
        "12‑step programs or community support groups",
        "Pharmacotherapy: Naltrexone, Acamprosate, Disulfiram (under specialist care)",
        "Address comorbid mental wellbeing conditions",
        "Family therapy and community support",
      ],
      severity: "moderate to severe",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },

    suicidality: {
      id: "suicidality",
      name: "Suicide Risk & Self‑Harm (ራስን መግደል ስጋት)",
      description: "Behaviour with potential to cause death or injury, including suicidal ideation, plans, attempts, and non‑suicidal self‑injury",
      physiological_symptoms: [
        "Suicidal ideation (thoughts about ending one's life)",
        "Suicidal plans (method, time, place)",
        "Suicidal attempts (past attempts are the strongest risk factor)",
        "Non‑suicidal self‑injury (cutting, burning) – often a maladaptive coping strategy",
        "Feelings of hopelessness, worthlessness, being trapped",
        "Withdrawal from social connections",
        "Giving away possessions",
      ],
      risk_factors: [
        "Mental wellbeing conditions (depression, bipolar, PTSD, schizophrenia)",
        "Substance use (khat, alcohol)",
        "Previous suicide attempts",
        "Family history of suicide",
        "Chronic pain or terminal illness",
        "Social isolation, unemployment, poverty",
        "Trauma, abuse, conflict, displacement",
      ],
      cultural_idioms_of_distress: [
        "'Mota Fikir' (ሞት ፍቅር) – Feeling that death is the only escape",
        "'Ye-Ferag Mota' (የፍራግ ሞት) – Fearful death (anxiety about dying)",
      ],
      ethiopian_context: [
        "Suicide is highly stigmatised; it may be seen as 'shameful' or 'sinful', leading to under‑reporting",
        "It is also illegal in Ethiopia (attempted suicide is criminalised)",
        "Traditional healers (Debtera, Zar) may be consulted, but this can delay life‑saving care",
        "Community support (Iddir, family) is protective but can also be a source of stigma",
      ],
      management: [
        "Immediate risk assessment (ask directly about suicidal thoughts and plans)",
        "Remove means of self‑harm (medications, weapons)",
        "Crisis counselling and safety planning",
        "Urgent mental wellbeing assessment (Amanuel, psychiatric department)",
        "Family involvement and support",
        "Community awareness to reduce stigma and encourage help‑seeking",
        "Follow‑up: chronic risk requires long‑term care",
      ],
      severity: "critical",
      sources: ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
    },
  };

  // -------------------------------------------------------------------------
  // CHILD & ADOLESCENT MENTAL wellbeing
  // -------------------------------------------------------------------------
  private childAdolescentMentalwellbeing = {
    adhd: {
      id: "adhd",
      name: "Attention‑Deficit / Hyperactivity Disorder (ADHD)",
      description: "Persistent pattern of inattention and/or hyperactivity‑impulsivity interfering with functioning or development",
      icd11_code: "6A05",
      physiological_symptoms: [
        "Inattention: difficulty sustaining attention, easily distracted, forgetful, avoids tasks requiring sustained effort",
        "Hyperactivity: fidgeting, leaving seat, running about excessively, difficulty playing quietly",
        "Impulsivity: blurting out answers, difficulty waiting turn, interrupting others",
      ],
      cultural_idioms_of_distress: [
        "'Ye-Lij Mefetash' (የልጅ መፈታሽ) – Child restlessness / disobedient",
      ],
      risk_factors: [
        "Genetics (family history)",
        "Prenatal complications, maternal smoking/alcohol",
        "Low birth weight",
        "Lead exposure",
      ],
      ethiopian_context: [
        "Often mislabelled as 'bad behaviour' or 'disobedience'",
        "Underdiagnosed due to lack of specialist services for children",
        "Cultural discipline may be harsh, exacerbating behavioural problems",
      ],
      management: [
        "Behavioural therapy for the child and parent training",
        "School support and classroom accommodations",
        "Pharmacotherapy: methylphenidate or atomoxetine (limited availability)",
        "Psychoeducation for parents and teachers",
      ],
      severity: "moderate",
      sources: ["WHO mhGAP - Child and Adolescent"],
    },

    conduct_disorder: {
      id: "conduct_disorder",
      name: "Conduct Disorder (የባህሪ መረበሽ)",
      description: "Repetitive and persistent pattern of behaviour violating the rights of others or age‑appropriate social norms",
      icd11_code: "6C90",
      physiological_symptoms: [
        "Aggression to people and animals",
        "Destruction of property",
        "Deceitfulness or theft",
        "Serious violations of rules (truancy, running away)",
        "Lack of empathy or remorse",
      ],
      risk_factors: [
        "Child maltreatment, harsh discipline",
        "Family dysfunction, parental substance use",
        "Poverty, neighbourhood violence",
        "Peer influence",
      ],
      ethiopian_context: [
        "May be seen as 'evil' or 'cursed' rather than a treatable condition",
        "Community elders may be consulted, which can delay psychiatric care",
      ],
      management: [
        "Parent management training",
        "Cognitive‑behavioural therapy (CBT) for the child",
        "Address family dysfunction and environmental stressors",
        "Psychoeducation for families",
      ],
      severity: "moderate to severe",
      sources: ["WHO mhGAP - Child and Adolescent"],
    },

    developmental_delay: {
      id: "developmental_delay",
      name: "Global Developmental Delay",
      description: "Significant delay in two or more developmental domains (motor, language, social, cognitive)",
      icd11_code: "6A00",
      physiological_symptoms: [
        "Delayed milestones: sitting, walking, talking",
        "Poor social interaction, lack of eye contact",
        "Limited play skills",
        "Cognitive impairment (IQ < 70)",
      ],
      risk_factors: [
        "Malnutrition (stunting, anaemia)",
        "Intrauterine infections (TORCH)",
        "Prematurity, low birth weight",
        "Iodine deficiency",
        "Environmental deprivation",
      ],
      ethiopian_context: [
        "Malnutrition is a major contributor to developmental delay",
        "Iodine deficiency in highland areas contributes to cognitive impairment",
        "Early intervention services are scarce",
      ],
      management: [
        "Early childhood stimulation (play, communication)",
        "Nutritional rehabilitation (protein, iron, iodine)",
        "Special education and therapy (speech, occupational)",
        "Family support and psychoeducation",
      ],
      severity: "moderate to severe",
      sources: ["WHO mhGAP - Child and Adolescent", "EPHI Nutrition Data"],
    },
  };

  // -------------------------------------------------------------------------
  // COPING MECHANISMS & RESILIENCE
  // -------------------------------------------------------------------------
  private copingMechanisms = {
    problem_focused_coping: {
      id: "problem_focused_coping",
      name: "Problem‑Focused Coping",
      description: "Directly addressing the source of stress through planning, action, and information‑seeking",
      strategies: [
        "Identifying the specific problem and its causes",
        "Developing a step‑by‑step action plan",
        "Seeking information and advice from trusted sources",
        "Taking decisive action to resolve or mitigate the problem",
        "Evaluating outcomes and adjusting approach",
      ],
      ethiopian_context: [
        "Common in Ethiopian culture through community problem‑solving (Iddir, Iqub)",
        "Elders often play a key role in mediating and problem‑solving",
        "Collective decision‑making is valued over individual action",
      ],
      effectiveness: "High for concrete, controllable stressors; may be less effective for uncontrollable stressors",
    },

    emotion_focused_coping: {
      id: "emotion_focused_coping",
      name: "Emotion‑Focused Coping",
      description: "Managing emotional responses to stress through social support, emotional expression, and relaxation",
      strategies: [
        "Seeking social support (family, friends, community)",
        "Emotional expression (talking about feelings, crying, art)",
        "Relaxation and mindfulness (breathing, meditation, prayer)",
        "Acceptance and reappraisal (changing perspective on the stressor)",
        "Engaging in pleasurable activities (sports, music, cooking)",
      ],
      ethiopian_context: [
        "Community support (Iddir, Mahber) provides strong emotional containment",
        "Spiritual practices (prayer, church, mosque) are central to emotion‑focused coping",
        "Coffee ceremony (Buna) is a daily ritual for emotional debriefing",
        "Zar ceremonies provide community‑based emotional release",
      ],
      effectiveness: "High for uncontrollable stressors (chronic illness, loss); may delay problem‑solving if used exclusively",
    },

    community_coping: {
      id: "community_coping",
      name: "Community‑Based Coping (Iddir, Iqub, Mahber)",
      description: "Traditional Ethiopian social institutions that provide mutual support, financial security, and emotional containment",
      institutions: [
        "Iddir (እድር) – Community funeral and welfare association providing bereavement support and financial safety nets",
        "Iqub (እቁብ) – Rotating savings and credit association (ROSCA) mitigating catastrophic economic stress",
        "Mahber (ማህበር) – Faith‑based mutual support circles meeting monthly for shared meals, fellowship, and spiritual solidarity",
        "Senbete (ሰንበት) – Weekly church‑based community gatherings",
      ],
      scientific_relevance: [
        "Strong affiliation with traditional mutual support institutions correlates with significant protection against social isolation and suicidal ideation",
        "These institutions provide practical and emotional support, reducing the burden of stress",
        "They are culturally acceptable and non‑stigmatising",
      ],
      ethiopian_context: [
        "Iddir is present in almost every Ethiopian community; it is a powerful source of social capital",
        "Iqub provides financial resilience, preventing catastrophic economic shocks",
        "Mahber and Senbete offer spiritual and emotional support, reducing loneliness",
      ],
      recommendations: [
        "Engage actively with trusted community elders, family circles, or Iddir mutual support",
        "Use Iqub for financial planning to reduce economic stress",
        "Participate in Mahber or church gatherings for spiritual and emotional support",
      ],
      sources: ["Ethiopian Journal of wellbeing Development", "Social Capital Studies"],
    },

    spiritual_coping: {
      id: "spiritual_coping",
      name: "Spiritual & Religious Coping",
      description: "Using prayer, fasting, and spiritual practices to manage distress",
      strategies: [
        "Prayer (Orthodox, Islamic, Traditional)",
        "Fasting (Tsome, Ramadan)",
        "Holy water (Tsebel) bathing",
        "Consultation with Debtera or religious leaders",
        "Reading scripture and religious texts",
        "Confession (Metsehat) for psychological release",
      ],
      ethiopian_context: [
        "Spirituality is deeply embedded in Ethiopian culture (Orthodox Christianity and Islam)",
        "Many Ethiopians turn to spiritual leaders before seeking medical care",
        "Fasting is a powerful spiritual and physical practice that can also reduce psychological distress",
      ],
      effectiveness: "High for meaning‑making and coping with loss/illness; may delay medical care if used exclusively",
      recommendations: [
        "Integrate spiritual practices into a comprehensive coping plan",
        "Encourage balance between spiritual and medical care",
        "Engage religious leaders in wellbeing education",
      ],
      sources: ["Ethiopian Journal of wellbeing Development"],
    },
  };

  // -------------------------------------------------------------------------
  // ETHIOPIAN MENTAL health SERVICES & POLICY
  // -------------------------------------------------------------------------
  private mentalwellbeingServices = {
    amanel_hospital: {
      name: "Amanuel Mental Specialized Hospital",
      description: "Ethiopia's only dedicated psychiatric hospital, located in Addis Ababa",
      services: [
        "Outpatient psychiatry (adults, children, adolescents)",
        "Inpatient psychiatric care (acute, chronic)",
        "Emergency psychiatric services (crisis intervention)",
        "Community mental wellbeing outreach",
        "Training for psychiatric nurses and residents",
        "Substance use disorder treatment",
        "Forensic psychiatry",
      ],
      capacity: "Over 300 beds, over 10,000 outpatient visits annually",
      challenges: [
        "Staff shortage (few psychiatrists, psychiatric nurses)",
        "Long waiting times",
        "Limited resources and medications",
        "Stigma discourages help‑seeking",
      ],
      ethiopian_context: "Amanuel is the national referral centre; most mental health care in Ethiopia is provided at primary care level (WHO mhGAP)",
      sources: ["Amanuel Mental Specialized Hospital Annual Report"],
    },

    who_mhgap: {
      name: "WHO mhGAP (Mental wellbeing Gap Action Programme)",
      description: "World health Organization programme to scale up mental health care in low‑resource settings",
      key_interventions: [
        "Training primary care workers to diagnose and manage mental wellbeing conditions",
        "Mental wellbeing screening and risk assessment",
        "Community‑based mental health services",
        "Psychosocial support",
        "Essential psychotropic medication availability",
      ],
      ethiopian_context: [
        "mhGAP has been implemented in Ethiopia since 2014",
        "Over 10,000 primary health care workers trained",
        "Mental health services are now available in health centres across many regions",
        "Stigma reduction campaigns have been integrated",
      ],
      challenges: [
        "Limited follow‑up and continuity of care",
        "Inadequate referral systems",
        "Shortage of medications at primary care level",
      ],
      sources: ["WHO mhGAP Ethiopia Report"],
    },

    national_mental_wellbeing_strategy: {
      name: "National Mental wellbeing Strategy (Ethiopia)",
      description: "Government strategy for mental wellbeing policy and service development",
      pillars: [
        "Strengthening mental wellbeing governance and financing",
        "Integrating mental wellbeing into primary health care",
        "Ensuring access to psychotropic medications",
        "Community‑based mental health services",
        "Mental wellbeing promotion and prevention",
        "Human rights and anti‑stigma campaigns",
      ],
      targets: [
        "Increase coverage of mental health services to 80% of districts by 2025",
        "Reduce treatment gap to 50% by 2025",
        "Increase availability of psychotropic medications at primary care level",
      ],
      ethiopian_context: "The strategy aligns with the wellbeing Sector Transformation Plan (HSTP‑II)",
      sources: ["Federal Ministry of health - National Mental wellbeing Strategy"],
    },
  };

  // -------------------------------------------------------------------------
  // TRADITIONAL HEALING & MENTAL wellbeing
  // -------------------------------------------------------------------------
  private traditionalHealingMentalwellbeing = {
    debtera_healing: {
      name: "Debtera (ደብተራ) – Spiritual Scholars & Healers",
      description: "Literate clerical scholars with knowledge of healing scrolls, spiritual counseling, and exorcism",
      practices: [
        "Healing scrolls (Kitabe) with prayers, biblical verses, and herbal remedies",
        "Holy water (Tsebel) healing for mental and spiritual distress",
        "Exorcism for spirit possession (often misdiagnosed as psychosis)",
        "Astrological consultation for mental wellbeing timing",
        "Writing of protective amulets",
      ],
      mental_wellbeing_relevance: [
        "Provides spiritual comfort and psychological support",
        "Often consulted for conditions like PTSD, depression, and schizophrenia",
        "May delay access to biomedical care for severe mental illness",
      ],
      integration_opportunities: [
        "Collaborate with Debtera for culturally sensitive psychosocial support",
        "Train Debtera in mental wellbeing first aid and referral pathways",
        "Integrate Debtera into community mental wellbeing programmes",
      ],
      sources: ["Ethiopian Heritage Authority", "Institute of Ethiopian Studies"],
    },

    zar_healing: {
      name: "Zar Practitioners – Spirit Healing Ceremonies",
      description: "Traditional healers specialising in Zar spirit possession diagnoses and healing rituals",
      practices: [
        "Spirit possession diagnosis through ritual drumming and dance",
        "Ceremonial healing to pacify spirits causing illness",
        "Community healing rituals involving music, incense, and animal sacrifice",
        "Use of coloured cloth, special garments, and symbolic objects",
      ],
      mental_wellbeing_relevance: [
        "Provides psychosocial catharsis and community support",
        "Often consulted for chronic unexplained illness, anxiety, and PTSD",
        "May be a source of community validation and belonging",
      ],
      integration_opportunities: [
        "Acknowledge Zar as a culturally meaningful practice",
        "Encourage psychological evaluation alongside Zar ceremonies for persistent symptoms",
        "Integrate Zar practitioners into mental wellbeing awareness programmes",
      ],
      sources: ["Ethiopian Journal of wellbeing Development"],
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

  private getAge(userProfile: UserProfile): number | undefined {
    return userProfile.age || userProfile.wellbeing?.age;
  }

  private isPregnant(userProfile: UserProfile): boolean {
    return userProfile.pregnant || userProfile.wellbeing?.pregnant || false;
  }

  private hasTraumaHistory(userProfile: UserProfile): boolean {
    return userProfile.mentalwellbeing?.traumaHistory || userProfile.traumaHistory || false;
  }

  private hasSubstanceUse(userProfile: UserProfile): boolean {
    return (
      userProfile.substanceUse?.some((s) => s.includes("khat") || s.includes("alcohol")) ||
      userProfile.mentalwellbeing?.substanceUse === true
    );
  }

  // -------------------------------------------------------------------------
  // Main query method
  // -------------------------------------------------------------------------
  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const age = this.getAge(userProfile);
    const pregnant = this.isPregnant(userProfile);
    const traumaHistory = this.hasTraumaHistory(userProfile);
    const substanceUse = this.hasSubstanceUse(userProfile);

    // ---- 1. Mental wellbeing Conditions ----
    for (const [key, condition] of Object.entries(this.mentalwellbeingConditions) as [string, any][]) {
      let score = 0;
      const matches: string[] = [];

      if (
        normalized.includes(key) ||
        condition.name.toLowerCase().includes(normalized) ||
        this.hasAlias(normalized, key as keyof typeof this.queryAliases)
      ) {
        score += 35;
        matches.push("condition_direct_match");
      }

      // Cultural idiom matching
      for (const idiom of condition.cultural_idioms_of_distress || []) {
        if (normalized.includes(idiom.toLowerCase().substring(0, 15))) {
          score += 25;
          matches.push("cultural_idiom_match");
        }
      }

      // Risk factor matching from user profile
      if (traumaHistory && (key === "ptsd" || key === "depression_major" || key === "anxiety_generalized")) {
        score += 20;
        matches.push("user_trauma_history");
      }

      if (substanceUse && (key === "substance_use_disorder_khat" || key === "substance_use_disorder_alcohol")) {
        score += 30;
        matches.push("user_substance_use");
      }

      if (pregnant && (key === "depression_major")) {
        score += 20;
        matches.push("user_pregnant");
      }

      if (age !== undefined) {
        if (age < 18 && key === "suicidality") {
          score += 15;
          matches.push("user_youth");
        }
        if (age > 60 && (key === "depression_major" || key === "anxiety_generalized")) {
          score += 15;
          matches.push("user_elderly");
        }
      }

      // Keyword scoring
      for (const term of terms) {
        if (condition.physiological_symptoms?.some((s: string) => s.toLowerCase().includes(term))) {
          score += 20;
          matches.push(`symptom_${term}`);
        }
        if (condition.risk_factors?.some((r: string) => r.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`risk_${term}`);
        }
        if (condition.ethiopian_context?.some((c: string) => c.toLowerCase().includes(term))) {
          score += 10;
          matches.push(`ethio_${term}`);
        }
      }

      if (score > 15) {
        const isCritical = key === "suicidality" || key === "ptsd" || key === "schizophrenia";

        results.push({
          type: "psychological_condition",
          strand: this.strandName,
          domain: "wellbeing",
          name: condition.name.toUpperCase(),
          description: `${condition.description} [ICD-11: ${condition.icd11_code || "N/A"}]`,
          evidence: `Scientific symptoms: ${condition.physiological_symptoms?.join("; ") || "N/A"}. Risk factors: ${condition.risk_factors?.join("; ") || "N/A"}.`,
          ethiopian_context: condition.ethiopian_context?.join("; ") || "Ethiopian mental wellbeing context",
          relevanceScore: Math.min(score / 60, 0.98),
          confidence: 0.92,
          matches,
          recommendations: condition.management || [],
          management: condition.management || [],
          sources: condition.sources || ["Amanuel Mental Specialized Hospital", "WHO mhGAP"],
          category: "Domain A",
          severity: isCritical ? "critical" : condition.severity || "moderate",
          risk_assessment: {
            level: isCritical ? "critical" : score > 40 ? "high" : "moderate",
            risk_factors: condition.risk_factors?.slice(0, 3) || [],
            recommendations: condition.management?.slice(0, 3) || [],
          },
        });
      }
    }

    // ---- 2. Child & Adolescent Mental wellbeing ----
    if (age !== undefined && age < 18) {
      for (const [key, condition] of Object.entries(this.childAdolescentMentalwellbeing) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (
          normalized.includes(key) ||
          condition.name.toLowerCase().includes(normalized)
        ) {
          score += 30;
          matches.push("child_mental_match");
        }

        for (const term of terms) {
          if (condition.physiological_symptoms?.some((s: string) => s.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`symptom_${term}`);
          }
          if (condition.ethiopian_context?.some((c: string) => c.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "child_adolescent_mental_wellbeing",
            strand: this.strandName,
            domain: "wellbeing",
            name: condition.name.toUpperCase(),
            description: `${condition.description} [ICD-11: ${condition.icd11_code || "N/A"}]`,
            evidence: `Scientific symptoms: ${condition.physiological_symptoms?.join("; ") || "N/A"}. Risk factors: ${condition.risk_factors?.join("; ") || "N/A"}.`,
            ethiopian_context: condition.ethiopian_context?.join("; ") || "Ethiopian child mental wellbeing context",
            relevanceScore: Math.min(score / 50, 0.90),
            confidence: 0.85,
            matches,
            recommendations: condition.management || [],
            management: condition.management || [],
            sources: condition.sources || ["WHO mhGAP - Child and Adolescent"],
            category: "Domain A",
            severity: condition.severity || "moderate",
          });
        }
      }
    }

    // ---- 3. Coping Mechanisms & Resilience (Domain B) ----
    if (this.hasAlias(normalized, "coping") || normalized.includes("support") || normalized.includes("resilience") || normalized.includes("community")) {
      for (const [key, coping] of Object.entries(this.copingMechanisms) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || coping.name.toLowerCase().includes(normalized)) {
          score += 30;
          matches.push("coping_match");
        }

        for (const term of terms) {
          if (coping.strategies?.some((s: string) => s.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`strategy_${term}`);
          }
          if (coping.ethiopian_context?.some((c: string) => c.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "coping_mechanism",
            strand: this.strandName,
            domain: "cultural",
            name: coping.name.toUpperCase(),
            description: coping.description,
            evidence: `Strategies: ${coping.strategies?.join("; ") || "N/A"}. Effectiveness: ${coping.effectiveness || "N/A"}.`,
            ethiopian_context: coping.ethiopian_context?.join("; ") || "Ethiopian coping traditions",
            relevanceScore: Math.min(score / 50, 0.88),
            confidence: 0.85,
            matches,
            recommendations: coping.recommendations || [],
            management: coping.recommendations || [],
            sources: coping.sources || ["Ethiopian Journal of wellbeing Development"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 4. Mental health Services (Domain A) ----
    if (normalized.includes("service") || normalized.includes("hospital") || normalized.includes("treatment") || normalized.includes("psychiatry") || normalized.includes("amanuel")) {
      for (const [key, service] of Object.entries(this.mentalwellbeingServices) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || service.name.toLowerCase().includes(normalized)) {
          score += 30;
          matches.push("service_match");
        }

        for (const term of terms) {
          if (service.services?.some((s: string) => s.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`service_${term}`);
          }
          if (service.ethiopian_context?.some((c: string) => c.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "mental_wellbeing_service",
            strand: this.strandName,
            domain: "wellbeing",
            name: service.name.toUpperCase(),
            description: service.description,
            evidence: `Services: ${service.services?.join("; ") || "N/A"}. Capacity: ${service.capacity || "N/A"}.`,
            ethiopian_context: service.ethiopian_context?.join("; ") || "",
            relevanceScore: Math.min(score / 50, 0.85),
            confidence: 0.82,
            matches,
            recommendations: service.challenges ? ["Address service challenges through advocacy and policy"] : [],
            management: [],
            sources: service.sources || ["Federal Ministry of health"],
            category: "Domain A",
            severity: "low",
          });
        }
      }
    }

    // ---- 5. Traditional Healing for Mental wellbeing (Domain B) ----
    if (this.hasAlias(normalized, "debtera") || this.hasAlias(normalized, "zar") || normalized.includes("traditional healing") || normalized.includes("spiritual")) {
      for (const [key, healing] of Object.entries(this.traditionalHealingMentalwellbeing) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || healing.name.toLowerCase().includes(normalized)) {
          score += 30;
          matches.push("traditional_healing_match");
        }

        for (const term of terms) {
          if (healing.practices?.some((p: string) => p.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`practice_${term}`);
          }
          if (healing.ethiopian_context?.some((c: string) => c.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`ethio_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "traditional_healing_mental_wellbeing",
            strand: this.strandName,
            domain: "cultural",
            name: healing.name.toUpperCase(),
            description: healing.description,
            evidence: `Practices: ${healing.practices?.join("; ") || "N/A"}.`,
            ethiopian_context: healing.ethiopian_context?.join("; ") || "Traditional Ethiopian healing practices",
            relevanceScore: Math.min(score / 50, 0.82),
            confidence: 0.80,
            matches,
            recommendations: healing.integration_opportunities || [],
            management: healing.integration_opportunities || [],
            sources: healing.sources || ["Ethiopian Heritage Authority"],
            category: "Domain B",
            severity: "low",
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
   * Get mental wellbeing condition by cultural idiom
   */
  getConditionByCulturalIdiom(idiom: string): string | null {
    const search = idiom.toLowerCase();
    for (const [key, condition] of Object.entries(this.mentalwellbeingConditions) as [string, any][]) {
      if (condition.cultural_idioms_of_distress?.some((i: string) => i.toLowerCase().includes(search))) {
        return condition.name;
      }
    }
    return null;
  }

  /**
   * Get management recommendations for a specific condition
   */
  getManagementForCondition(conditionName: string): string[] {
    const search = conditionName.toLowerCase();
    for (const [key, condition] of Object.entries(this.mentalwellbeingConditions) as [string, any][]) {
      if (condition.name.toLowerCase().includes(search) || key.includes(search)) {
        return condition.management || [];
      }
    }
    return ["Consult a mental health professional for personalised care."];
  }

  /**
   * Get community coping resources
   */
  getCommunityCopingResources(): string[] {
    const resources: string[] = [];
    for (const [key, coping] of Object.entries(this.copingMechanisms) as [string, any][]) {
      if (key === "community_coping") {
        resources.push(...(coping.recommendations || []));
      }
    }
    return resources;
  }

  /**
   * Get mental health services in Ethiopia
   */
  getMentalwellbeingServices(): { name: string; services: string[] }[] {
    const services: { name: string; services: string[] }[] = [];
    for (const [key, service] of Object.entries(this.mentalwellbeingServices) as [string, any][]) {
      services.push({ name: service.name, services: service.services || [] });
    }
    return services;
  }

  /**
   * Get suicide prevention resources
   */
  getSuicidePreventionResources(): string[] {
    return [
      "Immediate risk assessment: ask directly about suicidal thoughts and plans",
      "Remove means of self‑harm (medications, weapons)",
      "Crisis counselling and safety planning",
      "Urgent mental wellbeing assessment (Amanuel Hospital, psychiatric department)",
      "Family involvement and community support",
      "National suicide prevention helpline (if available)",
      "Follow‑up: chronic risk requires long‑term care",
    ];
  }

  /**
   * Get substance use harm reduction advice
   */
  getSubstanceUseHarmReduction(): string[] {
    return [
      "Gradual reduction rather than abrupt cessation (withdrawal can be severe)",
      "Cognitive‑behavioural therapy (CBT) for substance use",
      "Motivational interviewing to enhance readiness to change",
      "Support groups (community‑based, religious organisations)",
      "Address underlying mental wellbeing conditions (depression, anxiety)",
      "For khat: reduce chewing frequency and amount; replace with healthier alternatives",
      "For alcohol: detoxification under medical supervision for severe withdrawal",
      "Naltrexone, Acamprosate, Disulfiram (under specialist care)",
    ];
  }
}