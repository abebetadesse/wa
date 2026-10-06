/**
 * Vocabulary for the reviewer's case analysis (analysis.ts).
 *
 * A FACTOR is something a person says about their situation ("I cannot sleep", "he lost his job").
 * Each factor lists the words that signal it in an answer, the stems that tie it to knowledge-strand
 * findings, a follow-up question that would sharpen the picture, and cautious first steps.
 * A PATTERN joins factors that commonly drive each other into one cause hypothesis.
 *
 * Everything here is reviewer-facing working material: hypotheses to check, never a diagnosis.
 */
import type { KnowledgeStrandType } from "@/lib/knowledge/types";

export interface Factor {
  id: string;
  label: string;
  /** Lowercase; Latin triggers match at the start of a word, Ethiopic ones anywhere. */
  triggers: string[];
  /** Stems searched for in a finding's name, category and description. */
  knowledge: string[];
  strands: KnowledgeStrandType[];
  /** Base importance when ranking causes (1–3). */
  weight: number;
  causeTitle: string;
  followUp: string;
  steps: string[];
  /** Bodily or medication matters: any advice needs a health professional's confirmation. */
  physical?: boolean;
  /** A safety matter the reviewer must address before anything else. */
  safety?: boolean;
  /**
   * "No alcohol" or "never any pain" means the factor is absent, so a negated mention is skipped.
   * Not set for lacks that are themselves the problem ("no money", "no sleep").
   */
  negatable?: boolean;
}

export const FACTORS: Factor[] = [
  {
    id: "violence",
    negatable: true,
    label: "Safety and violence",
    triggers: ["hit me", "hits me", "beat", "threat", "abus", "violen", "forced me", "afraid of him", "afraid of her", "መታኝ", "ድብደባ", "ዛቻ", "ጥቃት", "አስገደደ"],
    knowledge: ["violence", "abuse", "trauma", "gender-based", "ptsd"],
    strands: ["psychological", "socioeconomic"],
    weight: 3,
    causeTitle: "Fear of harm from another person is shaping the situation",
    followUp: "Are you safe where you are right now, and is there someone you trust who knows what is happening?",
    steps: [
      "Confirm the person's immediate safety before any other guidance, and share the crisis contacts.",
      "Do not suggest mediation or reconciliation while violence or coercion is present.",
    ],
    safety: true,
  },
  {
    id: "sleep",
    label: "Sleep",
    triggers: ["sleep", "insomnia", "awake at night", "nightmare", "እንቅልፍ"],
    knowledge: ["sleep", "insomnia", "circadian"],
    strands: ["psychological", "biological", "addiction"],
    weight: 2,
    causeTitle: "Disturbed sleep is wearing down coping and mood",
    followUp: "How long has your sleep been disturbed, and about how many hours do you sleep on a usual night?",
    steps: [
      "Keep one fixed wake-up time for two weeks, including fasting days and weekends.",
      "Move coffee, tea and khat to before midday and note whether sleep changes.",
    ],
  },
  {
    id: "anxiety",
    label: "Worry and stress",
    triggers: ["anxi", "worr", "panic", "nervous", "stress", "overwhelm", "afraid", "fear", "tense", "ጭንቀት", "ፍርሃት", "ስጋት", "መጨነቅ"],
    knowledge: ["anxiety", "panic", "worry"],
    strands: ["psychological", "biological"],
    weight: 2,
    causeTitle: "Sustained worry is keeping the body and mind on alert",
    followUp: "When is the worry strongest, and what usually sets it off?",
    steps: [
      "Name the two or three concrete worries behind the general feeling and sort them into what can be acted on this week and what cannot.",
      "Agree one daily calming practice the person already trusts (prayer, a walk, slow breathing) at a fixed time.",
    ],
  },
  {
    id: "low_mood",
    label: "Low mood",
    triggers: ["sad", "depress", "hopeless", "crying", "cry ", "empty", "worthless", "no interest", "ድብርት", "ተስፋ መቁረጥ", "ማልቀስ", "ባዶነት"],
    knowledge: ["depress", "mood"],
    strands: ["psychological", "biological"],
    weight: 2,
    causeTitle: "Persistent low mood is reducing energy for change",
    followUp: "How long have you felt this way, and are there days or activities that still feel lighter?",
    steps: [
      "Plan one small, valued activity each day and one contact with a trusted person each week.",
      "If low mood has lasted more than two weeks or includes thoughts of self-harm, refer to a health centre counsellor.",
    ],
  },
  {
    id: "fatigue",
    label: "Tiredness and low energy",
    triggers: ["tired", "exhaust", "fatigue", "weak", "no energy", "ድካም", "መድከም"],
    knowledge: ["fatigue", "energy", "anemia", "anaemia", "iron"],
    strands: ["biochemical", "biological", "dietary"],
    weight: 1.5,
    causeTitle: "Ongoing tiredness may have a bodily cause that needs checking",
    followUp: "Is the tiredness there all day or at certain times, and has your eating, fasting or sleep changed recently?",
    steps: ["Suggest a health-centre check (including a blood count) if tiredness has lasted more than a few weeks."],
    physical: true,
  },
  {
    id: "physical",
    negatable: true,
    label: "Bodily symptoms",
    triggers: ["pain", "headache", "stomach", "fever", "cough", "vomit", "diarrh", "dizz", "nausea", "rash", "bleed", "ህመም", "ራስ ምታት", "ትኩሳት", "ሆድ", "ሳል", "ማስመለስ"],
    knowledge: ["pain", "headache", "gastri", "fever", "infection"],
    strands: ["biological", "epidemiological", "medication", "biochemical"],
    weight: 2,
    causeTitle: "Bodily symptoms are part of the picture and need a health assessment",
    followUp: "What bodily symptoms do you have, since when, and have you seen a health worker about them?",
    steps: ["Recommend an in-person health assessment; do not interpret symptoms in the report."],
    physical: true,
  },
  {
    id: "medication",
    negatable: true,
    label: "Medicines",
    triggers: ["medicine", "medication", "tablet", "pill", "prescri", "መድኃኒት", "መድሃኒት", "ኪኒን"],
    knowledge: ["medication", "interaction", "adherence", "drug"],
    strands: ["medication", "biochemical"],
    weight: 1.5,
    causeTitle: "Current medicines may interact with the situation or with traditional remedies",
    followUp: "Which medicines or traditional remedies are you taking, and who prescribed or recommended them?",
    steps: ["Ask the person to show all medicines and remedies to a pharmacist or prescriber before adding anything new."],
    physical: true,
  },
  {
    id: "substance",
    negatable: true,
    label: "Khat, alcohol and tobacco",
    triggers: ["khat", "alcohol", "drinking", "drunk", "beer", "tej", "tella", "areke", "smok", "cigarette", "shisha", "ጫት", "አልኮል", "መጠጥ", "ጠላ", "ጠጅ", "አረቄ", "ሲጋራ"],
    knowledge: ["khat", "alcohol", "tobacco", "substance", "stimulant"],
    strands: ["addiction", "psychological"],
    weight: 2,
    causeTitle: "Khat, alcohol or tobacco use is adding to the strain",
    followUp: "How often do you use khat, alcohol or tobacco at the moment, and has that changed since the difficulty began?",
    steps: [
      "Ask the person to note use and mood for one week, to see the link for themselves.",
      "Offer a gradual reduction plan rather than a sudden stop, and refer to a health centre if use is daily.",
    ],
    physical: true,
  },
  {
    id: "caffeine",
    negatable: true,
    label: "Coffee and tea",
    triggers: ["coffee", "caffeine", "buna", "tea ", "ቡና", "ሻይ"],
    knowledge: ["coffee", "caffeine", "buna"],
    strands: ["dietary", "cultural", "biochemical"],
    weight: 1,
    causeTitle: "Coffee or tea late in the day may be affecting sleep and nerves",
    followUp: "How many cups of coffee or tea do you have in a day, and at what times?",
    steps: ["Keep the coffee ceremony as a social anchor but move the last cup to before midday for two weeks."],
  },
  {
    id: "food",
    label: "Eating and fasting",
    triggers: ["appetite", "eating", "weight", "hungry", "hunger", "fasting", "diet", "meal", "ጾም", "ምግብ", "ክብደት", "ረሃብ"],
    knowledge: ["fasting", "nutrition", "diet", "appetite", "undernutrition"],
    strands: ["dietary", "biochemical"],
    weight: 1.5,
    causeTitle: "Changes in eating or fasting are affecting energy and mood",
    followUp: "What do you usually eat in a day at the moment, and are you fasting?",
    steps: ["Review the current eating and fasting pattern for regular meals, protein sources and fluids."],
    physical: true,
  },
  {
    id: "money",
    label: "Money pressure",
    triggers: ["money", "debt", "loan", "income", "salary", "rent", "afford", "poverty", "expens", "bills", "ገንዘብ", "ዕዳ", "ብድር", "ደመወዝ", "ኪራይ", "ድህነት"],
    knowledge: ["poverty", "income", "economic", "livelihood", "iqub", "equb", "financ"],
    strands: ["socioeconomic", "cultural"],
    weight: 2.5,
    causeTitle: "Money pressure is a main source of strain",
    followUp: "What are the most urgent money obligations this month, and who else in the household contributes?",
    steps: [
      "List this month's fixed obligations and income together with the household, to replace a general fear with a concrete gap.",
      "Point to community safety nets the person may qualify for (iddir, equb, kebele or woreda support).",
    ],
  },
  {
    id: "work",
    label: "Work and livelihood",
    triggers: ["job", "work", "unemploy", "fired", "laid off", "boss", "career", "business", "promotion", "ስራ", "ሥራ"],
    knowledge: ["employment", "unemploy", "informal sector", "livelihood", "vocation"],
    strands: ["socioeconomic", "cultural"],
    weight: 2,
    causeTitle: "Insecure or unsatisfying work is at the centre of the concern",
    followUp: "What is your work situation today, and what change in it would matter most to you?",
    steps: ["Separate what the person can influence in the next month (applications, skills, a conversation) from what they cannot."],
  },
  {
    id: "conflict",
    label: "Conflict",
    triggers: ["argu", "fight", "conflict", "quarrel", "dispute", "shout", "divorce", "separat", "ጠብ", "ክርክር", "ጭቅጭቅ", "ፍቺ", "አለመግባባት"],
    knowledge: ["conflict", "dispute", "reconcil", "mediat", "shemgelna", "peacemak"],
    strands: ["cultural", "psychological", "socioeconomic"],
    weight: 2.5,
    causeTitle: "Repeated conflict is the most visible problem",
    followUp: "What are the disagreements usually about, and how do they normally end?",
    steps: [
      "Agree a calm time to talk about one topic only, with each person describing their own experience.",
      "Where both sides are willing and there is no violence, involve a trusted elder or spiritual father as a neutral listener.",
    ],
  },
  {
    id: "family",
    label: "Family and marriage",
    triggers: ["husband", "wife", "spouse", "marriage", "married", "mother", "father", "parent", "child", "son ", "daughter", "in-law", "family", "ባል", "ሚስት", "ትዳር", "ቤተሰብ", "ልጅ", "እናት", "አባት"],
    knowledge: ["family", "marriage", "household", "kinship", "parent"],
    strands: ["cultural", "socioeconomic"],
    weight: 1.5,
    causeTitle: "Family roles and expectations are under strain",
    followUp: "Who in the family is involved, and whose support can you count on?",
    steps: ["Map who is involved, who is affected (especially children) and who could support a calmer conversation."],
  },
  {
    id: "isolation",
    label: "Loneliness",
    triggers: ["lonely", "alone", "isolat", "no friends", "left out", "excluded", "nobody", "ብቸኝነት", "ብቻዬን", "ብቸኛ"],
    knowledge: ["isolation", "lonel", "social support", "belong", "iddir", "mahber", "community"],
    strands: ["psychological", "cultural", "socioeconomic"],
    weight: 2,
    causeTitle: "Isolation leaves the person carrying the difficulty alone",
    followUp: "Who do you speak to in a normal week, and is there a group or community you used to be part of?",
    steps: ["Identify one person to contact this week and one gathering (iddir, mahber, faith community) to attend once."],
  },
  {
    id: "grief",
    negatable: true,
    label: "Loss and grief",
    triggers: ["died", "death", "passed away", "funeral", "mourning", "grief", "griev", "ሞት", "ሞተ", "ለቅሶ", "ሐዘን"],
    knowledge: ["grief", "bereave", "mourning"],
    strands: ["psychological", "cultural"],
    weight: 2.5,
    causeTitle: "An unfinished loss sits underneath the present difficulty",
    followUp: "Whom or what have you lost, when, and have you been able to mourn in the way your family and faith expect?",
    steps: ["Acknowledge the loss directly and ask what mourning practices were, or could still be, observed."],
  },
  {
    id: "legal",
    label: "Land, inheritance and agreements",
    triggers: ["land", "inherit", "court", "contract", "evict", "tenant", "landlord", "property", "lawyer", "መሬት", "ውርስ", "ፍርድ ቤት", "ውል", "ንብረት"],
    knowledge: ["land", "inherit", "customary", "tenure", "elder"],
    strands: ["cultural", "socioeconomic"],
    weight: 2,
    causeTitle: "A dispute over property or an agreement is driving the difficulty",
    followUp: "What documents or agreements exist, and is there any date or deadline you have been given?",
    steps: [
      "Ask the person to keep every document and notice together and to note any deadline.",
      "Formal questions belong with a licensed attorney or legal aid clinic; the report offers reflection only.",
    ],
  },
  {
    id: "purpose",
    label: "Direction and meaning",
    triggers: ["purpose", "direction", "meaning", "confus", "decision", "decide", "future", "stuck", "calling", "ዓላማ", "አቅጣጫ", "ውሳኔ", "የወደፊት", "ጥሪ"],
    knowledge: ["vocation", "purpose", "meaning", "identity", "calling"],
    strands: ["cultural", "astrological", "psychological"],
    weight: 1.5,
    causeTitle: "Uncertainty about direction, more than one obstacle, is at the centre",
    followUp: "If the next year went well, what would be different, and what is holding you back from the first step?",
    steps: ["Help the person state the decision in one sentence and the two options they are really choosing between."],
  },
  {
    id: "spiritual",
    negatable: true,
    label: "Faith and spiritual concerns",
    triggers: ["pray", "church", "mosque", "faith", "spirit", "curse", "evil eye", "buda", "zar", "holy water", "tsebel", "dream", "ጸሎት", "ቤተ ክርስቲያን", "መስጊድ", "እምነት", "መንፈስ", "ቡዳ", "ዛር", "ጸበል", "ሕልም", "እርግማን"],
    knowledge: ["spirit", "prayer", "holy water", "tsebel", "zar", "buda", "faith", "awde", "awude", "ge'ez"],
    strands: ["cultural", "astrological"],
    weight: 1.5,
    causeTitle: "The person understands the difficulty in spiritual terms",
    followUp: "How do you and your family understand what is happening, and what spiritual support have you already sought?",
    steps: ["Respect the person's own framing and offer reflection alongside, never instead of, practical and health support."],
  },
];

export interface Pattern {
  id: string;
  /** Every group must have at least one detected factor. */
  needs: string[][];
  title: string;
  explanation: string;
}

export const PATTERNS: Pattern[] = [
  {
    id: "safety_first",
    needs: [["violence"], ["conflict", "family"]],
    title: "The conflict involves fear of harm, so safety comes before reconciliation",
    explanation: "Where one person fears another, communication advice can increase risk. The first task is a safety check and support contacts.",
  },
  {
    id: "money_conflict",
    needs: [["money"], ["conflict"]],
    title: "Money pressure is feeding the conflict",
    explanation: "Arguments that began or intensified with financial strain usually ease when the obligations are made concrete and shared, more than when communication alone is addressed.",
  },
  {
    id: "work_money",
    needs: [["work"], ["money"]],
    title: "Loss or insecurity of work is the practical root of the money pressure",
    explanation: "The financial strain follows from the work situation, so livelihood steps are likely to relieve more than budgeting alone.",
  },
  {
    id: "stress_sleep",
    needs: [["anxiety", "low_mood"], ["sleep"]],
    title: "Stress and poor sleep are reinforcing each other",
    explanation: "Worry delays sleep and short sleep lowers the threshold for worry and irritability the next day; improving either usually helps both.",
  },
  {
    id: "stimulant_sleep",
    needs: [["substance", "caffeine"], ["sleep", "anxiety"]],
    title: "Khat, coffee or alcohol is likely worsening sleep and nerves",
    explanation: "Stimulants taken later in the day and alcohol at night both fragment sleep and raise next-day anxiety, which can in turn increase use.",
  },
  {
    id: "isolation_mood",
    needs: [["isolation"], ["low_mood", "anxiety"]],
    title: "Isolation and low mood are deepening each other",
    explanation: "Withdrawal removes the contact that would lift mood, and low mood makes contact harder; one small, regular connection is the usual way in.",
  },
  {
    id: "grief_mood",
    needs: [["grief"], ["low_mood", "sleep", "isolation", "anxiety"]],
    title: "Grief underlies the changes in mood, sleep or contact with others",
    explanation: "The present symptoms began with, or echo, a loss. Acknowledging and mourning it is likely to matter more than treating each symptom.",
  },
  {
    id: "food_energy",
    needs: [["food"], ["fatigue"]],
    title: "The eating or fasting pattern may be contributing to low energy",
    explanation: "Long fasts or reduced meals without planned protein, iron and fluid sources commonly show up as tiredness.",
  },
  {
    id: "property_family",
    needs: [["legal"], ["family", "conflict"]],
    title: "A property or inheritance dispute is straining family relationships",
    explanation: "The relationship conflict follows a concrete dispute; elders' mediation and clear documents address the source.",
  },
  {
    id: "direction_work",
    needs: [["purpose"], ["work"]],
    title: "The work concern is mainly a question of direction",
    explanation: "The person describes uncertainty about which path to take rather than one specific barrier, so clarifying the choice comes before tactics.",
  },
];

/** Asked when the request itself gives the analysis little to work with. */
export const GENERIC_FOLLOW_UPS = [
  "Could you describe what happened, when it started and what you have already tried?",
  "What result would make the biggest difference for you in the next month?",
];
