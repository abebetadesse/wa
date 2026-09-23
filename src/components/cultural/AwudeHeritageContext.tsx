const AWUDE_HERITAGE_IMAGES = [
  {
    title: "Royal enclosure",
    caption: "Fasil Ghebbi, Gondar",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/ET_Gondar_asv2018-02_img19_Fasil_Ghebbi.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:ET_Gondar_asv2018-02_img19_Fasil_Ghebbi.jpg",
  },
  {
    title: "Castle geometry",
    caption: "Fasilides Palace",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Fasilides%27_palace%2C_Gonder%2C_Ethiopia_03.jpg?width=600",
    source: "https://commons.wikimedia.org/wiki/File:Fasilides%27_palace,_Gonder,_Ethiopia_03.jpg",
  },
  {
    title: "Highland context",
    caption: "Simien National Park",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Simien_National_Park-139420.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Simien_National_Park-139420.jpg",
  },
] as const;

const ETHIOPIA_MAP_IMAGE = "https://commons.wikimedia.org/wiki/Special:FilePath/Ethiopia_Base_Map.png?width=900";
const ETHIOPIA_MAP_SOURCE = "https://commons.wikimedia.org/wiki/File:Ethiopia_Base_Map.png";

interface AwudeHeritageContextProps {
  compact?: boolean;
}

export default function AwudeHeritageContext({ compact = false }: AwudeHeritageContextProps) {
  return (
    <section
      aria-labelledby="awude-heritage-context"
      className={`border border-amber-500/30 bg-slate-950/80 shadow-xl backdrop-blur-md ${compact ? "rounded-xl p-4" : "rounded-2xl p-5 md:p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Cultural reflection layer</span>
          <h2 id="awude-heritage-context" className="mt-1 text-lg font-bold text-slate-100">AwudeNegest heritage context</h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
            Visual references to the Gondar and Ethiopian highland setting associated with the AwudeNegest tradition. This layer enriches reflection and does not change Debral findings, urgency, or treatment guidance.
          </p>
        </div>
        <a
          href="https://commons.wikimedia.org/wiki/Category:Fasil_Ghebbi"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-amber-300 hover:text-amber-200"
        >
          Browse source collection ↗
        </a>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
          {AWUDE_HERITAGE_IMAGES.map((visual) => (
            <a
              key={visual.title}
              href={visual.source}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-950">
                <img
                  src={visual.image}
                  alt={`${visual.title}, ${visual.caption}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-slate-200">{visual.title}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{visual.caption} · Wikimedia Commons ↗</div>
              </div>
            </a>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 lg:col-span-5">
          <a href={ETHIOPIA_MAP_SOURCE} target="_blank" rel="noreferrer" className="block aspect-[16/10] bg-slate-950">
            <img
              src={ETHIOPIA_MAP_IMAGE}
              alt="Map of Ethiopia showing the highland geography around Gondar"
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
            />
          </a>
          <div className="p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-200">Geographic anchor</span>
              <span className="text-[10px] text-emerald-300">Gondar · Amhara Highlands</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
              A visual orientation for the historic highland context used in the cultural reflection layer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
