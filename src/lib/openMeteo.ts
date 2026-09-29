// Open-Meteo client on native fetch (no axios): timeout, cancellation,
// response guards, and a 10-minute stale-while-revalidate-ish cache.

import type { CityData, GeoResult, WeatherData } from "@/types/weather";

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";

const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 10 * 60 * 1000;

export type ApiErrorKind = "network" | "timeout" | "bad-response" | "empty";

export class WeatherApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = "WeatherApiError";
    this.kind = kind;
  }
}

async function fetchJson(
  url: string,
  signal?: AbortSignal,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  // An external signal (unmount / city change) wins over the timeout.
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherApiError(
        "network",
        `Request failed with status ${response.status}.`,
      );
    }
    return (await response.json()) as unknown;
  } catch (err) {
    if (err instanceof WeatherApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new WeatherApiError(
        "timeout",
        signal?.aborted
          ? "Request was cancelled."
          : "Request timed out. Please try again.",
      );
    }
    throw new WeatherApiError(
      "network",
      "Network error. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

export function mapGeoResultToCityData(result: GeoResult): CityData {
  const state = result.admin1 ? `, ${result.admin1}` : "";
  const postal =
    result.postcode && result.postcode.length > 0
      ? ` (${result.postcode[0]})`
      : "";

  return {
    id: result.id,
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country ?? "",
    label: `${result.name}${state}, ${result.country ?? ""}${postal}`,
  };
}

/** Search cities by name. Query is URL-encoded (handles "São Paulo", "München"). */
export async function searchCities(
  query: string,
  signal?: AbortSignal,
): Promise<CityData[]> {
  const params = new URLSearchParams({
    name: query,
    count: "10",
    language: "en",
    format: "json",
  });
  const data = await fetchJson(
    `${GEOCODING_BASE_URL}?${params.toString()}`,
    signal,
  );
  if (typeof data !== "object" || data === null || !("results" in data))
    return [];
  const results = (data as { results: unknown }).results;
  if (!Array.isArray(results)) return [];
  return results.map((r) => mapGeoResultToCityData(r as GeoResult));
}

function isWeatherData(data: unknown): data is WeatherData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.current !== "object" || d.current === null) return false;
  if (typeof d.daily !== "object" || d.daily === null) return false;
  if (typeof d.hourly !== "object" || d.hourly === null) return false;
  const current = d.current as Record<string, unknown>;
  const daily = d.daily as Record<string, unknown>;
  const hourly = d.hourly as Record<string, unknown>;
  return (
    typeof d.utc_offset_seconds === "number" &&
    typeof current.temperature_2m === "number" &&
    typeof current.weather_code === "number" &&
    Array.isArray(daily.time) &&
    Array.isArray(daily.temperature_2m_max) &&
    Array.isArray(daily.temperature_2m_min) &&
    Array.isArray(hourly.time) &&
    Array.isArray(hourly.temperature_2m)
  );
}

/** Current + 7-day + 24×7-hourly in one call. Units always metric (converted client-side). */
export async function fetchWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      // NOTE: `time` must NOT be listed — Open-Meteo auto-includes current.time
      // and rejects it as an explicit variable (HTTP 400). Location-local "now"
      // is derived client-side from `utc_offset_seconds` (see locationNowIso).
      "temperature_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max",
    hourly: "temperature_2m,weather_code",
    timezone: "auto",
    forecast_days: "7",
  });
  const data = await fetchJson(
    `${WEATHER_BASE_URL}?${params.toString()}`,
    signal,
  );
  if (!isWeatherData(data)) {
    throw new WeatherApiError(
      "bad-response",
      "Unexpected weather data. Please try again.",
    );
  }
  return data;
}

type CacheEntry = { data: WeatherData; fetchedAt: number };

const cache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

/** Cached fetch — back-navigation and unit toggles never hit the network twice. */
export async function fetchWeatherCached(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const key = cacheKey(lat, lon);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) return hit.data;
  const data = await fetchWeather(lat, lon, signal);
  cache.set(key, { data, fetchedAt: Date.now() });
  return data;
}

/** Test-only: reset the module cache between cases. */
export function clearWeatherCache(): void {
  cache.clear();
}
