"use client";

import React from "react";

interface NutrientPoint {
  name: string;
  symbol: string;
  actual: number;
  target: number;
  unit: string;
  pct: number;
}

interface RadarChartProps {
  data: NutrientPoint[];
}

export default function NutrientRadarChart({ data }: RadarChartProps) {
  if (!data || data.length === 0) return null;

  const size = 380;
  const center = size / 2;
  const radius = center - 50;
  const total = data.length;
  const angleStep = (Math.PI * 2) / total;

  // Levels for the radar grid: 25%, 50%, 75%, 100% (Target Baseline), 125%
  const levels = [0.25, 0.5, 0.75, 1.0, 1.25];

  // Helper to compute (x, y) for an angle and radius factor
  const getCoordinates = (index: number, factor: number) => {
    const angle = index * angleStep - Math.PI / 2; // start from top (12 o'clock)
    const r = radius * Math.min(factor, 1.35); // cap display at 135%
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build polygon points for the actual client intake
  const actualPoints = data
    .map((item, i) => {
      const factor = (item.pct / 100) * 1.0;
      const { x, y } = getCoordinates(i, factor);
      return `${x},${y}`;
    })
    .join(" ");

  // Build polygon points for the 100% Target Baseline
  const targetPoints = data
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 1.0);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="glass-panel p-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Biochemical Nutrient Balance Radar</span>
            <span className="badge badge-safe text-[9px]">EFCT Baseline vs Altitude</span>
          </h3>
          <p className="text-xs text-slate-400">
            Green dashed circle marks 100% of altitude-calibrated physiological requirements
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-400"></span>
            <span className="text-slate-300">Client Intake</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-400"></span>
            <span className="text-slate-300">Target (100%)</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background concentric rings */}
          {levels.map((level, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke={level === 1.0 ? "rgba(245, 158, 11, 0.6)" : "rgba(255, 255, 255, 0.07)"}
              strokeWidth={level === 1.0 ? 1.5 : 1}
              strokeDasharray={level === 1.0 ? "4,4" : undefined}
            />
          ))}

          {/* Radial axis lines */}
          {data.map((_, i) => {
            const { x, y } = getCoordinates(i, 1.25);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Target Baseline Polygon (100%) */}
          <polygon
            points={targetPoints}
            fill="none"
            stroke="rgba(245, 158, 11, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* Client Actual Intake Polygon */}
          <polygon
            points={actualPoints}
            fill="rgba(16, 185, 129, 0.25)"
            stroke="#10b981"
            strokeWidth="2.5"
          />

          {/* Axis Vertex Nodes & Labels */}
          {data.map((item, i) => {
            const factor = (item.pct / 100) * 1.0;
            const node = getCoordinates(i, factor);
            const labelPos = getCoordinates(i, 1.35);

            const isDeficient = item.pct < 70;

            return (
              <g key={i}>
                {/* Vertex circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="4"
                  fill={isDeficient ? "#fb7185" : "#34d399"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Label text */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[11px] font-semibold fill-slate-200"
                >
                  {item.symbol || item.name.slice(0, 4)}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[9px] font-mono ${isDeficient ? "fill-rose-400 font-bold" : "fill-emerald-400"}`}
                >
                  {item.pct}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 mt-6 pt-4 border-t border-white/10 text-xs">
        {data.slice(0, 4).map((d, idx) => (
          <div key={idx} className="p-2 rounded bg-white/[0.02] text-center">
            <span className="text-slate-400 text-[10px] block">{d.name}</span>
            <span className={`font-mono font-bold ${d.pct < 70 ? "text-rose-400" : "text-emerald-400"}`}>
              {d.actual} / {d.target} {d.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
