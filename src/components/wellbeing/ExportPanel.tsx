"use client";

import { useState } from "react";
import { withBasePath } from '@/lib/base-path';

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
      const response = await fetch(withBasePath(`/api/export/${reportId}?format=${format}`));
      if (!response.ok) {
        throw new Error("Export failed. Please try again.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const ext = format === "json" ? "json" : "csv";
      const a = document.createElement("a");
      a.href = url;
      a.download = `wellbeing-report-${reportId.slice(0, 8)}.${ext}`;
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
        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-soft">
          ⬇
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Export Report</h3>
          <p className="text-[10px] text-subtle">Download your scientific gap analysis</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* JSON */}
        <button
          id="export-json-btn"
          onClick={() => handleExport("json")}
          disabled={loading !== null}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-foreground/[0.04] border border-border hover:border-brand/40 hover:bg-foreground/[0.07] transition-all text-left group disabled:opacity-50"
        >
          <span className="text-xl">{ }</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-soft group-hover:text-foreground transition-colors">
              {loading === "json" ? "Downloading…" : "Export as JSON"}
            </div>
            <div className="text-[10px] text-subtle">Full structured data · gaps, causes, solutions, sources</div>
          </div>
          <span className="text-xs text-subtle font-mono">.json</span>
        </button>

        {/* CSV */}
        <button
          id="export-csv-btn"
          onClick={() => handleExport("csv")}
          disabled={loading !== null}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-foreground/[0.04] border border-border hover:border-brand/40 hover:bg-foreground/[0.07] transition-all text-left group disabled:opacity-50"
        >
          <span className="text-xl">📊</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-soft group-hover:text-foreground transition-colors">
              {loading === "csv" ? "Downloading…" : "Export as CSV"}
            </div>
            <div className="text-[10px] text-subtle">Spreadsheet-ready · nutrient gaps with RDA targets</div>
          </div>
          <span className="text-xs text-subtle font-mono">.csv</span>
        </button>
      </div>

      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-danger-soft border border-danger/30 text-danger-strong text-xs">
          {error}
        </div>
      )}

      <p className="mt-3 text-[10px] text-subtle leading-relaxed">
        Exports contain Domain A (scientific) data only. Cultural / Ge&apos;ez heritage data (Domain B) is never included.
        Report ID: <span className="font-mono">{reportId.slice(0, 8)}…</span>
      </p>
    </div>
  );
}
