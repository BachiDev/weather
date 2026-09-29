// Open-Meteo Air Quality API client (keyless, same patterns as the forecast
// client): timeout, cancellation, guards, and a 10-minute cache.

import type { AirQuality } from "@/types/weather";
import { fetchJson, WeatherApiError } from "@/lib/openMeteo";

const AIR_QUALITY_BASE_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality";

const CACHE_TTL_MS = 10 * 60 * 1000;

export type AqiBand = {
  label: string;
  /** Compact label for tight tiles ("Unhealthy for some" → "USG"). */
  short: string;
  /** Full literal class strings (purge-safe) for the badge. */
  pill: string;
  /** Value tint for Stat tiles. */
  text: string;
};

/** US AQI bands → labels + styling. Unknown/negative values are "Unknown". */
export function aqiBand(aqi: number): AqiBand {
  if (!Number.isFinite(aqi) || aqi < 0) {
    return {
      label: "Unknown",
      short: "Unknown",
      pill: "bg-white/5 text-zinc-300 ring-white/10",
      text: "text-zinc-300",
    };
  }
  if (aqi <= 50) {
    return {
      label: "Good",
      short: "Good",
      pill: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
      text: "text-emerald-300",
    };
  }
  if (aqi <= 100) {
    return {
      label: "Moderate",
      short: "Moderate",
      pill: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/40",
      text: "text-yellow-300",
    };
  }
  if (aqi <= 150) {
    return {
      label: "Unhealthy for some",
      short: "USG",
      pill: "bg-orange-500/10 text-orange-300 ring-orange-500/40",
      text: "text-orange-300",
    };
  }
  if (aqi <= 200) {
    return {
      label: "Unhealthy",
      short: "Unhealthy",
      pill: "bg-red-500/10 text-red-400 ring-red-500/40",
      text: "text-red-400",
    };
  }
  if (aqi <= 300) {
    return {
      label: "Very unhealthy",
      short: "V. unhealthy",
      pill: "bg-purple-500/10 text-purple-300 ring-purple-500/40",
      text: "text-purple-300",
    };
  }
  return {
    label: "Hazardous",
    short: "Hazardous",
    pill: "bg-red-500/20 text-red-200 ring-red-500/60",
    text: "text-red-200",
  };
}

function isAirQuality(data: unknown): data is AirQuality {
  if (typeof data !== "object" || data === null) return false;
  const current = (data as Record<string, unknown>).current;
  if (typeof current !== "object" || current === null) return false;
  const c = current as Record<string, unknown>;
  return (
    typeof c.us_aqi === "number" &&
    typeof c.pm2_5 === "number" &&
    typeof c.ozone === "number"
  );
}

export async function fetchAirQuality(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "us_aqi,pm2_5,ozone",
    timezone: "auto",
  });
  const data = await fetchJson(
    `${AIR_QUALITY_BASE_URL}?${params.toString()}`,
    signal,
  );
  if (!isAirQuality(data)) {
    throw new WeatherApiError(
      "bad-response",
      "Unexpected air-quality data. Please try again.",
    );
  }
  return data;
}

const cache = new Map<string, { data: AirQuality; fetchedAt: number }>();

export async function fetchAirQualityCached(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<AirQuality> {
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) return hit.data;
  const data = await fetchAirQuality(lat, lon, signal);
  cache.set(key, { data, fetchedAt: Date.now() });
  return data;
}

/** Test-only: reset the module cache between cases. */
export function clearAirQualityCache(): void {
  cache.clear();
}
