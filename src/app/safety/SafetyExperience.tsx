"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FlaskConical, Grid3x3, Leaf, Library, Link2, Pill, Plus, Printer, Search, ShieldAlert, X } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, EmptyState, ErrorState, Input, LoadingState, Select, Textarea } from "@/components/ui";
import { CONDITIONS, CONDITION_LABELS, PROPERTIES, type Condition, type Finding, type Severity } from "@/server/safety/rules";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

// ── Types from the API ───────────────────────────────────────────────────────

interface Substance {
  slug: string;
  name: string;
  kind: "modern" | "traditional";
  category: string;
  scientificName: string | null;
  amharicName: string | null;
  aliases: string[];
  properties: string[];
}

interface MatrixItem extends Substance {
  alerts: { condition: Condition; level: "avoid" | "caution"; note?: string }[];
  notes: string | null;
  evidence: string | null;
  toxic: boolean;
}

interface Pair {
  a: string;
  b: string;
  severity: Severity | null;
  basis: "documented" | "predicted" | null;
  findings: Finding[];
}

interface MatrixResult {
  items: MatrixItem[];
  pairs: Pair[];
  counts: Record<Severity, number>;
  checkedPairs: number;
  worst: Severity | null;
  verdict: { tone: "danger" | "warning" | "info" | "success"; title: string; body: string };
  unmatched: string[];
}

interface Detail extends Omit<Substance, "properties"> {
  properties: string[];
  cautions: Partial<Record<Condition, { level: "avoid" | "caution"; note?: string }>>;
  notes: string | null;
  evidence: string | null;
  interactions: { slug: string; name: string; kind: string; category: string; severity: Severity; basis: "documented" | "predicted"; finding: Finding }[];
  summary: Record<Severity, number>;
}

interface Overview {
  groups: string[];
  rows: { slug: string; name: string; category: string; amharicName: string | null; toxic: boolean; cells: { group: string; worst: Severity | null; documented: boolean; flagged: string[] }[] }[];
}

// ── Presentation helpers ─────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<Severity, { label: string; cell: string; badge: "danger" | "warning" | "brand" | "neutral" }> = {
  contraindicated: { label: "Never combine", cell: "bg-danger text-inverse-foreground", badge: "danger" },
  major: { label: "Major", cell: "bg-danger/70 text-inverse-foreground", badge: "danger" },
  moderate: { label: "Moderate", cell: "bg-warning/70 text-foreground", badge: "warning" },
  minor: { label: "Minor", cell: "bg-brand/25 text-foreground", badge: "brand" },
};
const SEVERITY_ORDER: Severity[] = ["contraindicated", "major", "moderate", "minor"];
const propertyLabel = (key: string) => (PROPERTIES as Record<string, string>)[key] ?? key;

function KindIcon({ kind, className }: { kind: string; className?: string }) {
  return kind === "traditional" ? <Leaf className={cn("text-success", className)} aria-hidden="true" /> : <Pill className={cn("text-brand", className)} aria-hidden="true" />;
}

function SeverityBadge({ severity, basis }: { severity: Severity; basis?: "documented" | "predicted" | null }) {
  const { t } = useLanguage();
  const severityLabels: Record<Severity, string> = {
    contraindicated: t.safety.neverCombine,
    major: t.safety.major,
    moderate: t.safety.moderate,
    minor: t.safety.minor,
  };
  return (
    <span className="inline-flex items-center gap-1">
      <Badge tone={SEVERITY_STYLE[severity].badge}>{severityLabels[severity]}</Badge>
      {basis && <Badge tone={basis === "documented" ? "gold" : "neutral"}>{basis === "documented" ? t.safety.documented : t.safety.predicted}</Badge>}
    </span>
  );
}

function matches(substance: Substance, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [substance.name, substance.scientificName, substance.amharicName, substance.category, ...substance.aliases].some((v) => v?.toLowerCase().includes(q));
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = "check" | "map" | "library";

export default function SafetyExperience() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("check");
  const [library, setLibrary] = useState<{ substances: Substance[]; counts: { modern: number; traditional: number; documented: number } } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);

  const load = useCallback(() => {
    apiFetch<typeof library>("/api/safety/substances").then(setLibrary).catch((err) => setError(errorMessage(err)));
  }, []);
  useEffect(load, [load]);

  // Restore a shared check from the URL (?items=a,b&profile=pregnancy).
  const [profile, setProfile] = useState<Condition[]>([]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const items = params.get("items")?.split(",").filter(Boolean) ?? [];
    const conditions = (params.get("profile")?.split(",") ?? []).filter((c): c is Condition => (CONDITIONS as readonly string[]).includes(c));
    if (items.length) setSelected(items.slice(0, 40));
    if (conditions.length) setProfile(conditions);
  }, []);

  const add = (slug: string) => {
    setSelected((list) => (list.includes(slug) ? list : [...list, slug].slice(0, 40)));
    setTab("check");
  };

  const bySlug = useMemo(() => new Map(library?.substances.map((s) => [s.slug, s]) ?? []), [library]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-6 max-w-3xl">
        <Badge tone="danger" className="mb-3"><ShieldAlert className="size-3.5" aria-hidden="true" /> {t.safety.matrix}</Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t.safety.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {t.safety.description}
        </p>
        {library && (
          <p className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Pill className="size-4 text-brand" aria-hidden="true" /> {library.counts.modern} {t.safety.modernMedicines}</span>
            <span className="inline-flex items-center gap-1.5"><Leaf className="size-4 text-success" aria-hidden="true" /> {library.counts.traditional} {t.safety.traditionalItems}</span>
            <span className="inline-flex items-center gap-1.5"><FlaskConical className="size-4 text-gold" aria-hidden="true" /> {library.counts.documented} {t.safety.documentedPairs}</span>
          </p>
        )}
      </header>

      <div role="tablist" aria-label={t.safety.views} className="mb-6 flex flex-wrap gap-2">
        {([["check", t.safety.checkCombination, ShieldAlert], ["map", t.safety.remediesByMedicine, Grid3x3], ["library", t.safety.browseLibrary, Library]] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors", tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
            <Icon className="size-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !library ? (
        <LoadingState label={t.safety.loading} />
      ) : tab === "check" ? (
        <Checker substances={library.substances} bySlug={bySlug} selected={selected} setSelected={setSelected} profile={profile} setProfile={setProfile} onOpen={setDetailSlug} />
      ) : tab === "map" ? (
        <RemedyMap onOpen={setDetailSlug} />
      ) : (
        <LibraryBrowser substances={library.substances} onOpen={setDetailSlug} onAdd={add} selected={selected} />
      )}

      <p className="mt-10 rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
        This is a screening aid for healers, clients and pharmacists. It cannot cover every product, dose or person. &ldquo;Predicted&rdquo; findings come from shared properties and need confirming. No finding does not mean a mix is safe. Ask a pharmacist before starting, stopping or combining medicines.
      </p>

      {detailSlug && <DetailDialog slug={detailSlug} onClose={() => setDetailSlug(null)} onAdd={(slug) => { add(slug); setDetailSlug(null); }} onOpen={setDetailSlug} />}
    </div>
  );
}

// ── Checker ──────────────────────────────────────────────────────────────────

const SCENARIOS: { label: string; items: string[] }[] = [
  { label: "Blood thinner with home remedies", items: ["warfarin", "tena-adam", "nech-shinkurt", "gomen"] },
  { label: "TB treatment with HIV medicines", items: ["rifampicin", "isoniazid", "tld", "combined-oral-contraceptive"] },
  { label: "Diabetes with remedies and drinks", items: ["metformin", "glibenclamide", "tikur-azmud", "abish", "areke"] },
  { label: "Antibiotic with khat and coffee", items: ["ciprofloxacin", "khat", "buna", "antacid"] },
];

function Checker({
  substances,
  bySlug,
  selected,
  setSelected,
  profile,
  setProfile,
  onOpen,
}: {
  substances: Substance[];
  bySlug: Map<string, Substance>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  profile: Condition[];
  setProfile: React.Dispatch<React.SetStateAction<Condition[]>>;
  onOpen: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "modern" | "traditional">("all");
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState("");
  const [result, setResult] = useState<MatrixResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusPair, setFocusPair] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);

  const suggestions = useMemo(
    () => (query.trim() ? substances.filter((s) => (kind === "all" || s.kind === kind) && !selected.includes(s.slug) && matches(s, query)).slice(0, 8) : []),
    [substances, query, kind, selected],
  );

  // Recompute whenever the list or profile changes; keep the URL shareable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (selected.length) params.set("items", selected.join(","));
    if (profile.length) params.set("profile", profile.join(","));
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    if (!selected.length) {
      setResult(null);
      return;
    }
    let cancelled = false;
    apiFetch<MatrixResult>("/api/safety/matrix", { method: "POST", json: { items: selected, profile } })
      .then((data) => !cancelled && (setResult(data), setError(null)))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [selected, profile]);

  const add = (slug: string) => {
    setSelected((list) => (list.includes(slug) ? list : [...list, slug].slice(0, 40)));
    setQuery("");
  };

  async function addPasted() {
    const names = pasted.split(/[\n,;]+/).map((n) => n.trim()).filter(Boolean);
    if (!names.length) return;
    try {
      const data = await apiFetch<MatrixResult>("/api/safety/matrix", { method: "POST", json: { names, items: selected, profile } });
      setSelected(data.items.map((i) => i.slug));
      setUnmatched(data.unmatched);
      setPasting(false);
      setPasted("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const pairMap = useMemo(() => new Map(result?.pairs.map((p) => [[p.a, p.b].sort().join("|"), p]) ?? []), [result]);
  const pairFor = (a: string, b: string) => pairMap.get([a, b].sort().join("|"));
  const nameOf = (slug: string) => bySlug.get(slug)?.name ?? slug;

  function exportCsv() {
    if (!result) return;
    const rows = [["Item A", "Item B", "Severity", "Basis", "What happens", "Why", "What to do", "Source"]];
    for (const p of result.pairs) {
      const f = p.findings[0];
      rows.push([nameOf(p.a), nameOf(p.b), p.severity ?? "", p.basis ?? "", f.effect, f.mechanism, f.management, f.source ?? (f.because ? `Predicted: ${f.because.map(propertyLabel).join(" + ")}` : "")]);
    }
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: "safety-matrix.csv" }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      {/* Builder */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex gap-1 rounded-xl bg-muted p-1 text-xs font-semibold">
              {(["all", "modern", "traditional"] as const).map((k) => (
                <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={cn("flex-1 rounded-lg py-1.5", kind === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                  {k === "all" ? "All" : k === "modern" ? "Medicines" : "Traditional"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && suggestions[0]) {
                    e.preventDefault();
                    add(suggestions[0].slug);
                  }
                }}
                placeholder="Type a medicine, brand or remedy (e.g. Coartem, ጤና አዳም)"
                className="pl-9"
                aria-label="Search medicines and remedies"
                aria-autocomplete="list"
              />
              {suggestions.length > 0 && (
                <ul role="listbox" className="absolute left-0 right-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-xl">
                  {suggestions.map((s) => (
                    <li key={s.slug}>
                      <button type="button" role="option" aria-selected="false" onClick={() => add(s.slug)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent">
                        <KindIcon kind={s.kind} className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-foreground">{s.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{[s.amharicName, s.category].filter(Boolean).join(" · ")}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPasting(true)}><Plus className="size-4" aria-hidden="true" /> Paste a list</Button>
              {selected.length > 0 && <Button variant="ghost" size="sm" onClick={() => { setSelected([]); setUnmatched([]); }}>Clear</Button>}
            </div>

            {selected.length === 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Or start from an example:</p>
                {SCENARIOS.map((scenario) => (
                  <button key={scenario.label} type="button" onClick={() => setSelected(scenario.items.filter((slug) => bySlug.has(slug)))} className="rounded-xl border border-border px-3 py-2 text-left text-sm text-foreground hover:border-brand/40 hover:bg-accent">
                    {scenario.label}
                  </button>
                ))}
              </div>
            ) : (
              <ul className="flex flex-wrap gap-2" aria-label="Items being checked">
                {selected.map((slug) => {
                  const s = bySlug.get(slug);
                  return (
                    <li key={slug} className={cn("inline-flex items-center gap-1.5 rounded-full border py-1 pl-2.5 pr-1 text-sm", s?.kind === "traditional" ? "border-success/40 bg-success/10" : "border-brand/40 bg-brand/10")}>
                      <KindIcon kind={s?.kind ?? "modern"} className="size-3.5" />
                      <button type="button" onClick={() => onOpen(slug)} className="font-semibold text-foreground hover:underline">{s?.name ?? slug}</button>
                      <button type="button" aria-label={`Remove ${s?.name ?? slug}`} onClick={() => setSelected((list) => list.filter((x) => x !== slug))} className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {unmatched.length > 0 && <Alert tone="warning" title="Not in the reference yet">{unmatched.join(", ")}. Check the spelling or ask the knowledge team to add them.</Alert>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">About the person</CardTitle><CardDescription>Adds warnings that depend on who is taking them.</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {CONDITIONS.map((condition) => {
              const on = profile.includes(condition);
              return (
                <button key={condition} type="button" aria-pressed={on} onClick={() => setProfile((list) => (on ? list.filter((c) => c !== condition) : [...list, condition]))} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", on ? "border-gold bg-gold/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
                  {CONDITION_LABELS[condition]}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="flex min-w-0 flex-col gap-6">
        {error && <Alert tone="danger">{error}</Alert>}
        {!result ? (
          <EmptyState title="Add two or more items" description="Medicines, remedies, foods or drinks, in any language or brand name." />
        ) : (
          <>
            <Alert tone={result.verdict.tone} title={result.verdict.title}>
              {result.verdict.body} {result.checkedPairs > 0 && `${result.checkedPairs} ${result.checkedPairs === 1 ? "pair" : "pairs"} checked.`}
            </Alert>
            <div className="flex flex-wrap items-center gap-2">
              {SEVERITY_ORDER.map((s) => (
                <span key={s} className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", result.counts[s] ? SEVERITY_STYLE[s].cell : "bg-muted text-muted-foreground")}>
                  {SEVERITY_STYLE[s].label}: {result.counts[s]}
                </span>
              ))}
              <span className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Link2 className="size-4" aria-hidden="true" /> Copy link</Button>
                <Button size="sm" variant="outline" onClick={exportCsv} disabled={!result.pairs.length}><Download className="size-4" aria-hidden="true" /> CSV</Button>
                <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="size-4" aria-hidden="true" /> Print</Button>
              </span>
            </div>

            {/* Person & item warnings */}
            {result.items.some((i) => i.alerts.length || i.toxic) && (
              <Card className="border-warning/40">
                <CardHeader><CardTitle className="text-base">Warnings for this person</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  {result.items.filter((i) => i.toxic).map((i) => (
                    <p key={`${i.slug}-toxic`} className="text-danger"><strong>{i.name}</strong> is poisonous if swallowed. {i.notes}</p>
                  ))}
                  {result.items.flatMap((i) => i.alerts.map((a) => (
                    <p key={`${i.slug}-${a.condition}`}>
                      <Badge tone={a.level === "avoid" ? "danger" : "warning"}>{a.level === "avoid" ? "Avoid" : "Caution"}</Badge>{" "}
                      <strong>{i.name}</strong>: {CONDITION_LABELS[a.condition]}{a.note ? `. ${a.note}` : ""}
                    </p>
                  )))}
                </CardContent>
              </Card>
            )}

            {/* Matrix grid */}
            {result.items.length >= 2 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Matrix</CardTitle><CardDescription>Select a coloured square for details.</CardDescription></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="border-separate border-spacing-1 text-xs">
                      <thead>
                        <tr>
                          <th />
                          {result.items.map((item) => (
                            <th key={item.slug} scope="col" className="h-28 w-9 align-bottom">
                              <span className="inline-block max-w-[7rem] -rotate-45 origin-bottom-left translate-x-4 truncate whitespace-nowrap text-left font-semibold text-foreground">{item.name}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((row) => (
                          <tr key={row.slug}>
                            <th scope="row" className="max-w-[10rem] truncate pr-2 text-right font-semibold text-foreground">
                              <span className="inline-flex items-center gap-1"><KindIcon kind={row.kind} className="size-3" />{row.name}</span>
                            </th>
                            {result.items.map((col) => {
                              if (row.slug === col.slug) return <td key={col.slug} className="size-9 rounded-md bg-muted/40" />;
                              const p = pairFor(row.slug, col.slug);
                              const key = [row.slug, col.slug].sort().join("|");
                              return (
                                <td key={col.slug} className="size-9 p-0">
                                  <button
                                    type="button"
                                    title={p?.severity ? `${row.name} + ${col.name}: ${SEVERITY_STYLE[p.severity].label}` : `${row.name} + ${col.name}: nothing found`}
                                    onClick={() => p && (setFocusPair(key), document.getElementById(`pair-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" }))}
                                    className={cn("grid size-9 place-items-center rounded-md font-bold", p?.severity ? SEVERITY_STYLE[p.severity].cell : "bg-muted/60 text-muted-foreground")}
                                  >
                                    {p?.severity ? (p.basis === "documented" ? "●" : "○") : ""}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">● documented interaction · ○ predicted from shared properties</p>
                </CardContent>
              </Card>
            )}

            {/* Pair list */}
            <div className="flex flex-col gap-3">
              {result.pairs.map((p) => {
                const key = [p.a, p.b].sort().join("|");
                return (
                  <Card key={key} id={`pair-${key}`} className={cn("scroll-mt-28 transition-shadow", focusPair === key && "ring-2 ring-ring")}>
                    <CardContent className="flex flex-col gap-3 pt-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{nameOf(p.a)} + {nameOf(p.b)}</h3>
                        <span className="ml-auto"><SeverityBadge severity={p.severity!} basis={p.basis} /></span>
                      </div>
                      {p.findings.map((f, index) => (
                        <div key={index} className={cn("rounded-2xl border p-3 text-sm", index === 0 ? "border-border" : "border-dashed border-border/70 text-muted-foreground")}>
                          <p className="font-semibold text-foreground">{f.effect}</p>
                          <p className="mt-1"><span className="text-muted-foreground">Why: </span>{f.mechanism}</p>
                          <p className="mt-1"><span className="text-muted-foreground">What to do: </span>{f.management}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {f.basis === "documented" ? `Source: ${f.source} · Evidence: ${f.evidence}` : `Predicted because: ${f.because?.map(propertyLabel).join(" + ")}`}
                            {index > 0 && ` · ${SEVERITY_STYLE[f.severity].label}`}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Dialog open={pasting} onClose={() => setPasting(false)} title="Paste a list" description="One per line or separated by commas. Brand, generic, Amharic and local names all work." footer={<><Button variant="ghost" onClick={() => setPasting(false)}>Cancel</Button><Button onClick={addPasted} disabled={!pasted.trim()}>Add</Button></>}>
        <Textarea rows={6} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={"Coartem\nTLD\nጤና አዳም\nareke"} aria-label="Medicines and remedies" />
      </Dialog>
    </div>
  );
}

// ── Remedies × medicine groups ───────────────────────────────────────────────

function RemedyMap({ onOpen }: { onOpen: (slug: string) => void }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(true);
  useEffect(() => {
    apiFetch<Overview>("/api/safety/overview").then(setData).catch((err) => setError(errorMessage(err)));
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState label="Comparing every remedy with every medicine group…" />;
  const q = filter.trim().toLowerCase();
  const rows = data.rows.filter((row) => (!q || `${row.name} ${row.amharicName ?? ""}`.toLowerCase().includes(q)) && (!onlyFlagged || row.cells.some((c) => c.worst)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traditional remedies × medicine groups</CardTitle>
        <CardDescription>The most serious finding between each remedy and any medicine in the group. Hover a square to see which medicines; select a remedy for full details.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter remedies…" className="h-10 w-64" aria-label="Filter remedies" />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} className="size-4 accent-[var(--brand-accent)]" /> Only remedies with findings
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th />
                {data.groups.map((group) => (
                  <th key={group} scope="col" className="h-32 w-9 align-bottom">
                    <span className="inline-block -rotate-45 origin-bottom-left translate-x-4 whitespace-nowrap text-left font-semibold text-foreground">{group}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.slug}>
                  <th scope="row" className="pr-2 text-right">
                    <button type="button" onClick={() => onOpen(row.slug)} className="max-w-[12rem] truncate font-semibold text-foreground hover:text-brand">
                      {row.toxic && <span className="text-danger" title="Poisonous if swallowed">☠ </span>}
                      {row.name}
                    </button>
                  </th>
                  {row.cells.map((cell) => (
                    <td key={cell.group} className="p-0">
                      <span
                        title={cell.worst ? `${row.name} + ${cell.group}: ${SEVERITY_STYLE[cell.worst].label}\n${cell.flagged.join(", ")}` : `${row.name} + ${cell.group}: nothing found`}
                        className={cn("grid size-9 place-items-center rounded-md font-bold", cell.worst ? SEVERITY_STYLE[cell.worst].cell : "bg-muted/60")}
                      >
                        {cell.worst ? (cell.documented ? "●" : cell.flagged.length) : ""}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">● includes a documented interaction · numbers show how many medicines in the group are flagged</p>
      </CardContent>
    </Card>
  );
}

// ── Library ──────────────────────────────────────────────────────────────────

function LibraryBrowser({ substances, onOpen, onAdd, selected }: { substances: Substance[]; onOpen: (slug: string) => void; onAdd: (slug: string) => void; selected: string[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "modern" | "traditional">("all");
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => [...new Set(substances.filter((s) => kind === "all" || s.kind === kind).map((s) => s.category))].sort(), [substances, kind]);
  const list = substances.filter((s) => (kind === "all" || s.kind === kind) && (category === "all" || s.category === category) && matches(s, query));
  const grouped = [...new Set(list.map((s) => s.category))];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by any name…" className="h-10 w-72" aria-label="Search the library" />
        <Select value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setCategory("all"); }} className="h-10 w-48" aria-label="Kind">
          <option value="all">Everything</option>
          <option value="modern">Modern medicines</option>
          <option value="traditional">Traditional</option>
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-56" aria-label="Group">
          <option value="all">All groups</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <span className="self-center text-sm text-muted-foreground">{list.length} items</span>
      </div>
      {grouped.map((group) => (
        <section key={group}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{group}</h3>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {list.filter((s) => s.category === group).map((s) => (
              <div key={s.slug} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <KindIcon kind={s.kind} className="mt-0.5 size-4 shrink-0" />
                <button type="button" onClick={() => onOpen(s.slug)} className="min-w-0 flex-1 text-left">
                  <span className="block font-semibold text-foreground hover:text-brand">{s.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{[s.amharicName, s.scientificName, s.aliases.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{s.properties.slice(0, 3).map(propertyLabel).join(" · ") || "No interaction properties recorded"}</span>
                </button>
                <Button size="sm" variant="ghost" aria-label={`Add ${s.name} to the check`} disabled={selected.includes(s.slug)} onClick={() => onAdd(s.slug)}>
                  <Plus className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
      {list.length === 0 && <EmptyState title="Nothing matches" description="Try another spelling or group." />}
    </div>
  );
}

// ── Detail ───────────────────────────────────────────────────────────────────

function DetailDialog({ slug, onClose, onAdd, onOpen }: { slug: string; onClose: () => void; onAdd: (slug: string) => void; onOpen: (slug: string) => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity | "all">("all");
  useEffect(() => {
    setDetail(null);
    apiFetch<Detail>(`/api/safety/substances/${encodeURIComponent(slug)}`).then(setDetail).catch((err) => setError(errorMessage(err)));
  }, [slug]);

  const shown = detail?.interactions.filter((i) => severity === "all" || i.severity === severity) ?? [];
  return (
    <Dialog open onClose={onClose} size="lg" title={detail?.name ?? "Loading…"} description={detail ? [detail.amharicName, detail.scientificName, detail.category].filter(Boolean).join(" · ") : undefined} footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button onClick={() => onAdd(slug)}><Plus className="size-4" aria-hidden="true" /> Add to check</Button></>}>
      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : !detail ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-4">
          {detail.aliases.length > 0 && <p className="text-sm text-muted-foreground">Also known as: {detail.aliases.join(", ")}</p>}
          {detail.notes && <p className="text-sm text-foreground">{detail.notes}</p>}
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Properties</p>
            <div className="flex flex-wrap gap-1.5">
              {detail.properties.length ? detail.properties.map((p) => <Badge key={p} tone={p === "toxic_internal" ? "danger" : "neutral"}>{propertyLabel(p)}</Badge>) : <span className="text-sm text-muted-foreground">None recorded</span>}
            </div>
            {detail.evidence && <p className="mt-1.5 text-xs text-muted-foreground">Evidence: {detail.evidence}</p>}
          </div>
          {Object.keys(detail.cautions).length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Who should be careful</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(detail.cautions) as [Condition, { level: string; note?: string }][]).map(([condition, c]) => (
                  <Badge key={condition} tone={c.level === "avoid" ? "danger" : "warning"} title={c.note}>{c.level === "avoid" ? "Avoid" : "Caution"}: {CONDITION_LABELS[condition]}</Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interactions ({detail.interactions.length})</p>
              <div className="ml-auto flex flex-wrap gap-1">
                {(["all", ...SEVERITY_ORDER] as const).map((s) => (
                  <button key={s} type="button" aria-pressed={severity === s} onClick={() => setSeverity(s)} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", severity === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {s === "all" ? "All" : `${SEVERITY_STYLE[s].label} (${detail.summary[s] ?? 0})`}
                  </button>
                ))}
              </div>
            </div>
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
              {shown.map((i) => (
                <li key={i.slug} className="rounded-2xl border border-border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <KindIcon kind={i.kind} className="size-4" />
                    <button type="button" onClick={() => onOpen(i.slug)} className="font-semibold text-foreground hover:text-brand">{i.name}</button>
                    <span className="ml-auto"><SeverityBadge severity={i.severity} basis={i.basis} /></span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{i.finding.effect} {i.finding.management}</p>
                </li>
              ))}
              {shown.length === 0 && <li className="text-sm text-muted-foreground">No interactions at this level in the reference.</li>}
            </ul>
          </div>
        </div>
      )}
    </Dialog>
  );
}
