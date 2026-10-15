/**
 * Weather forecast shapes shared by the server fetcher and the timing planner, and the WMO weather
 * codes in words. Pure: no network here (see src/server/weather/openMeteo.ts).
 */

export interface HourWeather {
  /** Epoch ms at the start of the hour. */
  at: number;
  temperature: number | null;
  /** 0–100. */
  precipitationProbability: number | null;
  /** mm in the hour. */
  precipitation: number | null;
  weatherCode: number | null;
  /** 0–100. */
  humidity: number | null;
  /** km/h. */
  windSpeed: number | null;
  /** 0–100. */
  cloudCover: number | null;
  uvIndex: number | null;
}

export interface DayWeather {
  /** Local "YYYY-MM-DD". */
  date: string;
  weatherCode: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationSum: number | null;
  precipitationProbabilityMax: number | null;
  windSpeedMax: number | null;
  uvIndexMax: number | null;
}

export interface WeatherForecast {
  source: "open-meteo";
  latitude: number;
  longitude: number;
  elevation: number | null;
  utcOffsetHours: number;
  fetchedAt: number;
  hourly: HourWeather[];
  daily: DayWeather[];
}

const WMO: Record<number, { label: string; icon: "sun" | "partly" | "cloud" | "fog" | "drizzle" | "rain" | "storm" | "snow" }> = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "partly" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Freezing fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Heavy drizzle", icon: "drizzle" },
  56: { label: "Freezing drizzle", icon: "drizzle" },
  57: { label: "Freezing drizzle", icon: "drizzle" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Freezing rain", icon: "rain" },
  67: { label: "Freezing rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Light showers", icon: "rain" },
  81: { label: "Showers", icon: "rain" },
  82: { label: "Heavy showers", icon: "rain" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm with hail", icon: "storm" },
  99: { label: "Thunderstorm with hail", icon: "storm" },
};

export type WeatherIcon = (typeof WMO)[number]["icon"];

export function describeWeather(code: number | null | undefined): { label: string; icon: WeatherIcon } {
  return (code != null && WMO[code]) || { label: "No forecast", icon: "cloud" };
}

/** True for drizzle, rain, showers, snow and thunderstorms. */
export function isWet(code: number | null | undefined): boolean {
  return code != null && code >= 51;
}

/** The forecast hour containing an instant, if the forecast reaches that far. */
export function weatherAt(forecast: WeatherForecast | null, ms: number): HourWeather | null {
  if (!forecast || forecast.hourly.length === 0) return null;
  const first = forecast.hourly[0].at;
  const index = Math.floor((ms - first) / 3_600_000);
  const hour = forecast.hourly[index];
  return hour && ms >= hour.at && ms < hour.at + 3_600_000 ? hour : null;
}
