"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Match = { id: string; sourceType: string; sourceName: string; targetType: string; targetName: string; mechanism: string; evidenceLevel: string; confidenceScore: number; ethiopianContext?: string; safetyNotes: string[] };
type Discovery = { query: string; matches: Match[]; disclaimer: string };

const examples = ["metformin", "headache", "iron", "stress", "fasting"];
const confidenceLabel = (score: number) => score >= 0.8 ? "Strong evidence" : score >= 0.6 ? "Moderate evidence" : score >= 0.4 ? "Limited evidence" : "Early or traditional evidence";

export default function DiscoverExperience() {
  const [query, setQuery] = useState("metformin");
  const [type, setType] = useState("all");
  const [result, setResult] = useState<Discovery | null>(null);
  const [compare, setCompare] = useState({ item1: "metformin", item2: "moringa" });
  const [comparison, setComparison] = useState<{ sharedMechanisms: string[]; mechanisms: string[]; disclaimer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event?: FormEvent, requestedQuery = query) {
    event?.preventDefault(); setLoading(true); setError("");
    try { const response = await fetch(`/api/mechanism/search?q=${encodeURIComponent(requestedQuery)}&type=${type}`); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setQuery(requestedQuery); setResult(payload.data); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Discovery search failed."); }
    finally { setLoading(false); }
  }
  async function runCompare(event: FormEvent) {
    event.preventDefault(); setError("");
    try { const response = await fetch(`/api/mechanism/compare?item1=${encodeURIComponent(compare.item1)}&item2=${encodeURIComponent(compare.item2)}`); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setComparison(payload.data); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Comparison failed."); }
  }

  return <div className="app-container py-10"><div className="max-w-6xl mx-auto"><header className="max-w-4xl mb-8"><div className="badge badge-safe mb-3">Mechanism discovery · Educational only</div><h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Explore how health ideas connect</h1><p className="text-slate-400 mt-3 leading-relaxed">Search medication, symptom, nutrient, food, and cultural pathways through their reported mechanisms. A match describes a parallel, not compatibility, efficacy, or a treatment recommendation.</p></header>

    <section className="glass-panel p-6 md:p-8 mb-8"><form onSubmit={search} className="flex flex-col md:flex-row gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try metformin, headache, iron, or stress" className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-emerald-500" /><select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-white"><option value="all">All pathways</option><option value="medication">Medication</option><option value="symptom">Symptom</option><option value="condition">Condition</option></select><button className="btn-primary" disabled={loading}>{loading ? "Searching..." : "Search mechanisms"}</button></form><div className="flex flex-wrap gap-2 mt-4">{examples.map((example) => <button key={example} type="button" onClick={() => void search(undefined, example)} className="badge badge-safe normal-case tracking-normal">{example}</button>)}</div>{error && <p className="text-sm text-rose-300 mt-4">{error}</p>}</section>

    {result && <section className="space-y-4 mb-10"><div className="flex items-end justify-between"><div><div className="badge badge-moderate mb-2">{result.matches.length} connection{result.matches.length === 1 ? "" : "s"}</div><h2 className="text-2xl font-bold text-white">Mechanisms related to “{result.query}”</h2></div></div>{result.matches.map((match) => <article key={match.id} className="glass-panel p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-wider text-emerald-400">{match.sourceType} → {match.targetType}</div><h3 className="text-lg font-bold text-white mt-1">{match.sourceName} and {match.targetName}</h3><p className="text-sm text-slate-300 mt-2">{match.mechanism}</p></div><div className="text-right"><div className="text-2xl font-black text-amber-300">{Math.round(match.confidenceScore * 100)}%</div><div className="text-[11px] text-slate-400">{confidenceLabel(match.confidenceScore)}</div></div></div><div className="flex flex-wrap gap-2 mt-4"><span className="badge badge-moderate normal-case tracking-normal">{match.evidenceLevel}</span><span className="badge badge-safe normal-case tracking-normal">Mechanistic parallel</span></div>{match.ethiopianContext && <p className="text-xs text-amber-200/80 mt-4">Ethiopian context: {match.ethiopianContext}</p>}<div className="mt-4 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-100"><strong>Safety boundary:</strong> {match.safetyNotes.join(" ")}</div></article>)}<p className="text-xs text-slate-500 border-t border-white/10 pt-4">{result.disclaimer}</p></section>}

    <section className="glass-panel p-6 md:p-8"><div className="badge badge-safe mb-2">Compare pathways</div><h2 className="text-2xl font-bold text-white">Put two ideas side by side</h2><p className="text-sm text-slate-400 mt-2">Comparison highlights shared language in the curated catalog; it does not establish that items can be combined.</p><form onSubmit={runCompare} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 mt-5"><input value={compare.item1} onChange={(event) => setCompare({ ...compare, item1: event.target.value })} className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white" /><span className="self-center text-center text-emerald-300">vs</span><input value={compare.item2} onChange={(event) => setCompare({ ...compare, item2: event.target.value })} className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white" /><button className="btn-secondary">Compare</button></form>{comparison && <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-4 rounded-xl bg-black/30 border border-white/5"><h3 className="text-sm font-bold text-white">Shared mechanisms</h3>{comparison.sharedMechanisms.length ? <ul className="mt-2 space-y-2 text-sm text-emerald-200">{comparison.sharedMechanisms.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="text-sm text-slate-400 mt-2">No shared catalog mechanism found.</p>}</div><div className="p-4 rounded-xl bg-black/30 border border-white/5"><h3 className="text-sm font-bold text-white">Catalog mechanisms</h3><ul className="mt-2 space-y-2 text-sm text-slate-300">{comparison.mechanisms.map((item) => <li key={item}>{item}</li>)}</ul></div><p className="md:col-span-2 text-xs text-rose-200/80">{comparison.disclaimer}</p></div>}</section>
    <div className="mt-8 flex justify-between text-xs text-slate-500"><Link href="/case" className="hover:text-white">Return to guided case</Link><Link href="/safety" className="hover:text-white">Open safety matrix</Link></div></div></div>;
}
