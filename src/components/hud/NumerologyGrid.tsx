// src/components/hud/NumerologyGrid.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const DEMO_NAMES = [
  { name: "ሙሉ", transliteration: "Mulu", letters: ["ሙ", "ሉ"] },
  { name: "ሰላም", transliteration: "Selam", letters: ["ሰ", "ላ", "ም"] },
  { name: "ዳዊት", transliteration: "Dawit", letters: ["ዳ", "ዊ", "ት"] },
];

const LETTER_VALUES: Record<string, number> = {
  "ሙ": 40, "ሉ": 30,
  "ሰ": 7, "ላ": 30, "ም": 40,
  "ዳ": 100, "ዊ": 60, "ት": 10,
};

export default function NumerologyGrid() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatedLetters, setAnimatedLetters] = useState<string[]>([]);
  const [totalSum, setTotalSum] = useState(0);
  const [finalNumber, setFinalNumber] = useState(0);

  useEffect(() => {
    const demo = DEMO_NAMES[currentIndex];
    setAnimatedLetters([]);
    setTotalSum(0);
    setFinalNumber(0);

    // Animate each letter appearing
    demo.letters.forEach((letter, idx) => {
      setTimeout(() => {
        setAnimatedLetters((prev) => [...prev, letter]);
        setTotalSum((prev) => prev + (LETTER_VALUES[letter] || 0));
      }, idx * 400);
    });

    // Calculate final number
    setTimeout(() => {
      const sum = demo.letters.reduce((acc, l) => acc + (LETTER_VALUES[l] || 0), 0);
      setFinalNumber(sum % 12 || 12);
    }, demo.letters.length * 400 + 300);

    // Move to next demo
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DEMO_NAMES.length);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const demo = DEMO_NAMES[currentIndex];

  return (
    <div className="numerology-grid">
      <div className="numerology-header">
        <div className="numerology-label">LIVE GEMATRIA ENGINE</div>
        <div className="numerology-name">
          <span className="numerology-translit">{demo.transliteration}</span>
          <span className="numerology-geez">{demo.name}</span>
        </div>
      </div>

      {/* Letter tiles */}
      <div className="numerology-letters">
        <AnimatePresence>
          {demo.letters.map((letter, idx) => (
            <motion.div
              key={`${demo.name}-${letter}`}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -20 }}
              transition={{ delay: idx * 0.4, duration: 0.5 }}
              className="numerology-letter-tile"
            >
              <div className="letter-geez">{letter}</div>
              <div className="letter-value">= {LETTER_VALUES[letter] || 0}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Running sum */}
      <div className="numerology-sum">
        <div className="sum-row">
          <span className="sum-label">TOTAL SUM</span>
          <motion.span
            key={totalSum}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sum-value"
          >
            {totalSum}
          </motion.span>
        </div>
        <div className="sum-row">
          <span className="sum-label">÷ 12</span>
          <span className="sum-value">{(totalSum / 12).toFixed(1)}</span>
        </div>
        <div className="sum-row sum-row--final">
          <span className="sum-label">FINAL NUMBER</span>
          <motion.span
            key={finalNumber}
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="final-value"
          >
            {finalNumber}
          </motion.span>
        </div>
      </div>

      {/* Life path indicators */}
      <div className="numerology-indicators">
        <div className="indicator">
          <span className="indicator-label">LIFE PATH</span>
          <span className="indicator-value">{finalNumber}</span>
        </div>
        <div className="indicator">
          <span className="indicator-label">DESTINY</span>
          <span className="indicator-value">{((finalNumber + 3) % 9) + 1}</span>
        </div>
        <div className="indicator">
          <span className="indicator-label">SOUL URGE</span>
          <span className="indicator-value">{((finalNumber + 6) % 9) + 1}</span>
        </div>
      </div>
    </div>
  );
}