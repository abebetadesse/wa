/**
 * Matches a remedy or practice to the times that suit it: the Moon's phase and sign, the planetary
 * hour, the part of the day, the weather forecast and the church calendar.
 *
 * Each kind of work starts from the timing rules the traditions commonly give (gather leaves on a
 * waxing moon and roots on a waning one, cleanse as the Moon wanes, take holy water at dawn, dry
 * remedies in dry sunny weather, keep away from the body part the Moon's sign governs). Every rule
 * is a preference the healer can change; the planner only ranks windows and says why. Timing is
 * cultural practice, not evidence of effect, and never replaces the safety check.
 *
 * Pure: runs in the browser and on the server.
 */
import {
  BODY_REGIONS,
  MOON_PHASES,
  PLANETS,
  localDateOf,
  moonStateAt,
  toEthiopianDate,
  type BodyRegionKey,
  type EthiopianDate,
  type MoonState,
  type Planet,
  type SkyDay,
} from "./skyDay";
import { describeWeather, isWet, weatherAt, type HourWeather, type WeatherForecast } from "./weather";

export type TimeOfDay = "dawn" | "morning" | "midday" | "afternoon" | "evening" | "night";
export type MoonPreference = "waxing" | "waning" | "full" | "new" | "any";
export type FastingPreference = "prefer" | "avoid" | "any";

export const TIMES_OF_DAY: Record<TimeOfDay, { label: string; hint: string }> = {
  dawn: { label: "Dawn", hint: "First light to an hour after sunrise" },
  morning: { label: "Morning", hint: "Until about 10:30" },
  midday: { label: "Midday", hint: "Around solar noon" },
  afternoon: { label: "Afternoon", hint: "Until an hour before sunset" },
  evening: { label: "Evening", hint: "Sunset and the first hours of dark" },
  night: { label: "Night", hint: "Deep night, before first light" },
};

export const MOON_PREFERENCES: Record<MoonPreference, { label: string; hint: string }> = {
  waxing: { label: "Waxing moon", hint: "New to full: building, growth, gathering above-ground parts" },
  waning: { label: "Waning moon", hint: "Full to new: removal, cleansing, gathering roots" },
  full: { label: "Near full moon", hint: "Within about three days of full" },
  new: { label: "Near new moon", hint: "Within about three days of new" },
  any: { label: "Any phase", hint: "The Moon's phase does not matter for this work" },
};

export interface TimingPreferences {
  moon: MoonPreference;
  rulers: Planet[];
  times: TimeOfDay[];
  /** Avoid rain. */
  needsDry: boolean;
  /** Avoid strong wind (smoke, steam, outdoor work). */
  calmWind: boolean;
  /** Avoid heat above 30 °C and cold below 8 °C. */
  mildTemperature: boolean;
  /** Favour sunshine (drying). */
  sunny: boolean;
  fasting: FastingPreference;
  /** Favour feasts and the major monthly commemorations. */
  holyDays: boolean;
  /** Keep away from days when the Moon is in the sign governing this part of the body. */
  bodyRegion: BodyRegionKey | null;
}

export interface HealingIntent {
  key: string;
  name: string;
  description: string;
  /** Where the default rules come from, in plain words. */
  tradition: string;
  defaults: TimingPreferences;
  caution?: string;
}

const NEUTRAL: TimingPreferences = {
  moon: "any",
  rulers: [],
  times: [],
  needsDry: false,
  calmWind: false,
  mildTemperature: false,
  sunny: false,
  fasting: "any",
  holyDays: false,
  bodyRegion: null,
};

export const HEALING_INTENTS: HealingIntent[] = [
  {
    key: "cleansing",
    name: "Cleansing & purging",
    description: "Remedies that expel, wash out or clear: purges, cleansing drinks, removal of a lingering illness.",
    tradition: "Removal follows the waning moon; Saturn and Mars hours are the hours of taking away; taken early, before food.",
    defaults: { ...NEUTRAL, moon: "waning", rulers: ["Saturn", "Mars"], times: ["dawn", "morning"] },
    caution: "Purges and emetics can be dangerous: run the herb and medicine safety check (pregnancy, children, elders, medicines) before giving any.",
  },
  {
    key: "strengthening",
    name: "Strengthening & recovery",
    description: "Tonics, nourishing remedies and recovery after illness or childbirth.",
    tradition: "Building follows the waxing moon; Sun and Jupiter hours are for vitality and growth; given in the morning.",
    defaults: { ...NEUTRAL, moon: "waxing", rulers: ["Sun", "Jupiter"], times: ["morning"], mildTemperature: true },
  },
  {
    key: "calming",
    name: "Calming, sleep & the mind",
    description: "Remedies and practices for worry, grief, fright, poor sleep and restlessness.",
    tradition: "Moon and Venus hours are the soft, cooling hours; given in the evening as the day settles.",
    defaults: { ...NEUTRAL, rulers: ["Moon", "Venus"], times: ["evening", "night"] },
    caution: "If the person speaks of harming themselves or others, use Emergency support first.",
  },
  {
    key: "fertility",
    name: "Fertility & women's health",
    description: "Remedies and prayers for conception, the womb, the monthly cycle and after childbirth.",
    tradition: "The waxing moon toward full is the time of increase; Venus and Moon hours govern fertility and the body's waters.",
    defaults: { ...NEUTRAL, moon: "waxing", rulers: ["Venus", "Moon"], times: ["evening"] },
    caution: "Many plants are unsafe in pregnancy; check the safety matrix before giving anything to someone who may be pregnant.",
  },
  {
    key: "protection",
    name: "Prayer, blessing & holy water",
    description: "Protective prayer, blessing, holy water (tsebel) and spiritual care.",
    tradition: "Holy water and prayer are taken at dawn before eating; feasts and the major saints' days are favoured; Sun and Jupiter hours are hours of blessing.",
    defaults: { ...NEUTRAL, rulers: ["Sun", "Jupiter"], times: ["dawn"], holyDays: true },
  },
  {
    key: "harvest-aerial",
    name: "Gathering leaves, flowers & seeds",
    description: "Collecting above-ground plant parts for remedies.",
    tradition: "Above-ground parts are gathered on a waxing moon, in the morning once the dew has dried, in dry weather.",
    defaults: { ...NEUTRAL, moon: "waxing", rulers: ["Sun", "Mercury", "Venus"], times: ["morning"], needsDry: true, sunny: true },
    caution: "Gather sustainably: take a little from each plant and leave rare species standing.",
  },
  {
    key: "harvest-roots",
    name: "Gathering roots & bark",
    description: "Digging roots and taking bark for remedies.",
    tradition: "Roots and bark are taken on a waning moon, when the plant's strength is said to go down; early or late in the day, in dry weather.",
    defaults: { ...NEUTRAL, moon: "waning", rulers: ["Saturn", "Moon"], times: ["dawn", "evening"], needsDry: true },
    caution: "Ring-barking or uprooting kills the plant: take from the side and from abundant stands only.",
  },
  {
    key: "preparation",
    name: "Preparing, drying & storing remedies",
    description: "Drying plant material, grinding, mixing and storing remedies.",
    tradition: "Dry, sunny, still weather keeps remedies from moulding; Mercury hours are for craft and mixing.",
    defaults: { ...NEUTRAL, rulers: ["Mercury", "Sun"], times: ["morning", "midday"], needsDry: true, sunny: true, calmWind: true },
  },
  {
    key: "smoke-steam",
    name: "Steam, smoke & fumigation",
    description: "Steam baths, smoke baths (tis) and incense fumigation of a room or person.",
    tradition: "Done in the evening on a waning moon to draw illness out; still air keeps the smoke where it is wanted.",
    defaults: { ...NEUTRAL, moon: "waning", rulers: ["Mars", "Sun"], times: ["evening"], calmWind: true },
    caution: "Smoke and steam harm people with asthma, heart disease, pregnancy and small children; always keep a window open.",
  },
  {
    key: "bodywork",
    name: "Bone-setting, massage & cupping",
    description: "Hands-on work: setting bones, massage, cupping (wagemt) and work on a particular part of the body.",
    tradition: "Done in good daylight; the old rule keeps away from the part of the body governed by the sign the Moon is in that day.",
    defaults: { ...NEUTRAL, rulers: ["Mars", "Sun"], times: ["morning", "afternoon"], mildTemperature: true, bodyRegion: "knees-bones" },
    caution: "Open fractures, wounds, high fever or loss of feeling need a clinic first. Cutting and bloodletting carry infection risk.",
  },
  {
    key: "custom",
    name: "My own rules",
    description: "Start from nothing and set the moon, hours, weather and calendar your own tradition uses.",
    tradition: "Set by you.",
    defaults: NEUTRAL,
  },
];

export function intentByKey(key: string): HealingIntent {
  return HEALING_INTENTS.find((intent) => intent.key === key) ?? HEALING_INTENTS[HEALING_INTENTS.length - 1];
}

// ── Scoring ────────────────────────────────────────────────────────────────

export type ReasonTone = "good" | "bad" | "info";

export interface Reason {
  tone: ReasonTone;
  text: string;
}

export type Rating = "excellent" | "good" | "fair" | "weak";

export const RATING_LABELS: Record<Rating, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  weak: "Weak",
};

export interface TimingWindow {
  start: number;
  end: number;
  /** Local civil date of the window's start (night hours after midnight fall on the next date). */
  date: string;
  ethiopian: EthiopianDate;
  timeOfDay: TimeOfDay;
  ruler: Planet;
  isDaytime: boolean;
  hourIndex: number;
  moon: MoonState;
  weather: HourWeather | null;
  score: number;
  rating: Rating;
  reasons: Reason[];
}

const HOUR_MS = 3_600_000;

function classify(mid: number, day: SkyDay, nextSunrise: number): TimeOfDay {
  const { sunrise, sunset, solarNoon } = day.sun;
  if (mid >= nextSunrise - 1.5 * HOUR_MS) return "dawn";
  if (mid < sunrise - 1.5 * HOUR_MS) return "night";
  if (mid < sunrise + HOUR_MS) return "dawn";
  if (mid < solarNoon - 1.5 * HOUR_MS) return "morning";
  if (mid < solarNoon + 1.5 * HOUR_MS) return "midday";
  if (mid < sunset - HOUR_MS) return "afternoon";
  if (mid < sunset + 2.5 * HOUR_MS) return "evening";
  return "night";
}

function rate(score: number): Rating {
  if (score >= 55) return "excellent";
  if (score >= 32) return "good";
  if (score >= 10) return "fair";
  return "weak";
}

function scoreMoon(pref: MoonPreference, moon: MoonState, reasons: Reason[]): number {
  // Reason texts are built from whole catalogue labels so the Amharic translator can swap each part.
  const phase = MOON_PHASES[moon.phase].name;
  if (pref === "any") return 0;
  if (pref === "waxing" || pref === "waning") {
    const match = (pref === "waxing") === moon.waxing;
    const actual = MOON_PREFERENCES[moon.waxing ? "waxing" : "waning"].label;
    reasons.push({ tone: match ? "good" : "bad", text: match ? `${actual} (moon phase: ${phase})` : `${actual} — the work asks for a ${MOON_PREFERENCES[pref].label}` });
    return match ? 25 : -20;
  }
  // Distance in degrees from the full (180) or new (0) point; the Moon moves about 12° a day.
  const target = pref === "full" ? 180 : 0;
  const distance = Math.abs(((moon.elongation - target + 540) % 360) - 180);
  const days = distance / 12.19;
  const name = MOON_PHASES[pref].name;
  if (distance <= 18) {
    reasons.push({ tone: "good", text: days < 0.5 ? `${name} falls today` : `${name} within ${days.toFixed(1)} days` });
    return 30;
  }
  if (distance <= 37) {
    reasons.push({ tone: "good", text: `${name} within ${days.toFixed(1)} days` });
    return 15;
  }
  reasons.push({ tone: "bad", text: `${name} is far off (${phase} now)` });
  return -10;
}

function scoreWeather(prefs: TimingPreferences, weather: HourWeather | null, day: SkyDay, isDaytime: boolean, reasons: Reason[]): number {
  const wants = prefs.needsDry || prefs.calmWind || prefs.mildTemperature || prefs.sunny;
  if (!wants) return 0;
  if (!weather) {
    if (prefs.needsDry && day.season.key === "kiremt") {
      reasons.push({ tone: "bad", text: "Main rainy season and no forecast yet for this day" });
      return -10;
    }
    reasons.push({ tone: "info", text: "No forecast yet for this hour; judged on the season" });
    return 0;
  }
  let score = 0;
  const rain = weather.precipitationProbability ?? 0;
  if (prefs.needsDry) {
    if (rain >= 60 || isWet(weather.weatherCode)) {
      reasons.push({ tone: "bad", text: `${describeWeather(weather.weatherCode).label}, ${Math.round(rain)}% chance of rain` });
      score -= 35;
    } else if (rain >= 30) {
      reasons.push({ tone: "bad", text: `${Math.round(rain)}% chance of rain` });
      score -= 12;
    } else {
      reasons.push({ tone: "good", text: `Dry: ${Math.round(rain)}% chance of rain` });
      score += 8;
    }
  }
  if (prefs.calmWind && weather.windSpeed != null) {
    if (weather.windSpeed > 25) {
      reasons.push({ tone: "bad", text: `Windy (${Math.round(weather.windSpeed)} km/h)` });
      score -= 20;
    } else if (weather.windSpeed < 12) {
      reasons.push({ tone: "good", text: `Still air (${Math.round(weather.windSpeed)} km/h)` });
      score += 5;
    }
  }
  if (prefs.mildTemperature && weather.temperature != null) {
    if (weather.temperature > 30) {
      reasons.push({ tone: "bad", text: `Hot (${Math.round(weather.temperature)} °C)` });
      score -= 15;
    } else if (weather.temperature < 8) {
      reasons.push({ tone: "bad", text: `Cold (${Math.round(weather.temperature)} °C)` });
      score -= 15;
    }
  }
  if (prefs.sunny && isDaytime && weather.cloudCover != null) {
    if (weather.cloudCover < 40) {
      reasons.push({ tone: "good", text: `Sunny (${Math.round(weather.cloudCover)}% cloud)` });
      score += 8;
    } else if (weather.cloudCover > 80) {
      reasons.push({ tone: "bad", text: `Overcast (${Math.round(weather.cloudCover)}% cloud)` });
      score -= 8;
    }
  }
  return score;
}

/**
 * Every planetary hour in the given days, scored against the preferences; past hours are left out.
 * Sorted by start time; use `bestWindows` for a ranked short list.
 */
export function scoreWindows(days: SkyDay[], prefs: TimingPreferences, forecast: WeatherForecast | null, now: number, utcOffsetHours: number): TimingWindow[] {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const windows: TimingWindow[] = [];

  for (const day of days) {
    const nextSunrise = day.planetaryHours[23].end;
    for (const hour of day.planetaryHours) {
      if (hour.end <= now) continue;
      const mid = (hour.start + hour.end) / 2;
      const date = localDateOf(hour.start, utcOffsetHours);
      // A night hour after midnight belongs to the planetary day that began at sunrise, but to the next calendar date.
      const calendarDay = byDate.get(date) ?? day;
      const moon = moonStateAt(mid);
      const weather = weatherAt(forecast, mid);
      const timeOfDay = classify(mid, day, nextSunrise);
      const reasons: Reason[] = [];
      let score = 0;

      score += scoreMoon(prefs.moon, moon, reasons);

      if (prefs.rulers.length > 0) {
        if (prefs.rulers.includes(hour.ruler)) {
          reasons.push({ tone: "good", text: `Hour of ${hour.ruler} (${PLANETS[hour.ruler].theme})` });
          score += 20;
          if (prefs.rulers.includes(day.dayRuler)) {
            reasons.push({ tone: "good", text: `${day.weekdayName} is ${day.dayRuler}'s day` });
            score += 5;
          }
        } else {
          score -= 5;
        }
      }

      if (prefs.times.length > 0) {
        if (prefs.times.includes(timeOfDay)) {
          reasons.push({ tone: "good", text: `${TIMES_OF_DAY[timeOfDay].label}, as the practice asks` });
          score += 15;
        } else {
          reasons.push({ tone: "bad", text: `${TIMES_OF_DAY[timeOfDay].label}, outside the preferred time` });
          score -= 25;
        }
      }

      score += scoreWeather(prefs, weather, calendarDay, hour.isDaytime, reasons);

      const { fast, feasts, commemoration } = calendarDay.observances;
      if (fast && prefs.fasting === "prefer") {
        reasons.push({ tone: "good", text: `Fasting day: ${fast.name}` });
        score += 8;
      } else if (fast && prefs.fasting === "avoid") {
        reasons.push({ tone: "bad", text: `Fasting day: ${fast.name}` });
        score -= 20;
      }

      if (prefs.holyDays) {
        if (feasts.length > 0) {
          reasons.push({ tone: "good", text: `Feast: ${feasts.map((f) => f.name).join(", ")}` });
          score += 15;
        } else if (commemoration?.major) {
          reasons.push({ tone: "good", text: `Commemoration of ${commemoration.name}` });
          score += 12;
        }
      }

      if (prefs.bodyRegion) {
        if (moon.bodyRegion === prefs.bodyRegion) {
          reasons.push({ tone: "bad", text: `Moon in ${moon.sign} (governs: ${BODY_REGIONS[prefs.bodyRegion]}) — tradition keeps away from this area today` });
          score -= 40;
        } else {
          reasons.push({ tone: "good", text: `Moon in ${moon.sign} (governs: ${BODY_REGIONS[moon.bodyRegion]}), away from the area worked on` });
          score += 5;
        }
      }

      windows.push({
        start: hour.start,
        end: hour.end,
        date,
        ethiopian: calendarDay.date === date ? calendarDay.ethiopian : toEthiopianDate(date),
        timeOfDay,
        ruler: hour.ruler,
        isDaytime: hour.isDaytime,
        hourIndex: hour.index,
        moon,
        weather,
        score,
        rating: rate(score),
        reasons,
      });
    }
  }
  return windows;
}

/** The highest-scoring windows, at most `perDay` from any one date so the list spans the period. */
export function bestWindows(windows: TimingWindow[], limit = 8, perDay = 2): TimingWindow[] {
  const taken = new Map<string, number>();
  const result: TimingWindow[] = [];
  for (const window of [...windows].sort((a, b) => b.score - a.score || a.start - b.start)) {
    const count = taken.get(window.date) ?? 0;
    if (count >= perDay) continue;
    taken.set(window.date, count + 1);
    result.push(window);
    if (result.length >= limit) break;
  }
  return result;
}
