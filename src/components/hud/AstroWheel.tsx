type AstroWheelProps = {
  sign?: string;
  degree?: number;
};

const signs = [
  "Anbessa",
  "Tsehay",
  "Arba",
  "Kebre",
  "Hagay",
  "Awe",
  "Bazena",
  "Ras",
  "Dala",
  "Mebat",
  "Mebit",
  "Amanu'el",
  "Gugsa",
];

export default function AstroWheel({ sign = "Anbessa", degree = 42 }: AstroWheelProps) {
  const rotation = `rotate(${degree}deg)`;

  return (
    <div className="astro-wheel" aria-label={`Astro wheel for ${sign}`}>
      <svg viewBox="0 0 220 220" className="astro-wheel__svg">
        <circle cx="110" cy="110" r="92" className="astro-wheel__ring" />
        {[...Array(13)].map((_, index) => {
          const angle = (index / 13) * 360;
          const x = 110 + Math.cos((angle - 90) * (Math.PI / 180)) * 72;
          const y = 110 + Math.sin((angle - 90) * (Math.PI / 180)) * 72;
          return (
            <g key={index}>
              <line x1="110" y1="110" x2={x} y2={y} className="astro-wheel__axis" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="astro-wheel__label">
                {index + 1}
              </text>
            </g>
          );
        })}
        <circle cx="110" cy="110" r="32" className="astro-wheel__core" />
      </svg>
      <div className="astro-wheel__needle" style={{ transform: rotation }} />
      <div className="astro-wheel__sign">{sign}</div>
    </div>
  );
}
