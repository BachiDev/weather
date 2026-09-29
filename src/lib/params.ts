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
