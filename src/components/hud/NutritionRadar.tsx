"use client";

type NutritionRadarProps = {
  data?: number[];
};

const defaultData = [72, 85, 91, 68, 76, 82];
const labels = ["Protein", "Iron", "Zinc", "Calcium", "Vit A", "Vit C"];

export default function NutritionRadar({ data = defaultData }: NutritionRadarProps) {
  const size = 220;
  const center = size / 2;
  const radius = 78;
  const levelCount = 4;

  const toPoint = (angle: number, value: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    const pointRadius = (value / 100) * radius;
    return {
      x: center + Math.cos(radians) * pointRadius,
      y: center + Math.sin(radians) * pointRadius,
    };
  };

  const polygonPoints = labels
    .map((_, index) => {
      const angle = (360 / labels.length) * index;
      return toPoint(angle, data[index] ?? 0);
    })
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  const rings = Array.from({ length: levelCount }, (_, level) => {
    const levelRadius = (radius * (level + 1)) / levelCount;
    const ringPoints = labels
      .map((_, index) => {
        const angle = (360 / labels.length) * index;
        const point = toPoint(angle, (100 * (level + 1)) / levelCount);
        return `${point.x},${point.y}`;
      })
      .join(" ");

    return <polygon key={level} points={ringPoints} fill="none" stroke="rgba(125,211,252,0.2)" strokeWidth="1" />;
  });

  const axisLines = labels.map((label, index) => {
    const angle = (360 / labels.length) * index;
    const end = toPoint(angle, 100);
    const anchorX = center + Math.cos(((angle - 90) * Math.PI) / 180) * (radius + 12);
    const anchorY = center + Math.sin(((angle - 90) * Math.PI) / 180) * (radius + 12);

    return (
      <g key={label}>
        <line x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(125,211,252,0.25)" strokeWidth="1" />
        <text x={anchorX} y={anchorY} textAnchor="middle" fill="#dfeaf7" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace">
          {label}
        </text>
      </g>
    );
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="220" role="img" aria-label="Nutrition radar chart">
      <defs>
        <linearGradient id="nutrition-radar-fill" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0.45)" />
          <stop offset="100%" stopColor="rgba(34,197,94,0.25)" />
        </linearGradient>
      </defs>
      {rings}
      {axisLines}
      <polygon points={polygonPoints} fill="url(#nutrition-radar-fill)" stroke="#22d3ee" strokeWidth="2" />
      {labels.map((_, index) => {
        const point = toPoint((360 / labels.length) * index, data[index] ?? 0);
        return <circle key={`${index}-dot`} cx={point.x} cy={point.y} r="3" fill="#7dd3fc" />;
      })}
    </svg>
  );
}
