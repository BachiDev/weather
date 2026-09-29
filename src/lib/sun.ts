// Sun-path math. All inputs are location-local ISO strings ("2026-09-29T07:12")
// from the same forecast response, so lexicographic comparison is exact.

export type SunState = "day" | "night" | "unknown";

export type SunPosition = {
  state: SunState;
  /** 0 at sunrise → 1 at sunset, clamped. 0 before sunrise, 1 after sunset. */
  progress: number;
};

export function sunPosition(
  sunrise: string,
  sunset: string,
  nowIso: string,
): SunPosition {
  if (!sunrise || !sunset || sunrise >= sunset)
    return { state: "unknown", progress: 0 };
  if (nowIso < sunrise) return { state: "night", progress: 0 };
  if (nowIso >= sunset) return { state: "night", progress: 1 };
  const start = Date.parse(sunrise);
  const end = Date.parse(sunset);
  const now = Date.parse(nowIso);
  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    Number.isNaN(now) ||
    end <= start
  ) {
    return { state: "unknown", progress: 0 };
  }
  return {
    state: "day",
    progress: Math.min(1, Math.max(0, (now - start) / (end - start))),
  };
}

/** Dot coordinates on a 200×110 semi-ellipse arc for a 0..1 progress. */
export function sunDot(progress: number): { x: number; y: number } {
  const p = Math.min(1, Math.max(0, progress));
  return {
    x: 10 + 180 * p,
    y: 100 - 90 * Math.sin(Math.PI * p),
  };
}
