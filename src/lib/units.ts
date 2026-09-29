// Unit conversion + formatting. The API is always queried in metric;
// imperial display is a pure client-side conversion (no refetch).

export type TempUnit = "c" | "f";
export type SpeedUnit = "kmh" | "mph";

export function toTemp(celsius: number, unit: TempUnit): number {
  const value = unit === "f" ? (celsius * 9) / 5 + 32 : celsius;
  return Math.round(value);
}

export function formatTemp(celsius: number, unit: TempUnit): string {
  return `${toTemp(celsius, unit)}°${unit === "f" ? "F" : "C"}`;
}

export function toSpeed(kmh: number, unit: SpeedUnit): number {
  const value = unit === "mph" ? kmh * 0.621371 : kmh;
  return Math.round(value);
}

export function formatSpeed(kmh: number, unit: SpeedUnit): string {
  return `${toSpeed(kmh, unit)} ${unit === "mph" ? "mph" : "km/h"}`;
}

const COMPASS_16 = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

/** 0–360° → 16-point compass label. */
export function formatWindDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  return COMPASS_16[Math.round(normalized / 22.5) % 16];
}

/** "2026-09-29T07:12" (location-local ISO) → "7:12 AM". */
export function formatTimeOfDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * "2026-09-29" (date-only, parsed as UTC by Date) → "Mon" + "Sep 29".
 * Noon-shift avoids off-by-one weekdays in negative UTC offsets.
 */
export function formatDayLabel(isoDate: string): {
  weekday: string;
  date: string;
} {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { weekday: "—", date: "—" };
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

/** "2026-09-29T14:00" → "2 PM". */
export function formatHourLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
}
