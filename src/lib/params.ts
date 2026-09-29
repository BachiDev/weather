import type { CityData } from "@/types/weather";

// Deep-link params: ?name=Vienna&lat=48.2082&lon=16.3738
// Lets search results be shared/bookmarked; loading with params skips geocoding.

export type CityParams = {
  name: string;
  lat: number;
  lon: number;
};

export function encodeCityParams(
  city: Pick<CityData, "name" | "latitude" | "longitude">,
): string {
  const params = new URLSearchParams({
    name: city.name,
    lat: String(city.latitude),
    lon: String(city.longitude),
  });
  return params.toString();
}

export function decodeCityParams(search: URLSearchParams): CityParams | null {
  const name = search.get("name");
  const latRaw = search.get("lat");
  const lonRaw = search.get("lon");
  if (
    !name ||
    latRaw === null ||
    lonRaw === null ||
    latRaw === "" ||
    lonRaw === ""
  )
    return null;
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { name, lat, lon };
}

/** Parse an optional `?day=0..6` drill-down index. Anything else → null. */
export function decodeDayParam(
  search: URLSearchParams,
  maxDays = 7,
): number | null {
  const raw = search.get("day");
  if (raw === null || raw === "") return null;
  const day = Number(raw);
  if (!Number.isInteger(day) || day < 0 || day >= maxDays) return null;
  return day;
}

/**
 * Compare lists ride along as `?compare=name~lat~lon|…` (names survive
 * spaces/umlauts via encodeURIComponent; "~"/"|" essentially never occur
 * in place names). Capped, validated, de-duped — garbage yields [].
 */
export function encodeCompare(
  cities: Pick<CityData, "name" | "latitude" | "longitude">[],
): string {
  return cities
    .map((c) => `${encodeURIComponent(c.name)}~${c.latitude}~${c.longitude}`)
    .join("|");
}

export function decodeCompareParam(
  search: URLSearchParams,
  maxCities = 3,
): CityData[] {
  const raw = search.get("compare");
  if (!raw) return [];
  const out: CityData[] = [];
  for (const part of raw.split("|")) {
    const [nameEnc, latRaw, lonRaw] = part.split("~");
    if (!nameEnc || !latRaw || !lonRaw) continue;
    let name: string;
    try {
      name = decodeURIComponent(nameEnc);
    } catch {
      continue;
    }
    if (!name) continue;
    const lat = Number(latRaw);
    const lon = Number(lonRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
    const city = cityFromParams({ name, lat, lon });
    if (out.some((c) => c.id === city.id)) continue;
    out.push(city);
    if (out.length >= maxCities) break;
  }
  return out;
}

/** Build a selectable CityData from deep-link params (no geocoding needed). */
export function cityFromParams(params: CityParams): CityData {
  return {
    // Deterministic negative id from coords — never collides with API ids.
    id: -Math.abs(
      Math.round(params.lat * 1000) * 1_000_000 + Math.round(params.lon * 1000),
    ),
    latitude: params.lat,
    longitude: params.lon,
    name: params.name,
    country: "",
    label: params.name,
  };
}
