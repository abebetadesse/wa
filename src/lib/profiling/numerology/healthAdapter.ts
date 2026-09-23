import { getNumerologyMeaning } from "./meaningMapper";

export function getSomaticWelbeingSummary(
  lifePathNum: number,
  destinyNum: number
): {
  targetOrganSystems: string[];
  primaryStressResponse: string[];
  preventiveHabits: string[];
} {
  const lp = getNumerologyMeaning(lifePathNum);
  const dest = getNumerologyMeaning(destinyNum);

  const organMap: Record<number, string[]> = {
    1: ["Adrenal glands", "Spine", "Cerebral blood flow"],
    2: ["Gastric mucosa", "Lymphatic system", "Urinary bladder"],
    3: ["Throat & Vocal cords", "Bronchial tree", "Thyroid"],
    4: ["Bones & Joints", "Ligaments", "Gallbladder"],
    5: ["Peripheral nervous system", "Digestive peristalsis", "Adrenal medulla"],
    6: ["Cardiovascular system", "Heart muscle", "Pancreatic islet cells"],
    7: ["Pineal gland", "Brain neurotransmitters", "Central nervous system"],
    8: ["Liver & Hepatic portal system", "Arterial pressure", "Musculoskeletal framework"],
    9: ["Immune thymus", "Lymph nodes", "Lungs & Cellular respiration"],
    11: ["Sensory nerves", "Cardiac conduction rhythm", "Pineal gland"],
    22: ["Skeletal foundation", "Major arterial vessels", "Lumbar vertebral column"],
    33: ["Heart pericardium", "Thymus gland", "Autonomic equilibrium"],
  };

  const stressMap: Record<number, string[]> = {
    1: ["Hyper-arousal, restlessness, impulse to take immediate solitary control"],
    2: ["Gastric cramping, avoidance of confrontation, feeling energetically drained by others"],
    3: ["Rapid nervous chatter or sudden vocal fatigue, craving for sugary comfort foods"],
    4: ["Muscular clenching, stubborn refusal to pause, rigid joint and neck tension"],
    5: ["Restlessness, sensory fidgeting, sleep phase delay from racing thoughts"],
    6: ["Feeling heavy chest pressure, worrying incessantly about relatives' well-being"],
    7: ["Withdrawing into total silence, ruminative insomnia, intellectual detachment"],
    8: ["Tight jaw clenching, elevated systolic blood pressure, commanding work overdrive"],
    9: ["Emotional weeping or grief sighing, sluggish heavy legs, existential fatigue"],
    11: ["Sensory overwhelm in crowded environments, rapid heart palpitations"],
    22: ["Shouldering monumental burdens alone until acute back spasm occurs"],
    33: ["Deep physical lethargy following intense emotional caregiving encounters"],
  };

  const targetOrganSystems = Array.from(
    new Set([...(organMap[lifePathNum] || organMap[1]), ...(organMap[destinyNum] || organMap[1])])
  );

  const primaryStressResponse = Array.from(
    new Set([...(stressMap[lifePathNum] || stressMap[1]), ...(stressMap[destinyNum] || stressMap[1])])
  );

  const preventiveHabits = Array.from(
    new Set([...lp.WelbeingPatterns.lifestyleRecommendations, ...dest.WelbeingPatterns.lifestyleRecommendations])
  );

  return {
    targetOrganSystems,
    primaryStressResponse,
    preventiveHabits,
  };
}
