import fs from "fs";
import path from "path";

export interface SystemConfig {
  maintenance: {
    enabled: boolean;
    message: string;
    startedAt: string | null;
  };
  announcement: {
    enabled: boolean;
    message: string;
    severity: "info" | "warning" | "critical";
    updatedAt: string;
  };
  flags: {
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    domainBEnforced: boolean;
    safetyGateStrictness: "standard" | "elevated" | "strict_lock";
    literatureAutoSync: boolean;
    altitudeCalibrationMeters: number;
    defaultLanguage: "en" | "am" | "om" | "ti" | "so";
    sessionTimeoutHours: number;
    debugTelemetry: boolean;
  };
  platform: {
    name: string;
    organization: string;
    supportEmail: string;
    version: string;
    environment: string;
  };
}

const DEFAULT_CONFIG: SystemConfig = {
  maintenance: {
    enabled: false,
    message: "The Ethiopian Wellbeing Platform is undergoing scheduled regulatory updates. We will be back online shortly.",
    startedAt: null,
  },
  announcement: {
    enabled: false,
    message: "System running standard scientific-adjacent evaluation protocols (EFCT 2025 v3.0).",
    severity: "info",
    updatedAt: new Date().toISOString(),
  },
  flags: {
    allowSelfRegistration: true,
    requireEmailVerification: false,
    domainBEnforced: true,
    safetyGateStrictness: "standard",
    literatureAutoSync: true,
    altitudeCalibrationMeters: 2400,
    defaultLanguage: "en",
    sessionTimeoutHours: 72,
    debugTelemetry: true,
  },
  platform: {
    name: "Ethiopian Wisdom & Wellness Platform",
    organization: "Ethiopian Wisdom Platform",
    supportEmail: "compliance@ethio-wellness.example",
    version: "v3.0 Enterprise Control Plane",
    environment: process.env.NODE_ENV || "development",
  },
};

const CONFIG_FILE_PATH = path.join(process.cwd(), ".system_config.json");

// In-memory cache
let cachedConfig: SystemConfig | undefined;

export function getSystemConfig(): SystemConfig {
  if (cachedConfig) return cachedConfig;

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const merged: SystemConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        maintenance: { ...DEFAULT_CONFIG.maintenance, ...(parsed.maintenance || {}) },
        announcement: { ...DEFAULT_CONFIG.announcement, ...(parsed.announcement || {}) },
        flags: { ...DEFAULT_CONFIG.flags, ...(parsed.flags || {}) },
        platform: { ...DEFAULT_CONFIG.platform, ...(parsed.platform || {}) },
      };
      cachedConfig = merged;
      return merged;
    }
  } catch (err) {
    console.warn("[SystemConfig] Failed to load config file, using defaults:", err);
  }

  const fallback: SystemConfig = { ...DEFAULT_CONFIG };
  cachedConfig = fallback;
  return fallback;
}

export function updateSystemConfig(partial: Partial<SystemConfig>): SystemConfig {
  const current = getSystemConfig();
  const next: SystemConfig = {
    ...current,
    ...partial,
    maintenance: { ...current.maintenance, ...(partial.maintenance || {}) },
    announcement: { ...current.announcement, ...(partial.announcement || {}) },
    flags: { ...current.flags, ...(partial.flags || {}) },
    platform: { ...current.platform, ...(partial.platform || {}) },
  };

  cachedConfig = next;

  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(next, null, 2), "utf-8");
  } catch (err) {
    console.warn("[SystemConfig] Failed to write config file to disk:", err);
  }

  return next;
}
