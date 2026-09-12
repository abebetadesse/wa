"use client";

import { useEffect, useState } from "react";

const bootLines = [
  "> INITIALIZING NUTRI-CORE v2.5",
  "> LOADING EFCT 2025 DATASET ......... OK",
  "> 726 FOODS · 69 NUTRIENTS · 48 DISTRICTS",
  "> CALIBRATING ASTRO-CALENDRICAL ENGINE .. OK",
  "> SYSTEM ONLINE",
];

export default function BootSequence() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const next = Math.min(100, (elapsed / 1800) * 100);
      setProgress(next);
      if (next >= 100) {
        window.setTimeout(() => setVisible(false), 220);
        window.clearInterval(timer);
      }
    }, 25);

    return () => window.clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="boot-sequence" aria-live="polite">
      <div className="boot-sequence-inner">
        <div className="boot-ring" aria-hidden="true" />
        <div className="boot-lines" aria-label="System boot sequence">
          {bootLines.map((line) => (
            <div key={line} className="boot-line">{line}</div>
          ))}
        </div>
        <div className="boot-progress-wrap" aria-label="Boot progress">
          <div className="boot-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
