"use client";

import React from "react";
import { AwdeCircle, AwdeSegment } from "@/lib/cultural/spiritualDivinationEngine";

export function AwdeCircleVisualizer({
  circle,
  segment,
}: {
  circle?: AwdeCircle | null;
  segment?: AwdeSegment | null;
}) {
  const circleNum = circle?.number || 8;
  const totalSegments = 16;
  const radius = 110;
  const center = 140;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/30 overflow-hidden shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-[280px] h-[280px]">
        <svg viewBox="0 0 280 280" className="w-full h-full animate-spin-slow">
          {/* Outer ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(245, 158, 11, 0.2)"
            strokeWidth="2"
            strokeDasharray="4 6"
          />

          {/* Inner ring */}
          <circle
            cx={center}
            cy={center}
            r={radius - 28}
            fill="none"
            stroke="rgba(245, 158, 11, 0.3)"
            strokeWidth="1.5"
          />

          {/* 16 Segments */}
          {Array.from({ length: totalSegments }).map((_, i) => {
            const angle = (i * 360) / totalSegments;
            const rad = (angle * Math.PI) / 180;
            const x1 = center + (radius - 28) * Math.cos(rad);
            const y1 = center + (radius - 28) * Math.sin(rad);
            const x2 = center + radius * Math.cos(rad);
            const y2 = center + radius * Math.sin(rad);
            const isCurrent = i + 1 === circleNum;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isCurrent ? "#f59e0b" : "rgba(245, 158, 11, 0.25)"}
                  strokeWidth={isCurrent ? 3 : 1}
                />
                {isCurrent && (
                  <circle
                    cx={center + (radius - 14) * Math.cos(rad + (Math.PI / totalSegments))}
                    cy={center + (radius - 14) * Math.sin(rad + (Math.PI / totalSegments))}
                    r="5"
                    fill="#10b981"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* Center core */}
          <circle
            cx={center}
            cy={center}
            r={48}
            fill="rgba(20, 15, 10, 0.9)"
            stroke="#d97706"
            strokeWidth="2"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          <span className="text-xs uppercase tracking-widest text-amber-400/90 font-mono">
            Circle {circleNum}
          </span>
          <span className="text-base font-bold text-amber-100 font-serif leading-tight mt-1">
            {circle?.nameAmharic || "ቅድስት"}
          </span>
          <span className="text-[10px] text-stone-300 font-sans mt-0.5">
            {circle?.name || "Transformation"}
          </span>
        </div>
      </div>

      {/* Segment details */}
      <div className="mt-4 text-center max-w-sm space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
          <span>💧 {circle?.lakeName || "Lake of Renewal"}</span>
          <span>·</span>
          <span>Segment {segment?.number || 1}: {segment?.topic || "New Beginnings"}</span>
        </div>
        <p className="text-xs text-stone-300 mt-2 font-serif italic">
          &ldquo;{segment?.prediction || "A cycle is completing, making space for a new phase."}&rdquo;
        </p>
      </div>
    </div>
  );
}
