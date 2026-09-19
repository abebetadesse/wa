// src/components/hud/AwdeNegestRings.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AWDE_CIRCLES = [
  { n: 1, name: "Sun", nameAmh: "ትሱያ", color: "#f59e0b" },
  { n: 2, name: "Moon", nameAmh: "ወርህ", color: "#3b82f6" },
  { n: 3, name: "Wisdom", nameAmh: "መልክ", color: "#a855f7" },
  { n: 4, name: "Ancestors", nameAmh: "አባቶች", color: "#78350f" },
  { n: 5, name: "Joy", nameAmh: "ፍርድ", color: "#ec4899" },
  { n: 6, name: "Service", nameAmh: "ሰብአ", color: "#10b981" },
  { n: 7, name: "Unity", nameAmh: "ስንቁ", color: "#06b6d4" },
  { n: 8, name: "Renewal", nameAmh: "ቅድስት", color: "#8b5cf6" },
  { n: 9, name: "Knowledge", nameAmh: "ብርሃን", color: "#fbbf24" },
  { n: 10, name: "Glory", nameAmh: "ግብር", color: "#dc2626" },
  { n: 11, name: "Fellowship", nameAmh: "ኅብረት", color: "#0891b2" },
  { n: 12, name: "Healing", nameAmh: "መድሀኒት", color: "#059669" },
  { n: 13, name: "Rebirth", nameAmh: "እርሻ", color: "#ea580c" },
  { n: 14, name: "Justice", nameAmh: "ሚዛን", color: "#7c3aed" },
  { n: 15, name: "Restoration", nameAmh: "ፈውስ", color: "#0284c7" },
  { n: 16, name: "Fulfillment", nameAmh: "መጨረሻ", color: "#78716c" },
];

interface AwdeNegestRingsProps {
  highlightCircle?: number;
  size?: number;
}

export default function AwdeNegestRings({ highlightCircle = 15, size = 340 }: AwdeNegestRingsProps) {
  const [pulseIndex, setPulseIndex] = useState(highlightCircle);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev % 16) + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const center = size / 2;
  const maxRadius = size / 2 - 26;
  const innerRadius = 58;
  const labelRadius = maxRadius + 28;
  const segmentAngle = 360 / AWDE_CIRCLES.length;
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);

  const roundCoordinate = (value: number) => Number(value.toFixed(6));

  const polarToCartesian = (cx: number, cy: number, radius: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: roundCoordinate(cx + radius * Math.cos(angleRad)),
      y: roundCoordinate(cy + radius * Math.sin(angleRad)),
    };
  };

  const describeSegment = (segmentIndex: number) => {
    const start = segmentIndex * segmentAngle;
    const end = (segmentIndex + 1) * segmentAngle;
    const outerStart = polarToCartesian(center, center, maxRadius, end);
    const outerEnd = polarToCartesian(center, center, maxRadius, start);
    const innerStart = polarToCartesian(center, center, innerRadius, start);
    const innerEnd = polarToCartesian(center, center, innerRadius, end);
    const largeArcFlag = end - start > 180 ? 1 : 0;

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${maxRadius} ${maxRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
  };

  return (
    <div className="awde-rings-wrap" style={{ width: size, height: size }}>
      <div className="awde-glow" />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Awde Negest sacred atlas map">
        <defs>
          <radialGradient id="awdeCenterGlow">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="awdeParchmentGlow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#3c2a15" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#1d1410" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        <circle cx={center} cy={center} r={maxRadius + 14} fill="url(#awdeParchmentGlow)" opacity="0.74" />

        {AWDE_CIRCLES.map((circle, idx) => {
          const isActive = circle.n === pulseIndex;
          const isHovered = hoveredCircle === circle.n;
          const angle = idx * segmentAngle + segmentAngle / 2;
          const labelPoint = polarToCartesian(center, center, labelRadius, angle);
          const radius = ((idx + 1) / 16) * maxRadius;

          const textAnchor = labelPoint.x > center ? "start" : "end";
          const dx = labelPoint.x > center ? 11 : -11;

          return (
            <g key={circle.n}>
              <motion.path
                d={describeSegment(idx)}
                fill={isActive ? circle.color + "22" : isHovered ? circle.color + "18" : "rgba(255,255,255,0.01)"}
                stroke={isActive ? circle.color : isHovered ? circle.color : "rgba(245,158,11,0.42)"}
                strokeWidth={isActive ? 1.8 : isHovered ? 1.2 : 0.8}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.7 }}
                transition={{ duration: 0.35 }}
                onClick={() => setPulseIndex(circle.n)}
                onMouseEnter={() => setHoveredCircle(circle.n)}
                onMouseLeave={() => setHoveredCircle(null)}
                style={{ cursor: "pointer" }}
              />

              <motion.circle
                key={`${circle.n}-ring`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={isActive ? circle.color : circle.color + "40"}
                strokeWidth={isActive ? 2.2 : 0.9}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.45 }}
                transition={{ duration: 0.4 }}
              />

              <text
                x={labelPoint.x + dx * 0.2}
                y={labelPoint.y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontSize={isActive || isHovered ? "9" : "7.5"}
                fontWeight={isActive ? 700 : 600}
                fill={isActive ? "#fef3c7" : "#f5d188"}
                letterSpacing="1.4"
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => setPulseIndex(circle.n)}
                onMouseEnter={() => setHoveredCircle(circle.n)}
                onMouseLeave={() => setHoveredCircle(null)}
              >
                {circle.n}
              </text>

              <text
                x={labelPoint.x + dx}
                y={labelPoint.y + 12}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontSize={isActive || isHovered ? "7" : "5.8"}
                fill={isActive ? circle.color : "#f7d88c"}
                letterSpacing="1.2"
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => setPulseIndex(circle.n)}
                onMouseEnter={() => setHoveredCircle(circle.n)}
                onMouseLeave={() => setHoveredCircle(null)}
              >
                {circle.name}
              </text>
            </g>
          );
        })}

        {Array.from({ length: 16 }).map((_, idx) => {
          const angle = (idx * 360) / 16 - 90;
          const radian = (angle * Math.PI) / 180;
          return (
            <line
              key={`ray-${idx}`}
              x1={center}
              y1={center}
              x2={roundCoordinate(center + maxRadius * Math.cos(radian))}
              y2={roundCoordinate(center + maxRadius * Math.sin(radian))}
              stroke="rgba(245,158,11,0.18)"
              strokeWidth="0.8"
            />
          );
        })}

        <circle cx={center} cy={center} r={innerRadius} fill="rgba(0,0,0,0.2)" stroke="rgba(245,158,11,0.35)" strokeWidth="1.2" />
        <circle cx={center} cy={center} r={30} fill="url(#awdeCenterGlow)" />

        {AWDE_CIRCLES.map((circle, idx) => {
          const angle = (idx * 360) / 16 - 90 + 11.25;
          const radian = (angle * Math.PI) / 180;
          const labelRadiusInner = 96;
          const x = roundCoordinate(center + labelRadiusInner * Math.cos(radian));
          const y = roundCoordinate(center + labelRadiusInner * Math.sin(radian));
          const isActive = circle.n === pulseIndex;

          return (
            <text
              key={`${circle.n}-tiny`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isActive ? "9" : "7.5"}
              fontWeight={isActive ? "bold" : "normal"}
              fill={isActive ? circle.color : "#d6a84a"}
              style={{ transition: "all 0.4s ease" }}
            >
              {circle.n}
            </text>
          );
        })}
      </svg>

      <div className="awde-center-label">
        <div className="awde-center-number">{pulseIndex}</div>
        <div className="awde-center-name">
          {AWDE_CIRCLES[pulseIndex - 1]?.name}
        </div>
        <div className="awde-center-amh">
          {AWDE_CIRCLES[pulseIndex - 1]?.nameAmh}
        </div>
      </div>

      {hoveredCircle && (
        <div className="awde-tooltip">
          <span>{hoveredCircle}</span>
          <strong>{AWDE_CIRCLES[hoveredCircle - 1]?.name}</strong>
          <small>{AWDE_CIRCLES[hoveredCircle - 1]?.nameAmh}</small>
        </div>
      )}
    </div>
  );
}