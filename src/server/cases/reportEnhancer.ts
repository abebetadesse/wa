/**
 * Builds the detailed, editable report from the reviewer's analysis, in English or Amharic.
 *
 * Every section is assembled from this case: the person's own words, the patterns found in them,
 * every knowledge strand's reading, the steps that answer those patterns and, with consent, the
 * person's profile (life stage, place and season, wellbeing cautions, and a cultural reading from
 * their birth details). Nothing is sent as written here — the reviewer edits and approves each
 * section.
 *
 * Amharic reports use Amharic sentence frames and the phrase table in amharic.ts for every line
 * drawn from the case vocabularies. Text that only exists in English — reference-catalogue entries,
 * cross-strand links, engine notes and the astrological reading — is left out of an Amharic report
 * and listed in `omitted`, so the reviewer can add it by hand; a vocabulary line without a
 * translation is kept in English and listed in `untranslated`. The person's own words are always
 * quoted as written.
 *
 * Reflection-only case types (career, legal) receive no evidence-based sections, and no text is
 * generated at all while a safety warning is open (the review desk disables the button).
 */
import { toEthiopianDate } from "@/lib/cosmic/skyDay";
import { CONFIDENCE_MEANING, FACTOR_GUIDANCE } from "./analysisGuidance";
import { FACTORS } from "./analysisLexicon";
import { createTranslator, type ReportLanguage } from "./amharic";
import { layoutSections } from "./reportLayout";
import { CONTACTS, REFERRALS } from "./support";
import type { AnalysisConfidence, AnalysisSolution, CaseAnalysis, CaseLens, GroundedFinding, ReportSection } from "./types";

// Limits enforced when a draft is saved (schemas.ts).
const MAX_BODY = 7800;
const MAX_ITEM = 1900;
const MAX_ITEMS = 40;

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

const section = (id: string, title: string, body: string, items?: string[], cultural = false): ReportSection => {
  const points = (items ?? []).map((item) => clip(item.trim(), MAX_ITEM)).filter(Boolean).slice(0, MAX_ITEMS);
  return {
    id: `analysis-${id}`,
    title,
    body: clip(body, MAX_BODY),
    ...(points.length ? { items: points } : {}),
    locked: false,
    ...(cultural ? { cultural: true } : {}),
  };
};

const HORIZON_ORDER: AnalysisSolution["horizon"][] = ["now", "this_week", "ongoing"];
const PROFESSIONAL_STRANDS = new Set(["medication", "biochemical", "biological", "epidemiological", "addiction", "dietary"]);
const DOMAIN_B_STRANDS = new Set(["cultural", "astrological"]);
const FACTOR_BY_ID = new Map(FACTORS.map((factor) => [factor.id, factor]));
const RED_FLAG_QUESTION = "Have you noticed any of these: ";
const ENGINE_LABEL_AM: Record<string, string> = {
  urgency_screening: "የአስቸኳይና ደህንነት ምርመራ",
  intent_classification: "የጉዳይ ዓላማና ቋንቋ ምደባ",
  entity_extraction: "የጉዳይ ዝርዝር ማውጣት",
  knowledge_retrieval: "የዕውቀት ዘርፍ ማጣቀሻ",
  cross_strand_integration: "የዘርፎች ጥምረት",
  recommendation_synthesis: "የምክረ ሃሳብ ማዋሃድ",
  clinical_triage: "የጤና ምልክቶች ቅድመ ምርመራ",
  fasting_calendar: "የጾም ቀን መቁጠሪያ",
  agro_ecology: "የአግሮ-ኢኮሎጂ ዞን",
  fluoride: "የሪፍት ቫሊ የውሃ ፍሎራይድ",
  awde_negest: "የዓውደ ነገሥት የስም ንባብ",
  language_model: "የቋንቋ ሞዴል ማጠቃለያ",
};

/** Each knowledge strand, named for the person reading the report. */
export const STRAND_LABEL: Record<string, string> = {
  biological: "How the body works",
  biochemical: "Nutrients and body chemistry",
  medication: "Medicines and remedies",
  addiction: "Khat, alcohol and tobacco",
  ecological: "Water, place and environment",
  epidemiological: "Common illnesses in Ethiopia",
  psychological: "Mind and mood",
  socioeconomic: "Daily life and resources",
  dietary: "Food and fasting",
  cultural: "Culture and faith",
  astrological: "Traditional timing",
};

const sentence = (text: string) => (/[.!?።…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);
const amSentence = (text: string) => (/[.!?።…]$/.test(text.trim()) ? text.trim() : `${text.trim()}።`);
const lower = (text: string) => (/^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text);
const quoted = (quotes: string[], separator: string) => quotes.map((quote) => `“${quote}”`).join(separator);
const enList = (words: string[]) => (words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`);
const amList = (words: string[]) => (words.length <= 1 ? words.join("") : `${words.slice(0, -1).join("፣ ")} እና ${words[words.length - 1]}`);

const LANGUAGE_NAMES: Record<ReportLanguage | string, { en: string; am: string }> = {
  am: { en: "Amharic", am: "አማርኛ" },
  om: { en: "Afaan Oromoo", am: "አፋን ኦሮሞ" },
  ti: { en: "Tigrinya", am: "ትግርኛ" },
  so: { en: "Somali", am: "ሶማሊኛ" },
  en: { en: "English", am: "እንግሊዝኛ" },
};
const PROFILE_FIELD_AM: Record<string, string> = {
  age: "ዕድሜ",
  gender: "ጾታ",
  region: "ክልል",
  "medicines and health conditions": "መድኃኒቶችና የጤና ሁኔታዎች",
};
const CONFIDENCE_AM: Record<AnalysisConfidence, string> = { strong: "ጠንካራ", moderate: "መካከለኛ", tentative: "ግምታዊ" };
const HORIZON: Record<ReportLanguage, Record<AnalysisSolution["horizon"], string>> = {
  en: { now: "Consider now", this_week: "Consider this week", ongoing: "Ongoing" },
  am: { now: "አሁን ያስቡበት", this_week: "በዚህ ሳምንት ያስቡበት", ongoing: "ቀጣይነት ያለው" },
};
const SOURCE_AM: Record<string, string> = {
  "Case review protocol": "የጉዳይ ግምገማ ሥርዓት",
  "Clinical referral protocol": "የክሊኒካዊ ሪፈራል ሥርዓት",
  "Medical urgency protocol": "የህክምና አስቸኳይ ሁኔታ ሥርዓት",
  "Platform crisis protocol": "የመድረኩ የቀውስ ጊዜ ሥርዓት",
};

/** A grounding reason, without exposing raw profile values. */
function reason(matchedOn: string[]): string {
  return [...new Set(matchedOn.map((entry) => (entry.startsWith("Profile: ") ? "your profile" : entry)))].join("; ");
}

function formatDate(iso: string, language: ReportLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  if (language === "am") return toEthiopianDate(date.toISOString().slice(0, 10)).label;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export interface EnhancedReport {
  language: ReportLanguage;
  sections: ReportSection[];
  /** Vocabulary lines that had no Amharic and were kept in English. */
  untranslated: string[];
  /** English-only material left out of an Amharic report, for the reviewer to add by hand. */
  omitted: string[];
}

export interface EnhanceOptions {
  language?: ReportLanguage;
  /** False when the person did not agree to cultural and spiritual reflection: Part B is then left out. */
  culturalConsent?: boolean;
}

/** Creates editable report sections from the latest reviewer-only analysis. */
export function buildEnhancedReportSections(analysis: CaseAnalysis, profileConsented: boolean, options: EnhanceOptions = {}): ReportSection[] {
  return buildEnhancedReport(analysis, profileConsented, options).sections;
}

/** The report language that suits the person: their profile's, when they consented to its use. */
export function preferredReportLanguage(analysis: CaseAnalysis, profileConsented: boolean): ReportLanguage {
  return profileConsented && analysis.person?.language === "am" ? "am" : "en";
}

export function buildEnhancedReport(analysis: CaseAnalysis, profileConsented: boolean, { language = "en", culturalConsent = true }: EnhanceOptions = {}): EnhancedReport {
  const am = language === "am";
  const { t, untranslated } = createTranslator(language);
  const omitted: string[] = [];
  const omit = (what: string) => omitted.push(what);
  const say = (en: string, amharic: string) => (am ? amharic : en);
  const end = am ? amSentence : sentence;
  const strandName = (strand: string) => t(STRAND_LABEL[strand] ?? strand);
  const colon = am ? "፦ " : ": ";

  const sections: ReportSection[] = [];
  const full = analysis.publishScope === "full";
  const person = profileConsented ? analysis.person : undefined;
  const care = person?.care ?? [];
  // With a pregnancy or medicines on the profile, catalogue advice that needs a professional is left to that professional.
  const cautious = care.some((entry) => entry.id === "pregnancy" || entry.id === "medicines");
  const profileFields = [...new Set(analysis.dataQuality.used.filter((item) => item.startsWith("Profile: ")).map((item) => item.slice("Profile: ".length)))];
  const fieldName = (field: string) => (am ? PROFILE_FIELD_AM[field] ?? t(field) : field);
  const themes = analysis.factors.slice(0, 6);
  const clinical = analysis.clinical;
  const lenses: CaseLens[] = analysis.lenses ?? clinical?.lenses ?? [];

  // ── 1. The situation in the person's own words ─────────────────────────────
  const quotes = themes.flatMap((factor) => factor.quotes.slice(0, 2).map((quote) => `${t(factor.label)}${colon}“${quote}”`));
  if (analysis.narrative.excerpt || quotes.length) {
    const words = analysis.narrative.words;
    const basis = [
      words > 0 ? say(`${words} words in your own description`, `በራስዎ ገለጻ ውስጥ ያሉ ${words} ቃላት`) : "",
      profileConsented && profileFields.length
        ? say(`${profileFields.length} area${profileFields.length === 1 ? "" : "s"} of your profile (${enList(profileFields)})`, `የመገለጫዎ ${profileFields.length} ክፍሎች (${amList(profileFields.map(fieldName))})`)
        : "",
    ].filter(Boolean);
    const labels = themes.map((factor) => (am ? t(factor.label) : factor.label.toLowerCase()));
    const score = analysis.dataQuality.score;
    sections.push(section(
      "overview",
      say("Your situation, summarized", "ሁኔታዎ በአጭሩ"),
      [
        analysis.narrative.excerpt ? say(`What you shared: “${analysis.narrative.excerpt}”`, `ያጋሩት፦ “${analysis.narrative.excerpt}”`) : "",
        themes.length
          ? say(
            `We read ${themes.length === 1 ? "one main theme" : `${themes.length} themes`} in what you wrote: ${labels.join("; ")}. ${themes.length > 1 ? `${themes[0].label} carries the most weight.` : ""} The points below quote the words each one rests on, so you can see exactly what was understood and correct anything that was not.`,
            `በጻፉት ውስጥ ${themes.length === 1 ? "አንድ ዋና ርዕስ" : `${themes.length} ርዕሶች`} አንብበናል፦ ${labels.join("፤ ")}። ${themes.length > 1 ? `${t(themes[0].label)} ከፍተኛውን ክብደት ይይዛል። ` : ""}ከዚህ በታች ያሉት ነጥቦች እያንዳንዱ የተመሠረተበትን ቃልዎን ይጠቅሳሉ፤ በዚህም ምን እንደተረዳን አይተው ያልተረዳነውን ማስተካከል ይችላሉ።`,
          )
          : "",
        basis.length
          ? say(
            `This report was prepared on ${formatDate(analysis.generatedAt, language)} from ${enList(basis)}. On a scale of 100 for how much there was to work with, this request scores ${score}${score < 50 ? ", so several points below are necessarily cautious" : ""}.`,
            `ይህ ሪፖርት በ${formatDate(analysis.generatedAt, language)} ተዘጋጀ፤ መሠረቱ ${amList(basis)} ናቸው። ለመሥራት ምን ያህል መረጃ እንደነበረ በ100 ሲለካ ይህ ጥያቄ ${score} ያገኛል${score < 50 ? "፤ ስለዚህ ከዚህ በታች ያሉ በርካታ ነጥቦች በጥንቃቄ የተጻፉ ናቸው" : ""}።`,
          )
          : "",
        clinical?.readAs.length
          ? say(
            `We read ${enList(clinical.readAs.map((entry) => `“${entry.from}” as “${entry.to}”`))}; please say if that is not what you meant.`,
            `${amList(clinical.readAs.map((entry) => `“${entry.from}”ን “${entry.to}” ብለን`))} አንብበናል፤ ያሰቡት ይህ ካልሆነ እባክዎ ይንገሩን።`,
          )
          : "",
        say(
          "This summary reflects the information available at the time of review. Please tell your reviewer if anything is inaccurate or has changed.",
          "ይህ ማጠቃለያ በግምገማው ጊዜ የነበረውን መረጃ ያንጸባርቃል። የተሳሳተ ወይም የተለወጠ ነገር ካለ እባክዎ ለገምጋሚዎ ይንገሩ።",
        ),
      ].filter(Boolean).join("\n\n"),
      quotes,
    ));
  }

  // ── 2. Each theme, elaborated ──────────────────────────────────────────────
  if (full && themes.length) {
    sections.push(section(
      "themes",
      say("What stands out, theme by theme", "ጎልተው የሚታዩ ነጥቦች፣ በርዕስ በርዕስ"),
      say(
        "Each theme below was found in your own words. The note beside it describes how that theme usually works and what it tends to affect; it is general orientation, not a judgement about you.",
        "ከዚህ በታች ያለው እያንዳንዱ ርዕስ በራስዎ ቃላት ውስጥ የተገኘ ነው። ከጎኑ ያለው ማስታወሻ ርዕሱ በተለምዶ እንዴት እንደሚሰራና ምን እንደሚነካ ይገልጻል፤ አጠቃላይ አቅጣጫ እንጂ ስለ እርስዎ የተሰጠ ፍርድ አይደለም።",
      ),
      themes.map((factor, index) => {
        const guidance = FACTOR_GUIDANCE[factor.id];
        const prominence = index === 0 && themes.length > 1
          ? say("the most prominent theme", "ዋነኛው ርዕስ")
          : factor.quotes.length > 1 ? say(`raised in ${factor.quotes.length} places`, `በ${factor.quotes.length} ቦታዎች የተነሳ`) : say("mentioned once", "አንድ ጊዜ የተጠቀሰ");
        return `${t(factor.label)} (${prominence})${colon}${guidance ? t(guidance.insight) : say("Noted from your description.", "ከገለጻዎ የተወሰደ።")}`;
      }),
    ));
  }

  // ── 3. Patterns ────────────────────────────────────────────────────────────
  if (full && analysis.causes.length) {
    sections.push(section(
      "patterns",
      say("Patterns to consider together", "አብረው ሊታዩ የሚገባቸው ንድፎች"),
      [
        say(
          "These are possible explanations to discuss, not diagnoses or confirmed causes. They are ranked by how strongly the current information supports them.",
          "እነዚህ ለውይይት የቀረቡ ሊሆኑ የሚችሉ ማብራሪያዎች ናቸው እንጂ የበሽታ ምርመራ ወይም የተረጋገጡ ምክንያቶች አይደሉም። አሁን ያለው መረጃ ምን ያህል እንደሚደግፋቸው ተደርድረዋል።",
        ),
        say(
          `How to read the confidence labels — strong: ${CONFIDENCE_MEANING.strong}; moderate: ${CONFIDENCE_MEANING.moderate}; tentative: ${CONFIDENCE_MEANING.tentative}.`,
          `የእርግጠኝነት መለያዎቹን እንዴት ማንበብ እንደሚቻል — ጠንካራ፦ ${t(CONFIDENCE_MEANING.strong)}፤ መካከለኛ፦ ${t(CONFIDENCE_MEANING.moderate)}፤ ግምታዊ፦ ${t(CONFIDENCE_MEANING.tentative)}።`,
        ),
      ].join("\n\n"),
      analysis.causes.slice(0, 5).map((cause) => {
        const confirm = [...new Set(cause.factors.map((id) => FACTOR_BY_ID.get(id)?.followUp).filter((question): question is string => Boolean(question)))].slice(0, 2);
        // A single theme's explanation is composed in analysis.ts ("Raised once in the request…").
        const raised = /^Raised (once|(\d+) times) in the request/.exec(cause.explanation);
        const explanation = am && raised
          ? `በጥያቄው ውስጥ ${raised[2] ? `${raised[2]} ጊዜ` : "አንድ ጊዜ"} ተነስቷል። ከእርስዎ ጋር ሊረጋገጥ የሚገባ አስተዋጽኦ ያለው ምክንያት አድርገው ይዩት።`
          : t(cause.explanation);
        return [
          am ? `${t(cause.title)} (${CONFIDENCE_AM[cause.confidence]} እርግጠኝነት)፦ ${amSentence(explanation)}` : `${cause.title} (${cause.confidence} confidence): ${sentence(explanation)}`,
          cause.because.length ? `${say("What you shared that suggests it:", "ይህን የሚጠቁመው ያጋሩት፦")} ${quoted(cause.because, am ? "፤ " : "; ")}` : "",
          confirm.length ? `${say("What would confirm or rule it out:", "ሊያረጋግጠው ወይም ሊያስወግደው የሚችለው፦")} ${confirm.map(t).join(" ")}` : "",
          cause.strands.length ? `${say("Areas of knowledge that support it:", "የሚደግፉት የዕውቀት ዘርፎች፦")} ${am ? cause.strands.map(strandName).join("፤ ") : enList(cause.strands.map(strandName))}${am ? "።" : "."}` : "",
        ].filter(Boolean).join(" ");
      }),
    ));
  }

  // ── 3b. The health check: how soon, what may be looked at, what to bring ───
  if (full && clinical) {
    const symptomLabels = clinical.symptoms.map((symptom) => (am ? t(symptom.label) : symptom.label.toLowerCase()));
    const timeframe = t(clinical.priority.timeframe);
    const reassure = clinical.priority.level !== "routine";
    sections.push(section(
      "health-check",
      say("Seeing a health worker: how soon, and what may be checked", "ጤና ባለሙያ ማየት፦ መቼ፣ እና ምን ሊመረመር ይችላል"),
      [
        clinical.priority.level === "emergency"
          ? say(`What you describe should be seen ${timeframe}. Please do not wait for the rest of this report.`, `የገለጹት ${timeframe} መታየት አለበት። እባክዎ የዚህን ሪፖርት ቀሪ ክፍል አይጠብቁ።`)
          : say(
            `For ${enList(symptomLabels)}, we suggest an in-person visit to a health centre or clinic ${timeframe}.${reassure ? " This is not cause for alarm: it is the usual advice for this combination, because the common causes are found with simple tests and are easier to treat early." : ""}`,
            `ለ${amList(symptomLabels)}፣ ${timeframe} በጤና ጣቢያ ወይም ክሊኒክ በአካል እንዲታዩ እንመክራለን።${reassure ? " ይህ የሚያስደነግጥ አይደለም፦ ለዚህ ጥምረት የተለመደው ምክር ነው፤ ምክንያቱም የተለመዱት ምክንያቶች በቀላል ምርመራ ይገኛሉ፣ ቶሎ ሲታከሙም ይቀላሉ።" : ""}`,
          ),
        say(
          "This service cannot examine you or say what is causing your symptoms. The list below is what a health worker may choose from; most are quick and routine, and being offered one does not mean that anything particular is expected.",
          "ይህ አገልግሎት ሊመረምርዎ ወይም ምልክቶችዎን ምን እንደሚያመጣቸው ሊናገር አይችልም። ከዚህ በታች ያለው ዝርዝር የጤና ባለሙያ ሊመርጥባቸው የሚችላቸው ናቸው፤ አብዛኞቹ ፈጣንና መደበኛ ናቸው፣ አንዱ መሰጠቱም የተለየ ነገር ይጠበቃል ማለት አይደለም።",
        ),
        say(
          `To make the visit count, bring every medicine, painkiller and traditional remedy you use (or their names), and be ready to answer: ${clinical.describe.slice(0, 3).join(" ")}`,
          `ምርመራው ውጤታማ እንዲሆን የሚጠቀሙትን እያንዳንዱን መድኃኒት፣ የህመም ማስታገሻና ባህላዊ መድኃኒት (ወይም ስማቸውን) ይዘው ይሂዱ፤ ለሚከተሉትም መልስ ያዘጋጁ፦ ${clinical.describe.slice(0, 3).map(t).join(" ")}`,
        ),
      ].join("\n\n"),
      [...new Set(clinical.checks.map((check) => end(t(check))))],
    ));
  }

  // ── 3c. Every strand's reading ─────────────────────────────────────────────
  const angles = lenses
    .filter((lens) => lens.layer === "A")
    .flatMap((lens) => lens.points.filter((point) => point.person).slice(0, 2).map((point) => `${strandName(lens.strand)}${colon}${t(point.person)}`));
  if (full && angles.length) {
    const read = lenses.filter((lens) => lens.points.some((point) => point.person)).length;
    sections.push(section(
      "angles",
      say("Looking at it from every angle", "ከሁሉም አቅጣጫ ማየት"),
      clinical
        ? say(
          `Your request was read through ${read} areas of knowledge. Each adds something practical you can do or mention while the cause is being looked for. None of them is a diagnosis.`,
          `ጥያቄዎ በ${read} የዕውቀት ዘርፎች ታይቷል። እያንዳንዱ ምክንያቱ እስኪፈለግ ድረስ ሊያደርጉት ወይም ሊጠቅሱት የሚችሉትን ተግባራዊ ነገር ይጨምራል። አንዳቸውም የበሽታ ምርመራ አይደሉም።`,
        )
        : say(
          `Your request was read through ${read} areas of knowledge — body, mind, food, money, community, faith and more. Each adds something practical you can try or keep in mind. None of them is a judgement about you.`,
          `ጥያቄዎ በ${read} የዕውቀት ዘርፎች ታይቷል — ሰውነት፣ አእምሮ፣ ምግብ፣ ገንዘብ፣ ማኅበረሰብ፣ እምነትና ሌሎችም። እያንዳንዱ ሊሞክሩት ወይም ሊያስታውሱት የሚችሉትን ተግባራዊ ነገር ይጨምራል። አንዳቸውም ስለ እርስዎ የተሰጠ ፍርድ አይደሉም።`,
        ),
      angles,
    ));
  }

  // ── 4. Connections between areas ───────────────────────────────────────────
  if (full && analysis.intersections.length) {
    if (am) omit(`${analysis.intersections.length} cross-strand link${analysis.intersections.length === 1 ? "" : "s"} (catalogue text in English)`);
    else {
      sections.push(section(
        "connections",
        "How different areas may connect",
        "These connections help organize the discussion; they are not proof that one issue caused another.",
        analysis.intersections.slice(0, 4).map((link) => `${link.title.charAt(0).toUpperCase()}${link.title.slice(1)} (${link.strands.map((strand) => STRAND_LABEL[strand] ?? strand).join(" + ")}): ${sentence(link.description)} Consider: ${link.recommendation}`),
      ));
    }
  }

  // ── 5. Next steps, in order ────────────────────────────────────────────────
  const solutions = analysis.solutions.filter((solution) => !(cautious && solution.id.startsWith("knowledge-") && solution.needsProfessional));
  if (full && solutions.length) {
    const causeTitle = new Map(analysis.causes.map((cause) => [cause.id, cause.title]));
    const ordered = HORIZON_ORDER.flatMap((horizon) => solutions.filter((solution) => solution.horizon === horizon)).slice(0, 7);
    const items = ordered.flatMap((solution) => {
      const fromCatalogue = solution.id.startsWith("knowledge-");
      if (am && (fromCatalogue || solution.id === "safety")) {
        omit(fromCatalogue ? `Reference guidance “${solution.title}”` : "The safety-first step (written for the reviewer)");
        return [];
      }
      // The visit is written to the person here; analysis.ts words it for the reviewer.
      const steps = solution.id === "health-assessment" && clinical
        ? healthVisitSteps(clinical, am, t)
        : solution.id.startsWith("plan-") ? planAdvice(analysis, solution).map(t) : solution.steps.map((step) => t(step));
      const answers = solution.addresses.map((id) => causeTitle.get(id)).filter((title): title is string => Boolean(title));
      const title = solution.id === "health-assessment"
        ? say("A health check", "የጤና ምርመራ")
        : fromCatalogue ? `reference guidance under “${solution.title}” (a catalogue heading, not a diagnosis)` : t(solution.title.replace(/^Plan for: /, ""));
      return [[
        `${HORIZON[language][solution.horizon]} — ${title}${colon}${steps.map((step, index) => `(${index + 1}) ${end(step)}`).join(" ")}`,
        fromCatalogue && answers.length ? `Relevant to: ${answers.join("; ")}.` : "",
        solution.needsProfessional ? say("Confirm with a qualified professional before acting.", "ከመተግበርዎ በፊት ብቁ ከሆነ ባለሙያ ጋር ያረጋግጡ።") : "",
        `${say("Source:", "ምንጭ፦")} ${am ? SOURCE_AM[solution.source] ?? t(solution.source) : solution.source}${am ? "።" : "."}`,
      ].filter(Boolean).join(" ")];
    });
    if (items.length) {
      sections.push(section(
        "next-steps",
        say("Possible next steps", "ሊወሰዱ የሚችሉ ቀጣይ እርምጃዎች"),
        [
          say(
            "These options are drawn from the current case analysis. Choose only what fits your circumstances, and confirm any specialist or health-related step with a qualified professional.",
            "እነዚህ አማራጮች ከአሁኑ የጉዳይ ትንተና የተወሰዱ ናቸው። ከሁኔታዎ ጋር የሚስማማውን ብቻ ይምረጡ፤ ማንኛውንም የልዩ ባለሙያ ወይም ከጤና ጋር የተያያዘ እርምጃ ብቁ ከሆነ ባለሙያ ጋር ያረጋግጡ።",
          ),
          say(
            "They are ordered by when to consider them — now, this week, then ongoing — and each one names the pattern it answers, so a step can be dropped if that pattern does not fit.",
            "የሚታሰቡበት ጊዜ ተደርድረዋል — አሁን፣ በዚህ ሳምንት፣ ከዚያም ቀጣይነት ያለው — እያንዳንዱም የሚመልሰውን ንድፍ ይጠቅሳል፤ ንድፉ ካልተስማማ እርምጃው ሊተው ይችላል።",
          ),
          ...care.map((entry) => t(entry.report)),
        ].join("\n\n"),
        items,
      ));
    }
  }

  // ── 6. When not to wait ────────────────────────────────────────────────────
  if (full && themes.length) {
    const has = (...ids: string[]) => themes.some((factor) => ids.includes(factor.id));
    const signs = [
      ...themes.map((factor) => FACTOR_GUIDANCE[factor.id]?.watchFor).filter((line): line is string => Boolean(line)).map(t),
      ...(clinical?.redFlags.length
        ? [say(
          `Do not wait for your planned visit if you notice any of these: ${clinical.redFlags.map(lower).join("; ")}.`,
          `ከሚከተሉት አንዱን ካስተዋሉ የታቀደውን ምርመራ አይጠብቁ፦ ${clinical.redFlags.map(t).join("፤ ")}።`,
        )]
        : []),
    ];
    const services = [
      say(
        `Urgent help: ${CONTACTS.crisisLine.name} ${CONTACTS.crisisLine.number}; ${CONTACTS.police.name} ${CONTACTS.police.number}; ${CONTACTS.ambulance.name} ${CONTACTS.ambulance.number}.`,
        `አስቸኳይ እርዳታ፦ ${t(CONTACTS.crisisLine.name)} ${CONTACTS.crisisLine.number}፤ ${t(CONTACTS.police.name)} ${CONTACTS.police.number}፤ ${t(CONTACTS.ambulance.name)} ${CONTACTS.ambulance.number}።`,
      ),
      ...(has("low_mood", "anxiety", "sleep", "grief", "substance", "isolation") ? [say(`For support with mood, sleep or substance use: ${REFERRALS.healthCenter}.`, `ለስሜት፣ ለእንቅልፍ ወይም ለሱስ ድጋፍ፦ ${t(REFERRALS.healthCenter)}።`)] : []),
      ...(clinical
        ? [say(
          "For the health check: your nearest health centre, or a hospital outpatient department; many first tests are free or covered by community-based health insurance (CBHI).",
          "ለጤና ምርመራው፦ በአቅራቢያዎ ያለ ጤና ጣቢያ ወይም የሆስፒታል የተመላላሽ ክፍል፤ ብዙ የመጀመሪያ ምርመራዎች ነጻ ናቸው ወይም በማኅበረሰብ አቀፍ የጤና መድን (CBHI) ይሸፈናሉ።",
        )]
        : []),
      ...(has("money", "work") ? [say(`For hardship: ${REFERRALS.socialServices}.`, `ለችግር ጊዜ፦ ${t(REFERRALS.socialServices)}።`)] : []),
      ...(has("legal") ? [say(`For legal questions: ${REFERRALS.legalAid}.`, `ለህግ ጥያቄዎች፦ ${t(REFERRALS.legalAid)}።`)] : []),
      ...(has("family", "conflict", "spiritual", "grief") ? [say(`Someone to stand with you: ${lower(REFERRALS.elders)}.`, `ከጎንዎ የሚቆም ሰው፦ ${t(REFERRALS.elders)}።`)] : []),
    ];
    if (signs.length) {
      sections.push(section(
        "act-sooner",
        say("When to seek help sooner", "ቶሎ እርዳታ መፈለግ ያለብዎት መቼ ነው"),
        say(
          "Most of what is described here can be worked on step by step. The signs below, chosen for the themes in your request, mean it should not wait for the next message from your reviewer.",
          "እዚህ የተገለጸው አብዛኛው በደረጃ ሊሰራበት ይችላል። ለጥያቄዎ ርዕሶች የተመረጡት ከዚህ በታች ያሉት ምልክቶች ግን የገምጋሚዎን ቀጣይ መልዕክት መጠበቅ እንደሌለበት ያሳያሉ።",
        ),
        [...signs, ...services],
      ));
    }
  }

  // ── 7. Reference knowledge that applies ────────────────────────────────────
  // Only entries the person named, or that several of their statements support: the catalogues are
  // broad, and a loosely matched entry reads as noise (or as a claim) in a report.
  const references: GroundedFinding[] = analysis.strands
    .filter((strand) => strand.layer === "A")
    .flatMap((strand) => strand.findings)
    .filter((finding) => finding.relevance >= 0.6 || finding.matchedOn.some((entry) => entry.startsWith("Mentioned:")))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 4);
  if (full && references.length) {
    if (am) omit(`${references.length} reference knowledge entr${references.length === 1 ? "y" : "ies"} (catalogue text in English)`);
    else {
      sections.push(section(
        "knowledge",
        "Reference knowledge behind this report",
        `${analysis.strands.reduce((sum, strand) => sum + strand.considered, 0)} reference entries across ${analysis.strands.length} knowledge areas were checked against your request; the ${references.length === 1 ? "one" : references.length} below ${references.length === 1 ? "is" : "are"} the most closely supported by what you wrote. They are background reading: a heading is the name used by the reference source and does not mean the entry describes you.`,
        references.map((finding) => {
          const needsProfessional = PROFESSIONAL_STRANDS.has(finding.strand);
          return `${finding.name} (${STRAND_LABEL[finding.strand] ?? finding.strand}): ${sentence(clip(finding.summary || "Reference entry", 260))} Included because of — ${reason(finding.matchedOn)}.${needsProfessional ? " Anything here that touches your health is for a qualified professional to confirm." : ""}${finding.source ? ` Source: ${finding.source}.` : ""}`;
        }),
      ));
    }
  }

  // ── 7a. Trace each knowledge strand and analysis engine ────────────────────
  const strandData = new Map(analysis.strands.map((strand) => [strand.strand, strand]));
  const strandLens = new Map(lenses.map((lens) => [lens.strand, lens]));
  const coverageStrands = Object.keys(STRAND_LABEL).filter((strand) => full || DOMAIN_B_STRANDS.has(strand));
  const coverageItems = coverageStrands.map((strand) => {
    const data = strandData.get(strand);
    const lens = strandLens.get(strand);
    const label = strandName(strand);
    const considered = data?.considered ?? 0;
    const kept = data?.kept ?? 0;
    const profileMatches = (data?.findings ?? []).filter((finding) =>
      finding.matchedOn.some((match) => match.startsWith("Profile: "))
    ).length;
    const lensPoints = (lens?.points ?? []).flatMap((point) => point.person ? [t(point.person)] : []).slice(0, 2);

    if (am) {
      if (data?.findings.length) omit(`${data.findings.length} ${STRAND_LABEL[strand] ?? strand} library findings and sources (English catalogue text)`);
      return `${label}፦ ${considered} የማጣቀሻ ግቤቶች ተመርምረዋል፤ ${kept} ከጉዳዩ መረጃ ጋር ተዛምደዋል፤ ${profileMatches} ከመገለጫ ሁኔታ ጋርም ተዛምደዋል።${lensPoints.length ? ` ${lensPoints.join(" ")}` : ""}${data?.layer === "B" && analysis.safety.domainBSuppressed ? " የደህንነት ጉዳይ በመገምገም ላይ ስለሆነ ይህ ክፍል ተወግዷል።" : ""}`;
    }

    if (data?.layer === "B" && analysis.safety.domainBSuppressed) {
      return `${label}: cultural reflection was withheld while a safety concern is active.`;
    }

    const sources = [...new Set((data?.findings ?? []).map((finding) => finding.source).filter((source): source is string => Boolean(source)))];
    const findingDetails = kept > 0
      ? [`${kept} grounded reference ${kept === 1 ? "entry" : "entries"} were retained after comparing the case and available profile details.`,
        `${profileMatches} retained ${profileMatches === 1 ? "entry also reflects" : "entries also reflect"} the available profile context.`,
        ...(sources.length ? [`Library/source: ${sources.join("; ")}`] : [])]
      : [];
    const caseAngle = lensPoints.length ? `Case-specific reading: ${lensPoints.join(" ")}` : "";
    const noMatch = kept === 0
      ? "No catalogue finding was retained as sufficiently connected to the submitted case and available profile; this does not establish that a factor is absent."
      : "";
    return [
      `${label}: ${considered} reference-library entries considered; ${kept} grounded to the submitted case.`,
      findingDetails.length ? findingDetails.join(" | ") : noMatch,
      caseAngle,
    ].filter(Boolean).join(" ");
  });

  const engineItems = analysis.engines.map((engine) => {
    if (am) return `${ENGINE_LABEL_AM[engine.id] ?? "ተጨማሪ ትንተና"}፦ ለዚህ ጉዳይ ተጠቅሟል።`;
    const details = [engine.summary, ...engine.items].filter(Boolean);
    return `${engine.title}: ${details.join(" ")}`;
  });

  if (coverageItems.length || engineItems.length) {
    if (am && engineItems.length) omit(`${analysis.engines.length} analysis engine descriptions (English technical output)`);
    sections.push(section(
      "coverage",
      say("Knowledge strands, reference libraries and engines reviewed", "የተመረመሩ የዕውቀት ዘርፎች፣ ማጣቀሻ ቤተ-መጻሕፍትና ኤንጂኖች"),
      say(
        "Each strand below was checked against the submitted case and, when consented, relevant profile context. “Grounded” counts entries supported by the information available; it is a relevance measure, not a diagnosis. Source names are included where the library supplied them. The engines listed are the analysis and context engines that ran for this case.",
        "ከዚህ በታች ያሉት ዘርፎች በቀረበው ጉዳይና ፈቃድ በተሰጠበት ጊዜ በሚመለከተው የመገለጫ ሁኔታ ተመርምረዋል። “ከመረጃ ጋር ተዛምዷል” የሚለው በተገኘው መረጃ የተደገፉ ግቤቶችን ይቆጥራል፤ የበሽታ ምርመራ አይደለም። የማጣቀሻ ምንጮች ስሞች በእንግሊዝኛ ስለሆኑ ለገምጋሚው ተዘርዝረዋል። ከታች ያሉት ኤንጂኖች ለዚህ ጉዳይ የሰሩ የትንተናና የአውድ ኤንጂኖች ናቸው።",
      ),
      [...coverageItems, ...engineItems],
    ));
  }

  // ── 7b. Foods and plants the person shared ─────────────────────────────────
  const shared = analysis.foodAndHerbs;
  if (full && shared && (shared.meals.length || shared.herbs.length)) {
    const pregnancy = care.some((entry) => entry.id === "pregnancy");
    const allergies = care.some((entry) => entry.id === "allergies");
    const meals = shared.meals.map((meal) => am
      ? `${meal.nameAmharic || meal.name} (${meal.name})፦ ከመድረኩ የምግብ ስብጥር ሰንጠረዥ ጋር ተዛምዶ በእርስዎ ተረጋግጧል።${allergies ? " በመገለጫዎ ላይ ካሉት አለርጂዎች ጋር ያወዳድሩት።" : ""}`
      : `${meal.name}: ${meal.fasting}; ${meal.glycemic.toLowerCase()}.${meal.nutrients.length ? ` Notable per 100 g: ${meal.nutrients.slice(0, 3).map((line) => line.split(" — ")[0].replace(/ per 100 g$/, "")).join(", ")}.` : ""}${allergies ? " Check it against the allergies on your profile." : ""} Source: ${meal.source}.`);
    const herbs = shared.herbs.map((herb) => {
      const classes = [...new Set(herb.interactions.map((interaction) => interaction.drugClass.replace(/\s*\(.*\)$/, "").toLowerCase()))];
      const onProfile = herb.interactions.some((interaction) => interaction.onProfile);
      if (am) {
        return [
          `${herb.amharicName || herb.name} (${herb.name})፦`,
          classes.length ? `ከ${classes.length} የመድኃኒት አይነቶች ጋር እንደሚጋጭ ይታወቃል${onProfile ? "፤ መገለጫዎም ከእነዚህ አንዱን ይዘረዝራል" : ""}።` : "",
          pregnancy ? "በደህንነት መገለጫዎ በተመዘገበው ምክንያት ያለ ጤና ባለሙያዎ ስምምነት አይጠቀሙት።" : "ከመጠቀምዎ በፊት፣ በተለይ ከሌሎች መድኃኒቶች ጋር፣ ለፋርማሲስት ወይም ለጤና ባለሙያ ያሳዩት።",
        ].filter(Boolean).join(" ");
      }
      return [
        `${herb.name} (${herb.amharicName}): ${sentence(herb.safetyLabel)}`,
        cautious ? "" : `Traditionally: ${sentence(clip(herb.traditionalUse, 260))}`,
        classes.length ? `Known to interact with ${enList(classes)}${onProfile ? ", and your profile lists a medicine of that kind" : ""}.` : "",
        pregnancy ? "Because of what your wellbeing profile records, do not use it without your health provider's agreement." : "Show it to a pharmacist or health worker before using it, especially alongside other medicines.",
      ].filter(Boolean).join(" ");
    });
    const counts = [shared.meals.length ? say(`${shared.meals.length} food${shared.meals.length === 1 ? "" : "s"}`, `${shared.meals.length} ምግብ`) : "", shared.herbs.length ? say(`${shared.herbs.length} plant${shared.herbs.length === 1 ? "" : "s"}`, `${shared.herbs.length} ተክል`) : ""].filter(Boolean);
    sections.push(section(
      "food-herbs",
      say("The foods and plants you shared", "ያጋሯቸው ምግቦችና ተክሎች"),
      say(
        `You shared ${counts.join(" and ")} with your reviewer. Each was matched to the platform's food composition table or traditional-medicine reference and confirmed by you; your photos were not kept. This is general reference information, not a prescription: no preparation or dose is suggested here.`,
        `${counts.join(" እና ")} ለገምጋሚዎ አጋርተዋል። እያንዳንዱ ከመድረኩ የምግብ ስብጥር ሰንጠረዥ ወይም ከባህላዊ መድኃኒት ማጣቀሻ ጋር ተዛምዶ በእርስዎ ተረጋግጧል፤ ፎቶዎችዎ አልተቀመጡም። ይህ አጠቃላይ የማጣቀሻ መረጃ ነው እንጂ የመድኃኒት ትዕዛዝ አይደለም፦ እዚህ ምንም አዘገጃጀት ወይም መጠን አልተጠቆመም።`,
      ),
      [...meals, ...herbs],
    ));
  }

  // ── 8. The person: what the profile adds ───────────────────────────────────
  if (profileConsented) {
    const profileFindings = analysis.strands.flatMap((strand) => strand.findings)
      .filter((finding) => finding.matchedOn.some((match) => match.startsWith("Profile: ")))
      .slice(0, 4)
      .map((finding) => `${finding.name}: ${finding.summary}`);
    // The zone is already given with the place; nutrient and water detail is dropped when the profile calls for caution.
    const context = analysis.engines
      .filter((engine) => ["fasting_calendar", "fluoride"].includes(engine.id) || (engine.id === "agro_ecology" && !person?.place?.zone))
      .map((engine) => `${engine.title}: ${sentence(engine.summary)}${engine.items.length && !cautious ? ` ${engine.items.map(sentence).join(" ")} Check any change of diet or supplement with a health professional.` : ""}`);
    if (am && context.length) omit(`${context.length} engine note${context.length === 1 ? "" : "s"} (fasting calendar, zone or water; English only)`);
    if (am && profileFindings.length) omit(`${profileFindings.length} profile-linked catalogue entr${profileFindings.length === 1 ? "y" : "ies"}`);
    const missing = analysis.dataQuality.gaps
      .filter((gap) => gap.startsWith("The profile has no ") && !gap.includes("gender"))
      .map((gap) => gap.slice("The profile has no ".length));
    const languageName = person?.language ? LANGUAGE_NAMES[person.language] : undefined;
    const items = [
      ...(person?.lifeStage ? [say(
        `Life stage — ${person.lifeStage.label} (${person.lifeStage.band}): ${person.lifeStage.considerations.join(" ")}`,
        `የሕይወት ደረጃ — ${t(person.lifeStage.label)} (${t(person.lifeStage.band)})፦ ${person.lifeStage.considerations.map(t).join(" ")}`,
      )] : []),
      ...(person?.place ? [say(
        `Where you live — ${person.place.region}${person.place.zone ? `, ${person.place.zone}` : ""}: ${person.place.notes.join(" ")}`,
        `የሚኖሩበት — ${person.place.region}${person.place.zone ? `፣ ${person.place.zone}` : ""}፦ ${person.place.notes.map(t).join(" ")}`,
      )] : []),
      ...(am ? [] : context),
      ...care.map((entry) => t(entry.report)),
      ...(languageName && !(am && person?.language === "am")
        ? [say(
          `Language: your profile prefers ${languageName.en}. Tell your reviewer if you would like this report, or a conversation about it, in that language.`,
          `ቋንቋ፦ መገለጫዎ ${languageName.am} ይመርጣል። ይህን ሪፖርት ወይም ስለእሱ ውይይት በዚያ ቋንቋ ከፈለጉ ለገምጋሚዎ ይንገሩ።`,
        )]
        : []),
      ...(am ? [] : profileFindings),
      ...(missing.length
        ? [say(
          `Not yet on your profile: ${enList(missing)}. Adding ${missing.length === 1 ? "it" : "them"} would let a future review be more specific.`,
          `በመገለጫዎ ላይ ገና ያልተመዘገቡ፦ ${amList(missing.map(fieldName))}። ${missing.length === 1 ? "እሱን" : "እነሱን"} መጨመር የወደፊቱ ግምገማ ይበልጥ የተለየ እንዲሆን ያስችላል።`,
        )]
        : []),
    ];
    sections.push(section(
      "profile-context",
      say("Personal context and what to verify", "የግል ሁኔታና ሊረጋገጥ የሚገባው"),
      profileFields.length
        ? say(
          `With consent, the analysis considered these available profile areas where relevant: ${profileFields.join(", ")}. The points below show how each one shaped this report. Please confirm that this context is accurate and current.`,
          `በፈቃድዎ፣ ትንተናው አግባብ ባለበት እነዚህን የመገለጫ ክፍሎች ተመልክቷል፦ ${profileFields.map(fieldName).join("፣ ")}። ከዚህ በታች ያሉት ነጥቦች እያንዳንዱ ይህን ሪፖርት እንዴት እንደቀረጸው ያሳያሉ። እባክዎ ይህ መረጃ ትክክልና ወቅታዊ መሆኑን ያረጋግጡ።`,
        )
        : say(
          "Profile use was consented to, but the analysis did not have enough relevant profile information to personalize a finding. This report is grounded mainly in the case information provided.",
          "መገለጫ ለመጠቀም ፈቃድ ተሰጥቷል፤ ነገር ግን ትንተናው ግኝትን ለግል ለማድረግ በቂ ተዛማጅ የመገለጫ መረጃ አልነበረውም። ይህ ሪፖርት በዋናነት በጉዳዩ መረጃ ላይ የተመሠረተ ነው።",
        ),
      items,
    ));
  } else {
    sections.push(section(
      "profile-context",
      say("Personal context and what to verify", "የግል ሁኔታና ሊረጋገጥ የሚገባው"),
      say(
        "Account and wellbeing profile details were not used. This report is grounded in the information shared in this case and its follow-up messages.",
        "የመለያና የደህንነት መገለጫ ዝርዝሮች ጥቅም ላይ አልዋሉም። ይህ ሪፖርት በዚህ ጉዳይና በተከታይ መልዕክቶቹ በተጋራው መረጃ ላይ የተመሠረተ ነው።",
      ),
    ));
  }

  // ── 9. Cultural and spiritual reflection ───────────────────────────────────
  if (analysis.reflections.length) {
    if (am) omit(`${Math.min(5, analysis.reflections.length)} cultural reflection entr${analysis.reflections.length === 1 ? "y" : "ies"} from the catalogue`);
    else {
      sections.push(section(
        "reflections",
        "Themes from Ethiopian tradition",
        "These optional reflections are kept separate from evidence-based explanations. Keep only those that fit your own beliefs and preferences.",
        analysis.reflections.slice(0, 5).map((finding) => `${finding.name}: ${sentence(finding.summary)}${finding.steps.length ? ` Possible reflection prompts: ${finding.steps.map(sentence).join(" ")}` : ""}${finding.matchedOn.length ? ` Offered because of — ${reason(finding.matchedOn)}.` : ""}`),
        true,
      ));
    }
  }

  const traditions = lenses
    .filter((lens) => lens.layer === "B")
    .flatMap((lens) => lens.points.filter((point) => point.person).map((point) => `${strandName(lens.strand)}${colon}${t(point.person)}`));
  if (traditions.length && !analysis.safety.domainBSuppressed) {
    sections.push(section(
      "traditions",
      clinical ? say("Faith, tradition and timing alongside care", "እምነት፣ ትውፊትና የጊዜ አቆጣጠር ከእንክብካቤ ጎን") : say("Faith, tradition and timing", "እምነት፣ ትውፊትና የጊዜ አቆጣጠር"),
      clinical
        ? say(
          "Optional reflections, kept apart from the health advice above. They are offered so that prayer, fasting and traditional practice can sit alongside the health check rather than in place of it.",
          "ከላይ ካለው የጤና ምክር ተለይተው የተቀመጡ አማራጭ ማሰላሰያዎች ናቸው። ጸሎት፣ ጾምና ባህላዊ ልምዶች የጤና ምርመራውን ከመተካት ይልቅ ከጎኑ እንዲቆሙ ቀርበዋል።",
        )
        : say(
          "Optional reflections, kept apart from the practical points above. Keep only those that fit your own beliefs.",
          "ከላይ ካሉት ተግባራዊ ነጥቦች ተለይተው የተቀመጡ አማራጭ ማሰላሰያዎች ናቸው። ከእምነትዎ ጋር የሚስማሙትን ብቻ ይያዙ።",
        ),
      traditions,
      true,
    ));
  }

  const reading = person?.reading;
  if (reading && !analysis.safety.domainBSuppressed) {
    if (am) omit("The personal reading from birth details (English only)");
    else {
      sections.push(section(
        "personal-reading",
        "Timing and temperament from your personal profile",
        [
          `${reading.signature}.`,
          reading.basis,
          "This is a cultural reflection drawn from your birth details and today's sky. It is offered for self-understanding and for choosing your moment; it does not predict outcomes and is not advice.",
        ].join("\n\n"),
        [
          ...(reading.matter ? [reading.matter.note] : []),
          ...reading.temperament,
          ...reading.timing,
          // Food lines from the constitution are left out when the wellbeing profile calls for caution.
          ...(care.length ? reading.constitution.filter((line) => line.startsWith("Season:")) : reading.constitution),
        ],
        true,
      ));
    }
  }

  // ── 10. What would sharpen it ──────────────────────────────────────────────
  if (analysis.dataQuality.followUps.length) {
    // The warning-sign question is composed in analysis.ts; in Amharic it is rebuilt from its parts.
    const question = (text: string) => (am && text.startsWith(RED_FLAG_QUESTION) && clinical
      ? `ከሚከተሉት ማንኛውንም አስተውለዋል፦ ${clinical.redFlags.slice(0, 4).map(t).join("፤ ")}?`
      : t(text));
    sections.push(section(
      "clarifying-questions",
      say("Questions that could make this more specific", "ይበልጥ የተለየ ሊያደርጉት የሚችሉ ጥያቄዎች"),
      say(
        "The report may be refined if you choose to share more. These are optional questions, not requirements. A reply in the conversation, in the app or from Telegram or WhatsApp, is added to the analysis automatically.",
        "ተጨማሪ ለማጋራት ከመረጡ ሪፖርቱ ሊሻሻል ይችላል። እነዚህ አማራጭ ጥያቄዎች ናቸው እንጂ ግዴታ አይደሉም። በውይይቱ፣ በመተግበሪያው ወይም ከቴሌግራም ወይም ከዋትስአፕ የሚሰጥ መልስ በራስ-ሰር ወደ ትንተናው ይጨመራል።",
      ),
      [...new Set([...analysis.dataQuality.followUps.slice(0, 5), ...(clinical?.describe.slice(0, 3) ?? [])])].map(question),
    ));
  }

  // Part A, then "When not to wait", then Part B with its marker and opening line (reportLayout.ts).
  const withhold = analysis.safety.domainBSuppressed || !culturalConsent;
  return { language, sections: layoutSections(sections, { language, withhold }), untranslated: [...untranslated], omitted };
}

/** A plan's steps as advice to the person (analysis.ts keeps the reviewer's wording). */
function planAdvice(analysis: CaseAnalysis, solution: AnalysisSolution): string[] {
  const cause = analysis.causes.find((entry) => solution.addresses.includes(entry.id));
  const advice = [...new Set((cause?.factors ?? []).flatMap((id) => FACTOR_BY_ID.get(id)?.advice ?? []))].slice(0, 4);
  return advice.length ? advice : solution.steps;
}

/** The health visit, written to the person. */
function healthVisitSteps(clinical: NonNullable<CaseAnalysis["clinical"]>, am: boolean, t: (text: string) => string): string[] {
  const timeframe = t(clinical.priority.timeframe);
  const weight = clinical.symptoms.some((symptom) => symptom.id === "weight_loss");
  const checks = clinical.checks.slice(0, 6).map(t);
  return am
    ? [
      `${timeframe} ጤና ጣቢያ ወይም ክሊኒክ ይሂዱ`,
      "የሚጠቀሙትን እያንዳንዱን መድኃኒት፣ የህመም ማስታገሻና ባህላዊ መድኃኒት ይዘው ይሂዱ፤ ምልክቶቹ መቼ እንደጀመሩና ምን እንደሚለውጣቸው የሚገልጽ ማስታወሻም ያዙ",
      ...(weight ? ["ለውጡ እንዲከታተል ክብደትዎ እንዲለካና እንዲመዘገብ ይጠይቁ"] : []),
      `የጤና ባለሙያ ሊያስባቸው የሚችሉ ምርመራዎች፦ ${checks.join("፤ ")}`,
    ]
    : [
      `Visit a health centre or clinic ${timeframe}`,
      "Bring every medicine, painkiller and traditional remedy you use, and a note of when the symptoms began and what changes them",
      ...(weight ? ["Ask for your weight to be measured and recorded so the trend can be followed"] : []),
      `Checks a health worker may consider: ${checks.join("; ")}`,
    ];
}

/** Word count and reading time of a report, for the reviewer's editor. */
export function reportStatistics(report: { summary: string; sections: Array<Pick<ReportSection, "body" | "items">> }): { sections: number; words: number; minutes: number } {
  const text = [report.summary, ...report.sections.flatMap((entry) => [entry.body ?? "", ...(entry.items ?? [])])].join(" ");
  const words = text.split(/\s+/u).filter(Boolean).length;
  return { sections: report.sections.length, words, minutes: Math.max(1, Math.round(words / 200)) };
}
