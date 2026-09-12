// src/components/hud/FinanceFlow.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AUSPICIOUS_DAYS = [
  { day: "Thu", date: "Jun 19", activity: "Launch / Sign", strength: 94, icon: "🚀" },
  { day: "Wed", date: "Jun 25", activity: "Negotiate", strength: 84, icon: "🤝" },
  { day: "Thu", date: "Jul 3", activity: "Expand", strength: 92, icon: "📈" },
];

const BUSINESS_METRICS = [
  { label: "Success Potential", value: 78, color: "#10b981" },
  { label: "Elemental Match", value: 88, color: "#f59e0b" },
  { label: "Timing Alignment", value: 82, color: "#8b5cf6" },
  { label: "Numeric Resonance", value: 71, color: "#06b6d4" },
];

const MARKET_PULSE = [
  { region: "Addis Ababa", value: 82, trend: "+3.2%" },
  { region: "Oromia", value: 74, trend: "+1.8%" },
  { region: "Tigray", value: 68, trend: "-0.5%" },
  { region: "Amhara", value: 77, trend: "+2.4%" },
  { region: "SNNP", value: 71, trend: "+1.1%" },
];

export default function FinanceFlow() {
  const [activeMetric, setActiveMetric] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % BUSINESS_METRICS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="finance-flow">
      {/* Auspicious days calendar */}
      <div className="finance-days">
        <div className="finance-section-header">
          <span className="finance-label">AUSPICIOUS BUSINESS DAYS</span>
          <span className="finance-live-dot" />
        </div>
        <div className="finance-day-grid">
          {AUSPICIOUS_DAYS.map((day, idx) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="finance-day-card"
            >
              <div className="day-icon">{day.icon}</div>
              <div className="day-info">
                <div className="day-name">{day.day}</div>
                <div className="day-date">{day.date}</div>
                <div className="day-activity">{day.activity}</div>
              </div>
              <div className="day-strength">
                <div className="strength-value">{day.strength}</div>
                <div className="strength-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${day.strength}%` }}
                    transition={{ delay: idx * 0.15 + 0.3, duration: 0.8 }}
                    className="strength-fill"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Business metrics */}
      <div className="finance-metrics">
        <div className="finance-section-header">
          <span className="finance-label">BUSINESS READINESS</span>
        </div>
        <div className="metric-list">
          {BUSINESS_METRICS.map((metric, idx) => (
            <div
              key={metric.label}
              className={`metric-row ${activeMetric === idx ? "metric-row--active" : ""}`}
            >
              <span className="metric-label">{metric.label}</span>
              <div className="metric-bar-wrap">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="metric-bar"
                  style={{ backgroundColor: metric.color }}
                />
              </div>
              <span className="metric-value" style={{ color: metric.color }}>
                {metric.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional market pulse */}
      <div className="finance-pulse">
        <div className="finance-section-header">
          <span className="finance-label">REGIONAL MARKET PULSE</span>
        </div>
        <div className="pulse-list">
          {MARKET_PULSE.map((item, idx) => (
            <motion.div
              key={item.region}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="pulse-row"
            >
              <span className="pulse-region">{item.region}</span>
              <span className="pulse-value">{item.value}</span>
              <span
                className={`pulse-trend ${
                  item.trend.startsWith("+") ? "trend-up" : "trend-down"
                }`}
              >
                {item.trend}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}