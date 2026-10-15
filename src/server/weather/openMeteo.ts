/**
 * Daily and hourly forecast for a place from Open-Meteo (free, no API key, 16 days ahead).
 *
 * Only coordinates are sent, never anything about the person asking. Forecasts are cached per
 * place for 30 minutes so a busy page does not repeat calls; on failure the caller gets an error
 * and the planner falls back to the season.
 */
import type { DayWeather, HourWeather, WeatherForecast } from "@/lib/cosmic/weather";

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const TTL_MS = 30 * 60_000;
const MAX_ENTRIES = 300;
const cache = new Map<string, { expires: number; forecast: WeatherForecast }>();

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation?: number;
  hourly?: Record<string, (number | null)[] | string[]>;
  daily?: Record<string, (number | null)[] | string[]>;
}

/** IANA "Etc/GMT-3" is UTC+3: the sign is inverted by convention. */
function etcZone(utcOffsetHours: number): string {
  if (utcOffsetHours === 0) return "GMT";
  return `Etc/GMT${utcOffsetHours > 0 ? "-" : "+"}${Math.abs(utcOffsetHours)}`;
}

function localToEpoch(local: string, utcOffsetHours: number): number {
  return Date.parse(`${local.length === 16 ? local : `${local}T00:00`}:00Z`) - utcOffsetHours * 3_600_000;
}

const num = (values: unknown, i: number): number | null => {
  const v = Array.isArray(values) ? values[i] : null;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};

export async function getForecast(latitude: number, longitude: number, utcOffsetHours: number): Promise<WeatherForecast> {
  const lat = Math.round(latitude * 100) / 100;
  const lng = Math.round(longitude * 100) / 100;
  const offset = Math.round(utcOffsetHours);
  const key = `${lat},${lng},${offset}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) return hit.forecast;

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    timezone: etcZone(offset),
    forecast_days: "16",
    hourly: "temperature_2m,precipitation_probability,precipitation,weather_code,relative_humidity_2m,wind_speed_10m,cloud_cover,uv_index",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max",
  });
  const res = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!res.ok) throw new Error(`Forecast service answered ${res.status}.`);
  const body = (await res.json()) as OpenMeteoResponse;

  const h = body.hourly ?? {};
  const hourTimes = (h.time as string[] | undefined) ?? [];
  const hourly: HourWeather[] = hourTimes.map((time, i) => ({
    at: localToEpoch(time, offset),
    temperature: num(h.temperature_2m, i),
    precipitationProbability: num(h.precipitation_probability, i),
    precipitation: num(h.precipitation, i),
    weatherCode: num(h.weather_code, i),
    humidity: num(h.relative_humidity_2m, i),
    windSpeed: num(h.wind_speed_10m, i),
    cloudCover: num(h.cloud_cover, i),
    uvIndex: num(h.uv_index, i),
  }));

  const d = body.daily ?? {};
  const dayTimes = (d.time as string[] | undefined) ?? [];
  const daily: DayWeather[] = dayTimes.map((date, i) => ({
    date,
    weatherCode: num(d.weather_code, i),
    temperatureMax: num(d.temperature_2m_max, i),
    temperatureMin: num(d.temperature_2m_min, i),
    precipitationSum: num(d.precipitation_sum, i),
    precipitationProbabilityMax: num(d.precipitation_probability_max, i),
    windSpeedMax: num(d.wind_speed_10m_max, i),
    uvIndexMax: num(d.uv_index_max, i),
  }));

  const forecast: WeatherForecast = {
    source: "open-meteo",
    latitude: body.latitude,
    longitude: body.longitude,
    elevation: typeof body.elevation === "number" ? body.elevation : null,
    utcOffsetHours: offset,
    fetchedAt: now,
    hourly,
    daily,
  };

  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
  cache.set(key, { expires: now + TTL_MS, forecast });
  return forecast;
}
