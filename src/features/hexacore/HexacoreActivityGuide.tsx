import Link from "next/link";
import { BookOpen, Camera, ShieldCheck } from "lucide-react";
import { HEXACORE_ACTIVITY_GUIDES, hexacoreActivityForService } from "@/lib/cultural/hexacoreActivities";

export function HexacoreActivityGuide({ kind, compact = false }: { kind?: string; compact?: boolean }) {
  const guides = kind
    ? [hexacoreActivityForService(kind)].filter((guide) => guide !== null)
    : HEXACORE_ACTIVITY_GUIDES;

  if (guides.length === 0) return null;

  return (
    <section aria-labelledby="hexacore-activity-guides" className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
        <div>
          <h2 id="hexacore-activity-guides" className="font-display text-lg font-bold text-foreground">
            {kind ? "What to expect" : "Hexacore activity guides"}
          </h2>
          {!kind && <p className="mt-1 text-sm text-muted-foreground">Review the activity, preparation, and limits before booking.</p>}
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
        {guides.map((guide) => (
          <article key={guide.kind} className="rounded-2xl border border-border bg-background/50 p-4">
            <h3 className="font-semibold text-foreground">{guide.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{guide.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{guide.session}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">Prepare:</strong> {guide.preparation}</p>
            {guide.imageGuidance && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/70 p-3 text-xs leading-relaxed text-foreground">
                <Camera className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <span>{guide.imageGuidance}</span>
              </p>
            )}
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{guide.boundaries}</span>
            </p>
            <Link href={guide.href} className="mt-3 inline-flex text-sm font-semibold text-brand hover:underline">
              Read the learning guide <span className="sr-only">for {guide.title}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
