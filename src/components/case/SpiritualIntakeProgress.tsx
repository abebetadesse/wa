const stages = [
  "Name & context",
  "Adaptive inquiry",
  "Cultural reading",
  "Draft processing",
  "Reading preview",
];

export function SpiritualIntakeProgress({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <nav aria-label="Spiritual reading progress" className="w-full">
      <ol className="grid grid-cols-5 gap-2">
        {stages.map((stage, index) => {
          const step = index + 1;
          const complete = step < current;
          const active = step === current;
          return (
            <li
              key={stage}
              aria-current={active ? "step" : undefined}
              className={`min-w-0 border-t-2 pt-2 ${
                active
                  ? "border-gold text-gold-strong"
                  : complete
                    ? "border-brand text-brand"
                    : "border-border text-subtle"
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wide">
                {complete ? "Done" : `Step ${step}`}
              </span>
              <span className="mt-1 block truncate text-[10px] sm:text-xs">{stage}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
