import Link from "next/link";

const sequence = [
  { id: "01", title: "Name & Gematria", detail: "Enter the names that carry your lineage and vibration.", icon: "✦" },
  { id: "02", title: "Adaptive Inquiry", detail: "Answer living questions that respond to your situation.", icon: "✎" },
  { id: "03", title: "Divination Reveal", detail: "Receive a constellation-aware arc of guidance.", icon: "☼" },
];

const livingSignals = [
  { label: "Name Resonance", value: "Ge'ez", tone: "amber" },
  { label: "Lineage Circle", value: "Awde", tone: "emerald" },
  { label: "Care Path", value: "Private", tone: "sky" },
];

export default function SpiritualIntakeLandingPage() {
  return (
    <main className="min-h-screen bg-[#110f0c] text-stone-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute right-[-8%] top-[12%] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-[-8%] left-[30%] h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between border-b border-amber-500/20 pb-6">
            <Link href="/case" className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_#fbbf24]" />
              CASE / SPIRITUAL
            </Link>
            <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-stone-400">
              <span>Oracle Intake</span>
              <span className="text-amber-400">✧</span>
              <span>Debtera Review</span>
            </div>
          </nav>

          <section className="grid lg:grid-cols-[minmax(640px,1.8fr)_minmax(380px,1fr)] gap-8 mt-10">
            <section className="relative rounded-[2rem] border border-amber-500/30 bg-stone-950/60 p-8 shadow-2xl shadow-amber-950/20 backdrop-blur-sm">
              <div className="absolute right-8 top-8 hidden md:block">
                <div className="relative h-28 w-28 rounded-full border border-amber-300/50 flex items-center justify-center">
                  <div className="absolute inset-1 rounded-full border border-amber-500/40" />
                  <span className="text-4xl text-amber-200">✦</span>
                </div>
              </div>

              <div className="max-w-3xl">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-300">
                  <span className="h-px w-12 bg-amber-400" />
                  Spiritual & Life Direction
                </div>

                <div className="mt-7 space-y-5">
                  <h1 className="font-serif text-5xl leading-none md:text-7xl font-black text-amber-50 tracking-tight">
                    Sacred Intake
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-stone-300">
                    Enter your name, lineage, and living situation in a guided flow that translates vibration,
                    family memory, and present direction into a coherent spiritual care path.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/case/spiritual/intake/step-1"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3 font-black text-sm uppercase tracking-[0.18em] text-black shadow-xl shadow-amber-500/30 transition hover:scale-[1.02] hover:from-amber-400 hover:to-amber-500"
                  >
                    Begin Reading
                  </Link>
                  <Link
                    href="/case"
                    className="inline-flex items-center justify-center rounded-2xl border border-stone-700 px-7 py-3 font-bold text-sm uppercase tracking-[0.16em] text-stone-300 transition hover:bg-stone-900 hover:text-amber-200"
                  >
                    Return to Case Domains
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {livingSignals.map((signal) => (
                    <div key={signal.label} className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">{signal.label}</div>
                      <div className="mt-2 text-lg font-serif font-black text-amber-100">{signal.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">Reading Protocol</div>
                  <div className="mt-2 text-xs text-stone-500">01 / 03</div>
                </div>
                <span className="rounded-full border border-emerald-500/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                  Secure
                </span>
              </div>

              <div className="mt-8 space-y-4">
                {sequence.map((item, index) => (
                  <div key={item.id} className="group flex items-start gap-3 rounded-2xl border border-stone-800/80 bg-black/20 p-4 transition hover:border-amber-500/60 hover:bg-stone-950/80">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-200">
                      <span className="font-serif text-lg">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{item.id}</span>
                        <span className="text-sm font-bold text-stone-100">{item.title}</span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-stone-400">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-amber-500/30 bg-amber-500/8 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Signal Quality</span>
                  <span className="text-emerald-300 text-xs font-bold">Online</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-stone-800">
                  <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-amber-300 to-emerald-400" />
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-stone-500">
                  <span>Name echo</span>
                  <span>Lineage match</span>
                  <span>Care focus</span>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
