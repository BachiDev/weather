import type { HourFormat } from "@/lib/units";
import { fetchJson, WeatherApiError } from "@/lib/openMeteo";

// Slippy-map tile math (OSM convention) + RainViewer manifest client.
// No map library: a 3×3 <img> grid is all a static radar view needs.

export const MIN_ZOOM = 4;
export const MAX_ZOOM = 10;

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 7;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(zoom)));
}

export function latLonToTile(
  lat: number,
  lon: number,
  zoom: number,
): { x: number; y: number } {
  const n = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y };
}

export function tileToBounds(x: number, y: number, zoom: number) {
  const n = 2 ** zoom;
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const latOf = (ty: number) => {
    const t = Math.PI * (1 - (2 * ty) / n);
    return (Math.atan(Math.sinh(t)) * 180) / Math.PI;
  };
  return { north: latOf(y), south: latOf(y + 1), west, east };
}

/** 3×3 tile window around a point (x wraps at the antimeridian, y clamps). */
export function tileGrid(
  lat: number,
  lon: number,
  zoom: number,
): Array<{ x: number; y: number }> {
  const n = 2 ** zoom;
  const center = latLonToTile(lat, lon, zoom);
  const tiles: Array<{ x: number; y: number }> = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({
        x: (((center.x + dx) % n) + n) % n,
        y: Math.min(n - 1, Math.max(0, center.y + dy)),
      });
    }
  }
  return tiles;
}

export function osmTileUrl(x: number, y: number, zoom: number): string {
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

export function radarTileUrl(
  host: string,
  path: string,
  x: number,
  y: number,
  zoom: number,
): string {
  return `${host}${path}/256/${zoom}/${x}/${y}/2/1_1.png`;
}

export type RadarFrame = { time: number; path: string };

type RadarManifest = { host: string; frames: RadarFrame[] };

/** RainViewer public manifest (no key): past + nowcast frames, oldest → newest. */
export async function fetchRadarFrames(
  signal?: AbortSignal,
): Promise<RadarManifest> {
  const data = await fetchJson(
    "https://api.rainviewer.com/public/weather-maps.json",
    signal,
  );
  if (typeof data !== "object" || data === null) {
    throw new WeatherApiError("bad-response", "Unexpected radar data.");
  }
  const d = data as Record<string, unknown>;
  if (typeof d.host !== "string") {
    throw new WeatherApiError("bad-response", "Unexpected radar data.");
  }
  const radar = d.radar as { past?: unknown; nowcast?: unknown } | undefined;
  const collect = (list: unknown): RadarFrame[] => {
    if (!Array.isArray(list)) return [];
    const out: RadarFrame[] = [];
    for (const item of list) {
      const f = item as Record<string, unknown>;
      if (typeof f.time === "number" && typeof f.path === "string") {
        out.push({ time: f.time, path: f.path });
      }
    }
    return out;
  };
  const frames = [...collect(radar?.past), ...collect(radar?.nowcast)];
  if (frames.length === 0) {
    throw new WeatherApiError("empty", "No radar frames available right now.");
  }
  return { host: d.host, frames };
}

/**
 * Frame timestamp (UTC epoch seconds) → location-local "14:30" / "2:30 PM"
 * via the forecast's utc_offset_seconds (browser zone may differ).
 */
export function formatFrameTime(
  epochSeconds: number,
  utcOffsetSeconds: number,
  hourFormat: HourFormat,
): string {
  const iso = new Date((epochSeconds + utcOffsetSeconds) * 1000).toISOString();
  const hm = iso.slice(11, 16); // "HH:MM" 24h
  if (hourFormat === "24h") return hm;
  const [h, m] = hm.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
