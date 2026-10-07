/**
 * Astronomical positions for the profile charts.
 *
 * Geocentric ecliptic longitudes of date for the Sun, Moon and planets, plus the angles (Ascendant,
 * Midheaven) and sunrise/sunset for a place. Sun and Moon follow Meeus, "Astronomical Algorithms"
 * (ch. 25 and 47, truncated series); the planets use the JPL approximate Keplerian elements for
 * 1800–2050. Accuracy is a few arc-minutes for the planets and better for the Sun and Moon, which
 * is enough to place a body in its sign, house, nakshatra and aspects for a given person.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export type EphemerisBody =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export const EPHEMERIS_BODIES: EphemerisBody[] = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

export function normalizeDegrees(value: number): number {
  const d = value % 360;
  return d < 0 ? d + 360 : d;
}

/** Smallest signed difference a − b, in the range −180…180. */
export function angularDifference(a: number, b: number): number {
  let d = normalizeDegrees(a - b);
  if (d > 180) d -= 360;
  return d;
}

/** Julian Day for a Gregorian calendar date and a time in hours of Universal Time. */
export function julianDay(year: number, month: number, day: number, utHours = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 + utHours / 24;
}

export function julianDayFromDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function dateFromJulianDay(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

/**
 * Julian Day of a civil date and clock time kept at a fixed offset from UT
 * (East Africa Time, used throughout Ethiopia, is +3).
 */
export function julianDayFromLocal(dateStr: string, timeStr = "12:00", utcOffsetHours = 3): number {
  const [y, m, d] = dateStr.split("-").map((part) => parseInt(part, 10));
  const [hh, mm] = timeStr.split(":").map((part) => parseInt(part, 10));
  const hours = (Number.isFinite(hh) ? hh : 12) + (Number.isFinite(mm) ? mm : 0) / 60;
  return julianDay(y || 2000, m || 1, d || 1, hours - utcOffsetHours);
}

function centuries(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/** Mean obliquity of the ecliptic, degrees. */
export function obliquity(jd: number): number {
  return 23.439291 - 0.0130042 * centuries(jd);
}

/** Apparent geocentric longitude of the Sun, degrees. */
export function sunLongitude(jd: number): number {
  const t = centuries(jd);
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = (357.52911 + 35999.05029 * t - 0.0001537 * t * t) * RAD;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m) +
    0.000289 * Math.sin(3 * m);
  const omega = (125.04 - 1934.136 * t) * RAD;
  return normalizeDegrees(l0 + c - 0.00569 - 0.00478 * Math.sin(omega));
}

// Periodic terms for the Moon's longitude: multiples of D, M, M', F and the coefficient in 1e-6 degrees.
const MOON_TERMS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487],
];

/** Geocentric longitude of the Moon, degrees. */
export function moonLongitude(jd: number): number {
  const t = centuries(jd);
  const lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
  const d = (297.8501921 + 445267.1114034 * t - 0.0018819 * t * t) * RAD;
  const m = (357.5291092 + 35999.0502909 * t - 0.0001536 * t * t) * RAD;
  const mp = (134.9633964 + 477198.8675055 * t + 0.0087414 * t * t) * RAD;
  const f = (93.272095 + 483202.0175233 * t - 0.0036539 * t * t) * RAD;
  const e = 1 - 0.002516 * t - 0.0000074 * t * t;

  let sum = 0;
  for (const [cd, cm, cmp, cf, coefficient] of MOON_TERMS) {
    const eccentricity = Math.abs(cm) === 1 ? e : Math.abs(cm) === 2 ? e * e : 1;
    sum += coefficient * eccentricity * Math.sin(cd * d + cm * m + cmp * mp + cf * f);
  }
  const a1 = (119.75 + 131.849 * t) * RAD;
  const a2 = (53.09 + 479264.29 * t) * RAD;
  sum += 3958 * Math.sin(a1) + 1962 * Math.sin(lp * RAD - f) + 318 * Math.sin(a2);

  return normalizeDegrees(lp + sum / 1e6);
}

/** Mean ascending node of the Moon (Rahu); Ketu is the opposite point. */
export function lunarNodeLongitude(jd: number): number {
  const t = centuries(jd);
  return normalizeDegrees(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t);
}

// JPL approximate Keplerian elements, J2000 ecliptic, valid 1800–2050:
// [a (au), e, i, mean longitude, longitude of perihelion, ascending node] followed by their rates per century.
type Elements = readonly [number, number, number, number, number, number, number, number, number, number, number, number];
const ELEMENTS: Record<"Mercury" | "Venus" | "Earth" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto", Elements> = {
  Mercury: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  Venus: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255, 0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418],
  Earth: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0],
  Mars: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  Jupiter: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  Saturn: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  Uranus: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503, -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
  Neptune: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
  Pluto: [39.48211675, 0.2488273, 17.14001206, 238.92903833, 224.06891629, 110.30393684, -0.00031596, 0.0000517, 0.00004818, 145.20780515, -0.04062942, -0.01183482],
};

/** Heliocentric rectangular coordinates in the J2000 ecliptic plane. */
function heliocentric(body: keyof typeof ELEMENTS, t: number): [number, number, number] {
  const el = ELEMENTS[body];
  const a = el[0] + el[6] * t;
  const e = el[1] + el[7] * t;
  const inclination = (el[2] + el[8] * t) * RAD;
  const meanLongitude = el[3] + el[9] * t;
  const perihelion = el[4] + el[10] * t;
  const node = el[5] + el[11] * t;

  const argument = (perihelion - node) * RAD;
  const meanAnomaly = angularDifference(meanLongitude - perihelion, 0) * RAD;

  // Kepler's equation by Newton iteration.
  let eccentricAnomaly = meanAnomaly + e * Math.sin(meanAnomaly);
  for (let i = 0; i < 8; i++) {
    eccentricAnomaly -= (eccentricAnomaly - e * Math.sin(eccentricAnomaly) - meanAnomaly) / (1 - e * Math.cos(eccentricAnomaly));
  }

  const xOrbit = a * (Math.cos(eccentricAnomaly) - e);
  const yOrbit = a * Math.sqrt(1 - e * e) * Math.sin(eccentricAnomaly);

  const cosW = Math.cos(argument);
  const sinW = Math.sin(argument);
  const cosO = Math.cos(node * RAD);
  const sinO = Math.sin(node * RAD);
  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);

  return [
    (cosW * cosO - sinW * sinO * cosI) * xOrbit + (-sinW * cosO - cosW * sinO * cosI) * yOrbit,
    (cosW * sinO + sinW * cosO * cosI) * xOrbit + (-sinW * sinO + cosW * cosO * cosI) * yOrbit,
    sinW * sinI * xOrbit + cosW * sinI * yOrbit,
  ];
}

/** Geocentric ecliptic longitude of date for any body, degrees. */
export function bodyLongitude(body: EphemerisBody, jd: number): number {
  if (body === "Sun") return sunLongitude(jd);
  if (body === "Moon") return moonLongitude(jd);
  const t = centuries(jd);
  const [px, py] = heliocentric(body, t);
  const [ex, ey] = heliocentric("Earth", t);
  // The elements are referred to the J2000 equinox; add general precession to reach the equinox of date.
  return normalizeDegrees(Math.atan2(py - ey, px - ex) * DEG + 1.3969713 * t);
}

/** Daily motion in longitude (degrees per day); negative while the body is retrograde. */
export function bodySpeed(body: EphemerisBody, jd: number): number {
  return angularDifference(bodyLongitude(body, jd + 0.5), bodyLongitude(body, jd - 0.5));
}

export interface BodyPosition {
  body: EphemerisBody;
  longitude: number;
  speed: number;
  isRetrograde: boolean;
}

export function allBodyPositions(jd: number): BodyPosition[] {
  return EPHEMERIS_BODIES.map((body) => {
    const speed = bodySpeed(body, jd);
    return { body, longitude: bodyLongitude(body, jd), speed, isRetrograde: speed < 0 };
  });
}

/** Local sidereal time in degrees for a longitude east of Greenwich. */
export function localSiderealTime(jd: number, longitudeEast: number): number {
  const t = centuries(jd);
  return normalizeDegrees(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t + longitudeEast);
}

/** Ascendant and Midheaven (ecliptic longitudes) for a moment and a place. */
export function chartAngles(jd: number, latitude: number, longitudeEast: number): { ascendant: number; midheaven: number } {
  const ramc = localSiderealTime(jd, longitudeEast) * RAD;
  const eps = obliquity(jd) * RAD;
  const phi = latitude * RAD;
  const midheaven = normalizeDegrees(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) * DEG);
  const ascendant = normalizeDegrees(
    Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * DEG
  );
  return { ascendant, midheaven };
}

export interface SolarDay {
  /** Clock hours (local, at the given UTC offset) of sunrise, true solar noon and sunset. */
  sunrise: number;
  solarNoon: number;
  sunset: number;
  dayLengthHours: number;
}

/** Sunrise, solar noon and sunset for a civil date at a place, in local clock hours. */
export function solarDay(dateStr: string, latitude: number, longitudeEast: number, utcOffsetHours = 3): SolarDay {
  const jdNoon = julianDayFromLocal(dateStr, "12:00", utcOffsetHours);
  const t = centuries(jdNoon);
  const lambda = sunLongitude(jdNoon) * RAD;
  const eps = obliquity(jdNoon) * RAD;
  const declination = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const rightAscension = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) * DEG;
  const meanLongitude = normalizeDegrees(280.46646 + 36000.76983 * t);
  const equationOfTimeMinutes = 4 * angularDifference(meanLongitude - 0.0057183, rightAscension);

  const phi = latitude * RAD;
  const cosHour = (Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(declination)) / (Math.cos(phi) * Math.cos(declination));
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHour))) * DEG;

  const solarNoon = 12 + utcOffsetHours - longitudeEast / 15 - equationOfTimeMinutes / 60;
  const half = hourAngle / 15;
  return { sunrise: solarNoon - half, solarNoon, sunset: solarNoon + half, dayLengthHours: 2 * half };
}

/** "6:18 AM" style clock label for a number of local hours. */
export function formatClock(hours: number): string {
  const total = Math.round((((hours % 24) + 24) % 24) * 60);
  const h24 = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** Fraction of the Moon's disc that is lit (0 new … 1 full) for a Sun–Moon elongation. */
export function moonIllumination(elongation: number): number {
  return (1 - Math.cos(elongation * RAD)) / 2;
}
