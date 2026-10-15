"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { UserReport } from "@/lib/reports/types";

export interface PublishedReportHistoryEntry {
  version: number;
  createdAt: string;
  publishedAt: string | null;
  confidence: "low" | "moderate" | "high";
  payload: UserReport;
}

interface Props {
  report: UserReport;
  version: number;
  confidence: "low" | "moderate" | "high";
  createdAt?: string;
  publishedAt?: string | null;
  history?: PublishedReportHistoryEntry[];
  locale: "am" | "en";
}

const LABELS = {
  en: {
    summary: "Report at a glance",
    overallConfidence: "Overall report confidence",
    full: "Full report",
    concise: "Quick summary",
    print: "Print / Save PDF",
    download: "Download care summary",
    share: "Share summary",
    safety: "Safety overview",
    safetyClear: "No urgent directive is listed in this report.",
    safetyAction: "Read the safety directive before continuing.",
    urgent: "Urgent",
    caution: "Caution",
    avoid: "Avoid for now",
    readFlags: "Read and acknowledge",
    nextSteps: "Recommended next steps",
    seekHelp: "When to seek help",
    foods: "Local food and nutrition context",
    remedySafety: "Traditional remedies safety review",
    sources: "Sources informing this report",
    history: "Published report history",
    compare: "Compare with previous published version",
    changed: "Changes since the previous published version",
    noChanges: "No changes detected in the displayed report sections.",
    notTranslated: "Report recommendations are shown in their original language; only interface labels switch languages.",
    created: "Generated",
    published: "Published",
    version: "Version",
    careSummaryTitle: "Patient care summary",
    cultural: "Your situation",
    understanding: "What may be happening",
    culturalTag: "Cultural reflection",
    followUpTag: "Follow-up",
    supportiveCareTag: "Supportive care",
    publishedTag: "Published",
    importantNotes: "Important notes",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    safe: "Safe",
    avoidStatus: "Avoid",
    copied: "Summary copied to clipboard.",
    shared: "Summary shared.",
    shareUnavailable: "Sharing is unavailable here. Download or print the summary instead.",
    shareFailed: "Could not share the summary. Try downloading or printing it.",
    actionPlan: "My action plan",
    actionPlanProgress: "steps marked done",
    sessionOnly: "Progress is kept only while this page is open.",
    readingSize: "Text size",
    normal: "Normal",
    large: "Large",
    largest: "Largest",
    before: "Previous",
    after: "Current",
    compareUnavailable: "No previous report is available to compare.",
    noNextSteps: "No action steps are listed.",
    sourceCitation: "Citation",
    summaryExplanation: "Summary",
    priorityNote: "This summary is for sharing and does not replace the full report or professional advice.",
    headlineChange: "Report headline",
    directiveChange: "Urgent safety directive",
    explanationChange: "Plain-language explanation",
    stepsChange: "Recommended next steps",
    remedyChange: "Remedy safety guidance",
    foodsChange: "Foods to emphasize",
    seasonalChange: "Seasonal food guidance",
    helpChange: "When to seek help",
    culturalChange: "Cultural context",
    ecologicalChange: "Ecological context",
  },
  am: {
    summary: "የሪፖርቱ አጭር ማጠቃለያ",
    overallConfidence: "የሪፖርቱ አጠቃላይ እምነት",
    full: "ሙሉ ሪፖርት",
    concise: "አጭር ማጠቃለያ",
    print: "አትም / PDF አስቀምጥ",
    download: "የእንክብካቤ ማጠቃለያ አውርድ",
    share: "ማጠቃለያውን አጋራ",
    safety: "የደህንነት ማጠቃለያ",
    safetyClear: "በዚህ ሪፖርት ውስጥ አስቸኳይ መመሪያ አልተጠቀሰም።",
    safetyAction: "ከመቀጠልዎ በፊት የደህንነት መመሪያውን ያንብቡ።",
    urgent: "አስቸኳይ",
    caution: "ጥንቃቄ",
    avoid: "ለጊዜው ያስወግዱ",
    readFlags: "አንብቤ አረጋግጫለሁ",
    nextSteps: "የሚመከሩ ቀጣይ እርምጃዎች",
    seekHelp: "እርዳታ መቼ መፈለግ እንዳለብዎ",
    foods: "የአካባቢ ምግብና አመጋገብ አውድ",
    remedySafety: "የባህላዊ መድኃኒቶች ደህንነት ግምገማ",
    sources: "ለዚህ ሪፖርት መሠረት የሆኑ ምንጮች",
    history: "የታተሙ የሪፖርት ታሪኮች",
    compare: "ከቀድሞው የታተመ ስሪት ጋር አወዳድር",
    changed: "ከቀድሞው የታተመ ስሪት የተለወጡ ነገሮች",
    noChanges: "በሚታዩት የሪፖርት ክፍሎች ላይ ለውጥ አልተገኘም።",
    notTranslated: "የሪፖርቱ ምክሮች በመጀመሪያ ቋንቋቸው ይታያሉ፤ የመተግበሪያው ርዕሶች ብቻ ይቀየራሉ።",
    created: "የተፈጠረበት",
    published: "የታተመበት",
    version: "ስሪት",
    careSummaryTitle: "የታካሚ እንክብካቤ ማጠቃለያ",
    cultural: "ሁኔታዎ",
    understanding: "ምን እየተፈጠረ ሊሆን ይችላል",
    culturalTag: "ባህላዊ ነጸብራቅ",
    followUpTag: "ክትትል",
    supportiveCareTag: "ደጋፊ እንክብካቤ",
    publishedTag: "የታተመ",
    importantNotes: "አስፈላጊ ማስታወሻዎች",
    low: "ዝቅተኛ",
    moderate: "መካከለኛ",
    high: "ከፍተኛ",
    safe: "ደህንነቱ የተጠበቀ",
    avoidStatus: "ያስወግዱ",
    copied: "ማጠቃለያው ወደ ቅንጥብ ሰሌዳ ተቀድቷል።",
    shared: "ማጠቃለያው ተጋርቷል።",
    shareUnavailable: "ማጋራት እዚህ አይገኝም። በምትኩ ማጠቃለያውን ያውርዱ ወይም ያትሙ።",
    shareFailed: "ማጠቃለያውን ማጋራት አልተቻለም። ማውረድ ወይም ማተም ይሞክሩ።",
    actionPlan: "የእኔ የእርምጃ እቅድ",
    actionPlanProgress: "እርምጃዎች ተጠናቀዋል",
    sessionOnly: "እድገቱ ይህ ገጽ ክፍት እስካለ ድረስ ብቻ ይቀመጣል።",
    readingSize: "የጽሑፍ መጠን",
    normal: "መደበኛ",
    large: "ትልቅ",
    largest: "በጣም ትልቅ",
    before: "ቀዳሚ",
    after: "አሁን",
    compareUnavailable: "ለማወዳደር የቀድሞ ሪፖርት የለም።",
    noNextSteps: "የእርምጃ ምክሮች አልተዘረዘሩም።",
    sourceCitation: "ማጣቀሻ",
    summaryExplanation: "ማጠቃለያ",
    priorityNote: "ይህ ማጠቃለያ ለማጋራት ነው፤ ሙሉ ሪፖርቱን ወይም የባለሙያ ምክርን አይተካም።",
    headlineChange: "የሪፖርቱ ርዕስ",
    directiveChange: "አስቸኳይ የደህንነት መመሪያ",
    explanationChange: "በቀላል ቋንቋ የቀረበ ማብራሪያ",
    stepsChange: "የሚመከሩ ቀጣይ እርምጃዎች",
    remedyChange: "የመድኃኒት ደህንነት መመሪያ",
    foodsChange: "እንዲመረጡ የተጠቆሙ ምግቦች",
    seasonalChange: "ወቅታዊ የምግብ መመሪያ",
    helpChange: "እርዳታ መቼ መፈለግ እንዳለብዎ",
    culturalChange: "ባህላዊ አውድ",
    ecologicalChange: "ሥነ-ምህዳራዊ አውድ",
  },
} as const;

type ReportChange = {
  label: string;
  before: string;
  after: string;
};

type ReportLabels = { [Key in keyof typeof LABELS.en]: string };

function listText(items: string[]) {
  return items.length ? items.join("\n") : "—";
}

function remedyText(report: UserReport) {
  return report.traditionalRemedies.length
    ? report.traditionalRemedies.map((item) => `${item.status.toUpperCase()}: ${item.name} — ${item.reason}`).join("\n")
    : "—";
}

function changesBetween(before: UserReport, after: UserReport, labels: ReportLabels): ReportChange[] {
  const changes: ReportChange[] = [];
  const addChange = (label: string, previous: string, current: string) => {
    if (previous !== current) changes.push({ label, before: previous || "—", after: current || "—" });
  };

  addChange(labels.headlineChange, before.headline, after.headline);
  addChange(labels.directiveChange, before.urgentDirective ?? "", after.urgentDirective ?? "");
  addChange(labels.explanationChange, before.whatMayBeHappening.plainLanguage, after.whatMayBeHappening.plainLanguage);
  addChange(labels.stepsChange, listText(before.nextSteps), listText(after.nextSteps));
  addChange(labels.remedyChange, remedyText(before), remedyText(after));
  addChange(labels.foodsChange, listText(before.foodAndNutrition.localFoodsToEmphasize), listText(after.foodAndNutrition.localFoodsToEmphasize));
  addChange(labels.seasonalChange, before.foodAndNutrition.seasonalNotes, after.foodAndNutrition.seasonalNotes);
  addChange(labels.helpChange, listText(before.whenToSeekHelpNow), listText(after.whenToSeekHelpNow));
  addChange(labels.culturalChange, before.yourSituation.culturalFraming, after.yourSituation.culturalFraming);
  addChange(labels.ecologicalChange, before.yourSituation.ecologicalContext, after.yourSituation.ecologicalContext);
  return changes;
}

export function PublishedReportEnhancements({
  report,
  version,
  confidence,
  createdAt,
  publishedAt,
  history = [],
  locale,
}: Props) {
  const labels = LABELS[locale];
  const [showFullReport, setShowFullReport] = useState(true);
  const [acknowledgedFlags, setAcknowledgedFlags] = useState<Set<number>>(new Set());
  const [selectedVersion, setSelectedVersion] = useState<number | "">("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [readingScale, setReadingScale] = useState<100 | 115 | 130>(100);
  const reportStyle = { "--report-reading-scale": readingScale / 100 } as CSSProperties;
  const urgency = Boolean(report.urgentDirective);
  const avoidCount = report.traditionalRemedies.filter((remedy) => remedy.status === "avoid").length;
  const cautionCount = report.traditionalRemedies.filter((remedy) => remedy.status === "caution").length;

  const selectedPrevious = history.find((entry) => entry.version === selectedVersion);
  const previousChanges = useMemo(
    () => selectedPrevious ? changesBetween(selectedPrevious.payload, report, labels) : [],
    [labels, report, selectedPrevious]
  );

  const summaryText = useMemo(() => [
    labels.careSummaryTitle,
    report.headline,
    report.urgentDirective,
    `${labels.cultural}: ${report.yourSituation.culturalFraming}`,
    report.yourSituation.ecologicalContext,
    `${labels.summaryExplanation}: ${report.whatMayBeHappening.plainLanguage}`,
    `${labels.nextSteps}: ${report.nextSteps.join("; ")}`,
    `${labels.seekHelp}: ${report.whenToSeekHelpNow.join("; ")}`,
    `${labels.foods}: ${report.foodAndNutrition.localFoodsToEmphasize.join(", ")}`,
    report.foodAndNutrition.seasonalNotes,
    ...report.traditionalRemedies.map((item) => `${item.status.toUpperCase()}: ${item.name} — ${item.reason}`),
    ...(report.sources ?? []).map((source) => `${labels.sourceCitation}: ${source.citation}`),
    labels.priorityNote,
    ...report.disclaimers,
  ].filter(Boolean).join("\n\n"), [labels, report]);

  async function shareSummary() {
    setActionError(null);
    setActionNotice(null);
    try {
      if (navigator.share) {
        await navigator.share({ title: report.headline, text: summaryText });
        setActionNotice(labels.shared);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
        setActionNotice(labels.copied);
      } else {
        setActionError(labels.shareUnavailable);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setActionError(labels.shareFailed);
    }
  }

  function downloadSummary() {
    setActionError(null);
    setActionNotice(null);
    try {
      const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `care-summary-v${version}.txt`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setActionError(labels.shareFailed);
    }
  }

  function toggleFlag(index: number) {
    setAcknowledgedFlags((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleStep(index: number) {
    setCompletedSteps((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  useEffect(() => {
    setCompletedSteps(new Set());
    setAcknowledgedFlags(new Set());
    setSelectedVersion("");
  }, [version, report.headline, report.urgentDirective, report.nextSteps, report.whenToSeekHelpNow]);

  const formattedDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-ET", { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  return (
    <article className={`published-report-print-root report-reading-${readingScale} space-y-6`} aria-labelledby="published-report-title" style={reportStyle}>
      <section className="rounded-2xl border border-emerald-400/30 bg-slate-900/80 p-5 md:p-7" aria-labelledby="report-summary-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">{labels.summary}</p>
            <h2 id="published-report-title" className="mt-2 text-2xl font-black text-white">{report.headline}</h2>
            <p className="mt-2 text-sm text-slate-300">{report.urgentDirective ?? report.nextSteps[0]}</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Report tags">
            <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">{labels.version} {version}</span>
            {urgency && <span className="rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-200">{labels.urgent}</span>}
            {cautionCount > 0 && <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-200">{labels.caution}</span>}
            {avoidCount > 0 && <span className="rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-200">{labels.avoid}</span>}
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">{labels.publishedTag}</span>
            {report.yourSituation.spiritualFraming && <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-100">{labels.culturalTag}</span>}
            {report.nextSteps.length > 0 && <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-100">{labels.followUpTag}</span>}
            {!urgency && report.nextSteps.length > 0 && <span className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs text-teal-100">{labels.supportiveCareTag}</span>}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">{labels.overallConfidence}</p>
            <p className="mt-1 font-semibold text-white">{labels[confidence]}</p>
            <p className="mt-1 text-[11px] text-slate-400">This is report-level confidence, not a separate score for each recommendation.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">{labels.created}</p>
            <p className="mt-1 font-semibold text-white">{formattedDate(createdAt)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">{labels.published}</p>
            <p className="mt-1 font-semibold text-white">{formattedDate(publishedAt)}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400" role="note">{labels.notTranslated}</p>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => setShowFullReport((value) => !value)} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10">
            {showFullReport ? labels.concise : labels.full}
          </button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10">{labels.print}</button>
          <button type="button" onClick={downloadSummary} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10">{labels.download}</button>
          <button type="button" onClick={shareSummary} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10">{labels.share}</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden" role="group" aria-label={labels.readingSize}>
          <span className="mr-1 text-xs text-slate-400">{labels.readingSize}:</span>
          {([
            [100, labels.normal],
            [115, labels.large],
            [130, labels.largest],
          ] as const).map(([scale, label]) => (
            <button key={scale} type="button" aria-pressed={readingScale === scale} onClick={() => setReadingScale(scale)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white aria-pressed:border-sky-300 aria-pressed:bg-sky-500/20">
              {label}
            </button>
          ))}
        </div>
        {actionError && <p className="mt-3 text-sm text-rose-300" role="alert">{actionError}</p>}
        {actionNotice && <p className="mt-3 text-sm text-emerald-200" role="status">{actionNotice}</p>}
      </section>

      {urgency && (
        <section className="rounded-xl border-2 border-rose-400/60 bg-rose-950/50 p-4" aria-labelledby="report-urgent-heading" role="alert">
          <h3 id="report-urgent-heading" className="font-bold text-rose-100">{labels.urgent}: {labels.safety}</h3>
          <p className="mt-2 text-sm text-rose-100">{report.urgentDirective}</p>
        </section>
      )}

      {showFullReport ? (
        <>
          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-labelledby="safety-overview-heading">
            <h3 id="safety-overview-heading" className="font-bold text-white">{labels.safety}</h3>
            <p className={`mt-2 text-sm ${urgency || avoidCount ? "text-rose-200" : cautionCount ? "text-amber-200" : "text-emerald-200"}`}>
              {urgency ? labels.safetyAction : labels.safetyClear}
              {avoidCount + cautionCount > 0 && ` ${avoidCount} avoid item(s), ${cautionCount} caution item(s) listed below.`}
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-labelledby="situation-heading">
            <h3 id="situation-heading" className="font-bold text-white">{labels.cultural}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{report.yourSituation.culturalFraming}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{report.yourSituation.ecologicalContext}</p>
            {report.yourSituation.spiritualFraming && <p className="mt-2 border-t border-white/10 pt-3 text-sm text-purple-200">{report.yourSituation.spiritualFraming}</p>}
          </section>

          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-labelledby="understanding-heading">
            <h3 id="understanding-heading" className="font-bold text-white">{labels.understanding}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{report.whatMayBeHappening.plainLanguage}</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {report.whatMayBeHappening.bodySystems.map((system) => (
                <li key={system.name} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                  <strong className="block text-cyan-200">{system.name}</strong>
                  <span className="mt-1 block text-slate-300">{system.explanation}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-labelledby="remedies-heading">
            <h3 id="remedies-heading" className="font-bold text-white">{labels.remedySafety}</h3>
            <ul className="mt-3 space-y-3">
              {report.traditionalRemedies.map((remedy) => (
                <li key={`${remedy.name}-${remedy.status}`} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  <div>
                    <p className="font-semibold text-white">{remedy.name} <span className="text-slate-300">({remedy.amharic})</span></p>
                    <p className="mt-1 text-sm text-slate-300">{remedy.reason}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${remedy.status === "avoid" ? "bg-rose-500/20 text-rose-200" : remedy.status === "caution" ? "bg-amber-500/20 text-amber-100" : "bg-emerald-500/20 text-emerald-100"}`}>{remedy.status === "avoid" ? labels.avoidStatus : labels[remedy.status]}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-labelledby="foods-heading">
            <h3 id="foods-heading" className="font-bold text-white">{labels.foods}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {report.foodAndNutrition.localFoodsToEmphasize.map((food) => <li key={food}>{food}</li>)}
            </ul>
            <p className="mt-3 text-sm text-slate-300">{report.foodAndNutrition.seasonalNotes}</p>
            <p className="mt-2 text-xs text-slate-400">{report.foodAndNutrition.preparationNotes}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-2" aria-label={`${labels.nextSteps} and ${labels.seekHelp}`}>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-5">
              <h3 id="next-steps-heading" className="font-bold text-emerald-200">{labels.actionPlan}</h3>
              <p className="mt-1 text-xs text-slate-400">{labels.sessionOnly}</p>
              {report.nextSteps.length > 0 ? (
                <>
                  <div className="mt-3 flex items-center gap-3" aria-label={`${completedSteps.size} / ${report.nextSteps.length} ${labels.actionPlanProgress}`}>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={report.nextSteps.length} aria-valuenow={completedSteps.size} aria-label={labels.actionPlanProgress}>
                      <div className="h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: `${(completedSteps.size / report.nextSteps.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-300">{completedSteps.size}/{report.nextSteps.length}</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {report.nextSteps.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex items-start gap-2 text-sm text-slate-200">
                        <input type="checkbox" checked={completedSteps.has(index)} onChange={() => toggleStep(index)} aria-label={`${labels.actionPlan}: ${step}`} className="mt-1 size-4 accent-emerald-500 print:hidden" />
                        <span className={completedSteps.has(index) ? "text-slate-400 line-through" : ""}>{step}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : <p className="mt-3 text-sm text-slate-300">{labels.noNextSteps}</p>}
            </div>
            <div id="seek-help-section" className="rounded-xl border border-rose-400/20 bg-rose-950/20 p-5">
              <h3 className="font-bold text-rose-200">{labels.seekHelp}</h3>
              <ul className="mt-3 space-y-2">
                {report.whenToSeekHelpNow.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-slate-200">
                    <input type="checkbox" checked={acknowledgedFlags.has(index)} onChange={() => toggleFlag(index)} aria-label={`${labels.readFlags}: ${item}`} className="mt-1 size-4 accent-rose-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {report.whenToSeekHelpNow.length > 0 && <p className="mt-3 text-xs text-slate-400" aria-live="polite">{acknowledgedFlags.size} / {report.whenToSeekHelpNow.length} {labels.readFlags}</p>}
            </div>
          </section>

          {Boolean(report.sources?.length) && (
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-labelledby="sources-heading">
              <h3 id="sources-heading" className="font-bold text-white">{labels.sources}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {report.sources?.map((source, index) => {
                  const externalUri = source.uri && /^https?:\/\//i.test(source.uri) ? source.uri : undefined;
                  return (
                    <li key={`${source.citation}-${source.title}-${index}`}>
                      {externalUri ? (
                        <a href={externalUri} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-100 underline-offset-2 hover:underline">
                          {source.title}{source.year ? ` · ${source.year}` : ""}
                        </a>
                      ) : (
                        <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-100">
                          {source.title}{source.year ? ` · ${source.year}` : ""}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-3 space-y-1 text-xs text-slate-400">
                {report.sources?.map((source, index) => <li key={`${source.citation}-${index}`}>{source.citation}</li>)}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-labelledby="disclaimers-heading">
            <h3 id="disclaimers-heading" className="font-bold text-white">{labels.importantNotes}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">{report.disclaimers.map((disclaimer) => <li key={disclaimer}>{disclaimer}</li>)}</ul>
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5" aria-label={labels.concise}>
          <p className="text-sm leading-relaxed text-slate-200">{report.whatMayBeHappening.plainLanguage}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">{report.nextSteps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}</ul>
        </section>
      )}

      {history.length > 1 && (
        <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5 print:hidden" aria-labelledby="history-heading">
          <h3 id="history-heading" className="font-bold text-white">{labels.history}</h3>
          <ol className="mt-3 space-y-2">
            {history.map((entry) => (
              <li key={entry.version} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3 text-sm">
                <span className="text-slate-200">{labels.version} {entry.version} · {formattedDate(entry.publishedAt ?? entry.createdAt)}</span>
                {entry.version < version && <button type="button" onClick={() => setSelectedVersion(entry.version)} className="rounded-md border border-white/20 px-2 py-1 text-xs text-sky-200 hover:bg-white/10">{labels.compare}</button>}
              </li>
            ))}
          </ol>
          {selectedPrevious && (
            <div className="mt-4 rounded-lg border border-sky-400/20 bg-sky-950/20 p-3" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-sky-100">{labels.changed} · {labels.version} {selectedPrevious.version}</h4>
                <button type="button" onClick={() => setSelectedVersion("")} className="text-xs text-slate-300 underline">Close</button>
              </div>
              {previousChanges.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {previousChanges.map((change) => (
                    <li key={change.label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <h5 className="font-semibold text-white">{change.label}</h5>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{labels.before}</p><p className="mt-1 whitespace-pre-line text-sm text-slate-300">{change.before}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-sky-200">{labels.after}</p><p className="mt-1 whitespace-pre-line text-sm text-slate-200">{change.after}</p></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-slate-300">{labels.noChanges}</p>}
            </div>
          )}
          {!selectedPrevious && selectedVersion !== "" && <p className="mt-3 text-sm text-slate-300">{labels.compareUnavailable}</p>}
        </section>
      )}
    </article>
  );
}
