// Hourly-window helpers. The API returns location-local ISO strings
// ("2026-09-29T14:00") for `hourly.time`; "now" comes from
// `locationNowIso(utc_offset_seconds)`, so a plain lexicographic comparison
// finds the window without any timezone conversion.

export type HourPoint = {
  time: string;
  temp: number;
  code: number;
  precip: number | null;
  humidity: number | null;
};

type HourlyLike = {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability?: number[];
  relative_humidity_2m?: number[];
};

/**
 * Next 24 hourly points starting at (or right after) the observation time.
 * Falls back to the first 24 entries when `currentTime` is missing or beyond
 * the range — never `slice(-1, …)` (the old findIndex-by-hour bug).
 */
export function sliceNext24Hours(
  hourly: HourlyLike,
  currentTime: string,
): HourPoint[] {
  let start = hourly.time.findIndex((t) => t >= currentTime);
  if (start < 0) start = 0;
  const points: HourPoint[] = [];
  for (let i = start; i < Math.min(start + 24, hourly.time.length); i++) {
    points.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      code: hourly.weather_code[i],
      precip: hourly.precipitation_probability?.[i] ?? null,
      humidity: hourly.relative_humidity_2m?.[i] ?? null,
    });
  }
  return points;
}

/**
 * All 24 hourly points of one daily index (0 = first day). The hourly arrays
 * run midnight-to-midnight per day, aligned with `daily.time` order.
 * Out-of-range indices (or short arrays) yield whatever exists, possibly [].
 */
export function sliceDayHours(
  hourly: HourlyLike,
  dayIndex: number,
): HourPoint[] {
  if (!Number.isInteger(dayIndex) || dayIndex < 0) return [];
  const points: HourPoint[] = [];
  const start = dayIndex * 24;
  for (let i = start; i < Math.min(start + 24, hourly.time.length); i++) {
    points.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      code: hourly.weather_code[i],
      precip: hourly.precipitation_probability?.[i] ?? null,
      humidity: hourly.relative_humidity_2m?.[i] ?? null,
    });
  }
  return points;
}

/**
 * Location-local "now" as `"YYYY-MM-DDTHH:MM"` — comparable with the API's
 * location-local hourly ISO strings, regardless of the browser's timezone.
 * `utc_offset_seconds` comes from the forecast response top level.
 */
export function locationNowIso(
  utcOffsetSeconds: number,
  nowMs = Date.now(),
): string {
  return new Date(nowMs + utcOffsetSeconds * 1000).toISOString().slice(0, 16);
}
