import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile, DomainType } from "../types";

/**
 * Enhanced Socioeconomic Knowledge Strand
 *
 * Integrates:
 * - Demographics (age structure, rural/urban split, ethnic composition, population projections)
 * - Poverty indicators (income levels, multidimensional poverty, regional disparities)
 * - Education factors (literacy rates, enrolment, gender disparities, health literacy)
 * - Employment patterns (agriculture, pastoralism, urban informal, migration)
 * - healthcare access (rural/urban differences, financial barriers, insurance coverage)
 * - Housing & sanitation (quality, water access, sanitation facilities)
 * - Social networks & capital (Iddir, Iqub, Mahber, community trust)
 * - Food security (food insecurity prevalence, seasonal patterns, nutrition programs)
 * - Gender & health (gender-based violence, maternal health, women's empowerment)
 * - Conflict & displacement (IDPs, refugees, conflict-affected populations)
 * - Economic vulnerability (climate shocks, inflation, livelihood diversification)
 * - Cross‑strand linking (Epidemiological, Psychological, Dietary, Ecological)
 * - Domain A (clinical/health) and Domain B (cultural/reflective) tagging
 * - Evidence‑weighted confidence and severity
 * - User‑specific profiling (location, income, education, employment)
 */
export class SocioEconomicKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "socioeconomic";
  readonly domain: DomainType = "wellbeing";

  // --- Alias registry for query expansion ---
  private queryAliases: Record<string, string[]> = {
    // Demographics
    population: ["population", "demographics", "age", "rural", "urban", "ethnic", "migration"],
    // Poverty
    poverty: ["poverty", "poor", "income", "wealth", "economic", "poor", "food insecure"],
    // Education
    education: ["education", "school", "literacy", "enrollment", "teacher", "health literacy"],
    // Employment
    employment: ["job", "work", "employment", "unemployment", "farmer", "pastoralist", "labor", "salary"],
    // healthcare access
    healthcare: ["healthcare", "clinic", "hospital", "doctor", "nurse", "health center", "cost", "insurance", "cbhi"],
    // Housing & sanitation
    housing: ["housing", "shelter", "water", "sanitation", "toilet", "cooking", "smoke", "fuel"],
    // Social networks
    social: ["social", "iddir", "iqub", "mahber", "community", "trust", "support", "elder"],
    // Food security
    food_security: ["food security", "hunger", "starvation", "aid", "nutrition", "wasting", "stunting"],
    // Gender
    gender: ["gender", "women", "girls", "gender‑based violence", "maternal", "empowerment"],
    // Conflict
    conflict: ["conflict", "displacement", "idp", "refugee", "war", "violence", "peace"],
    // Vulnerability
    vulnerability: ["vulnerability", "shock", "drought", "flood", "inflation", "crisis"],
  };

  // -------------------------------------------------------------------------
  // DEMOGRAPHICS
  // -------------------------------------------------------------------------
  private demographics = {
    population_profile: {
      id: "population_profile",
      title: "Ethiopian Population Profile",
      total_population: "Approximately 125 million (2024 estimate)",
      growth_rate: "~2.6% per year",
      age_structure: {
        under_18: "~45%",
        working_age_18_60: "~50%",
        over_60: "~5%",
      },
      rural_urban_split: {
        rural: "~80%",
        urban: "~20% (increasing rapidly)",
      },
      ethnic_groups: [
        "Oromo (~34%)",
        "Amhara (~27%)",
        "Somali (~6%)",
        "Tigray (~6%)",
        "Sidama (~4%)",
        "Gurage (~2%)",
        "Afar (~1.5%)",
        "Hadiya, Kembata, Wolaytta, others (~19%)",
      ],
      religious_affiliation: {
        orthodox: "~43%",
        muslim: "~33%",
        protestant: "~18%",
        traditional: "~3%",
        catholic: "~1%",
        others: "~2%",
      },
      population_projections: {
        "2025": "~128 million",
        "2030": "~145 million",
        "2040": "~175 million",
        "2050": "~210 million",
      },
      wellbeing_implications: [
        "High dependency ratio (45% under 18) places pressure on health and education systems",
        "Rapid urbanisation creates challenges for urban health infrastructure",
        "Young population presents a demographic opportunity but requires investment",
        "Ethnic diversity requires culturally sensitive health programming",
      ],
      recommendations: [
        "Invest in youth health and education to leverage demographic dividend",
        "Strengthen urban health systems to meet growing urban demand",
        "Design culturally adapted health interventions for diverse ethnic groups",
        "Scale up family planning to manage population growth",
      ],
      sources: ["Central Statistical Agency of Ethiopia", "UN Population Division"],
    },
    regional_variations: {
      id: "regional_variations",
      title: "Regional Variations in Population & health",
      regions: [
        {
          name: "Oromia",
          population: "~40 million",
          urban_percentage: "~20%",
          wellbeing_challenges: ["High stunting rates", "Malaria in lowlands", "Maternal mortality"],
        },
        {
          name: "Amhara",
          population: "~22 million",
          urban_percentage: "~20%",
          wellbeing_challenges: ["Goitre (iodine deficiency)", "Stunting", "TB"],
        },
        {
          name: "Tigray",
          population: "~7 million",
          urban_percentage: "~25%",
          wellbeing_challenges: ["Conflict‑related trauma", "Displacement", "Malnutrition"],
        },
        {
          name: "Somali",
          population: "~8 million",
          urban_percentage: "~15%",
          wellbeing_challenges: ["Malaria", "Leishmaniasis", "Drought and food insecurity"],
        },
        {
          name: "Afar",
          population: "~2 million",
          urban_percentage: "~12%",
          wellbeing_challenges: ["Heat stress", "Dehydration", "Pastoral health issues"],
        },
        {
          name: "SNNPR / Sidama",
          population: "~20 million",
          urban_percentage: "~18%",
          wellbeing_challenges: ["Schistosomiasis", "Podoconiosis", "Enset-based nutrition"],
        },
        {
          name: "Addis Ababa",
          population: "~5 million",
          urban_percentage: "100%",
          wellbeing_challenges: ["Air pollution", "NCDs (hypertension, diabetes)", "HIV"],
        },
      ],
      recommendations: [
        "Tailor health interventions to regional epidemiological profiles",
        "Strengthen health infrastructure in rapidly growing regions",
        "Address regional disparities in healthcare access",
      ],
      sources: ["Central Statistical Agency", "EPHI Regional health Profiles"],
    },
  };

  // -------------------------------------------------------------------------
  // POVERTY INDICATORS
  // -------------------------------------------------------------------------
  private povertyIndicators = {
    national_poverty: {
      id: "national_poverty",
      title: "National Poverty Profile",
      description: "Ethiopia remains one of the poorest countries in Africa, with significant regional disparities",
      poverty_metrics: {
        headcount_ratio: "~20-25% (national poverty line)",
        extreme_poverty: "~10-15% (less than $2.15/day)",
        multidimensional_poverty_index: "~50% (deprivation in education, health, living standards)",
      },
      regional_disparities: {
        high_poverty: ["Somali", "Afar", "Gambella", "Benishangul-Gumuz"],
        low_poverty: ["Addis Ababa", "Harari", "Dire Dawa"],
      },
      urban_rural_gap: {
        rural_poverty: "~25-30%",
        urban_poverty: "~15-20%",
      },
      wellbeing_implications: [
        "Poverty limits access to healthcare (out‑of‑pocket costs)",
        "Poverty drives malnutrition (food insecurity)",
        "Poverty is associated with higher rates of communicable diseases",
        "Poverty limits health literacy and health‑seeking behaviour",
      ],
      recommendations: [
        "Expand social protection programmes (Productive Safety Net Programme - PSNP)",
        "Invest in poverty‑reduction strategies (agriculture, infrastructure, education)",
        "Scale up Community‑Based health Insurance (CBHI) for the poor",
        "Target health interventions to high‑poverty regions",
      ],
      sources: ["World Bank Ethiopia Poverty Assessment", "UNDP Multidimensional Poverty Index"],
    },
    income_inequality: {
      id: "income_inequality",
      title: "Income Inequality & Wealth Distribution",
      description: "Income inequality is significant, with large gaps between urban and rural, and richest and poorest",
      gini_coefficient: "~0.35-0.40 (moderate inequality)",
      wealth_disparities: [
        "Richest 10% hold ~40% of national income",
        "Poorest 40% hold ~15% of national income",
      ],
      urban_rural_gap: {
        per_capita_income: "Urban ~3x rural",
        asset_ownership: "Urban households have significantly more assets",
      },
      wellbeing_implications: [
        "Inequality drives unequal health outcomes",
        "Poorer populations have higher disease burden and lower healthcare utilisation",
        "Inequality reduces social cohesion and trust",
      ],
      recommendations: [
        "Progressive taxation and social protection to reduce inequality",
        "Invest in rural infrastructure and livelihoods",
        "Promote inclusive economic growth",
      ],
      sources: ["World Bank Ethiopia", "UNDP"],
    },
  };

  // -------------------------------------------------------------------------
  // EDUCATION FACTORS
  // -------------------------------------------------------------------------
  private educationFactors = {
    literacy_rates: {
      id: "literacy_rates",
      title: "Literacy & Education Levels",
      description: "Literacy rates have improved but remain low, especially in rural areas and among women",
      adult_literacy: {
        total: "~50-60%",
        male: "~60-70%",
        female: "~40-50%",
      },
      youth_literacy: {
        total: "~70-80%",
        male: "~75-85%",
        female: "~65-75%",
      },
      school_enrolment: {
        primary_net_enrolment: "~85-90%",
        secondary_net_enrolment: "~30-35%",
        tertiary_enrolment: "~8-10%",
      },
      gender_disparity: [
        "Girls have lower enrolment and higher drop‑out rates, especially in rural areas",
        "Early marriage and pregnancy are major barriers to girls' education",
        "Cultural norms and household chores limit girls' school attendance",
      ],
      wellbeing_implications: [
        "Low maternal education is associated with higher child mortality and malnutrition",
        "health literacy is low, limiting disease prevention and health‑seeking behaviour",
        "Education empowers women and improves child health outcomes",
      ],
      recommendations: [
        "Promote girls' education and retention in schools",
        "Integrate health education into school curricula",
        "Adult literacy programmes to improve health literacy",
        "Address barriers to education (poverty, child labour, early marriage)",
      ],
      sources: ["Ministry of Education Ethiopia", "UNESCO"],
    },
    wellbeing_literacy: {
      id: "wellbeing_literacy",
      title: "health Literacy & health Knowledge",
      description: "health literacy is low in many areas, affecting disease prevention and healthcare utilisation",
      wellbeing_knowledge_gaps: [
        "Limited knowledge of HIV prevention and transmission",
        "Poor understanding of malaria prevention",
        "Low awareness of hypertension and diabetes risk factors",
        "Misconceptions about vaccination and traditional vs modern medicine",
        "Limited knowledge of family planning and reproductive health",
      ],
      wellbeing_implications: [
        "Low health literacy delays care‑seeking",
        "Reduces adherence to treatment (e.g., TB, HIV)",
        "Increases risk of preventable diseases",
        "Perpetuates harmful traditional practices",
      ],
      recommendations: [
        "Strengthen health education campaigns (radio, TV, community health workers)",
        "Integrate health literacy into school curricula",
        "Use culturally appropriate communication channels (community leaders, religious institutions)",
        "Empower health Extension Workers (HEWs) to provide health education",
      ],
      sources: ["EPHI health Literacy Studies", "WHO"],
    },
  };

  // -------------------------------------------------------------------------
  // EMPLOYMENT PATTERNS
  // -------------------------------------------------------------------------
  private employmentPatterns = {
    national_employment: {
      id: "national_employment",
      title: "Employment Profile",
      description: "Ethiopia has a predominantly agrarian economy with a growing informal urban sector",
      employment_by_sector: {
        agriculture: "~65-70%",
        services: "~20-25%",
        industry: "~5-10%",
      },
      informal_economy: {
        percentage: "~80-90% of employment is informal",
        characteristics: ["Low wages", "No social protection", "Unstable incomes", "Limited labour rights"],
      },
      unemployment: {
        national: "~5-8% (official)",
        youth: "~15-20% (official, likely higher)",
        urban: "~10-15%",
        rural: "~3-5% (underemployment is high)",
      },
      wellbeing_implications: [
        "Agricultural employment exposes workers to pesticides, ergonomic risks, and zoonotic diseases",
        "Informal sector workers lack health insurance and social protection",
        "Unemployment and underemployment drive poverty and stress",
      ],
      recommendations: [
        "Strengthen social protection (health insurance, social security) for informal workers",
        "Improve occupational health and safety in agriculture and industry",
        "Create decent employment opportunities, especially for youth",
        "Support livelihood diversification and skills training",
      ],
      sources: ["Central Statistical Agency", "World Bank Ethiopia Employment Report"],
    },
    agricultural_employment: {
      id: "agricultural_employment",
      title: "Agriculture & Livelihoods",
      description: "Agriculture is the backbone of the Ethiopian economy, employing the majority of the population",
      smallholder_farming: {
        percentage: "~90% of agricultural output",
        characteristics: ["Rain‑fed", "Subsistence", "Limited mechanisation", "Vulnerable to climate shocks"],
      },
      pastoralism: {
        percentage: "~10-15% of the population",
        regions: ["Afar", "Somali", "Southern Ethiopia"],
        characteristics: ["Mobility-based livestock production", "Vulnerable to drought", "Limited access to health and education"],
      },
      wellbeing_implications: [
        "Agricultural labour is physically demanding and associated with injuries and ergonomic disorders",
        "Pesticide exposure causes acute and chronic health problems",
        "Pastoralists have limited healthcare access due to mobility",
        "Zoonotic diseases (e.g., anthrax, brucellosis) are common in pastoral areas",
      ],
      recommendations: [
        "Promote safe use of pesticides and protective equipment",
        "Strengthen veterinary services to prevent zoonotic diseases",
        "Improve access to healthcare for pastoralist communities",
        "Support agricultural diversification and value addition",
      ],
      sources: ["Ministry of Agriculture", "FAO"],
    },
    urban_employment: {
      id: "urban_employment",
      title: "Urban Employment & Informal Sector",
      description: "Urbanisation is rapidly increasing, with a growing informal economy",
      urban_employment_sectors: {
        trade: "~30%",
        manufacturing: "~15%",
        construction: "~10%",
        services: "~40%",
        others: "~5%",
      },
      informal_employment: {
        percentage: "~80% of urban employment",
        examples: ["Street vending", "Small‑scale trading", "Day labour", "Domestic work"],
      },
      wellbeing_implications: [
        "Informal workers lack health insurance and social protection",
        "Working conditions are often hazardous (pollution, unsafe buildings)",
        "Stress and mental health issues are common in informal urban settings",
      ],
      recommendations: [
        "Extend health insurance and social protection to informal workers",
        "Improve occupational health and safety in informal workplaces",
        "Provide skills training and support for formalisation",
      ],
      sources: ["Central Statistical Agency", "World Bank Ethiopia"],
    },
  };

  // -------------------------------------------------------------------------
  // healthCARE ACCESS
  // -------------------------------------------------------------------------
  private healthcareAccess = {
    rural_wellbeing_extension_tier: {
      id: "rural_wellbeing_extension_tier",
      category: "Rural Primary healthcare Tier",
      infrastructure: "Kebele health Posts staffed by health Extension Workers (HEWs), linked to Woreda health Centers",
      barriers: [
        "Geographic distance: primary health posts or centres frequently require walking 5–15+ kilometres across rugged terrain",
        "Limited diagnostic equipment (reliance on rapid diagnostic tests RDTs, lack of automated biochemistry or ultrasound)",
        "Supply chain interruptions in essential antibiotics, antimalarials, and oxytocin",
        "Limited availability of skilled health professionals (doctors, nurses) in rural areas",
        "Transport barriers: lack of ambulances and poor road networks",
      ],
      strengths: [
        "health Extension Program (HEP) provides localised doorstep immunisations, family planning, hygiene education, and malaria screening",
        "Community‑based health insurance (CBHI) is expanding in rural areas",
        "health Extension Workers are trusted community members",
      ],
      ethiopian_context: [
        "Serves approximately 80% of the Ethiopian population living in rural agricultural or pastoralist communities",
        "The health Extension Program is a global model for community‑based primary healthcare",
      ],
      recommendations: [
        "Utilise local Kebele health Extension Workers for initial malaria and child nutrition triage",
        "Plan early transport arrangements for labour or acute medical emergencies before clinical deterioration",
        "Enrol in Community‑Based health Insurance (CBHI) to reduce out‑of‑pocket costs",
        "Attend health education sessions provided by HEWs",
      ],
      sources: ["Ethiopian Ministry of health - health Sector Transformation Plan (HSTP)", "World Bank Ethiopia Poverty & Social Assessment"],
    },
    urban_tertiary_tier: {
      id: "urban_tertiary_tier",
      category: "Urban Tertiary & Specialised healthcare Tier",
      infrastructure: "Specialised teaching and referral hospitals (Tikur Anbessa, St. Paul's Millennium Medical College, Zewditu Memorial, regional teaching hospitals) and private clinics",
      barriers: [
        "High patient volume, long appointment waitlists, and bed shortages for elective admissions",
        "High out‑of‑pocket expenditure for advanced proprietary pharmaceuticals, CT/MRI imaging, and private laboratory diagnostics",
        "Limited availability of specialised mental health services",
        "Referral system is often bypassed, causing overcrowding at tertiary centres",
      ],
      strengths: [
        "Specialist physician and surgical subspecialties available",
        "Comprehensive blood banking and critical care capabilities",
        "Medical research and training conducted",
      ],
      ethiopian_context: [
        "High concentration of clinical specialists in Addis Ababa, requiring inter‑regional referrals for complex conditions",
        "Private healthcare is expanding but remains expensive",
      ],
      recommendations: [
        "Enrol in Community‑Based health Insurance (CBHI) or formal employment health schemes to reduce catastrophic out‑of‑pocket hospital costs",
        "Obtain structured referral slips from primary health centres to expedite tertiary hospital registration",
        "Use private clinics for routine care if affordable, to avoid overcrowded public hospitals",
      ],
      sources: ["Ethiopian Ministry of health", "WHO Ethiopia"],
    },
    wellbeing_insurance: {
      id: "wellbeing_insurance",
      category: "health Insurance Coverage",
      schemes: [
        { name: "Community‑Based health Insurance (CBHI)", coverage: "Rural populations (~50% of rural households)", features: ["Voluntary", "Low premiums", "Covers primary and secondary care"] },
        { name: "Social health Insurance (SHI)", coverage: "Formal sector employees (~5% of population)", features: ["Mandatory", "Employer‑employee contributions", "Covers tertiary care"] },
        { name: "Private Insurance", coverage: "Wealthy urban individuals (~1-2% of population)", features: ["Premiums vary", "Covers private facilities"] },
        { name: "Uninsured", coverage: "~40-50% of population", features: ["Out‑of‑pocket payments", "Catastrophic health expenditure risk"] },
      ],
      barriers: [
        "Limited coverage in rural areas (CBHI still expanding)",
        "High out‑of‑pocket costs for the uninsured",
        "Catastrophic health expenditure is common (pushing families into poverty)",
      ],
      recommendations: [
        "Enrol in CBHI if eligible to reduce healthcare costs",
        "Advocate for health insurance expansion",
        "Seek care at public health facilities which are subsidised",
      ],
      sources: ["Ethiopian health Insurance Agency", "WHO"],
    },
  };

  // -------------------------------------------------------------------------
  // HOUSING & SANITATION
  // -------------------------------------------------------------------------
  private housingSanitation = {
    housing_conditions: {
      id: "housing_conditions",
      title: "Housing & Living Conditions",
      description: "Housing quality varies significantly between urban and rural areas",
      rural_housing: {
        type: "Traditional tukul huts, mud and wattle, grass‑thatched roofs, or corrugated iron",
        characteristics: [
          "Limited ventilation (exacerbates indoor air pollution)",
          "Shared with livestock in some pastoralist settings",
          "Susceptible to weather damage (heavy rains, wind)",
          "Congested (multiple generations sharing one room)",
        ],
      },
      urban_housing: {
        type: "Concrete or mud‑brick houses, often in dense settlements",
        characteristics: [
          "Overcrowding in slum areas",
          "Poor sanitation and drainage",
          "High population density",
          "Many are rented (high cost relative to income)",
        ],
      },
      wellbeing_implications: [
        "Overcrowding increases transmission of respiratory infections and TB",
        "Poor ventilation leads to indoor air pollution (cooking with biomass fuels)",
        "Congested living conditions increase stress and mental health issues",
        "Housing quality is a social determinant of health",
      ],
      recommendations: [
        "Improve housing ventilation (eave spaces, separate kitchen)",
        "Transition to clean cookstoves (Mirt, electric mitad)",
        "Reduce overcrowding where possible",
        "Support affordable housing programmes",
      ],
      sources: ["Central Statistical Agency", "UN‑HABITAT"],
    },
    water_access: {
      id: "water_access",
      title: "Water Access & Quality",
      description: "Access to clean drinking water is limited in many rural areas",
      water_sources: {
        improved: "Protected springs, boreholes, piped water (~60-70% of households)",
        unimproved: "Unprotected wells, rivers, ponds (~30-40% of households)",
      },
      rural_urban_gap: {
        urban_access: "~80-90% improved water",
        rural_access: "~50-60% improved water",
      },
      water_quality: {
        contamination: "Bacterial contamination (E. coli, cholera) common in unprotected sources",
        fluoride: "High fluoride in Rift Valley groundwater causing fluorosis",
      },
      wellbeing_implications: [
        "Water‑borne diseases (diarrhoea, cholera, typhoid) are common",
        "Fluorosis is endemic in the Rift Valley",
        "Water scarcity affects hygiene and sanitation",
      ],
      recommendations: [
        "Treat water (boil, chlorine solution, or filter) before drinking",
        "Use protected water sources where available",
        "Support community‑based water projects",
        "In Rift Valley, use defluoridated water or safe surface water",
      ],
      sources: ["Ministry of Water, Irrigation and Electricity", "WHO/UNICEF JMP"],
    },
    sanitation: {
      id: "sanitation",
      title: "Sanitation & Hygiene",
      description: "Sanitation coverage is low, especially in rural areas",
      sanitation_facilities: {
        improved: "Flush toilets, pit latrines with slab (~30-40% of households)",
        unimproved: "Open defecation, pit latrines without slab (~60-70%)",
      },
      rural_urban_gap: {
        urban_sanitation: "~50-60% improved",
        rural_sanitation: "~20-30% improved",
      },
      open_defecation: {
        prevalence: "~20-30% of population (mainly rural)",
        trends: "Declining due to CLTS (Community‑Led Total Sanitation) campaigns",
      },
      wellbeing_implications: [
        "Open defecation increases risk of diarrhoeal diseases, helminths",
        "Poor sanitation contributes to stunting in children",
        "Hygiene practices (hand washing) are key to preventing infection",
      ],
      recommendations: [
        "Use improved sanitation facilities (latrines with slabs)",
        "Promote hand washing with soap at critical times",
        "Support CLTS campaigns to eliminate open defecation",
        "Improve menstrual hygiene management",
      ],
      sources: ["Ministry of Water, Irrigation and Electricity", "WHO/UNICEF JMP"],
    },
    indoor_air_pollution: {
      id: "indoor_air_pollution",
      category: "Household Energy & Indoor Air Pollution",
      infrastructure: "Household biomass hearths, firewood/charcoal cooking, and rural dwellings",
      barriers: [
        "Biomass indoor cooking fuel (firewood, charcoal, dried dung / Kubet) burned in traditional unventilated tukuls causes severe indoor particulate air pollution (PM2.5)",
        "Chronic domestic smoke inhalation drives childhood pneumonia, chronic bronchitis in women, and cataracts",
        "Variable access to protected water sources in remote zones elevating cyclical waterborne diarrhoeal disease risk",
      ],
      ethiopian_context: [
        "Transition to clean cookstoves ('Mirt' biomass‑saving stove, electric 'Mitad' for baking injera) substantially reduces respiratory disease burden",
      ],
      recommendations: [
        "Ensure continuous ventilation (open eave spaces, separate kitchen huts) during injera baking or hearth cooking",
        "Boil or treat all unverified drinking water with chlorine solution (Wuha Agar)",
      ],
      sources: ["WHO Indoor Air Pollution Guidelines", "Ethiopian Ministry of health - Environmental health"],
    },
  };

  // -------------------------------------------------------------------------
  // SOCIAL NETWORKS & CAPITAL
  // -------------------------------------------------------------------------
  private socialNetworks = {
    iddir: {
      id: "iddir",
      name: "Iddir (እድር) – Community Welfare Association",
      description: "Traditional community funeral and welfare association providing bereavement support and financial safety nets",
      functions: [
        "Financial support for funeral expenses",
        "Emotional support during bereavement",
        "Community solidarity and mutual aid",
        "Conflict resolution through elders",
      ],
      wellbeing_implications: [
        "Reduces psychosocial impact of loss (grief, bereavement)",
        "Financial safety net prevents catastrophic expenditure",
        "Strengthens social capital and trust",
      ],
      ethiopian_context: [
        "Iddir is present in almost every Ethiopian community",
        "Membership is nearly universal in some areas",
        "Provides a powerful buffer against poverty and social isolation",
      ],
      recommendations: [
        "Engage actively with Iddir for social support and financial resilience",
        "Strengthen community‑based health promotion through Iddir networks",
      ],
      sources: ["Ethiopian Journal of health Development", "Social Capital Studies"],
    },
    iqub: {
      id: "iqub",
      name: "Iqub (እቁብ) – Rotating Savings and Credit Association (ROSCA)",
      description: "Traditional rotating savings and credit association mitigating catastrophic economic stress",
      functions: [
        "Members contribute regular amounts and take turns receiving a lump sum",
        "Provides access to capital for emergencies, business, or consumption",
        "Builds community trust and financial discipline",
      ],
      wellbeing_implications: [
        "Reduces financial stress",
        "Enables timely access to healthcare payments",
        "Supports entrepreneurship and livelihoods",
      ],
      ethiopian_context: [
        "Very common in both urban and rural Ethiopia",
        "Often used for household expenses, education, and health emergencies",
        "Strengthens community social ties",
      ],
      recommendations: [
        "Use Iqub for financial planning and emergency savings",
        "Promote financial literacy within Iqub groups",
      ],
      sources: ["Ethiopian Journal of Development Research", "Social Capital Studies"],
    },
    mahber: {
      id: "mahber",
      name: "Mahber (ማህበር) – Faith‑Based Mutual Support Circle",
      description: "Faith‑based mutual support circles meeting monthly for shared meals, fellowship, and spiritual solidarity",
      functions: [
        "Monthly gatherings for prayer, fellowship, and shared meals",
        "Mutual support during illness, loss, or celebration",
        "Spiritual and emotional solidarity",
      ],
      wellbeing_implications: [
        "Reduces social isolation",
        "Provides emotional support and belonging",
        "Strengthens spiritual resilience",
      ],
      ethiopian_context: [
        "Common in Ethiopian Orthodox Christian communities",
        "Often associated with a particular saint or church",
        "Provides a space for community bonding and mutual aid",
      ],
      recommendations: [
        "Participate in Mahber for social and spiritual support",
        "Use Mahber networks for health education and promotion",
      ],
      sources: ["Ethiopian Orthodox Church Studies", "Social Capital Studies"],
    },
  };

  // -------------------------------------------------------------------------
  // FOOD SECURITY
  // -------------------------------------------------------------------------
  private foodSecurity = {
    national_food_security: {
      id: "national_food_security",
      title: "Food Security in Ethiopia",
      description: "Food insecurity remains a significant challenge in Ethiopia, especially in rural areas",
      food_insecure_population: "~10-15 million people (vulnerable to food insecurity)",
      seasonal_patterns: {
        lean_season: "June‑August (pre‑harvest)", // Fixed: August was spelled incorrectly
        post_harvest: "October‑February",
      },
      chronic_food_insecurity: {
        prevalence: "~20-30% of rural households",
        causes: ["Poverty", "Land degradation", "Climate shocks", "Low agricultural productivity"],
      },
      acute_food_insecurity: {
        prevalence: "Variable (droughts, conflicts)",
        causes: ["Drought", "Flooding", "Conflict", "Pest outbreaks (locusts)"],
      },
      nutrition_programmes: {
        Productive_Safety_Net_Programme: "PSNP provides food/cash transfers to food‑insecure households",
        Emergency_Food_Aid: "Provides emergency food assistance during crises",
        School_Feeding: "Provides meals to children in schools",
        Therapeutic_Feeding_Programmes: "Treats severe acute malnutrition",
      },
      wellbeing_implications: [
        "Food insecurity drives malnutrition (stunting, wasting, micronutrient deficiencies)",
        "Food insecurity is associated with stress and mental health issues",
        "Seasonal food insecurity leads to cyclical disease patterns",
      ],
      recommendations: [
        "Participate in productive safety net programmes if eligible",
        "Diversify livelihoods to reduce vulnerability",
        "Promote agricultural productivity and resilience",
        "Support community‑based nutrition programmes",
      ],
      sources: ["WFP Ethiopia", "Ethiopian Public health Institute"],
    },
  };

  // -------------------------------------------------------------------------
  // GENDER & health
  // -------------------------------------------------------------------------
  private genderwellbeing = {
    gender_based_violence: {
      id: "gender_based_violence",
      title: "Gender‑Based Violence (GBV)",
      description: "Gender‑based violence is a significant public health issue in Ethiopia",
      forms: ["Sexual violence", "Domestic violence", "Early marriage", "Female genital mutilation/cutting (FGM/C)"],
      prevalence: {
        domestic_violence: "~30-40% of women have experienced domestic violence",
        early_marriage: "~30-40% of girls married before 18",
        fgm_c: "~60-70% of women have undergone FGM/C",
        sexual_violence: "~10-20% of women have experienced sexual violence",
      },
      wellbeing_implications: [
        "Physical injuries and trauma",
        "Mental health issues (PTSD, depression, anxiety)",
        "Sexual and reproductive health issues",
        "Increased risk of HIV/STIs",
        "Maternal and infant health complications",
      ],
      prevention: [
        "Strengthen legal frameworks and enforcement",
        "Community education and awareness campaigns",
        "Support for survivors (psychosocial, medical, legal)",
        "Economic empowerment of women",
        "Engage men and boys in prevention",
      ],
      recommendations: [
        "Seek support from health facilities, police, or NGOs if experiencing violence",
        "Report GBV to appropriate authorities",
        "Promote gender equality and women's rights",
        "Support survivors with compassionate care",
      ],
      sources: ["UN Women Ethiopia", "WHO Violence Against Women"],
    },
    maternal_wellbeing: {
      id: "maternal_wellbeing",
      title: "Maternal health in Ethiopia",
      description: "Maternal health is a priority, with significant challenges but improving trends",
      indicators: {
        maternal_mortality_ratio: "~412 per 100,000 live births (2020)",
        antenatal_care: "~60-70% (at least 4 visits)",
        skilled_birth_attendance: "~50-60%",
        facility_delivery: "~50-60%",
        postpartum_care: "~30-40%",
      },
      barriers: [
        "Limited access to skilled birth attendants in rural areas",
        "Transport barriers (distance to health facilities)",
        "Financial constraints (cost of delivery, transport)",
        "Cultural norms (home delivery preference)",
        "Limited availability of emergency obstetric care (EmOC)",
      ],
      wellbeing_implications: [
        "High maternal mortality (haemorrhage, eclampsia, sepsis)",
        "High neonatal mortality (asphyxia, preterm, infections)",
        "Maternal malnutrition (anaemia, micronutrient deficiencies)",
      ],
      recommendations: [
        "Attend antenatal care regularly (at least 4 visits)",
        "Deliver at a health facility with skilled birth attendance",
        "Seek emergency care immediately if danger signs appear",
        "Enrol in CBHI to reduce healthcare costs",
        "Support maternal waiting homes near health facilities",
      ],
      sources: ["EPHI Maternal health Reports", "WHO"],
    },
    women_empowerment: {
      id: "women_empowerment",
      title: "Women's Empowerment & health",
      description: "Women's empowerment is key to improving maternal and child health",
      indicators: {
        literacy: "Female literacy ~40-50% (lower than male)",
        employment: "Women's labour force participation ~70-80% (mainly agriculture and informal)",
        decision_making: "Women have limited decision‑making power in many households",
        leadership: "Women are underrepresented in political and economic leadership",
      },
      wellbeing_implications: [
        "Empowered women have better health outcomes for themselves and their children",
        "Women's education is associated with lower child mortality and malnutrition",
        "Women's decision‑making improves household health spending",
      ],
      recommendations: [
        "Promote girls' education and female literacy",
        "Support women's economic empowerment (livelihoods, savings groups)",
        "Encourage women's participation in household decision‑making",
        "Promote women's leadership and political participation",
      ],
      sources: ["UN Women Ethiopia", "World Bank Gender Data"],
    },
  };

  // -------------------------------------------------------------------------
  // CONFLICT & DISPLACEMENT
  // -------------------------------------------------------------------------
  private conflictDisplacement = {
    internal_displacement: {
      id: "internal_displacement",
      title: "Internal Displacement (IDPs)",
      description: "Ethiopia has a significant number of internally displaced persons (IDPs) due to conflict and natural disasters",
      idp_population: "~3-5 million (varies with conflict and drought cycles)",
      causes: [
        "Armed conflict (Tigray, Amhara, Oromia, Benishangul‑Gumuz)",
        "Inter‑ethnic violence",
        "Natural disasters (drought, flooding)",
        "Development projects (land displacement)",
      ],
      wellbeing_implications: [
        "Increased risk of communicable diseases (diarrhoea, malaria, respiratory infections)",
        "Malnutrition (food insecurity in displacement)",
        "Mental health issues (PTSD, depression, anxiety)",
        "Maternal and child health risks (limited healthcare access)",
        "Gender‑based violence (GBV) risk increases in displacement",
        "Limited access to healthcare and essential medicines",
      ],
      recommendations: [
        "Ensure access to clean water, sanitation, and food in IDP camps",
        "Provide emergency healthcare (immunisations, maternal care, treatment of common illnesses)",
        "Offer mental health and psychosocial support (MHPSS)",
        "Prevent and respond to GBV in displacement settings",
        "Support durable solutions (return, local integration, resettlement)",
      ],
      sources: ["UNOCHA Ethiopia", "IOM Ethiopia", "UNHCR"],
    },
    refugee_populations: {
      id: "refugee_populations",
      title: "Refugee Populations in Ethiopia",
      description: "Ethiopia hosts a significant number of refugees, mainly from South Sudan, Somalia, Eritrea, and Sudan",
      refugee_population: "~900,000-1,000,000",
      main_countries_of_origin: ["South Sudan", "Somalia", "Eritrea", "Sudan"],
      camps: ["Gambella (South Sudanese)", "Somali region (Somali)", "Tigray (Eritrean)"],
      wellbeing_implications: [
        "Overcrowded camps increase infectious disease transmission",
        "Limited access to healthcare for chronic conditions",
        "Malnutrition and food insecurity common",
        "Mental health issues (PTSD, trauma) are prevalent",
        "Limited reproductive health services",
      ],
      recommendations: [
        "Ensure access to essential healthcare in refugee camps",
        "Provide culturally appropriate mental health services",
        "Support self‑reliance and livelihoods for refugees",
        "Prevent and respond to GBV in refugee settings",
        "Integrate refugees into national health systems",
      ],
      sources: ["UNHCR Ethiopia", "WHO Ethiopia"],
    },
  };

  // -------------------------------------------------------------------------
  // ECONOMIC VULNERABILITY
  // -------------------------------------------------------------------------
  private economicVulnerability = {
    climate_shocks: {
      id: "climate_shocks",
      title: "Climate Shocks & health",
      description: "Ethiopia is highly vulnerable to climate shocks (drought, flooding, locusts)",
      types: [
        { name: "Drought", frequency: "Recurring (El Niño, La Niña)", impact: "Food insecurity, malnutrition, water scarcity" },
        { name: "Flooding", frequency: "Seasonal (Kiremt rains)", impact: "Water‑borne diseases, displacement, crop damage" },
        { name: "Locusts", frequency: "Occasional", impact: "Crop loss, food insecurity" },
      ],
      wellbeing_implications: [
        "Drought drives acute malnutrition and water‑borne diseases",
        "Flooding increases malaria, diarrhoeal diseases, and cholera",
        "Crop loss leads to food insecurity and nutritional deficiencies",
        "Climate shocks increase stress and mental health issues",
      ],
      recommendations: [
        "Strengthen early warning systems and disaster preparedness",
        "Diversify livelihoods and build resilience (drought‑resistant crops, savings)",
        "Improve water harvesting and irrigation",
        "Support community‑based adaptation programmes",
      ],
      sources: ["National Meteorology Agency", "World Bank Climate and Development"],
    },
    inflation_economic_stress: {
      id: "inflation_economic_stress",
      title: "Economic Stress & health",
      description: "Inflation and economic stress affect health through reduced purchasing power and increased stress",
      inflation_trend: "High (double‑digit) in recent years",
      impacts: [
        "Reduced purchasing power for food and healthcare",
        "Increased food insecurity and malnutrition",
        "Higher stress and mental health issues",
        "Delayed healthcare seeking (cost)",
        "Increased reliance on informal healthcare (traditional healers)",
      ],
      recommendations: [
        "Diversify livelihoods and income sources",
        "Use savings and community support during economic stress",
        "Seek healthcare at subsidised public facilities",
        "Advocate for social protection and price controls",
      ],
      sources: ["World Bank Ethiopia Economic Update"],
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

  private isRural(userProfile: UserProfile): boolean {
    return userProfile.location?.type === "rural" || userProfile.location?.area === "rural" || false;
  }

  private isPregnant(userProfile: UserProfile): boolean {
    return userProfile.pregnant || userProfile.wellbeing?.pregnant || false;
  }

  private getEducationLevel(userProfile: UserProfile): string | undefined {
    return userProfile.education || userProfile.demographics?.education;
  }

  private getEmploymentStatus(userProfile: UserProfile): string | undefined {
    return userProfile.employment || userProfile.demographics?.employment;
  }

  // -------------------------------------------------------------------------
  // Main query method
  // -------------------------------------------------------------------------
  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const region = this.getRegion(userProfile);
    const rural = this.isRural(userProfile);
    const pregnant = this.isPregnant(userProfile);
    const education = this.getEducationLevel(userProfile);
    const employment = this.getEmploymentStatus(userProfile);

    // ---- 1. Demographics ----
    if (this.hasAlias(normalized, "population") || normalized.includes("demographics") || normalized.includes("age")) {
      for (const [key, data] of Object.entries(this.demographics) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized)) {
          score += 30;
          matches.push("demographics_match");
        }

        for (const term of terms) {
          if (data.total_population?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`pop_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (region && data.regions?.some((r: any) => r.name.toLowerCase().includes(region.toLowerCase()))) {
          score += 20;
          matches.push(`region_${region}`);
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_demographics",
            strand: this.strandName,
            domain: "cultural",
            name: data.title.toUpperCase(),
            description: data.total_population ? `Population: ${data.total_population}` : data.description || "Ethiopian demographic profile",
            evidence: `Age structure: Under 18: ${data.age_structure?.under_18 || "N/A"}, Working age: ${data.age_structure?.working_age_18_60 || "N/A"}, Over 60: ${data.age_structure?.over_60 || "N/A"}. Rural: ${data.rural_urban_split?.rural || "N/A"}, Urban: ${data.rural_urban_split?.urban || "N/A"}.`,
            ethiopian_context: data.ethnic_groups ? `Ethnic groups: ${data.ethnic_groups.join(", ")}` : "Ethiopian demographic context",
            relevanceScore: Math.min(score / 50, 0.92),
            confidence: 0.90,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["Central Statistical Agency of Ethiopia", "UN Population Division"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 2. Poverty Indicators ----
    if (this.hasAlias(normalized, "poverty") || normalized.includes("poor") || normalized.includes("income") || normalized.includes("wealth")) {
      for (const [key, data] of Object.entries(this.povertyIndicators) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized) || this.hasAlias(normalized, "poverty")) {
          score += 30;
          matches.push("poverty_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        // Rural poverty: higher likelihood if user is rural
        if (rural && (key === "national_poverty" || key === "income_inequality")) {
          score += 20;
          matches.push("user_rural");
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_poverty",
            strand: this.strandName,
            domain: "wellbeing",
            name: data.title.toUpperCase(),
            description: data.description || "Ethiopian poverty profile",
            evidence: `Poverty headcount: ${data.poverty_metrics?.headcount_ratio || "N/A"}, Extreme poverty: ${data.poverty_metrics?.extreme_poverty || "N/A"}, MPI: ${data.poverty_metrics?.multidimensional_poverty_index || "N/A"}.`,
            ethiopian_context: data.regional_disparities ? `High poverty regions: ${data.regional_disparities.high_poverty?.join(", ") || "N/A"}` : "Ethiopian poverty context",
            relevanceScore: Math.min(score / 50, 0.90),
            confidence: 0.88,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["World Bank Ethiopia Poverty Assessment", "UNDP Multidimensional Poverty Index"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 3. Education Factors ----
    if (this.hasAlias(normalized, "education") || normalized.includes("school") || normalized.includes("literacy") || normalized.includes("health literacy")) {
      for (const [key, data] of Object.entries(this.educationFactors) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized) || this.hasAlias(normalized, "education")) {
          score += 30;
          matches.push("education_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        // User education level
        if (education && data.gender_disparity?.some((d: string) => d.toLowerCase().includes("women"))) {
          score += 15;
          matches.push("user_female");
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_education",
            strand: this.strandName,
            domain: "wellbeing",
            name: data.title.toUpperCase(),
            description: data.description || "Ethiopian education profile",
            evidence: `Adult literacy: ${data.adult_literacy?.total || "N/A"} (Male: ${data.adult_literacy?.male || "N/A"}, Female: ${data.adult_literacy?.female || "N/A"}). Primary enrolment: ${data.school_enrolment?.primary_net_enrolment || "N/A"}.`,
            ethiopian_context: data.gender_disparity ? `Gender disparities: ${data.gender_disparity.join("; ")}` : "Ethiopian education context",
            relevanceScore: Math.min(score / 50, 0.88),
            confidence: 0.85,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["Ministry of Education Ethiopia", "UNESCO"],
            category: "Domain A",
            severity: "low",
          });
        }
      }
    }

    // ---- 4. Employment Patterns ----
    if (this.hasAlias(normalized, "employment") || normalized.includes("job") || normalized.includes("work") || normalized.includes("farmer") || normalized.includes("pastoral")) {
      for (const [key, data] of Object.entries(this.employmentPatterns) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized) || this.hasAlias(normalized, "employment")) {
          score += 30;
          matches.push("employment_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        // User employment
        if (employment && data.employment_by_sector?.agriculture && employment.toLowerCase().includes("agriculture")) {
          score += 20;
          matches.push("user_agriculture");
        }

        if (rural && key === "agricultural_employment") {
          score += 20;
          matches.push("user_rural");
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_employment",
            strand: this.strandName,
            domain: "wellbeing",
            name: data.title.toUpperCase(),
            description: data.description || "Ethiopian employment profile",
            evidence: `Agriculture: ${data.employment_by_sector?.agriculture || "N/A"}, Services: ${data.employment_by_sector?.services || "N/A"}, Industry: ${data.employment_by_sector?.industry || "N/A"}. Informal sector: ${data.informal_economy?.percentage || "N/A"}.`,
            ethiopian_context: data.characteristics ? `Characteristics: ${data.characteristics.join("; ") || "N/A"}` : "Ethiopian employment context",
            relevanceScore: Math.min(score / 50, 0.88),
            confidence: 0.85,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["Central Statistical Agency", "World Bank Ethiopia Employment Report"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 5. healthcare Access ----
    if (this.hasAlias(normalized, "healthcare") || normalized.includes("clinic") || normalized.includes("hospital") || normalized.includes("doctor") || normalized.includes("cost") || normalized.includes("insurance")) {
      for (const [key, item] of Object.entries(this.healthcareAccess) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (key === "rural_wellbeing_extension_tier" && rural) {
          score += 35;
          matches.push("rural_access_calibration");
        } else if (key === "urban_tertiary_tier" && !rural) {
          score += 25;
          matches.push("urban_access_calibration");
        }

        if (normalized.includes("clinic") || normalized.includes("hospital") || normalized.includes("doctor") || normalized.includes("cost") || normalized.includes("money") || normalized.includes("water") || normalized.includes("smoke") || normalized.includes("stove") || this.hasAlias(normalized, "healthcare")) {
          score += 25;
          matches.push("wellbeing_systems_query_term");
        }

        for (const term of terms) {
          if (item.barriers?.some((b: string) => b.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`barrier_${term}`);
          }
          if (item.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_healthcare_access",
            strand: this.strandName,
            domain: "wellbeing",
            name: (item.category || item.title || item.name || "").toUpperCase(),
            description: (item.infrastructure || item.description || "healthcare access factors"),
            evidence: `Recognised barriers: ${item.barriers?.slice(0, 3).join("; ") || "N/A"}. Strengths: ${item.strengths?.slice(0, 3).join("; ") || "N/A"}.`,
            ethiopian_context: item.ethiopian_context,
            relevanceScore: Math.min(score / 50, 0.94),
            confidence: 0.90,
            matches,
            recommendations: item.recommendations || [],
            management: item.recommendations || [],
            sources: item.sources || ["Ethiopian Ministry of health - health Sector Transformation Plan (HSTP)", "World Bank Ethiopia Poverty & Social Assessment"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 6. Housing & Sanitation ----
    if (this.hasAlias(normalized, "housing") || normalized.includes("water") || normalized.includes("sanitation") || normalized.includes("toilet") || normalized.includes("smoke") || normalized.includes("cooking")) {
      for (const [key, data] of Object.entries(this.housingSanitation) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title?.toLowerCase().includes(normalized) || data.category?.toLowerCase().includes(normalized) || this.hasAlias(normalized, "housing") || this.hasAlias(normalized, "water") || this.hasAlias(normalized, "sanitation")) {
          score += 30;
          matches.push("housing_sanitation_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (rural && (key === "indoor_air_pollution" || key === "water_access" || key === "sanitation")) {
          score += 20;
          matches.push("user_rural");
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_housing_sanitation",
            strand: this.strandName,
            domain: "wellbeing",
            name: (data.title || data.category || key).toUpperCase(),
            description: data.description || "Housing and sanitation conditions",
            evidence: `Characteristics: ${(data as any).characteristics?.join("; ") || (data as any).infrastructure || "N/A"}.`,
            ethiopian_context: data.ethiopian_context,
            relevanceScore: Math.min(score / 50, 0.88),
            confidence: 0.85,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["Central Statistical Agency", "WHO/UNICEF JMP"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 7. Social Networks ----
    if (this.hasAlias(normalized, "social") || normalized.includes("iddir") || normalized.includes("iqub") || normalized.includes("mahber") || normalized.includes("community") || normalized.includes("support")) {
      for (const [key, data] of Object.entries(this.socialNetworks) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.name.toLowerCase().includes(normalized) || this.hasAlias(normalized, "social")) {
          score += 30;
          matches.push("social_network_match");
        }

        for (const term of terms) {
          if (data.functions?.some((f: string) => f.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`function_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_social_networks",
            strand: this.strandName,
            domain: "cultural",
            name: data.name.toUpperCase(),
            description: data.description,
            evidence: `Functions: ${data.functions?.join("; ") || "N/A"}. health implications: ${data.wellbeing_implications?.join("; ") || "N/A"}.`,
            ethiopian_context: data.ethiopian_context,
            relevanceScore: Math.min(score / 50, 0.85),
            confidence: 0.82,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["Ethiopian Journal of health Development", "Social Capital Studies"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 8. Food Security ----
    if (this.hasAlias(normalized, "food_security") || normalized.includes("hunger") || normalized.includes("famine") || normalized.includes("aid") || normalized.includes("nutrition") || normalized.includes("wasting") || normalized.includes("stunting")) {
      for (const [key, data] of Object.entries(this.foodSecurity) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized) || this.hasAlias(normalized, "food_security")) {
          score += 30;
          matches.push("food_security_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (rural) {
          score += 20;
          matches.push("user_rural");
        }

        if (pregnant) {
          score += 15;
          matches.push("user_pregnant");
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_food_security",
            strand: this.strandName,
            domain: "wellbeing",
            name: data.title.toUpperCase(),
            description: data.description || "Food security context",
            evidence: `Food insecure population: ${data.food_insecure_population || "N/A"}. Lean season: ${data.seasonal_patterns?.lean_season || "N/A"}. Chronic food insecurity: ${data.chronic_food_insecurity?.prevalence || "N/A"}.`,
            ethiopian_context: data.nutrition_programmes ? `Nutrition programmes: ${data.nutrition_programmes.join("; ") || "N/A"}` : "Ethiopian food security context",
            relevanceScore: Math.min(score / 50, 0.88),
            confidence: 0.85,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["WFP Ethiopia", "Ethiopian Public health Institute"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 9. Gender & health ----
    if (this.hasAlias(normalized, "gender") || normalized.includes("women") || normalized.includes("girls") || normalized.includes("gender‑based violence") || normalized.includes("maternal") || normalized.includes("fgm")) {
      for (const [key, data] of Object.entries(this.genderwellbeing) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized) || this.hasAlias(normalized, "gender")) {
          score += 30;
          matches.push("gender_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (pregnant && key === "maternal_wellbeing") {
          score += 25;
          matches.push("user_pregnant");
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_gender_wellbeing",
            strand: this.strandName,
            domain: "wellbeing",
            name: data.title.toUpperCase(),
            description: data.description || "Gender and health context",
            evidence: `Prevalence: ${data.prevalence ? Object.entries(data.prevalence).map(([k, v]) => `${k}: ${v}`).join("; ") : "N/A"}. Indicators: ${data.indicators ? Object.entries(data.indicators).map(([k, v]) => `${k}: ${v}`).join("; ") : "N/A"}.`,
            ethiopian_context: data.ethiopian_context || "Ethiopian gender and health context",
            relevanceScore: Math.min(score / 50, 0.90),
            confidence: 0.88,
            matches,
            recommendations: data.recommendations || data.prevention || [],
            management: data.recommendations || data.prevention || [],
            sources: data.sources || ["UN Women Ethiopia", "WHO Violence Against Women", "EPHI Maternal health Reports"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 10. Conflict & Displacement ----
    if (this.hasAlias(normalized, "conflict") || normalized.includes("displacement") || normalized.includes("idp") || normalized.includes("refugee") || normalized.includes("war") || normalized.includes("violence")) {
      for (const [key, data] of Object.entries(this.conflictDisplacement) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized) || this.hasAlias(normalized, "conflict")) {
          score += 30;
          matches.push("conflict_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (region && data.idp_population && normalized.includes(region.toLowerCase())) {
          score += 20;
          matches.push(`region_${region}`);
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_conflict_displacement",
            strand: this.strandName,
            domain: "wellbeing",
            name: data.title.toUpperCase(),
            description: data.description || "Conflict and displacement context",
            evidence: `Affected population: ${data.idp_population || data.refugee_population || "N/A"}. Causes: ${data.causes?.join("; ") || data.main_countries_of_origin?.join("; ") || "N/A"}.`,
            ethiopian_context: data.ethiopian_context || "Ethiopian conflict and displacement context",
            relevanceScore: Math.min(score / 50, 0.88),
            confidence: 0.85,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["UNOCHA Ethiopia", "IOM Ethiopia", "UNHCR"],
            category: "Domain A",
            severity: "high",
          });
        }
      }
    }

    // ---- 11. Economic Vulnerability ----
    if (this.hasAlias(normalized, "vulnerability") || normalized.includes("drought") || normalized.includes("flood") || normalized.includes("inflation") || normalized.includes("shock") || normalized.includes("crisis")) {
      for (const [key, data] of Object.entries(this.economicVulnerability) as [string, any][]) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || data.title.toLowerCase().includes(normalized) || this.hasAlias(normalized, "vulnerability")) {
          score += 30;
          matches.push("vulnerability_match");
        }

        for (const term of terms) {
          if (data.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (data.wellbeing_implications?.some((h: string) => h.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`wellbeing_${term}`);
          }
          if (data.recommendations?.some((r: string) => r.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`rec_${term}`);
          }
        }

        if (rural && key === "climate_shocks") {
          score += 20;
          matches.push("user_rural");
        }

        if (score > 15) {
          results.push({
            type: "socioeconomic_vulnerability",
            strand: this.strandName,
            domain: "wellbeing",
            name: data.title.toUpperCase(),
            description: data.description || "Economic vulnerability context",
            evidence: `Types: ${data.types ? data.types.map((t: any) => `${t.name} (${t.impact})`).join("; ") : "N/A"}. Impacts: ${data.impacts?.join("; ") || data.wellbeing_implications?.join("; ") || "N/A"}.`,
            ethiopian_context: data.ethiopian_context || "Ethiopian economic vulnerability context",
            relevanceScore: Math.min(score / 50, 0.85),
            confidence: 0.82,
            matches,
            recommendations: data.recommendations || [],
            management: data.recommendations || [],
            sources: data.sources || ["National Meteorology Agency", "World Bank Climate and Development", "World Bank Ethiopia Economic Update"],
            category: "Domain A",
            severity: "moderate",
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
   * Get poverty risk based on user location and employment
   */
  getPovertyRisk(userProfile: UserProfile): string {
    const rural = this.isRural(userProfile);
    const employment = this.getEmploymentStatus(userProfile);
    if (rural && (!employment || employment.toLowerCase().includes("informal") || employment.toLowerCase().includes("casual"))) {
      return "High poverty risk";
    } else if (rural) {
      return "Moderate poverty risk";
    } else if (!rural && (!employment || employment.toLowerCase().includes("informal"))) {
      return "Moderate poverty risk";
    }
    return "Low poverty risk";
  }

  /**
   * Get healthcare access advice based on location
   */
  gethealthcareAccessAdvice(userProfile: UserProfile): string[] {
    const rural = this.isRural(userProfile);
    if (rural) {
      return [
        "Utilise local health Extension Workers for basic care",
        "Enrol in CBHI to reduce healthcare costs",
        "Plan for transport to health centres in emergencies",
        "Attend health education sessions provided by HEWs",
      ];
    } else {
      return [
        "Use public health facilities for subsidised care",
        "Obtain referral slips from primary centres for tertiary care",
        "Enrol in social health insurance if eligible",
        "Consider private clinics for routine care if affordable",
      ];
    }
  }

  /**
   * Get social support resources
   */
  getSocialSupportResources(): string[] {
    const resources: string[] = [];
    for (const [key, data] of Object.entries(this.socialNetworks) as [string, any][]) {
      resources.push(`${data.name}: ${data.description}`);
      if (data.recommendations) {
        resources.push(...data.recommendations);
      }
    }
    return resources;
  }

  /**
   * Get food security advice
   */
  getFoodSecurityAdvice(userProfile: UserProfile): string[] {
    const rural = this.isRural(userProfile);
    const advice: string[] = [];
    if (rural) {
      advice.push("Participate in Productive Safety Net Programme (PSNP) if eligible");
      advice.push("Diversify crops to reduce risk");
      advice.push("Store surplus for lean season");
      advice.push("Access school feeding programmes for children");
    } else {
      advice.push("Access affordable nutritious foods");
      advice.push("Buy grains in bulk to save costs");
      advice.push("Use community Iqub for food purchasing emergencies");
    }
    advice.push("Monitor children for signs of malnutrition (stunting, wasting)");
    advice.push("Seek nutritional support from health centres if needed");
    return advice;
  }

  /**
   * Get gender-based violence support resources
   */
  getGBVSupportResources(): string[] {
    return [
      "Call national helpline (if available) for support and referral",
      "Report GBV to police or health facility",
      "Seek medical care within 72 hours for emergency contraception and STI prophylaxis",
      "Access psychosocial support from social workers or NGOs",
      "Contact women's organisations for legal and economic support",
      "Engage community leaders to prevent GBV",
    ];
  }

  /**
   * Get conflict/displacement health advice
   */
  getConflictDisplacementwellbeingAdvice(): string[] {
    return [
      "Ensure access to clean water and sanitation",
      "Seek vaccination and health screening in displacement settings",
      "Access mental health and psychosocial support",
      "Prevent and respond to gender‑based violence",
      "Maintain continuity of care for chronic conditions (HIV, TB, diabetes)",
      "Support children's education and routines",
      "Seek durable solutions (return, local integration, resettlement)",
    ];
  }
}