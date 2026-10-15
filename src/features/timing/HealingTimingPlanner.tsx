"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Info,
  LocateFixed,
  MapPin,
  Moon,
  Snowflake,
  Sun,
  Sunrise,
  Sunset,
  TriangleAlert,
  X,
} from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, Input, Select, type BadgeTone } from "@/components/ui";
import { BIRTH_PLACE_SUGGESTIONS, resolveBirthPlace } from "@/lib/profiling/astrology/places";
import {
  BODY_REGIONS,
  ETHIOPIAN_WEEKDAYS,
  MOON_PHASES,
  PLANETS,
  addDays,
  climateZoneFor,
  ethiopianClock,
  localClock,
  localDateOf,
  skyDays,
  type BodyRegionKey,
  type Planet,
  type SkyDay,
  type SkyPlace,
} from "@/lib/cosmic/skyDay";
import {
  HEALING_INTENTS,
  MOON_PREFERENCES,
  RATING_LABELS,
  TIMES_OF_DAY,
  bestWindows,
  intentByKey,
  scoreWindows,
  type FastingPreference,
  type MoonPreference,
  type Rating,
  type TimeOfDay,
  type TimingPreferences,
  type TimingWindow,
} from "@/lib/cosmic/healingTiming";
import { describeWeather, weatherAt, type WeatherForecast, type WeatherIcon } from "@/lib/cosmic/weather";
import { cn } from "@/lib/utils";

const PERIODS = [7, 14, 30] as const;
const PLANET_ORDER: Planet[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const RATING_TONE: Record<Rating, BadgeTone> = { excellent: "success", good: "brand", fair: "gold", weak: "neutral" };

const WEATHER_ICONS: Record<WeatherIcon, typeof Sun> = {
  sun: Sun,
  partly: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
};

function WeatherGlyph({ code, className }: { code: number | null | undefined; className?: string }) {
  const Icon = WEATHER_ICONS[describeWeather(code).icon];
  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
}

function scoreColor(rating: Rating) {
  return rating === "excellent" ? "bg-success" : rating === "good" ? "bg-brand" : rating === "fair" ? "bg-gold" : "bg-muted-foreground/30";
}

/** Weekday (translated like other text) and the Gregorian date as day/month. */
function GregorianDate({ date }: { date: string }) {
  const weekday = ETHIOPIAN_WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()].en;
  const [, m, d] = date.split("-");
  return (
    <>
      <span>{weekday}</span> <span translate="no">{Number(d)}/{Number(m)}</span>
    </>
  );
}

/** Clock time at the place, with the Ethiopian clock reading beside it. */
function Clock({ ms, offset }: { ms: number | null; offset: number }) {
  if (ms == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="whitespace-nowrap">
      <span className="font-semibold tabular-nums text-foreground">{localClock(ms, offset)}</span>{" "}
      <span translate="no" className="text-xs text-muted-foreground">({ethiopianClock(ms, offset).label})</span>
    </span>
  );
}

export function HealingTimingPlanner({ defaultPlace }: { defaultPlace?: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  const [placeText, setPlaceText] = useState(defaultPlace || "Addis Ababa");
  const [startDate, setStartDate] = useState<string>("");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(14);
  const [intentKey, setIntentKey] = useState(HEALING_INTENTS[0].key);
  const [prefs, setPrefs] = useState<TimingPreferences>(HEALING_INTENTS[0].defaults);
  const [showRules, setShowRules] = useState(false);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // The clock starts after mount so server and browser render the same markup.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const resolved = useMemo(() => resolveBirthPlace(placeText), [placeText]);
  const place: SkyPlace = useMemo(
    () => ({
      name: resolved.city,
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      altitudeMeters: resolved.altitudeMeters || forecast?.elevation || 0,
      utcOffsetHours: resolved.utcOffsetHours,
    }),
    [resolved, forecast?.elevation],
  );
  const offset = place.utcOffsetHours;
  const today = now == null ? null : localDateOf(now, offset);
  const firstDate = startDate || today;

  useEffect(() => {
    let cancelled = false;
    setForecastError(null);
    apiFetch<WeatherForecast>(`/api/weather/forecast?lat=${resolved.latitude}&lng=${resolved.longitude}&offset=${resolved.utcOffsetHours}`)
      .then((data) => !cancelled && setForecast(data))
      .catch((err) => {
        if (cancelled) return;
        setForecast(null);
        setForecastError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [resolved.latitude, resolved.longitude, resolved.utcOffsetHours]);

  const days = useMemo(() => (firstDate ? skyDays(firstDate, period, place) : []), [firstDate, period, place]);
  const todaySky = useMemo(() => (today ? (days[0]?.date === today ? days[0] : skyDays(today, 1, place)[0]) : null), [today, days, place]);
  const windows = useMemo(() => (now == null ? [] : scoreWindows(days, prefs, forecast, now, offset)), [days, prefs, forecast, now, offset]);
  const best = useMemo(() => bestWindows(windows, 8, 2), [windows]);
  const windowsByDay = useMemo(() => {
    const map = new Map<string, TimingWindow[]>();
    for (const window of windows) {
      const key = days.find((d) => window.start >= d.planetaryHours[0].start && window.start < d.planetaryHours[23].end)?.date ?? window.date;
      map.set(key, [...(map.get(key) ?? []), window]);
    }
    return map;
  }, [windows, days]);

  const intent = intentByKey(intentKey);

  function chooseIntent(key: string) {
    setIntentKey(key);
    setPrefs(intentByKey(key).defaults);
  }

  function update<K extends keyof TimingPreferences>(key: K, value: TimingPreferences[K]) {
    setPrefs((current) => ({ ...current, [key]: value }));
  }

  function toggle<T extends string>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPlaceText(`${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  }

  const currentHour = now != null && todaySky ? todaySky.planetaryHours.find((h) => now >= h.start && now < h.end) ?? null : null;
  const currentWeather = now != null ? weatherAt(forecast, now) : null;
  const zone = climateZoneFor(place.altitudeMeters);

  return (
    <div className="flex flex-col gap-6">
      {/* Place, dates and period */}
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Field label="Place" hint={resolved.matched ? (
            <>
              <span translate="no">{place.latitude.toFixed(2)}°, {place.longitude.toFixed(2)}°{place.altitudeMeters ? ` · ${Math.round(place.altitudeMeters)} m` : ""}</span>
              {!place.altitudeMeters && <> · <span>altitude unknown</span></>}
            </>
          ) : "Not recognised — showing Addis Ababa. Type a town or coordinates."}>
            {(control) => (
              <div className="flex gap-2">
                <Input {...control} list="timing-places" value={placeText} onChange={(e) => setPlaceText(e.target.value)} placeholder="Town, or 9.03, 38.74" />
                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={useMyLocation} disabled={locating} title="Use my location">
                  <LocateFixed className="size-4" aria-hidden="true" />
                  <span className="sr-only">Use my location</span>
                </Button>
                <datalist id="timing-places">
                  {BIRTH_PLACE_SUGGESTIONS.map((p) => (
                    <option key={p.city} value={p.city} />
                  ))}
                </datalist>
              </div>
            )}
          </Field>
          <Field label="From">
            {(control) => <Input {...control} type="date" value={firstDate ?? ""} onChange={(e) => setStartDate(e.target.value)} />}
          </Field>
          <Field label="Look ahead">
            {(control) => (
              <Select {...control} value={period} onChange={(e) => setPeriod(Number(e.target.value) as (typeof PERIODS)[number])}>
                {PERIODS.map((p) => (
                  <option key={p} value={p}>{p} days</option>
                ))}
              </Select>
            )}
          </Field>
        </CardContent>
      </Card>

      {/* Right now */}
      {todaySky && now != null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><MapPin className="size-5 text-brand" aria-hidden="true" /> Now in {place.name}</CardTitle>
            <CardDescription>
              <span translate="no" className="font-semibold text-foreground">{todaySky.weekdayNameAm} {todaySky.ethiopian.label}</span>
              {" · "}<span translate="no">{Number(todaySky.date.slice(8))}/{Number(todaySky.date.slice(5, 7))}/{todaySky.date.slice(0, 4)}</span>{" · "}
              <Clock ms={now} offset={offset} />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sun</p>
              <p className="mt-1 flex items-center gap-1.5"><Sunrise className="size-4 text-gold" aria-hidden="true" /> <Clock ms={todaySky.sun.sunrise} offset={offset} /></p>
              <p className="flex items-center gap-1.5"><Sunset className="size-4 text-gold" aria-hidden="true" /> <Clock ms={todaySky.sun.sunset} offset={offset} /></p>
              <p className="text-xs text-muted-foreground">First light <Clock ms={todaySky.sun.civilDawn} offset={offset} /> · Day {todaySky.sun.dayLengthHours.toFixed(1)} h</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Moon</p>
              <p className="mt-1 font-semibold text-foreground">
                <span aria-hidden="true">{MOON_PHASES[todaySky.moon.state.phase].symbol}</span> {MOON_PHASES[todaySky.moon.state.phase].name} · {Math.round(todaySky.moon.state.illumination * 100)}% lit
              </p>
              <p className="text-xs text-muted-foreground">Day {todaySky.moon.state.ageDays.toFixed(1)} of the lunar month · in {todaySky.moon.state.sign} <span translate="no">{todaySky.moon.state.signGeez}</span></p>
              <p className="text-xs text-muted-foreground">Rises <Clock ms={todaySky.moon.rise} offset={offset} /> · sets <Clock ms={todaySky.moon.set} offset={offset} /></p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Planetary hour</p>
              {currentHour ? (
                <>
                  <p className="mt-1 font-semibold text-foreground">{currentHour.ruler}</p>
                  <p className="text-xs text-muted-foreground">{currentHour.isDaytime ? "Day" : "Night"} hour {currentHour.index} of 12 · until <Clock ms={currentHour.end} offset={offset} /></p>
                  <p className="text-xs text-muted-foreground">{PLANETS[currentHour.ruler].theme}</p>
                </>
              ) : (
                <p className="mt-1 text-muted-foreground">Before today&apos;s sunrise</p>
              )}
              <p className="text-xs text-muted-foreground">{todaySky.weekdayName} is ruled by {todaySky.dayRuler}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Weather &amp; season</p>
              {currentWeather ? (
                <p className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                  <WeatherGlyph code={currentWeather.weatherCode} /> {describeWeather(currentWeather.weatherCode).label}
                  {currentWeather.temperature != null && <span className="font-normal">· {Math.round(currentWeather.temperature)} °C</span>}
                </p>
              ) : (
                <p className="mt-1 text-muted-foreground">{forecastError ? "Forecast unavailable" : "Loading forecast…"}</p>
              )}
              {currentWeather && (
                <p className="text-xs text-muted-foreground">
                  Rain {Math.round(currentWeather.precipitationProbability ?? 0)}% · wind {Math.round(currentWeather.windSpeed ?? 0)} km/h · humidity {Math.round(currentWeather.humidity ?? 0)}%
                </p>
              )}
              <p className="text-xs text-muted-foreground">{todaySky.season.name} · {zone.name}</p>
            </div>
            {(todaySky.observances.fast || todaySky.observances.feasts.length > 0 || todaySky.observances.commemoration) && (
              <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
                {todaySky.observances.feasts.map((f) => <Badge key={f.key} tone="gold">{f.name} <span translate="no">· {f.nameAm}</span></Badge>)}
                {todaySky.observances.fast && <Badge tone="warning">{todaySky.observances.fast.name} <span translate="no">· {todaySky.observances.fast.nameAm}</span></Badge>}
                {todaySky.observances.commemoration && <Badge tone={todaySky.observances.commemoration.major ? "brand" : "neutral"}>{todaySky.observances.commemoration.name} <span translate="no">· {todaySky.observances.commemoration.nameAm}</span></Badge>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* What the work is */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>What are you timing?</CardTitle>
          <CardDescription>Pick the kind of work. Its traditional timing rules are filled in; change any of them to follow your own teacher or manuscript.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {HEALING_INTENTS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => chooseIntent(option.key)}
                aria-pressed={intentKey === option.key}
                className={cn(
                  "rounded-xl border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  intentKey === option.key ? "border-brand bg-brand/10" : "border-border bg-card hover:border-input",
                )}
              >
                <span className="block font-semibold text-foreground">{option.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
            <p className="flex items-start gap-2 text-foreground"><Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /> {intent.tradition}</p>
            {intent.caution && <p className="mt-2 flex items-start gap-2 text-warning"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {intent.caution}</p>}
          </div>

          <button
            type="button"
            onClick={() => setShowRules((v) => !v)}
            aria-expanded={showRules}
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand hover:text-brand-strong"
          >
            <ChevronDown className={cn("size-4 transition-transform", showRules && "rotate-180")} aria-hidden="true" /> Adjust the timing rules
          </button>

          {showRules && (
            <div className="grid gap-5 rounded-xl border border-border p-4 lg:grid-cols-2">
              <Field label="Moon">
                {(control) => (
                  <Select {...control} value={prefs.moon} onChange={(e) => update("moon", e.target.value as MoonPreference)}>
                    {(Object.keys(MOON_PREFERENCES) as MoonPreference[]).map((key) => (
                      <option key={key} value={key}>{MOON_PREFERENCES[key].label} — {MOON_PREFERENCES[key].hint}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Church calendar">
                {(control) => (
                  <Select {...control} value={prefs.fasting} onChange={(e) => update("fasting", e.target.value as FastingPreference)}>
                    <option value="any">Fasting days do not matter</option>
                    <option value="prefer">Prefer fasting days</option>
                    <option value="avoid">Avoid fasting days</option>
                  </Select>
                )}
              </Field>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-foreground">Planetary hours</legend>
                <div className="flex flex-wrap gap-2">
                  {PLANET_ORDER.map((planet) => (
                    <button
                      key={planet}
                      type="button"
                      aria-pressed={prefs.rulers.includes(planet)}
                      onClick={() => update("rulers", toggle(prefs.rulers, planet))}
                      title={PLANETS[planet].theme}
                      className={cn("rounded-full border px-3 py-1 text-xs font-semibold", prefs.rulers.includes(planet) ? "border-brand bg-brand text-primary-foreground" : "border-border text-muted-foreground hover:border-input")}
                    >
                      {planet}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">None selected: the hour&apos;s ruler is not considered.</p>
              </fieldset>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-foreground">Time of day</legend>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(TIMES_OF_DAY) as TimeOfDay[]).map((time) => (
                    <button
                      key={time}
                      type="button"
                      aria-pressed={prefs.times.includes(time)}
                      onClick={() => update("times", toggle(prefs.times, time))}
                      title={TIMES_OF_DAY[time].hint}
                      className={cn("rounded-full border px-3 py-1 text-xs font-semibold", prefs.times.includes(time) ? "border-brand bg-brand text-primary-foreground" : "border-border text-muted-foreground hover:border-input")}
                    >
                      {TIMES_OF_DAY[time].label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-foreground">Weather</legend>
                {([
                  ["needsDry", "Needs dry weather"],
                  ["sunny", "Needs sunshine (drying)"],
                  ["calmWind", "Needs still air"],
                  ["mildTemperature", "Avoid heat and cold"],
                  ["holyDays", "Favour feasts and the major saints' days"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={prefs[key]} onChange={(e) => update(key, e.target.checked)} className="size-4 accent-[var(--brand-accent)]" />
                    {label}
                  </label>
                ))}
              </fieldset>
              <Field label="Part of the body worked on" hint="Tradition keeps away from the part governed by the sign the Moon is in.">
                {(control) => (
                  <Select {...control} value={prefs.bodyRegion ?? ""} onChange={(e) => update("bodyRegion", (e.target.value || null) as BodyRegionKey | null)}>
                    <option value="">Not relevant</option>
                    {(Object.keys(BODY_REGIONS) as BodyRegionKey[]).map((key) => (
                      <option key={key} value={key}>{BODY_REGIONS[key]}</option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          )}
        </CardContent>
      </Card>

      {forecastError && (
        <p className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" /> {forecastError} Times are matched on the sky, calendar and season only.
        </p>
      )}

      {/* Best windows */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2"><Check className="size-5 text-success" aria-hidden="true" /> <span>Best times</span> · <span>{intent.name}</span></CardTitle>
          <CardDescription>
            Planetary hours in the next {period} days that meet the most rules. Times are local clock time at {place.name}, with the Ethiopian clock in brackets. Weather counts only where the 16-day forecast reaches.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {best.length === 0 && <p className="text-sm text-muted-foreground">Working out the sky…</p>}
          {best.map((window) => (
            <WindowCard key={window.start} window={window} offset={offset} />
          ))}
        </CardContent>
      </Card>

      {/* Day by day */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2"><CalendarDays className="size-5 text-brand" aria-hidden="true" /> Day by day</CardTitle>
          <CardDescription>Sun, Moon, calendar and forecast for each day, with that day&apos;s best hour. Open a day to see all 24 planetary hours.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {days.map((day) => (
            <DayRow
              key={day.date}
              day={day}
              offset={offset}
              forecast={forecast}
              windows={windowsByDay.get(day.date) ?? []}
              open={openDay === day.date}
              onToggle={() => setOpenDay((current) => (current === day.date ? null : day.date))}
            />
          ))}
          {firstDate && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setStartDate(addDays(firstDate, period))}>Next {period} days</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Sun and Moon times are calculated for the place (accurate to a minute or two); the forecast is from Open-Meteo and refreshes every 30 minutes. Fasts and feasts follow the Ethiopian Orthodox calendar; confirm local observance with your parish.
        Timing rules are cultural tradition offered for reflection. They are not medical evidence and never replace the herb and medicine safety check or referral to a clinic.
      </p>
    </div>
  );
}

function Reasons({ window }: { window: TimingWindow }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {window.reasons.map((reason, i) => (
        <li key={i} className={cn("flex items-center gap-1", reason.tone === "good" ? "text-success" : reason.tone === "bad" ? "text-danger" : "text-muted-foreground")}>
          {reason.tone === "good" ? <Check className="size-3.5" aria-hidden="true" /> : reason.tone === "bad" ? <X className="size-3.5" aria-hidden="true" /> : <Info className="size-3.5" aria-hidden="true" />}
          {reason.text}
        </li>
      ))}
    </ul>
  );
}

function WindowCard({ window, offset }: { window: TimingWindow; offset: number }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <p className="font-semibold text-foreground">
            <GregorianDate date={window.date} /> · <span translate="no">{window.ethiopian.label}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            <Clock ms={window.start} offset={offset} /> – <Clock ms={window.end} offset={offset} /> · hour of {window.ruler} · {TIMES_OF_DAY[window.timeOfDay].label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {window.weather && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <WeatherGlyph code={window.weather.weatherCode} /> {window.weather.temperature != null ? `${Math.round(window.weather.temperature)} °C` : ""}
            </span>
          )}
          <span className="text-xs text-muted-foreground"><span aria-hidden="true">{MOON_PHASES[window.moon.phase].symbol}</span> {Math.round(window.moon.illumination * 100)}%</span>
          <Badge tone={RATING_TONE[window.rating]}>{RATING_LABELS[window.rating]}</Badge>
        </div>
      </div>
      <Reasons window={window} />
    </div>
  );
}

function DayRow({ day, offset, forecast, windows, open, onToggle }: {
  day: SkyDay;
  offset: number;
  forecast: WeatherForecast | null;
  windows: TimingWindow[];
  open: boolean;
  onToggle: () => void;
}) {
  const weather = forecast?.daily.find((d) => d.date === day.date) ?? null;
  const top = windows.reduce<TimingWindow | null>((best, w) => (!best || w.score > best.score ? w : best), null);
  const { fast, feasts, commemoration } = day.observances;
  return (
    <div className="rounded-xl border border-border">
      <button type="button" onClick={onToggle} aria-expanded={open} className="grid w-full gap-2 p-3 text-left text-sm sm:grid-cols-[11rem_1fr_auto] sm:items-center">
        <span className="flex flex-col">
          <span className="font-semibold text-foreground"><GregorianDate date={day.date} /></span>
          <span translate="no" className="text-xs text-muted-foreground">{day.weekdayNameAm} {day.ethiopian.label}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Sunrise className="size-3.5 text-gold" aria-hidden="true" />{localClock(day.sun.sunrise, offset)}</span>
          <span className="flex items-center gap-1"><Sunset className="size-3.5 text-gold" aria-hidden="true" />{localClock(day.sun.sunset, offset)}</span>
          <span className="flex items-center gap-1">
            <Moon className="size-3.5" aria-hidden="true" />
            <span aria-hidden="true">{MOON_PHASES[day.moon.state.phase].symbol}</span> {Math.round(day.moon.state.illumination * 100)}% · {day.moon.state.sign}
            {day.moon.event && <strong className="text-foreground"> · {MOON_PHASES[day.moon.event.phase].name} {localClock(day.moon.event.at, offset)}</strong>}
          </span>
          {weather && (
            <span className="flex items-center gap-1">
              <WeatherGlyph code={weather.weatherCode} /> {Math.round(weather.temperatureMin ?? 0)}–{Math.round(weather.temperatureMax ?? 0)} °C · rain {Math.round(weather.precipitationProbabilityMax ?? 0)}%
            </span>
          )}
          {feasts.map((f) => <Badge key={f.key} tone="gold">{f.name}</Badge>)}
          {fast && <Badge tone="warning">{fast.name}</Badge>}
          {commemoration?.major && <Badge tone="neutral">{commemoration.name}</Badge>}
        </span>
        <span className="flex items-center gap-2 justify-self-start sm:justify-self-end">
          {top ? (
            <>
              <span className="text-xs text-muted-foreground">Best {localClock(top.start, offset)}</span>
              <Badge tone={RATING_TONE[top.rating]}>{RATING_LABELS[top.rating]}</Badge>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Passed</span>
          )}
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
        </span>
      </button>
      {open && (
        <div className="border-t border-border p-3">
          <div className="mb-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            <p>First light <Clock ms={day.sun.civilDawn} offset={offset} /> · last light <Clock ms={day.sun.civilDusk} offset={offset} /></p>
            <p>Moonrise <Clock ms={day.moon.rise} offset={offset} /> · moonset <Clock ms={day.moon.set} offset={offset} /></p>
            <p>Moon in {day.moon.state.sign} <span translate="no">{day.moon.state.signGeez}</span> · <span>governs</span>: <span>{BODY_REGIONS[day.moon.state.bodyRegion]}</span></p>
            <p>{day.weekdayName}: day of {day.dayRuler} · {day.season.name}</p>
            {commemoration && <p>Monthly commemoration: {commemoration.name} <span translate="no">({commemoration.nameAm})</span></p>}
          </div>
          {windows.length === 0 ? (
            <p className="text-sm text-muted-foreground">All of this day&apos;s hours have passed.</p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {windows.map((window) => (
                <li key={window.start} className="rounded-lg border border-border/60 p-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={cn("h-2 w-8 rounded-full", scoreColor(window.rating))} aria-hidden="true" />
                    <Clock ms={window.start} offset={offset} />
                    <span className="text-muted-foreground">· {window.isDaytime ? "day" : "night"} hour {window.hourIndex} · {window.ruler}</span>
                    {window.weather && <span className="flex items-center gap-1 text-xs text-muted-foreground"><WeatherGlyph code={window.weather.weatherCode} /> {Math.round(window.weather.precipitationProbability ?? 0)}% rain</span>}
                    <Badge tone={RATING_TONE[window.rating]} className="ml-auto">{RATING_LABELS[window.rating]}</Badge>
                  </div>
                  {window.rating !== "weak" && <Reasons window={window} />}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
