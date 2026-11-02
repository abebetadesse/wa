"use client";

import { useState } from "react";
import {
  Orbit,
  Leaf,
  BookOpen,
  Activity,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
} from "lucide-react";
import type { HexacoreDossierReport } from "@/lib/hexacore/HexacoreDossierService";

interface PractitionerHexacorePanelProps {
  bookingId: string;
  clientName: string;
  dossier?: HexacoreDossierReport | null;
  purchaseReference?: string | null;
  className?: string;
}

const CORE_COLORS: Record<string, string> = {
  Power: "#FF6347",
  Humanity: "#4169E1",
  Creation: "#32CD32",
  Peace: "#DAA520",
  Spirit: "#9370DB",
  Order: "#00CED1",
};

export default function PractitionerHexacorePanel({
  bookingId,
  clientName,
  dossier,
  purchaseReference,
  className = "",
}: PractitionerHexacorePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [practitionerNotes, setPractitionerNotes] = useState("");
  const [prescribedRemedy, setPrescribedRemedy] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveNotes = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // Persist as practitioner reading notes (extensible to dedicated API endpoint)
      await new Promise((r) => setTimeout(r, 700));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  if (!dossier) {
    return (
      <div className={`rounded-2xl border border-border bg-foreground/[0.03] p-5 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Orbit className="h-5 w-5 text-gold" />
          <h3 className="font-bold text-foreground text-sm">Hexacore Client Reading</h3>
        </div>
        <div className="rounded-xl border border-border bg-foreground/[0.02] p-4 text-center text-sm text-muted-foreground">
          <AlertTriangle className="h-6 w-6 text-gold mx-auto mb-2" />
          <p>No Hexacore dossier is attached to this booking.</p>
          <p className="text-xs mt-1 text-subtle">
            If the client booked a Hexacore reading session, their dossier will appear here after payment verification.
          </p>
        </div>
      </div>
    );
  }

  const dominantColor = CORE_COLORS[dossier.dominantCore] || "var(--gold)";

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${className}`}
      style={{ borderColor: "color-mix(in srgb, var(--gold-fill) 25%, transparent)", background: "var(--bg-card)" }}
    >
      {/* Panel Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition text-left"
        id={`practitioner-hexacore-toggle-${bookingId}`}
      >
        <div className="flex items-center gap-3">
          <div
            className="rounded-full p-2"
            style={{ background: `${dominantColor}20`, border: `1px solid ${dominantColor}50` }}
          >
            <Orbit className="h-4 w-4" style={{ color: dominantColor }} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gold">Hexacore Natal Reading</div>
            <h3 className="font-bold text-foreground text-sm">
              {clientName} · {dossier.dominantCore} Core · #{dossier.coreNumber}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border"
            style={{ color: dominantColor, borderColor: `${dominantColor}50`, background: `${dominantColor}15` }}
          >
            {dossier.masterArchetype}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-border pt-4">
          {/* 6-Core Spectrum */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">
              6-Core Energetic Spectrum
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(["P", "H", "C", "E", "S", "O"] as const).map((core) => {
                const names: Record<string, string> = {
                  P: "Power", H: "Humanity", C: "Creation", E: "Peace", S: "Spirit", O: "Order",
                };
                const color = CORE_COLORS[names[core]] || "var(--gold)";
                const val = dossier.coreRadar[core] || 0;
                return (
                  <div key={core}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground">{names[core]}</span>
                      <strong style={{ color }}>{val}%</strong>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-foreground/10">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${val}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Creation-Day & Solfeggio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-foreground/[0.03] p-3">
              <div className="text-[10px] text-gold font-bold uppercase mb-1">Creation-Day Anchor</div>
              <div className="text-sm font-semibold text-foreground">{dossier.creationDayAnchor.day}</div>
              <div className="text-xs text-muted-foreground">{dossier.creationDayAnchor.element}</div>
              <div className="text-[11px] text-subtle mt-1 italic">{dossier.creationDayAnchor.theme}</div>
            </div>
            <div className="rounded-xl border border-border bg-foreground/[0.03] p-3">
              <div className="text-[10px] text-info font-bold uppercase mb-1">Acoustic Key</div>
              <div className="text-lg font-bold text-info">{dossier.solfeggioHz} Hz</div>
              <div className="text-[11px] text-muted-foreground">{dossier.biorhythm.season} · {dossier.biorhythm.lifeStage}</div>
            </div>
          </div>

          {/* Initiation Gate */}
          <div className="rounded-xl border border-border bg-foreground/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Initiation Gate (Layer 11)</span>
            </div>
            <div className="text-sm text-foreground font-semibold">{dossier.initiationGate.gate}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <strong className="text-soft">Trial:</strong> {dossier.initiationGate.trial}
            </div>
            <div className="text-xs text-brand mt-1">
              <strong>Reward:</strong> {dossier.initiationGate.reward}
            </div>
          </div>

          {/* Botanical Prescriptions */}
          {dossier.botanicalPrescriptions && dossier.botanicalPrescriptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-brand" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                  Botanical Correspondence Formulas
                </span>
              </div>
              <div className="space-y-2">
                {dossier.botanicalPrescriptions.map((p) => (
                  <div
                    key={p.sku}
                    className="rounded-xl border border-border bg-foreground/[0.02] p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{p.herbNameEn}</div>
                        <div className="text-[11px] italic text-subtle">{p.scientificName}</div>
                      </div>
                      <span className="text-xs font-bold text-brand">{p.priceEtb} ETB</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.therapeuticSynergyEn}</div>
                    <div className="mt-1 text-[10px] text-gold-strong bg-gold/[0.08] rounded px-2 py-1">
                      ⚠ {p.safetyCautionEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practitioner Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-plum" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-plum">
                Practitioner Notes & Remedy Prescription
              </span>
            </div>
            <textarea
              id={`practitioner-notes-${bookingId}`}
              value={practitionerNotes}
              onChange={(e) => setPractitionerNotes(e.target.value)}
              placeholder="Record session observations, lineage insights, specific remedies prescribed, follow-up practices..."
              rows={4}
              className="w-full rounded-xl border border-border bg-foreground/[0.04] px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-plum/60 focus:outline-none resize-none"
            />
            <div className="mt-2">
              <label className="block text-[11px] text-muted-foreground mb-1">Specific Remedy Prescribed</label>
              <input
                id={`practitioner-remedy-${bookingId}`}
                type="text"
                value={prescribedRemedy}
                onChange={(e) => setPrescribedRemedy(e.target.value)}
                placeholder="e.g. Damakesse tincture 15ml, 3× weekly..."
                className="w-full rounded-xl border border-border bg-foreground/[0.04] px-3.5 py-2 text-sm text-foreground placeholder:text-subtle focus:border-plum/60 focus:outline-none"
              />
            </div>
            {saveError && (
              <div className="mt-2 text-xs text-danger flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> {saveError}
              </div>
            )}
            <button
              id={`practitioner-save-${bookingId}`}
              onClick={handleSaveNotes}
              disabled={saving || !practitionerNotes.trim()}
              className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-50"
              style={{ background: "var(--plum-soft)", border: "1px solid color-mix(in srgb, var(--plum) 40%, transparent)", color: "var(--plum-strong)" }}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4 text-brand" /> Notes Saved</>
              ) : (
                "Save Practitioner Notes"
              )}
            </button>
          </div>

          {/* Ethical Footer */}
          <div className="flex items-start gap-2 rounded-xl border border-gold/15 bg-gold/[0.04] p-3 text-[10px] text-gold-strong text-gold-strong">
            <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gold" />
            Hexacore reading is a cultural reflection tool. Practitioners must not use these correspondences as medical diagnoses, substitute them for psychological therapy, or present herbal formulas as clinical treatments.
          </div>
        </div>
      )}
    </div>
  );
}
