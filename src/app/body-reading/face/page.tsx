import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";

const topics = [
  {
    title: "Historical context",
    body: "Explore how different communities have used face-reading traditions as cultural stories and symbolic language. Specific claims about facial features are not established facts.",
  },
  {
    title: "Consent and dignity",
    body: "Keep discussion voluntary and focused on the tradition itself. Do not interpret another person's appearance or use appearance to make decisions about them.",
  },
  {
    title: "No image analysis",
    body: "A face photo is not needed or accepted for this activity. This page does not identify people or infer health, personality, emotion, ethnicity, character, or trustworthiness.",
  },
];

export default function FaceReadingPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <Link href="/body-reading/tongue" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Other body-sign learning
      </Link>

      <header className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
          <BookOpen className="size-4" aria-hidden="true" /> Cultural history and ethics
        </p>
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-5xl">
          Face-reading traditions <span lang="am" className="block text-2xl text-muted-foreground sm:inline">የፊት ንባብ</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          This guide is for learning about the history of physiognomic traditions, not for reading or assessing a person.
          Historical associations between appearance and inner traits are unsupported and should not be treated as factual.
        </p>
      </header>

      <section role="note" className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/[0.08] p-5 text-sm leading-relaxed text-amber-100">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden="true" />
        <p><strong>Ethical boundary:</strong> Do not infer identity, health, personality, emotion, ethnicity, character, or trustworthiness from someone&apos;s face. Do not use appearance to make personal, professional, or safety decisions.</p>
      </section>

      <section aria-label="Learning topics" className="grid gap-4 md:grid-cols-3">
        {topics.map((topic) => (
          <article key={topic.title} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold text-foreground">{topic.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{topic.body}</p>
          </article>
        ))}
      </section>

      <p className="text-sm leading-relaxed text-muted-foreground">
        If you are concerned about a health issue, consult a qualified health professional; face appearance is not a diagnostic test.
      </p>
    </main>
  );
}
