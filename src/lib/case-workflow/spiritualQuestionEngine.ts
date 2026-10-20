/**
 * Dynamic Question Branching & Crisis Screening Engine for Case 1
 * (Spiritual & Life Direction)
 */

import { FullDivinationResult } from "@/lib/cultural/spiritualDivinationEngine";
import { EMERGENCY_GUIDANCE, verifiedEmergencyContacts } from "@/lib/safety/emergencyContacts";
import { screenText } from "@/server/safety/urgency";

export interface DynamicQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: "text" | "textarea" | "select" | "radio" | "multi-select" | "scale";
  options?: { value: string; label: string; labelAmharic?: string }[];
  required: boolean;
  dependsOn?: { questionId: string; operator: string; value: any };
  aiGenerated: boolean;
  branchingReason?: string;
}

export interface CrisisScreenResult {
  isCrisis: boolean;
  urgencyLevel: "crisis" | "routine";
  crisisContent?: {
    title: string;
    message: string;
    hotlines: string[];
    emergencyContacts: { name: string; number: string }[];
    safetyPlanSteps: string[];
  };
  paywall?: {
    priceEtb: number;
    methods: string[];
  };
}

export function getCircleReflectionQuestion(circleNumber: number): { question: string; questionAmharic: string } | null {
  const circleQuestions: Record<number, { question: string; questionAmharic: string }> = {
    1: { question: "Michael's circle calls for decisive initiative. Where have you been hesitating to take a stand?", questionAmharic: "የሚካኤል አውድ ቁርጠኝነትን ይጠይቃል። በየትኛው ጉዳይ ላይ ውሳኔ ለማድረግ አቅማምተዋል?" },
    2: { question: "Gabriel's circle speaks of joyful announcements. What new creative chapter is waiting to be spoken aloud?", questionAmharic: "የገብርኤል አውድ ስለ አዲስ ምዕራፍ ያበስራል። በህይወትዎ ውስጥ ምን አዲስ ጅምር ይፈልጋሉ?" },
    3: { question: "Raphael's circle touches deep healing. What past wound are you now ready to bring into peaceful light?", questionAmharic: "የሩፋኤል አውድ ፈውስን ያመለክታል። አሁን ለማዳን ዝግጁ የሆኑት ያለፈ ስሜታዊ ቁስል ምንድን ነው?" },
    8: { question: "Your Awde Negest circle suggests a season of transformation. What feels like it is ending in your life right now?", questionAmharic: "የአውደ ነገሥት ክበብዎ የለውጥ ወቅት መሆኑን ያሳያል። አሁን በህይወትዎ ውስጥ እየተጠናቀቀ ያለው ነገር ምንድን ነው?" },
    15: { question: "The Lake of Life Springs reflects restoration. Where does your body and soul seek sanctuary?", questionAmharic: "የሕይወት ምንጮች ማገገምን ያመለክታሉ። ሰውነትዎ እና ነፍስዎ የት ሰላም ያገኛሉ?" },
    16: { question: "The Sabbath circle invites sacred stillness. How can you step back from restless striving?", questionAmharic: "የሰንበት አውድ ጸጥታን ያበረታታል። ከአድካሚ ሩጫ እንዴት ማረፍ ይችላሉ?" },
  };

  return circleQuestions[circleNumber] || {
    question: "How does your present season of life align with the deeper ancestral qualities of your name?",
    questionAmharic: "የአሁኑ የህይወት ወቅትዎ ከስምዎ መንፈሳዊ ትርጉም ጋር እንዴት ይስማማል?",
  };
}

/**
 * Generates dynamic branching questions based on Gematria calculations,
 * selected category, and prior answers.
 */
export function generateDynamicQuestions(
  gematria: Partial<FullDivinationResult>,
  category: string,
  priorAnswers: Record<string, any> = {}
): DynamicQuestion[] {
  const questions: DynamicQuestion[] = [];
  const currentCategory = priorAnswers.question_category || category || "life_direction";

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: ALWAYS ASKED — Question category
  // ═══════════════════════════════════════════════════════════════
  questions.push({
    id: "question_category",
    text: "What area of life would you like guidance on?",
    textAmharic: "በህይወትዎ ውስጥ በየትኛው መስክ ላይ መመሪያ ይፈልጋሉ?",
    type: "select",
    options: [
      { value: "life_direction", label: "Life direction & purpose", labelAmharic: "የህይወት አቅጣጫ" },
      { value: "career", label: "Career & vocation", labelAmharic: "ሥራ እና ሙያ" },
      { value: "relationships", label: "Relationships & marriage", labelAmharic: "ግንኙነቶች እና ጋብቻ" },
      { value: "wellbeing", label: "wellbeing & vitality", labelAmharic: "ጤና እና ጥንካሬ" },
      { value: "family", label: "Family matters", labelAmharic: "የቤተሰብ ጉዳዮች" },
      { value: "spiritual_growth", label: "Spiritual growth", labelAmharic: "መንፈሳዊ እድገት" },
      { value: "other", label: "Something else", labelAmharic: "ሌላ" },
    ],
    required: true,
    aiGenerated: false,
  });

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: DYNAMIC — Based on category selection
  // ═══════════════════════════════════════════════════════════════
  if (currentCategory === "career") {
    questions.push({
      id: "career_stage",
      text: "Where are you in your career journey right now?",
      textAmharic: "አሁን በስራዎ ጉዞ ላይ በየትኛው ደረጃ ላይ ነዎት?",
      type: "select",
      options: [
        { value: "starting", label: "Just starting out", labelAmharic: "አዲስ ጀማሪ" },
        { value: "transitioning", label: "Transitioning to something new", labelAmharic: "ወደ አዲስ መስክ እየተሸጋገሩ" },
        { value: "stuck", label: "Feeling stuck", labelAmharic: "የመቆም ስሜት የሚሰማዎት" },
        { value: "advancing", label: "Looking to advance", labelAmharic: "እድገት የሚፈልጉ" },
        { value: "business", label: "Building or running a business", labelAmharic: "የራስዎን ንግድ የሚገነቡ" },
      ],
      required: true,
      aiGenerated: false,
      branchingReason: "Category = career",
    });

    questions.push({
      id: "career_blocker",
      text: "What feels like the biggest blocker right now?",
      textAmharic: "አሁን ትልቁ እንቅፋት የሚመስልዎት ምንድን ነው?",
      type: "textarea",
      required: true,
      aiGenerated: false,
      branchingReason: "Category = career",
    });

    // If user's Awde circle is 8 (Transformation), add a specific question
    if (gematria.awdeCircle?.number === 8) {
      questions.push({
        id: "transformation_awareness",
        text: "Your Awde Negest circle suggests a season of transformation. What feels like it is ending in your life right now?",
        textAmharic: "የአውደ ነገሥት ክበብዎ የለውጥ ወቅት መሆኑን ያሳያል። አሁን በህይወትዎ ውስጥ እየተጠናቀቀ ያለው ነገር ምንድን ነው?",
        type: "textarea",
        required: false,
        aiGenerated: true,
        branchingReason: `Awde circle = 8 (Transformation), personalized for name ${gematria.nameGeez || "your name"}`,
      });
    }

    // If user's zodiac is Air element, add reflection question
    if (gematria.zodiac?.element === "Air") {
      questions.push({
        id: "air_element_reflection",
        text: "People with your Air-aligned sign often feel most alive when communicating or teaching. Is there a way your current work blocks that expression?",
        textAmharic: "ከንፋስ ባሕርይ ጋር የተገናኙ ሰዎች በማስተማር እና በግንኙነት ደስተኛ ናቸው። አሁን ያለዎት ሥራ ይህንን ይከለክላል?",
        type: "textarea",
        required: false,
        aiGenerated: true,
        branchingReason: `Zodiac element = Air (${gematria.zodiac.name})`,
      });
    }
  }

  if (currentCategory === "relationships") {
    questions.push({
      id: "relationship_status",
      text: "What best describes your current situation?",
      textAmharic: "የአሁኑን ሁኔታዎን በተሻለ ሁኔታ የሚገልጸው ምንድን ነው?",
      type: "select",
      options: [
        { value: "single", label: "Single and seeking", labelAmharic: "ነጠላ እና አጋር የሚፈልጉ" },
        { value: "dating", label: "Dating", labelAmharic: "በፍቅር ጓደኝነት ውስጥ" },
        { value: "engaged", label: "Engaged", labelAmharic: "የታጩ" },
        { value: "married", label: "Married", labelAmharic: "በባለትዳርነት" },
        { value: "separated", label: "Separated or divorced", labelAmharic: "የተለያዩ ወይም የተፋቱ" },
        { value: "complicated", label: "It is complicated", labelAmharic: "የተወሳሰበ" },
      ],
      required: true,
      aiGenerated: false,
      branchingReason: "Category = relationships",
    });

    // DV screening — MANDATORY for relationships
    questions.push({
      id: "safety_screening",
      text: "Are you currently safe in your relationship? If you are experiencing any form of violence or threats, please know we can connect you with immediate support.",
      textAmharic: "አሁን ባሉበት ግንኙነት ውስጥ ደህንነትዎ የተጠበቀ ነው? ማንኛውም አይነት ጥቃት ወይም ማስፈራሪያ የሚያጋጥምዎት ከሆነ፣ አፋጣኝ ድጋፍ ማግኘት ይችላሉ።",
      type: "radio",
      options: [
        { value: "safe", label: "Yes, I am safe", labelAmharic: "አዎ፣ ደህንነቴ የተጠበቀ ነው" },
        { value: "unsafe", label: "No, I am not safe", labelAmharic: "አይደለም፣ ደህንነቴ አልተጠበቀም" },
        { value: "prefer_not", label: "Prefer not to say", labelAmharic: "መመለስ አልፈልግም" },
      ],
      required: true,
      aiGenerated: false,
      branchingReason: "MANDATORY safety screening for relationships",
    });
  }

  if (currentCategory === "life_direction") {
    questions.push({
      id: "direction_feeling",
      text: "How would you describe your current sense of direction?",
      textAmharic: "የአሁኑን የህይወት አቅጣጫዎን እንዴት ይገልጹታል?",
      type: "scale",
      options: [
        { value: "1", label: "Completely lost", labelAmharic: "ሙሉ በሙሉ የጠፋብኝ" },
        { value: "2", label: "Uncertain", labelAmharic: "እርግጠኛ ያልሆንኩ" },
        { value: "3", label: "Somewhat clear", labelAmharic: "መጠነኛ ግልጽነት ያለው" },
        { value: "4", label: "Clear", labelAmharic: "ግልጽ" },
        { value: "5", label: "Very clear", labelAmharic: "በጣም ግልጽ" },
      ],
      required: true,
      aiGenerated: false,
    });

    if (gematria.awdeCircle) {
      const circleAdvice = getCircleReflectionQuestion(gematria.awdeCircle.number);
      if (circleAdvice) {
        questions.push({
          id: `circle_reflection_${gematria.awdeCircle.number}`,
          text: circleAdvice.question,
          textAmharic: circleAdvice.questionAmharic,
          type: "textarea",
          required: false,
          aiGenerated: true,
          branchingReason: `Awde circle = ${gematria.awdeCircle.number} (${gematria.awdeCircle.name})`,
        });
      }
    }
  }

  if (currentCategory === "wellbeing" || currentCategory === "family" || currentCategory === "spiritual_growth" || currentCategory === "other") {
    questions.push({
      id: "detail_narrative",
      text: "Please share what is on your heart regarding this area of your life.",
      textAmharic: "እባክዎን በዚህ የህይወት መስክ ላይ በልብዎ ያለውን ያካፍሉ።",
      type: "textarea",
      required: true,
      aiGenerated: false,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: SHARED REFLECTIVE BOUNDARIES
  // ═══════════════════════════════════════════════════════════════
  questions.push({
    id: "spiritual_beliefs_respected",
    text: "What faith beliefs, prayer customs, or ancestral traditions would you like respected in this reflection?",
    textAmharic: "በዚህ መንፈሳዊ ማሰላሰል ውስጥ እንዲከበሩልዎ የሚፈልጓቸው የእምነት፣ የጸሎት ወይም የባህል ልምዶች ምንድን ናቸው?",
    type: "textarea",
    required: false,
    aiGenerated: false,
  });

  questions.push({
    id: "spiritual_assumptions_avoid",
    text: "What would you like the reviewer to avoid assuming or interpreting about you?",
    textAmharic: "ገምጋሚው ስለ እርስዎ ምን ከመገመት ወይም በስህተት ከመተርጎም እንዲቆጠብ ይፈልጋሉ?",
    type: "textarea",
    required: false,
    aiGenerated: false,
  });

  return questions;
}

/**
 * Crisis Rule Engine: a thin adapter over the shared screen (src/server/safety/urgency.ts) plus the
 * structured safety answer. Self-harm, violence and medical emergencies are all crises.
 * If crisis is detected, urgency is set to 'crisis', non-gated emergency content
 * is returned, and paywall is omitted completely.
 */
export function evaluateSpiritualCrisis(
  freeText: string = "",
  answers: Record<string, any> = {}
): CrisisScreenResult {
  const combined = [
    freeText,
    String(answers.free_text || ""),
    String(answers.career_blocker || ""),
    String(answers.detail_narrative || ""),
    String(answers.safety_screening || ""),
    String(answers.transformation_awareness || ""),
  ].join(" ").toLowerCase();

  const screen = screenText(combined);
  const isSafetyScreenUnsafe = answers.safety_screening === "unsafe";

  if (screen.crisis || isSafetyScreenUnsafe) {
    const contacts = verifiedEmergencyContacts();
    const medical = screen.crisis === "medical";
    return {
      isCrisis: true,
      urgencyLevel: "crisis",
      crisisContent: {
        title: medical ? "Get medical help now" : "Your Life and Safety Are Sacred",
        message: medical
          ? "What you describe may be a medical emergency. Traditional reflection can wait; please get help now."
          : "We hear you, and you are not alone. Traditional Ethiopian divination is designed for reflection, never for crisis. Please connect with a person who can help now.",
        hotlines: contacts.map((contact) => contact.number),
        emergencyContacts: contacts.map(({ name, number }) => ({ name, number })),
        safetyPlanSteps: [
          EMERGENCY_GUIDANCE,
          "Reach out to a trusted elder, spiritual father (የንስሐ አባት), family member, or friend.",
          ...(medical ? [] : ["Move to a public, lit, or safe place if you can."]),
          "Remember that this difficult storm will pass, and help is available right now.",
        ],
      },
      // paywall is explicitly undefined to ensure crisis content is NOT gated behind a paywall
      paywall: undefined,
    };
  }

  return {
    isCrisis: false,
    urgencyLevel: "routine",
    paywall: {
      priceEtb: 500,
      methods: ["telebirr", "cbe_birr", "chapa", "stripe"],
    },
  };
}
