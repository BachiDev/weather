// Hourly-window helpers. The API returns location-local ISO strings
// ("2026-09-29T14:00") for both `current.time` and `hourly.time`, so a plain
// lexicographic comparison finds "now" without any timezone conversion.

export type HourPoint = {
  time: string;
  temp: number;
  code: number;
};

type HourlyLike = {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
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
