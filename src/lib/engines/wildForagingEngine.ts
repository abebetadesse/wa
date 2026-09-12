/**
 * Enhancement 11: Indigenous Ethiopian Wild Edible Fruits & Famine-Resilience Botanical Engine
 *
 * Models the micronutrient density, antioxidant capacity, and culinary applications of endemic
 * and naturalized wild Ethiopian fruits historically relied upon for seasonal resilience and medicinal nourishment.
 */

export interface WildEdibleFruit {
  id: string;
  nameAmharic: string;
  nameOromo?: string;
  botanicalName: string;
  agroEcologicalZone: "dega" | "weina_dega" | "kolla" | "bereha";
  vitaminCMgPer100g: number;
  ironMgPer100g: number;
  calciumMgPer100g: number;
  oracAntioxidantScoreUmolTE: number;
  primaryBioactivePhytochemicals: string[];
  traditionalUsageAndEthnobotany: string;
  nutritionalRole: string;
}

export const INDIGENOUS_WILD_FRUITS: WildEdibleFruit[] = [
  {
    id: "kurkura",
    nameAmharic: "ቁርቁራ (Kurkura)",
    nameOromo: "Qurqura",
    botanicalName: "Ziziphus spina-christi (Christ's Thorn Jujube)",
    agroEcologicalZone: "kolla",
    vitaminCMgPer100g: 285.0, // Exceptionally high ascorbic acid (~5x citrus)
    ironMgPer100g: 3.4,
    calciumMgPer100g: 130.0,
    oracAntioxidantScoreUmolTE: 4200,
    primaryBioactivePhytochemicals: ["Betulinic acid", "Spinachristoside saponins", "Rutin", "Quercetin"],
    traditionalUsageAndEthnobotany:
      "Drought-resilient riverine and lowland shrub. Children and pastoralists collect the golden-brown sweet fruits fresh or sun-dry them into meal cakes during dry seasons.",
    nutritionalRole: "Potent natural ascorbic acid source that enhances non-heme iron absorption from lowland sorghum and teff by >300%.",
  },
  {
    id: "agam",
    nameAmharic: "አጋም (Agam)",
    nameOromo: "Agamsa",
    botanicalName: "Carissa spinarum / Carissa edulis",
    agroEcologicalZone: "weina_dega",
    vitaminCMgPer100g: 68.0,
    ironMgPer100g: 2.8,
    calciumMgPer100g: 85.0,
    oracAntioxidantScoreUmolTE: 6800,
    primaryBioactivePhytochemicals: ["Cyanidin-3-glucoside anthocyanins", "Ursolic acid", "Carissone", "Resveratrol"],
    traditionalUsageAndEthnobotany:
      "Spiny highland hedgerow shrub bearing sweet, dark purple to black berries. Root decoctions are historically taken as a bitter hepatic and digestive restorative.",
    nutritionalRole: "Dense dark anthocyanins protect vascular endothelium from oxidative damage and promote capillary microcirculation.",
  },
  {
    id: "bedeno",
    nameAmharic: "በደኖ (Bedeno / Desert Date)",
    nameOromo: "Baddana",
    botanicalName: "Balanites aegyptiaca",
    agroEcologicalZone: "kolla",
    vitaminCMgPer100g: 45.0,
    ironMgPer100g: 4.1,
    calciumMgPer100g: 195.0,
    oracAntioxidantScoreUmolTE: 3100,
    primaryBioactivePhytochemicals: ["Diosgenin steroidal saponins", "Balanitoside", "Oleic/Linoleic fatty acids in seed kernel"],
    traditionalUsageAndEthnobotany:
      "Quintessential drought-resilience tree. Bitter-sweet fleshy pulp is macerated into beverage or porridge during lean seasons; kernels yield valuable clear edible oil.",
    nutritionalRole: "Supplies high electrolyte minerals (potassium and calcium) and prebiotic sterols that support endocrine homeostasis.",
  },
  {
    id: "koshim",
    nameAmharic: "ኮሽም (Koshim / Ethiopian Gooseberry)",
    nameOromo: "Koshimi",
    botanicalName: "Dovyalis abyssinica",
    agroEcologicalZone: "weina_dega",
    vitaminCMgPer100g: 145.0,
    ironMgPer100g: 1.9,
    calciumMgPer100g: 60.0,
    oracAntioxidantScoreUmolTE: 5400,
    primaryBioactivePhytochemicals: ["Abyssinin", "Chlorogenic acid", "Catechins", "High natural citric and malic acids"],
    traditionalUsageAndEthnobotany:
      "Vibrant yellow-orange highland berry known for its sharp, refreshing tartness. Commonly eaten fresh with a sprinkle of sea salt or infused into traditional digestive tonics.",
    nutritionalRole: "The intense organic acid and Vitamin C complex sharply decreases intestinal lumen pH, maximally dissociating bound dietary minerals.",
  },
];

export function getAllWildFruits(): WildEdibleFruit[] {
  return INDIGENOUS_WILD_FRUITS;
}

export function getWildFruitsByZone(zone: "dega" | "weina_dega" | "kolla" | "bereha"): WildEdibleFruit[] {
  return INDIGENOUS_WILD_FRUITS.filter((f) => f.agroEcologicalZone === zone);
}
