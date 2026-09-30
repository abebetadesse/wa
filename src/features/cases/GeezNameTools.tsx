"use client";

import { useMemo, useState } from "react";
import { Delete, Keyboard, Sparkles } from "lucide-react";
import { calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";
import { Button, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

/** First code point of each Ge'ez consonant row; its seven vowel orders follow it in Unicode. */
const ROWS = [0x1200, 0x1208, 0x1210, 0x1218, 0x1220, 0x1228, 0x1230, 0x1238, 0x1240, 0x1260, 0x1268, 0x1270, 0x1278, 0x1280, 0x1290, 0x1298, 0x12a0, 0x12a8, 0x12b8, 0x12c8, 0x12d0, 0x12d8, 0x12e0, 0x12e8, 0x12f0, 0x1300, 0x1308, 0x1320, 0x1328, 0x1330, 0x1338, 0x1340, 0x1348, 0x1350];

/** Tap a letter, then its vowel form, to type a name in Ge'ez without an Ethiopic keyboard. */
export function GeezKeyboard({ onInsert, onBackspace }: { onInsert: (text: string) => void; onBackspace: () => void }) {
  const [row, setRow] = useState<number | null>(null);
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Keyboard className="size-4" aria-hidden="true" /> {row === null ? "Choose a letter" : "Choose its sound"}
        <span className="ml-auto flex gap-1">
          {row !== null && <Button type="button" size="sm" variant="ghost" onClick={() => setRow(null)}>All letters</Button>}
          <Button type="button" size="sm" variant="ghost" onClick={onBackspace} aria-label="Delete last letter"><Delete className="size-4" aria-hidden="true" /></Button>
        </span>
      </div>
      <div className="flex flex-wrap gap-1" lang="am">
        {(row === null ? ROWS.map((start) => ({ char: String.fromCodePoint(start), start })) : Array.from({ length: 7 }, (_, order) => ({ char: String.fromCodePoint(row + order), start: row }))).map(({ char, start }) => (
          <button
            key={char}
            type="button"
            onClick={() => (row === null ? setRow(start) : (onInsert(char), setRow(null)))}
            className="grid size-10 place-items-center rounded-xl border border-border bg-card font-geez text-lg text-foreground hover:border-brand hover:bg-brand/10"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Live, reflective preview of the name's letter values as the person types. The full reading is
 * prepared and reviewed by a debtera; this only shows how the tradition counts the name.
 */
export function GeezNamePreview({ name, motherName }: { name: string; motherName: string }) {
  const reading = useMemo(() => {
    if (!/[ሀ-፿]/.test(name)) return null;
    try {
      return calculateFullDivination(name.trim(), motherName.trim());
    } catch {
      return null;
    }
  }, [name, motherName]);

  if (!reading) {
    return <p className="text-sm text-muted-foreground">Type the name in Ge&apos;ez letters to see how the Awde Negest tradition counts it.</p>;
  }

  return (
    <Card className="border-gold/40 bg-gradient-to-br from-gold/10 via-transparent to-brand/10">
      <CardContent className="flex flex-col gap-4 pt-5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold"><Sparkles className="size-4" aria-hidden="true" /> Name reckoning (preview)</p>
        <div className="flex flex-wrap gap-1.5" lang="am">
          {[...reading.letters, ...reading.motherLetters].map((letter, index) => (
            <span key={`${letter.letter}-${index}`} className={cn("flex flex-col items-center rounded-xl border px-2 py-1", index >= reading.letters.length ? "border-brand/30" : "border-gold/40")}>
              <span className="font-geez text-lg text-foreground">{letter.letter}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">{letter.value}</span>
            </span>
          ))}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><dt className="text-xs text-muted-foreground">Name total</dt><dd className="font-semibold tabular-nums text-foreground">{reading.nameSubtotal}</dd></div>
          {reading.motherLetters.length > 0 && <div><dt className="text-xs text-muted-foreground">Mother&apos;s name</dt><dd className="font-semibold tabular-nums text-foreground">{reading.motherSubtotal}</dd></div>}
          <div><dt className="text-xs text-muted-foreground">Remainder of 12</dt><dd className="font-semibold tabular-nums text-foreground">{reading.finalNumber}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Sign</dt><dd className="font-semibold text-foreground">{reading.zodiac.symbol} {reading.zodiac.name} <span lang="am" className="font-geez text-muted-foreground">{reading.zodiac.nameAmharic}</span></dd></div>
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Awde circle</dt><dd className="font-semibold text-foreground">{reading.awdeCircle.name} · {reading.awdeCircle.element}</dd></div>
        </dl>
        <p className="text-xs text-muted-foreground">A reflective tradition, not a prediction. Your debtera reviews the full reading before you see it.</p>
      </CardContent>
    </Card>
  );
}
