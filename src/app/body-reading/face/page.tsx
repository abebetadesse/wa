"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  Info,
  Layers,
  Scale,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

// ── Data: Facial Zones ────────────────────────────────────────────────────────

interface SignItem {
  feature: string;
  reading: string;
  biometricNote: string;
  am: string;
}

interface FaceZone {
  id: string;
  zone: string;
  am: string;
  correspondence: string;
  correspondenceAm: string;
  third: "Upper (Heaven / Mind)" | "Middle (Human / Vitality)" | "Lower (Earth / Will)" | "Lateral (Ancestral Axis)";
  color: "violet" | "sky" | "amber" | "rose" | "emerald" | "orange" | "teal";
  emoji: string;
  biometricMetric: string;
  overview: string;
  signs: SignItem[];
}

const FACE_ZONES: FaceZone[] = [
  {
    id: "forehead",
    zone: "Forehead & Crown",
    am: "ግንባር እና አክሊል",
    correspondence: "Intellect · Ancestral Horizon · Spiritual Insight",
    correspondenceAm: "አእምሮ · የዘር ራዕይ · መንፈሳዊ ግንዛቤ",
    third: "Upper (Heaven / Mind)",
    color: "violet",
    emoji: "🧠",
    biometricMetric: "Frontal Plane Curvature & Glabellar Tension Vector",
    overview:
      "In Ethiopian physiognomic wisdom (ሥነ-ገጽ), the forehead is the 'Heavenly Palace' reflecting mental acuity, hereditary clarity, and connection to higher lineage. Biometrically, frontal bone prominence, transverse wrinkles, and glabellar spacing indicate chronic motor tension patterns and cranial developmental symmetry.",
    signs: [
      {
        feature: "Broad, smooth, unlined forehead",
        reading: "Holistic strategic thinker; expansive intellectual calm; steady ancestral connection.",
        biometricNote: "Relaxed frontalis muscle baseline; minimal involuntary furrowing.",
        am: "ሰፊና የተረጋጋ ግንባር — ጥልቅ አእምሯዊ ሰላም",
      },
      {
        feature: "Vertical glabellar lines ('Life Lines')",
        reading: "Deep concentration, fierce discernment; tendency toward mental strain or hyper-focus.",
        biometricNote: "Hypertrophy of corrugator supercilii muscles from repeated squinting/focus.",
        am: "በቅንድብ መሃል ያሉ መስመሮች — ከፍተኛ ትኩረት እና ውጥረት",
      },
      {
        feature: "Prominent upper supraorbital ridge",
        reading: "High drive for truth and inquiry; natural researcher and investigator.",
        biometricNote: "Well-defined frontal sinus morphology and cranial robusticity.",
        am: "ጎልቶ የወጣ የግንባር አጥንት — የመመርመር እና የእውነት ጥማት",
      },
      {
        feature: "Transverse horizontal waves",
        reading: "Wide life experience, philosophical curiosity, adaptable mindset.",
        biometricNote: "Repetitive frontalis elevation dynamics with expressive cadence.",
        am: "አግድም መስመሮች — የሕይወት ተሞክሮ እና ጥበብ",
      },
    ],
  },
  {
    id: "eyes-brows",
    zone: "Eyes & Brow Arch",
    am: "ዓይኖች እና ቅንድብ",
    correspondence: "Soul Portal · Shen (Spirit) · Emotional Discernment",
    correspondenceAm: "የነፍስ መስኮት · መንፈስ · የስሜት ብልሃት",
    third: "Upper (Heaven / Mind)",
    color: "sky",
    emoji: "👁️",
    biometricMetric: "Inter-pupillary Distance, Palpebral Aperture & Scleral Exposure",
    overview:
      "Considered the prime mirror of the soul in traditional Ethiopian texts. The luster of the eyes reflects Shen (vital spirit) and liver vitality. Biometrically, palpebral symmetry, pupil reactivity, and micro-saccades offer objective windows into autonomic nervous system tone and sensory processing.",
    signs: [
      {
        feature: "Luminous, clear, sparkling iris",
        reading: "Abundant vitality (መንፈሳዊ ብርሃን); clear purpose, emotional honesty.",
        biometricNote: "Optimal corneal hydration, clear lens transparency, balanced autonomic tone.",
        am: "የሚያበራ ጥርት ያለ ዓይን — ጤናማ መንፈስ እና ጉልበት",
      },
      {
        feature: "Dull, hooded, or cloudy gaze",
        reading: "Fatigue, internal grief, or unresolved emotional processing.",
        biometricNote: "Slight ptosis, altered blink rate indicating parasympathetic down-regulation.",
        am: "የደከመ ወይም የተሸፈነ ዓይን — የውስጥ ድካም ወይም ሐዘን",
      },
      {
        feature: "Strong, well-arched, defined brows",
        reading: "Assertive leadership, moral conviction, harmonious relational boundaries.",
        biometricNote: "Symmetrical superciliary arch with balanced frontalis-orbicularis equilibrium.",
        am: "ቀጥ ያለና የተስተካከለ ቅንድብ — የመሪነት ቆራጥነት",
      },
      {
        feature: "Asymmetric eye heights / sizes",
        reading: "Dual perception: one eye reads the external world, the other reflects internal depth.",
        biometricNote: "Mild orbital floor asymmetry (normal in >78% of human populations).",
        am: "ያልተስተካከለ የዓይን አቀማመጥ — ውስጣዊና ውጫዊ ጥምር እይታ",
      },
    ],
  },
  {
    id: "nose",
    zone: "Nose & Bridge",
    am: "አፍንጫ እና አገዳ",
    correspondence: "Willpower · Core Vital Force · Breath & Purpose",
    correspondenceAm: "ጽናት · የሕይወት እስትንፋስ · ዓላማ",
    third: "Middle (Human / Vitality)",
    color: "amber",
    emoji: "👃",
    biometricMetric: "Nasofacial Angle, Dorsal Deviation & Alar Base Proportion",
    overview:
      "The central spine of the face represents the conduit of breath (እስትንፋስ) and personal authority. In traditional lore, a straight, unbroken bridge signifies focused will and constitutional stamina. Modern biometrics observes the nasal axis relative to bilateral facial midline planes.",
    signs: [
      {
        feature: "Straight, prominent nasal bridge",
        reading: "High self-reliance, steady perseverance, strong structural vitality.",
        biometricNote: "Co-linear alignment with nasion-menton axis; minimal deviation (<2°).",
        am: "ቀጥ ያለ የአፍንጫ አገዳ — ጽኑ ራስን መቻል",
      },
      {
        feature: "Hump or dorsal rise in mid-bridge",
        reading: "Proud resilience, fierce independence, thrives when overcoming obstacles.",
        biometricNote: "Cartilaginous-bone junction projection; common osteological variant.",
        am: "ትንሽ ከፍ ያለ አገዳ — የማይበገር ጽናት",
      },
      {
        feature: "Broad, rounded nasal tip",
        reading: "Generosity, grounded practical judgment, warm community spirit.",
        biometricNote: "Well-developed lower lateral cartilages with generous soft-tissue envelope.",
        am: "ሰፊና የተሞላ የአፍንጫ ጫፍ — ለጋስነት እና ማኅበራዊነት",
      },
      {
        feature: "Redness or spider capillaries on tip",
        reading: "Heat in the digestive fire or elevated cardiovascular tension.",
        biometricNote: "Superficial capillary vasodilation; hyperemic mucosal response.",
        am: "የቀላ ጫፍ — የሙቀት ወይም የደም ዝውውር መብዛት",
      },
    ],
  },
  {
    id: "cheeks",
    zone: "Cheeks & Zygomatic",
    am: "ጉንጭ እና ጉንጭ አጥንት",
    correspondence: "Social Radiance · Nourishment · Courage",
    correspondenceAm: "ማኅበራዊ ክብር · የተመጣጠነ ኃይል · ድፍረት",
    third: "Middle (Human / Vitality)",
    color: "rose",
    emoji: "🌸",
    biometricMetric: "Bimalar Breadth, Zygomatic Apex Projection & Soft-Tissue Volume",
    overview:
      "The cheeks manifest social courage and nutritional vitality (ሆድና ሳንባ). Plump, warm cheeks reflect thriving digestion and community engagement; hollow cheeks suggest over-exhaustion or dietary neglect. Biometrically, cheekbone coordinates govern the midface golden ratio.",
    signs: [
      {
        feature: "High, prominent cheekbones",
        reading: "Natural authority, enduring charisma, strong defense of community values.",
        biometricNote: "Pronounced anterior projection of zygomaticus major and bony malar prominence.",
        am: "ከፍ ያሉ የጉንጭ አጥንቶች — ተፈጥሯዊ ክብርና ማራኪነት",
      },
      {
        feature: "Full, rosy cheek apples",
        reading: "Vibrant blood circulation, optimism, welcoming emotional warmth.",
        biometricNote: "Rich dermal microvasculature, balanced subcutaneous malar fat pad.",
        am: "ደማቅና ሙሉ ጉንጭ — የደም ዝውውር ጥንካሬና ደስታ",
      },
      {
        feature: "Sunken or pale cheeks",
        reading: "Physical overexertion, digestive fatigue, prolonged introversion.",
        biometricNote: "Malar volume deficit; common with chronic sleep debt or nutritional deficit.",
        am: "የጎደጎደ ወይም የገረጣ ጉንጭ — ድካም ወይም የተመጣጠነ ምግብ ማጣት",
      },
      {
        feature: "Deep nasolabial folds (smile lines)",
        reading: "Authentic laughter, depth of life journey, emotional expressiveness.",
        biometricNote: "Repeated contraction of levator labii superioris & zygomaticus musculature.",
        am: "ጥልቅ የፈገግታ መስመሮች — የሕይወት እርካታ እና ስሜት መግለጽ",
      },
    ],
  },
  {
    id: "mouth-lips",
    zone: "Mouth & Lips",
    am: "አፍ እና ከንፈር",
    correspondence: "Speech of Truth · Sensual Balance · Spleen Vitality",
    correspondenceAm: "የእውነት ንግግር · ርኅራኄ · የመፈጨት ሚዛን",
    third: "Lower (Earth / Will)",
    color: "emerald",
    emoji: "👄",
    biometricMetric: "Vermilion Height Ratio (Upper:Lower), Oral Commissure Angle",
    overview:
      "In Ethiopian cultural lore, the mouth speaks what the heart conceals. The lips mirror digestive and reproductive vitality. Biometrically, resting lip competency, symmetry of the oral commissure, and philtrum depth map directly to motor-cranial nerve VII tone and autonomic state.",
    signs: [
      {
        feature: "Balanced, full lips (1:1.6 ratio)",
        reading: "Eloquent speech, emotional generosity, harmonious physical appetite.",
        biometricNote: "Golden-ratio approximation between upper and lower vermilion borders.",
        am: "የተመጣጠነ ሙሉ ከንፈር — አንደበተ ርቱዕነት እና ርኅራኄ",
      },
      {
        feature: "Thin, tightly pressed lips",
        reading: "Strict self-discipline, reserved judgment, cautious emotional sharing.",
        biometricNote: "Chronic resting tension in orbicularis oris and mentalis muscle groups.",
        am: "ቀጭንና የተጣበቀ ከንፈር — ጥንቃቄ እና ቁጥጥር",
      },
      {
        feature: "Turned-up oral corners at rest",
        reading: "Default disposition toward hope, relational approachability.",
        biometricNote: "Tonic activation of zygomaticus minor and risorius muscle fibers.",
        am: "ወደ ላይ ያዘነበለ የአፍ ጠርዝ — ተስፋ እና ወዳጅነት",
      },
      {
        feature: "Deep, crisp philtrum groove",
        reading: "Strong constitutional stamina, creative fertility, longevity marker.",
        biometricNote: "Well-formed bilateral philtral columns with distinct medial dimple.",
        am: "ጥልቅ የአፍንጫ-ከንፈር መስመር — ጽኑ ሕይወት እና ፈጠራ",
      },
    ],
  },
  {
    id: "chin-jaw",
    zone: "Jaw & Chin",
    am: "አገጭ እና መንጋጋ",
    correspondence: "Grounding · Tenacity · Instinctual Foundation",
    correspondenceAm: "መሰረት · ቆራጥነት · የተፈጥሮ ጥንካሬ",
    third: "Lower (Earth / Will)",
    color: "orange",
    emoji: "🏛️",
    biometricMetric: "Bigonial Width, Pogonio-Menton Projection & Gonial Angle",
    overview:
      "The lower jaw forms the anchor of the facial edifice. It represents willpower under pressure, bone density (kidney essence), and stamina to see intentions through to harvest. Biometrically, mandibular architecture is one of the most reliable indicators of masticatory strength and skeletal robusticity.",
    signs: [
      {
        feature: "Broad, defined, square jaw",
        reading: "Unyielding perseverance, defensive strength, protective guardian instinct.",
        biometricNote: "Well-developed masseter muscles with lateral mandibular flare (85°-110° angle).",
        am: "ሰፊና ጠንካራ መንጋጋ — የማይነቃነቅ ጽናት",
      },
      {
        feature: "Prominent, forward-projecting chin",
        reading: "High drive, determination to manifest goals, decisive action taker.",
        biometricNote: "Positive pogonion projection relative to Riedel's line.",
        am: "ወደ ፊት የወጣ አገጭ — ቆራጥ እርምጃ ሰጪነት",
      },
      {
        feature: "Receding or delicate chin",
        reading: "Gentle temperament, diplomacy over conflict, intuitive yielding.",
        biometricNote: "Retrognathic baseline; lower masticatory force distribution.",
        am: "ለስላሳ ወይም ወደ ኋላ ያፈገፈገ አገጭ — ሰላማዊ እና አስማሚ",
      },
      {
        feature: "Cleft or dimpled chin",
        reading: "Magnetism, playful charisma, craving for sincere emotional appreciation.",
        biometricNote: "Incomplete embryological fusion of left and right mandibular arches.",
        am: "መሃሉ የተከፈለ አገጭ — ማራኪነት እና ተወዳጅነት",
      },
    ],
  },
  {
    id: "ears",
    zone: "Ears & Helix",
    am: "ጆሮ እና ጆሮ ጫፍ",
    correspondence: "Ancestral Heritage · Deep Listening · Kidney Reserve",
    correspondenceAm: "የአባቶች ውርስ · ጥልቅ ማዳመጥ · የተፈጥሮ ክምችት",
    third: "Lateral (Ancestral Axis)",
    color: "teal",
    emoji: "👂",
    biometricMetric: "Auricular Length, Helix Infolding & Lobule Attachment Ratio",
    overview:
      "In Ethiopian esoteric anatomy, the ears are inverted embryonic maps reflecting the primordial kidney essence given by one's parents. They show how one receives wisdom from the unseen world. Biometrically, the ear is completely unique to every human — a permanent biometric identifier.",
    signs: [
      {
        feature: "Large, long, well-formed ears",
        reading: "Longevity endowment, patient listener, profound capacity for contemplative wisdom.",
        biometricNote: "Length >65mm with balanced antihelix and concha volume.",
        am: "ትላልቅና ረዣዥም ጆሮዎች — የመስማት ጥበብ እና ረጅም እድሜ",
      },
      {
        feature: "Thick, fleshy, free-hanging lobes",
        reading: "Abundance mindset, generosity, emotional rootedness in ancestral blessings.",
        biometricNote: "Unattached auricular lobule with generous fibro-adipose tissue.",
        am: "ወፍራም የተንጠለጠለ ጆሮ ጫፍ — በረከት እና ልግስና",
      },
      {
        feature: "High ear set (top sits above brow line)",
        reading: "Quick apprehension, rapid cognitive processing, intellectual impatience.",
        biometricNote: "Cranial insertion point elevated relative to Frankfort horizontal plane.",
        am: "ከፍ ብሎ የተቀመጠ ጆሮ — ፈጣን ግንዛቤ እና ንቃት",
      },
      {
        feature: "Pointed helix tip ('Satyr / Elf Ear')",
        reading: "Heightened instinctual sensitivity, attunement to subtle sounds and energies.",
        biometricNote: "Darwinian tubercle prominence on postero-superior helix.",
        am: "ጫፉ የሾለ ጆሮ — ረቂቅ ድምፅ እና ስሜትን የመለየት ችሎታ",
      },
    ],
  },
];

// ── Data: Eye Reading Details ────────────────────────────────────────────────

const EYE_SHAPES = [
  {
    shape: "Almond Eye",
    am: "የለውዝ ቅርጽ",
    trait: "Harmonious Balance & Calm Insight",
    desc: "Symmetrical contours; balanced canthal tilt. Considered the archetypal harmonious eye in Ethiopian art (Telsem iconography).",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  },
  {
    shape: "Deep-Set Eye",
    am: "ጠሊቅ ዓይን",
    trait: "Contemplative Depth & Discernment",
    desc: "Recessed behind supraorbital arch. Reflects an internal observer who watches intently before speaking.",
    color: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  },
  {
    shape: "Prominent / Large Eye",
    am: "ጎልቶ የወጣ ዓይን",
    trait: "Emotional Transparency & Receptivity",
    desc: "Wide palpebral opening; expressive ocular movement. Readily reveals inner state; naturally communicative.",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
  {
    shape: "Phoenix / Upturned Eye",
    am: "ወደ ላይ የተነሣ ዓይን",
    trait: "Aesthetic Sensitivity & Strategic Focus",
    desc: "Lateral canthus sits higher than medial canthus (+5° or more). High ambition and sharp critical acumen.",
    color: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  },
];

// ── Data: Face Shapes ────────────────────────────────────────────────────────

const FACE_SHAPES = [
  {
    shape: "Oval (The Harmonious)",
    am: "እንቁላል ቅርጽ",
    element: "Air & Water (ነፋስ እና ውሃ)",
    qualities: "Adaptable, diplomatic, balanced emotional and mental capacity. Moves smoothly between diverse circles.",
    color: "border-amber-400/30 bg-amber-400/5 text-amber-200",
  },
  {
    shape: "Round (The Nurturer)",
    am: "ክብ ቅርጽ",
    element: "Water & Earth (ውሃ እና መሬት)",
    qualities: "Generous, hospitable, highly empathetic. Prioritizes community consensus and shared joy.",
    color: "border-rose-400/30 bg-rose-400/5 text-rose-200",
  },
  {
    shape: "Square (The Builder)",
    am: "አራት ማዕዘን ቅርጽ",
    element: "Earth & Fire (መሬት እና እሳት)",
    qualities: "Steadfast, decisive, pragmatic. Anchored in tangible reality with high endurance for long endeavors.",
    color: "border-orange-400/30 bg-orange-400/5 text-orange-200",
  },
  {
    shape: "Heart (The Visionary)",
    am: "የልብ ቅርጽ",
    element: "Fire & Air (እሳት እና ነፋስ)",
    qualities: "Dynamic, creative, intuitive spark. Broad intellect tapering to passionate personal determination.",
    color: "border-violet-400/30 bg-violet-400/5 text-violet-200",
  },
  {
    shape: "Oblong / Rectangular (The Philosopher)",
    am: "ረጅም ቅርጽ",
    element: "Ether & Air (ጠፈር እና ነፋስ)",
    qualities: "Systematic, analytical, principled. Values intellectual rigor, historical depth, and deliberate planning.",
    color: "border-teal-400/30 bg-teal-400/5 text-teal-200",
  },
];

// ── Data: Biometric Golden Proportions ────────────────────────────────────────

const BIOMETRIC_PROPORTIONS = [
  {
    title: "Facial Thirds (የፊት ሦስት ክፍሎች)",
    desc: "Hairline to Glabella (Upper), Glabella to Subnasale (Middle), Subnasale to Menton (Lower). Equal thirds signify systemic constitutional equilibrium.",
    metric: "Vertical 1:1:1 Harmonic",
  },
  {
    title: "Bilateral Symmetry Index (የግራና ቀኝ ሚዛን)",
    desc: "Right hemiface governs outward executive role and social persona; Left hemiface reflects interior ancestral spirit and private emotion.",
    metric: "Hemifacial Variance < 4%",
  },
  {
    title: "Rule of Fifths (የዓይን እና የፊት ስፋት)",
    desc: "The width of the face equals five times the width of one eye. Inter-canthal distance naturally matches the single eye aperture in harmonic balance.",
    metric: "Horizontal 1:1:1:1:1 Ratio",
  },
];

// ── Color Map Helper ─────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  string,
  { border: string; bg: string; text: string; badge: string; ring: string; fill: string; stroke: string }
> = {
  violet: {
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    text: "text-violet-200",
    badge: "bg-violet-500/20 border-violet-400/40 text-violet-200",
    ring: "ring-violet-500/40",
    fill: "#8b5cf615",
    stroke: "#a78bfa",
  },
  sky: {
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
    text: "text-sky-200",
    badge: "bg-sky-500/20 border-sky-400/40 text-sky-200",
    ring: "ring-sky-500/40",
    fill: "#0ea5e915",
    stroke: "#38bdf8",
  },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    badge: "bg-amber-500/20 border-amber-400/40 text-amber-200",
    ring: "ring-amber-500/40",
    fill: "#f59e0b15",
    stroke: "#fbbf24",
  },
  rose: {
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    text: "text-rose-200",
    badge: "bg-rose-500/20 border-rose-400/40 text-rose-200",
    ring: "ring-rose-500/40",
    fill: "#f43f5e15",
    stroke: "#fb7185",
  },
  emerald: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-200",
    badge: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
    ring: "ring-emerald-500/40",
    fill: "#10b98115",
    stroke: "#34d399",
  },
  orange: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    text: "text-orange-200",
    badge: "bg-orange-500/20 border-orange-400/40 text-orange-200",
    ring: "ring-orange-500/40",
    fill: "#f9731615",
    stroke: "#fb923c",
  },
  teal: {
    border: "border-teal-500/40",
    bg: "bg-teal-500/10",
    text: "text-teal-200",
    badge: "bg-teal-500/20 border-teal-400/40 text-teal-200",
    ring: "ring-teal-500/40",
    fill: "#14b8a615",
    stroke: "#2dd4bf",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function FaceReadingPage() {
  const [activeZoneId, setActiveZoneId] = useState<string>(FACE_ZONES[0].id);
  const [expandedSignIndex, setExpandedSignIndex] = useState<number | null>(0);

  const activeZone = FACE_ZONES.find((z) => z.id === activeZoneId) ?? FACE_ZONES[0];
  const c = COLOR_MAP[activeZone.color] ?? COLOR_MAP.amber;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <Sparkles className="size-4 text-amber-400" aria-hidden="true" />
          <span>Body-Sign Reading · Face & Biometrics</span>
          <span className="text-stone-600">•</span>
          <span className="inline-flex items-center gap-1 text-sky-400">
            <Cpu className="size-3.5" aria-hidden="true" /> Non-Invasive Geometric Analysis
          </span>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Face Reading & Biometrics{" "}
            <span lang="am" className="block text-2xl font-semibold text-amber-300 sm:inline sm:text-3xl">
              የፊት ንባብ እና ባዮሜትሪክስ
            </span>
          </h1>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-stone-300">
          In Ethiopian classical hermeneutics (<span lang="am" className="text-amber-200">ሥነ-ገጽ</span>,{" "}
          <em>Sine-Gets</em>), the face is celebrated as the temple of light and the meeting place of spiritual intention
          and physical constitution. Combined with non-invasive facial biometric geometry—such as harmonic thirds,
          cranial symmetry vectors, and micro-expressive neuromuscular tone—practitioners gain an introspective,
          educational lens into the living human system.
        </p>

        {/* Ethical Red Line Banner */}
        <div className="rounded-2xl border border-amber-900/50 bg-stone-900/80 p-4 text-xs text-stone-300 flex items-start gap-3 shadow-inner">
          <AlertTriangle className="size-5 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Strict Ethical & Cultural Guardrails</p>
            <p className="text-stone-400 leading-relaxed">
              This interactive tool is designed purely for <strong>reflective self-knowledge and educational inquiry</strong>.
              It is <strong>not</strong> a forensic surveillance instrument, lie-detection tool, genetic determinism engine,
              or clinical medical diagnosis. We firmly repudiate historical phrenology and racialized profiling.
            </p>
          </div>
        </div>
      </header>

      {/* ── Main Face Diagram & Interactive Zone Selector ─────────────── */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
        {/* Left Column: Interactive Stylized SVG Face Map */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-72 h-96 sm:w-80 sm:h-[420px] rounded-3xl border border-stone-800 bg-stone-900/70 p-4 shadow-2xl flex items-center justify-center">
            {/* SVG Interactive Face Canvas */}
            <svg
              viewBox="0 0 240 320"
              className="w-full h-full select-none"
              aria-label="Interactive Facial Biometric Map"
            >
              <defs>
                {/* Subtle facial gradient */}
                <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#292524" />
                  <stop offset="100%" stopColor="#0c0a09" />
                </radialGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid / Biometric Golden Ratio Background Lines */}
              <g stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2,3" opacity="0.45">
                {/* Central midline */}
                <line x1="120" y1="10" x2="120" y2="310" stroke="#f59e0b" strokeWidth="0.75" />
                {/* Thirds: Trichion, Glabella, Subnasale, Menton */}
                <line x1="20" y1="45" x2="220" y2="45" />
                <line x1="20" y1="105" x2="220" y2="105" />
                <line x1="20" y1="195" x2="220" y2="195" />
                <line x1="20" y1="285" x2="220" y2="285" />
                {/* Eye level axis */}
                <line x1="30" y1="125" x2="210" y2="125" stroke="#38bdf8" strokeWidth="0.7" />
              </g>

              {/* Base Head Outline */}
              <path
                d="M 120 28 C 175 28, 205 60, 205 130 C 205 200, 180 260, 150 285 C 135 298, 105 298, 90 285 C 60 260, 35 200, 35 130 C 35 60, 65 28, 120 28 Z"
                fill="url(#faceGrad)"
                stroke="#57534e"
                strokeWidth="1.75"
              />

              {/* ── ZONE 7: EARS (Left & Right) ────────────────────────── */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => {
                  setActiveZoneId("ears");
                  setExpandedSignIndex(0);
                }}
                aria-label="Ears zone"
              >
                {/* Left Ear */}
                <path
                  d="M 35 110 C 20 115, 18 165, 36 175 C 34 160, 33 130, 35 110 Z"
                  fill={activeZoneId === "ears" ? COLOR_MAP.teal.fill : "#1c1917"}
                  stroke={activeZoneId === "ears" ? COLOR_MAP.teal.stroke : "#44403c"}
                  strokeWidth={activeZoneId === "ears" ? "2" : "1.2"}
                />
                {/* Right Ear */}
                <path
                  d="M 205 110 C 220 115, 222 165, 204 175 C 206 160, 207 130, 205 110 Z"
                  fill={activeZoneId === "ears" ? COLOR_MAP.teal.fill : "#1c1917"}
                  stroke={activeZoneId === "ears" ? COLOR_MAP.teal.stroke : "#44403c"}
                  strokeWidth={activeZoneId === "ears" ? "2" : "1.2"}
                />
              </g>

              {/* ── ZONE 1: FOREHEAD ───────────────────────────────────── */}
              <path
                d="M 52 75 C 65 42, 100 36, 120 36 C 140 36, 175 42, 188 75 C 185 100, 140 102, 120 102 C 100 102, 55 100, 52 75 Z"
                fill={activeZoneId === "forehead" ? COLOR_MAP.violet.fill : "#18181b"}
                stroke={activeZoneId === "forehead" ? COLOR_MAP.violet.stroke : "#3f3f46"}
                strokeWidth={activeZoneId === "forehead" ? "2" : "1"}
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => {
                  setActiveZoneId("forehead");
                  setExpandedSignIndex(0);
                }}
                aria-label="Forehead zone"
              />

              {/* ── ZONE 2: EYES & BROWS ───────────────────────────────── */}
              <g
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => {
                  setActiveZoneId("eyes-brows");
                  setExpandedSignIndex(0);
                }}
                aria-label="Eyes and Brows zone"
              >
                {/* Brows */}
                <path
                  d="M 68 112 Q 88 104 105 112"
                  fill="none"
                  stroke={activeZoneId === "eyes-brows" ? COLOR_MAP.sky.stroke : "#71717a"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 135 112 Q 152 104 172 112"
                  fill="none"
                  stroke={activeZoneId === "eyes-brows" ? COLOR_MAP.sky.stroke : "#71717a"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Left Eye */}
                <path
                  d="M 72 125 Q 88 116 102 125 Q 88 134 72 125 Z"
                  fill={activeZoneId === "eyes-brows" ? COLOR_MAP.sky.fill : "#27272a"}
                  stroke={activeZoneId === "eyes-brows" ? COLOR_MAP.sky.stroke : "#52525b"}
                  strokeWidth="1.5"
                />
                <circle cx="87" cy="125" r="4" fill={activeZoneId === "eyes-brows" ? "#38bdf8" : "#a1a1aa"} />
                {/* Right Eye */}
                <path
                  d="M 138 125 Q 152 116 168 125 Q 152 134 138 125 Z"
                  fill={activeZoneId === "eyes-brows" ? COLOR_MAP.sky.fill : "#27272a"}
                  stroke={activeZoneId === "eyes-brows" ? COLOR_MAP.sky.stroke : "#52525b"}
                  strokeWidth="1.5"
                />
                <circle cx="153" cy="125" r="4" fill={activeZoneId === "eyes-brows" ? "#38bdf8" : "#a1a1aa"} />
              </g>

              {/* ── ZONE 3: NOSE ───────────────────────────────────────── */}
              <path
                d="M 115 115 L 125 115 L 128 178 L 138 185 C 135 192, 105 192, 102 185 L 112 178 Z"
                fill={activeZoneId === "nose" ? COLOR_MAP.amber.fill : "#1c1917"}
                stroke={activeZoneId === "nose" ? COLOR_MAP.amber.stroke : "#52525b"}
                strokeWidth={activeZoneId === "nose" ? "2" : "1.2"}
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => {
                  setActiveZoneId("nose");
                  setExpandedSignIndex(0);
                }}
                aria-label="Nose zone"
              />

              {/* ── ZONE 4: CHEEKS (Left & Right) ──────────────────────── */}
              <g
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => {
                  setActiveZoneId("cheeks");
                  setExpandedSignIndex(0);
                }}
                aria-label="Cheeks zone"
              >
                {/* Left Cheek */}
                <path
                  d="M 46 142 C 48 185, 90 195, 104 185 C 98 165, 82 145, 58 140 Z"
                  fill={activeZoneId === "cheeks" ? COLOR_MAP.rose.fill : "#1c1917"}
                  stroke={activeZoneId === "cheeks" ? COLOR_MAP.rose.stroke : "#3f3f46"}
                  strokeWidth={activeZoneId === "cheeks" ? "1.8" : "1"}
                />
                {/* Right Cheek */}
                <path
                  d="M 194 142 C 192 185, 150 195, 136 185 C 142 165, 158 145, 182 140 Z"
                  fill={activeZoneId === "cheeks" ? COLOR_MAP.rose.fill : "#1c1917"}
                  stroke={activeZoneId === "cheeks" ? COLOR_MAP.rose.stroke : "#3f3f46"}
                  strokeWidth={activeZoneId === "cheeks" ? "1.8" : "1"}
                />
              </g>

              {/* ── ZONE 5: MOUTH & LIPS ───────────────────────────────── */}
              <g
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => {
                  setActiveZoneId("mouth-lips");
                  setExpandedSignIndex(0);
                }}
                aria-label="Mouth and Lips zone"
              >
                {/* Philtrum indicator */}
                <line x1="117" y1="190" x2="117" y2="208" stroke="#52525b" strokeWidth="0.8" />
                <line x1="123" y1="190" x2="123" y2="208" stroke="#52525b" strokeWidth="0.8" />
                {/* Lips shape */}
                <path
                  d="M 96 215 Q 120 206 144 215 Q 120 232 96 215 Z"
                  fill={activeZoneId === "mouth-lips" ? COLOR_MAP.emerald.fill : "#27272a"}
                  stroke={activeZoneId === "mouth-lips" ? COLOR_MAP.emerald.stroke : "#52525b"}
                  strokeWidth={activeZoneId === "mouth-lips" ? "2" : "1.2"}
                />
                {/* Center mouth line */}
                <path d="M 98 215 Q 120 218 142 215" stroke="#71717a" strokeWidth="1" fill="none" />
              </g>

              {/* ── ZONE 6: JAW & CHIN ─────────────────────────────────── */}
              <path
                d="M 76 250 C 90 282, 105 292, 120 292 C 135 292, 150 282, 164 250 C 145 244, 95 244, 76 250 Z"
                fill={activeZoneId === "chin-jaw" ? COLOR_MAP.orange.fill : "#18181b"}
                stroke={activeZoneId === "chin-jaw" ? COLOR_MAP.orange.stroke : "#3f3f46"}
                strokeWidth={activeZoneId === "chin-jaw" ? "2" : "1"}
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => {
                  setActiveZoneId("chin-jaw");
                  setExpandedSignIndex(0);
                }}
                aria-label="Chin and Jaw zone"
              />

              {/* Landmark Dots Overlay (Biometric points) */}
              <circle cx="120" cy="105" r="2" fill="#a78bfa" /> {/* Glabella */}
              <circle cx="120" cy="188" r="2" fill="#fbbf24" /> {/* Subnasale */}
              <circle cx="120" cy="285" r="2" fill="#fb923c" /> {/* Menton */}
              <circle cx="87" cy="125" r="1.5" fill="#38bdf8" />  {/* Left pupil */}
              <circle cx="153" cy="125" r="1.5" fill="#38bdf8" /> {/* Right pupil */}
              <circle cx="68" cy="170" r="1.5" fill="#fb7185" />  {/* Left zygion */}
              <circle cx="172" cy="170" r="1.5" fill="#fb7185" /> {/* Right zygion */}
            </svg>

            {/* Quick Helper caption under diagram */}
            <div className="absolute bottom-2 text-[10px] text-stone-500 font-mono tracking-wider">
              CLICK ANY REGION TO MAP CORRESPONDENCES
            </div>
          </div>

          {/* Quick Zone Switcher Buttons */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
            {FACE_ZONES.map((fz) => {
              const active = fz.id === activeZoneId;
              const cl = COLOR_MAP[fz.color];
              return (
                <button
                  key={fz.id}
                  onClick={() => {
                    setActiveZoneId(fz.id);
                    setExpandedSignIndex(0);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5 ${
                    active
                      ? `${cl.badge} ring-1 font-semibold`
                      : "border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>{fz.emoji}</span>
                  <span>{fz.zone.split(" ")[0]}</span>
                  <span lang="am" className="text-[10px] opacity-70">
                    {fz.am.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Zone Detailed Reading Card */}
        <div className="space-y-6">
          <div className={`rounded-3xl border ${c.border} ${c.bg} p-6 sm:p-8 space-y-6 shadow-xl transition-colors duration-300`}>
            {/* Zone Card Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-stone-800/60 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeZone.emoji}</span>
                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {activeZone.zone}
                  </h2>
                  <span lang="am" className="text-xl font-semibold text-amber-300">
                    {activeZone.am}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-stone-400">
                  Classical Domain: <span className="text-stone-200 font-semibold">{activeZone.correspondence}</span>
                  {" "}· <span lang="am" className="text-amber-200">{activeZone.correspondenceAm}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${c.badge}`}>
                  {activeZone.third}
                </span>
              </div>
            </div>

            {/* Biometric Marker Banner */}
            <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-3.5 flex items-center gap-3">
              <Cpu className={`size-4 shrink-0 ${c.text}`} aria-hidden="true" />
              <div className="text-xs">
                <span className="font-bold text-stone-200">Biometric Metric: </span>
                <span className="text-stone-300 font-mono">{activeZone.biometricMetric}</span>
              </div>
            </div>

            {/* Overview / Hermeneutic Narrative */}
            <div className="text-sm leading-relaxed text-stone-300 space-y-2">
              <p>{activeZone.overview}</p>
            </div>

            {/* Interactive Signs & Formations Accordion */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="size-3.5" aria-hidden="true" />
                Facial Signs & Neuromuscular Formations
              </h3>

              <div className="space-y-2">
                {activeZone.signs.map((sign, idx) => {
                  const isOpen = expandedSignIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-800/80 bg-stone-950/50 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedSignIndex(isOpen ? null : idx)}
                        className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-stone-900/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-xs font-bold">0{idx + 1}.</span>
                          <span className="font-bold text-sm text-stone-200">{sign.feature}</span>
                          <span lang="am" className="text-xs text-stone-400 hidden sm:inline">
                            — {sign.am}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="size-4 shrink-0 text-amber-400" />
                        ) : (
                          <ChevronDown className="size-4 shrink-0 text-stone-500" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-stone-800/60 space-y-2.5 text-xs">
                          <div>
                            <span className="font-semibold text-amber-300">Reflective Reading: </span>
                            <span className="text-stone-300 leading-relaxed">{sign.reading}</span>
                          </div>
                          <div className="rounded-xl bg-stone-900/70 p-2.5 text-stone-400 flex items-start gap-2">
                            <Cpu className="size-3.5 shrink-0 text-sky-400 mt-0.5" />
                            <div>
                              <span className="font-semibold text-sky-300">Biometric Correlate: </span>
                              <span>{sign.biometricNote}</span>
                            </div>
                          </div>
                          <div lang="am" className="text-[11px] text-amber-200/80 italic">
                            ትርጉም፦ {sign.am}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Facial Thirds & Bilateral Symmetry Guide ──────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-amber-400" aria-hidden="true" />
          <h2 className="text-xl font-extrabold text-white">
            Facial Thirds & Golden Symmetry
            <span lang="am" className="text-base font-semibold text-amber-300 ml-2">
              — የፊት ሦስት ክፍሎች እና ሚዛን
            </span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {BIOMETRIC_PROPORTIONS.map((bp, i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-800 bg-stone-900/60 p-5 space-y-2.5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <p className="font-bold text-sm text-stone-100">{bp.title}</p>
                <p className="text-xs text-stone-400 leading-relaxed mt-2">{bp.desc}</p>
              </div>
              <div className="pt-3 border-t border-stone-800/60 text-[11px] font-mono text-amber-400 flex items-center justify-between">
                <span>Standard Benchmark:</span>
                <span className="font-bold">{bp.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Eye Reading Sub-Section (የዓይን ንባብ) ────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="size-5 text-sky-400" aria-hidden="true" />
          <h2 className="text-xl font-extrabold text-white">
            Eye Formations & Ocular Reflections
            <span lang="am" className="text-base font-semibold text-sky-300 ml-2">
              — የዓይን ንባብ
            </span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EYE_SHAPES.map((es, i) => (
            <div key={i} className={`rounded-3xl border p-5 space-y-2 ${es.color} shadow-md`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{es.shape}</span>
                <span lang="am" className="text-xs opacity-75 font-semibold">
                  {es.am}
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-300">{es.trait}</p>
              <p className="text-xs leading-relaxed opacity-85">{es.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Face Shape Typology ───────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="size-5 text-emerald-400" aria-hidden="true" />
          <h2 className="text-xl font-extrabold text-white">
            Face Shape Typology & Elemental Correspondences
            <span lang="am" className="text-base font-semibold text-emerald-300 ml-2">
              — የፊት ቅርፅ ዓይነቶች
            </span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FACE_SHAPES.map((fs, i) => (
            <div
              key={i}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-3 ${fs.color} shadow-lg`}
            >
              <div>
                <p className="font-bold text-sm text-white">{fs.shape}</p>
                <p lang="am" className="text-xs opacity-70 mb-1">
                  {fs.am}
                </p>
                <span className="inline-block rounded-full bg-stone-900/60 px-2 py-0.5 text-[10px] font-mono text-stone-300 border border-stone-800">
                  {fs.element}
                </span>
                <p className="mt-2.5 text-xs leading-relaxed text-stone-300">{fs.qualities}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Practitioner Clinical & Cultural Notes ────────────────────── */}
      <section className="rounded-3xl border border-stone-800 bg-stone-900/50 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <Info className="size-5 text-amber-400" aria-hidden="true" />
          <span>Hexacore Practitioner Guidelines: The Art of Sine-Gets</span>
        </div>

        <ul className="grid gap-3 text-sm text-stone-300 sm:grid-cols-2 list-none">
          {[
            {
              title: "Dynamic vs. Static Differentiation",
              body: "Distinguish between permanent bone structure (constitutional destiny) and dynamic soft-tissue lines (current habitus, chronic tension, emotional weathering).",
            },
            {
              title: "Tri-Sign Triangulation",
              body: "Never read the face in isolation. Cross-reference signs with tongue coat (digestive fire) and palm mounts (vital trajectory) to form a coherent understanding.",
            },
            {
              title: "Environmental Lighting Protocol",
              body: "Always conduct observations under indirect natural daylight. Artificial fluorescent or warm incandescent lighting falsely exaggerates vascular redness and shadows.",
            },
            {
              title: "Absolute Ethical Compass",
              body: "Never use face reading to assess criminal culpability, trustworthiness, or racial traits. Such uses are unscientific, harmful, and strictly prohibited on this platform.",
            },
          ].map((item, idx) => (
            <li key={idx} className="rounded-2xl border border-stone-800/80 bg-stone-950/40 p-4 space-y-1">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block">
                {item.title}
              </span>
              <p className="text-xs text-stone-300 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Footer Navigation & Medical Disclaimer ────────────────────── */}
      <footer className="flex flex-col gap-6 border-t border-stone-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 max-w-xl text-[11px] text-stone-500">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
          <span>
            Face reading and biometric geometry are cultural and reflective educational modules. They do not constitute
            medical advice, dermatological diagnosis, or psychological evaluation. Consult certified professionals for health concerns.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/body-reading/palm"
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" /> Palm Reading
          </Link>
          <Link
            href="/hexacore"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
          >
            Hexacore Arcana <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
