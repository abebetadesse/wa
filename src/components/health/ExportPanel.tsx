"use client";

import { useState } from "react";

interface ExportPanelProps {
  reportId: string;
}

export default function ExportPanel({ reportId }: ExportPanelProps) {
  const [loading, setLoading] = useState<"json" | "csv" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: "json" | "csv") => {
    setLoading(format);
    setError(null);
    try {
      const response = await fetch(`/api/export/${reportId}?format=${format}`);
      if (!response.ok) {
        throw new Error("Export failed. Please try again.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const ext = format === "json" ? "json" : "csv";
      const a = document.createElement("a");
      a.href = url;
      a.download = `Welbeing-report-${reportId.slice(0, 8)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          ⬇
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Export Report</h3>
          <p className="text-[10px] text-slate-500">Download your Debral gap analysis</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* JSON */}
        <button
          id="export-json-btn"
          onClick={() => handleExport("json")}
          disabled={loading !== null}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.07] transition-all text-left group disabled:opacity-50"
        >
          <span className="text-xl">{ }</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              {loading === "json" ? "Downloading…" : "Export as JSON"}
            </div>
            <div className="text-[10px] text-slate-500">Full structured data · gaps, causes, solutions, sources</div>
          </div>
          <span className="text-xs text-slate-600 font-mono">.json</span>
        </button>

        {/* CSV */}
        <button
          id="export-csv-btn"
          onClick={() => handleExport("csv")}
          disabled={loading !== null}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-teal-500/40 hover:bg-white/[0.07] transition-all text-left group disabled:opacity-50"
        >
          <span className="text-xl">📊</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              {loading === "csv" ? "Downloading…" : "Export as CSV"}
            </div>
            <div className="text-[10px] text-slate-500">Spreadsheet-ready · nutrient gaps with RDA targets</div>
          </div>
          <span className="text-xs text-slate-600 font-mono">.csv</span>
        </button>
      </div>

      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <p className="mt-3 text-[10px] text-slate-700 leading-relaxed">
        Exports contain Domain A (Debral) data only. Cultural / Ge&apos;ez heritage data (Domain B) is never included.
        Report ID: <span className="font-mono">{reportId.slice(0, 8)}…</span>
      </p>
    </div>
  );
}
