// src/components/hud/ZodiacWheel.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ETHIOPIAN_ZODIAC_SIGNS = [
  { id: "anbessa", name: "Anbessa", nameAmharic: "አንበሳ", symbol: "🦁", element: "Fire", degree: 0 },
  { id: "tsehay", name: "Tsehay", nameAmharic: "ጸሀይ", symbol: "☀️", element: "Fire", degree: 30 },
  { id: "arba", name: "Arba", nameAmharic: "አርባ", symbol: "🌧️", element: "Water", degree: 60 },
  { id: "neber", name: "Neber", nameAmharic: "ነብር", symbol: "🐆", element: "Earth", degree: 90 },
  { id: "wuha_fera", name: "Wuha Fera", nameAmharic: "ውሃ ፈራ", symbol: "💧", element: "Water", degree: 120 },
  { id: "nisr", name: "Nisr", nameAmharic: "ንስር", symbol: "🦅", element: "Air", degree: 150 },
  { id: "akuqura", name: "Akuqura", nameAmharic: "አኩቁራ", symbol: "🐦", element: "Earth", degree: 180 },
  { id: "pagumen", name: "Pagumen", nameAmharic: "ጳጉሜን", symbol: "🔮", element: "Spirit", degree: 210 },
  { id: "yekatit", name: "Yekatit", nameAmharic: "የካቲት", symbol: "🌱", element: "Earth", degree: 240 },
  { id: "megabit", name: "Megabit", nameAmharic: "መጋቢት", symbol: "🌸", element: "Air", degree: 270 },
  { id: "miyazya", name: "Miyazya", nameAmharic: "ሚያዝያ", symbol: "🌿", element: "Earth", degree: 300 },
  { id: "ginbot", name: "Ginbot", nameAmharic: "ግንቦት", symbol: "🌻", element: "Fire", degree: 330 },
  { id: "sene", name: "Sene", nameAmharic: "ሰኔ", symbol: "🌾", element: "Water", degree: 360 },
];

interface ZodiacWheelProps {
  activeSign?: string;
  size?: number;
}

export default function ZodiacWheel({ activeSign = "anbessa", size = 320 }: ZodiacWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [hoveredSign, setHoveredSign] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.15) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="zodiac-wheel-wrap" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div className="zodiac-glow" />

      {/* Rotating zodiac ring */}
      <motion.div
        className="zodiac-ring"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id="zodiacCenter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#7c2d12" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="zodiacStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Outer decorative ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="none"
            stroke="url(#zodiacStroke)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.6"
          />

          {/* Main ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 30}
            fill="none"
            stroke="url(#zodiacStroke)"
            strokeWidth="1"
            opacity="0.8"
          />

          {/* Center glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 4}
            fill="url(#zodiacCenter)"
          />

          {/* 13 zodiac segments */}
          {ETHIOPIAN_ZODIAC_SIGNS.slice(0, 13).map((sign, index) => {
            const angle = (index * 360) / 13 - 90;
            const radian = (angle * Math.PI) / 180;
            const radius = size / 2 - 20;
            const x = size / 2 + radius * Math.cos(radian);
            const y = size / 2 + radius * Math.sin(radian);
            const isActive = sign.id === activeSign || sign.id === hoveredSign;

            return (
              <g key={sign.id}>
                {/* Tick marks */}
                <line
                  x1={size / 2 + (radius - 10) * Math.cos(radian)}
                  y1={size / 2 + (radius - 10) * Math.sin(radian)}
                  x2={size / 2 + (radius + 5) * Math.cos(radian)}
                  y2={size / 2 + (radius + 5) * Math.sin(radian)}
                  stroke={isActive ? "#fbbf24" : "#78350f"}
                  strokeWidth={isActive ? 2 : 1}
                />
                {/* Symbol */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isActive ? "20" : "16"}
                  fill={isActive ? "#fbbf24" : "#d97706"}
                  opacity={isActive ? 1 : 0.7}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredSign(sign.id)}
                  onMouseLeave={() => setHoveredSign(null)}
                >
                  {sign.symbol}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Center display */}
      <div className="zodiac-center">
        <div className="zodiac-center-label">CURRENT SIGN</div>
        <div className="zodiac-center-name">Anbessa</div>
        <div className="zodiac-center-amharic">አንበሳ</div>
        <div className="zodiac-center-element">FIRE · LION</div>
      </div>
    </div>
  );
}