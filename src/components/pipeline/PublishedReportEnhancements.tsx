"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { UserReport } from "@/lib/reports/types";
import { assetUrl } from "@/lib/base-path";

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
      <section className="rounded-2xl border border-brand/30 bg-card/80 p-5 md:p-7" aria-labelledby="report-summary-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">{labels.summary}</p>
            <h2 id="published-report-title" className="mt-2 text-2xl font-bold text-foreground">{report.headline}</h2>
            <p className="mt-2 text-sm text-soft">{report.urgentDirective ?? report.nextSteps[0]}</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Report tags">
            <span className="rounded-full border border-info/30 bg-info/10 px-3 py-1 text-xs text-info-strong">{labels.version} {version}</span>
            {urgency && <span className="rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-xs font-bold text-danger-strong">{labels.urgent}</span>}
            {cautionCount > 0 && <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold text-gold-strong">{labels.caution}</span>}
            {avoidCount > 0 && <span className="rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-xs font-bold text-danger-strong">{labels.avoid}</span>}
            <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-brand-strong">{labels.publishedTag}</span>
            {report.yourSituation.spiritualFraming && <span className="rounded-full border border-plum/30 bg-plum/10 px-3 py-1 text-xs text-plum-strong">{labels.culturalTag}</span>}
            {report.nextSteps.length > 0 && <span className="rounded-full border border-info/30 bg-info/10 px-3 py-1 text-xs text-info-strong">{labels.followUpTag}</span>}
            {!urgency && report.nextSteps.length > 0 && <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-brand-strong">{labels.supportiveCareTag}</span>}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-sunken/50 p-3">
            <p className="text-xs text-muted-foreground">{labels.overallConfidence}</p>
            <p className="mt-1 font-semibold text-foreground">{labels[confidence]}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">This is report-level confidence, not a separate score for each recommendation.</p>
          </div>
          <div className="rounded-xl border border-border bg-sunken/50 p-3">
            <p className="text-xs text-muted-foreground">{labels.created}</p>
            <p className="mt-1 font-semibold text-foreground">{formattedDate(createdAt)}</p>
          </div>
          <div className="rounded-xl border border-border bg-sunken/50 p-3">
            <p className="text-xs text-muted-foreground">{labels.published}</p>
            <p className="mt-1 font-semibold text-foreground">{formattedDate(publishedAt)}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground" role="note">{labels.notTranslated}</p>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => setShowFullReport((value) => !value)} className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-foreground/10">
            {showFullReport ? labels.concise : labels.full}
          </button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-foreground/10">{labels.print}</button>
          <button type="button" onClick={downloadSummary} className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-foreground/10">{labels.download}</button>
          <button type="button" onClick={shareSummary} className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-foreground/10">{labels.share}</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden" role="group" aria-label={labels.readingSize}>
          <span className="mr-1 text-xs text-muted-foreground">{labels.readingSize}:</span>
          {([
            [100, labels.normal],
            [115, labels.large],
            [130, labels.largest],
          ] as const).map(([scale, label]) => (
            <button key={scale} type="button" aria-pressed={readingScale === scale} onClick={() => setReadingScale(scale)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground aria-pressed:border-info aria-pressed:bg-info/20">
              {label}
            </button>
          ))}
        </div>
        {actionError && <p className="mt-3 text-sm text-danger" role="alert">{actionError}</p>}
        {actionNotice && <p className="mt-3 text-sm text-brand-strong" role="status">{actionNotice}</p>}
      </section>

      {urgency && (
        <section className="rounded-xl border-2 border-danger/60 bg-danger-soft p-4" aria-labelledby="report-urgent-heading" role="alert">
          <h3 id="report-urgent-heading" className="font-bold text-danger-strong">{labels.urgent}: {labels.safety}</h3>
          <p className="mt-2 text-sm text-danger-strong">{report.urgentDirective}</p>
        </section>
      )}

      {showFullReport ? (
        <>
          <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="safety-overview-heading">
            <h3 id="safety-overview-heading" className="font-bold text-foreground">{labels.safety}</h3>
            <p className={`mt-2 text-sm ${urgency || avoidCount ? "text-danger-strong" : cautionCount ? "text-gold-strong" : "text-brand-strong"}`}>
              {urgency ? labels.safetyAction : labels.safetyClear}
              {avoidCount + cautionCount > 0 && ` ${avoidCount} avoid item(s), ${cautionCount} caution item(s) listed below.`}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="situation-heading">
            <h3 id="situation-heading" className="font-bold text-foreground">{labels.cultural}</h3>
            <p className="mt-2 text-sm leading-relaxed text-soft">{report.yourSituation.culturalFraming}</p>
            <p className="mt-2 text-sm leading-relaxed text-soft">{report.yourSituation.ecologicalContext}</p>
            {report.yourSituation.spiritualFraming && <p className="mt-2 border-t border-border pt-3 text-sm text-plum-strong">{report.yourSituation.spiritualFraming}</p>}
          </section>

          <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="understanding-heading">
            <h3 id="understanding-heading" className="font-bold text-foreground">{labels.understanding}</h3>
            <p className="mt-2 text-sm leading-relaxed text-soft">{report.whatMayBeHappening.plainLanguage}</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {report.whatMayBeHappening.bodySystems.map((system) => (
                <li key={system.name} className="rounded-lg border border-border bg-sunken/50 p-3 text-sm">
                  <strong className="block text-info-strong">{system.name}</strong>
                  <span className="mt-1 block text-soft">{system.explanation}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="remedies-heading">
            <h3 id="remedies-heading" className="font-bold text-foreground">{labels.remedySafety}</h3>
            <ul className="mt-3 space-y-3">
              {report.traditionalRemedies.map((remedy) => (
                <li key={`${remedy.name}-${remedy.status}`} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-sunken/50 p-3">
                  <div>
                    <p className="font-semibold text-foreground">{remedy.name} <span className="text-soft">({remedy.amharic})</span></p>
                    <p className="mt-1 text-sm text-soft">{remedy.reason}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${remedy.status === "avoid" ? "bg-danger/20 text-danger-strong" : remedy.status === "caution" ? "bg-gold/20 text-gold-strong" : "bg-brand/20 text-brand-strong"}`}>{remedy.status === "avoid" ? labels.avoidStatus : labels[remedy.status]}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="foods-heading">
            <h3 id="foods-heading" className="font-bold text-foreground">{labels.foods}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">
              {report.foodAndNutrition.localFoodsToEmphasize.map((food) => <li key={food}>{food}</li>)}
            </ul>
            <p className="mt-3 text-sm text-soft">{report.foodAndNutrition.seasonalNotes}</p>
            <p className="mt-2 text-xs text-muted-foreground">{report.foodAndNutrition.preparationNotes}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-2" aria-label={`${labels.nextSteps} and ${labels.seekHelp}`}>
            <div className="rounded-xl border border-brand/20 bg-brand-soft p-5">
              <h3 id="next-steps-heading" className="font-bold text-brand-strong">{labels.actionPlan}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{labels.sessionOnly}</p>
              {report.nextSteps.length > 0 ? (
                <>
                  <div className="mt-3 flex items-center gap-3" aria-label={`${completedSteps.size} / ${report.nextSteps.length} ${labels.actionPlanProgress}`}>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10" role="progressbar" aria-valuemin={0} aria-valuemax={report.nextSteps.length} aria-valuenow={completedSteps.size} aria-label={labels.actionPlanProgress}>
                      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(completedSteps.size / report.nextSteps.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-soft">{completedSteps.size}/{report.nextSteps.length}</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {report.nextSteps.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex items-start gap-2 text-sm text-soft">
                        <input type="checkbox" checked={completedSteps.has(index)} onChange={() => toggleStep(index)} aria-label={`${labels.actionPlan}: ${step}`} className="mt-1 size-4 accent-brand print:hidden" />
                        <span className={completedSteps.has(index) ? "text-muted-foreground line-through" : ""}>{step}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : <p className="mt-3 text-sm text-soft">{labels.noNextSteps}</p>}
            </div>
            <div id="seek-help-section" className="rounded-xl border border-danger/20 bg-danger-soft p-5">
              <h3 className="font-bold text-danger-strong">{labels.seekHelp}</h3>
              <ul className="mt-3 space-y-2">
                {report.whenToSeekHelpNow.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-soft">
                    <input type="checkbox" checked={acknowledgedFlags.has(index)} onChange={() => toggleFlag(index)} aria-label={`${labels.readFlags}: ${item}`} className="mt-1 size-4 accent-danger" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {report.whenToSeekHelpNow.length > 0 && <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">{acknowledgedFlags.size} / {report.whenToSeekHelpNow.length} {labels.readFlags}</p>}
            </div>
          </section>

          {Boolean(report.sources?.length) && (
            <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="sources-heading">
              <h3 id="sources-heading" className="font-bold text-foreground">{labels.sources}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {report.sources?.map((source, index) => {
                  const externalUri = source.uri && /^https?:\/\//i.test(source.uri) ? source.uri : undefined;
                  return (
                    <li key={`${source.citation}-${source.title}-${index}`}>
                      {externalUri ? (
                        <a href={assetUrl(externalUri)} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-info/30 bg-info/10 px-3 py-1.5 text-xs text-info-strong underline-offset-2 hover:underline">
                          {source.title}{source.year ? ` · ${source.year}` : ""}
                        </a>
                      ) : (
                        <span className="inline-flex rounded-full border border-info/30 bg-info/10 px-3 py-1.5 text-xs text-info-strong">
                          {source.title}{source.year ? ` · ${source.year}` : ""}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {report.sources?.map((source, index) => <li key={`${source.citation}-${index}`}>{source.citation}</li>)}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="disclaimers-heading">
            <h3 id="disclaimers-heading" className="font-bold text-foreground">{labels.importantNotes}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{report.disclaimers.map((disclaimer) => <li key={disclaimer}>{disclaimer}</li>)}</ul>
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-border bg-card/60 p-5" aria-label={labels.concise}>
          <p className="text-sm leading-relaxed text-soft">{report.whatMayBeHappening.plainLanguage}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">{report.nextSteps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}</ul>
        </section>
      )}

      {history.length > 1 && (
        <section className="rounded-xl border border-border bg-card/60 p-5 print:hidden" aria-labelledby="history-heading">
          <h3 id="history-heading" className="font-bold text-foreground">{labels.history}</h3>
          <ol className="mt-3 space-y-2">
            {history.map((entry) => (
              <li key={entry.version} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                <span className="text-soft">{labels.version} {entry.version} · {formattedDate(entry.publishedAt ?? entry.createdAt)}</span>
                {entry.version < version && <button type="button" onClick={() => setSelectedVersion(entry.version)} className="rounded-md border border-border-strong px-2 py-1 text-xs text-info-strong hover:bg-foreground/10">{labels.compare}</button>}
              </li>
            ))}
          </ol>
          {selectedPrevious && (
            <div className="mt-4 rounded-lg border border-info/20 bg-info-soft p-3" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-info-strong">{labels.changed} · {labels.version} {selectedPrevious.version}</h4>
                <button type="button" onClick={() => setSelectedVersion("")} className="text-xs text-soft underline">Close</button>
              </div>
              {previousChanges.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {previousChanges.map((change) => (
                    <li key={change.label} className="rounded-lg border border-border bg-sunken/50 p-3">
                      <h5 className="font-semibold text-foreground">{change.label}</h5>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{labels.before}</p><p className="mt-1 whitespace-pre-line text-sm text-soft">{change.before}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-info-strong">{labels.after}</p><p className="mt-1 whitespace-pre-line text-sm text-soft">{change.after}</p></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-soft">{labels.noChanges}</p>}
            </div>
          )}
          {!selectedPrevious && selectedVersion !== "" && <p className="mt-3 text-sm text-soft">{labels.compareUnavailable}</p>}
        </section>
      )}
    </article>
  );
}
