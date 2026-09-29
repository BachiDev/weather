import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clampZoom,
  fetchRadarFrames,
  formatFrameTime,
  latLonToTile,
  osmTileUrl,
  radarTileUrl,
  tileGrid,
  tileToBounds,
} from "@/lib/tiles";

describe("latLonToTile", () => {
  it("resolves known tiles", () => {
    expect(latLonToTile(48.2082, 16.3738, 10)).toEqual({ x: 558, y: 355 });
    expect(latLonToTile(48.2082, 16.3738, 7)).toEqual({ x: 69, y: 44 });
    expect(latLonToTile(-33.87, 151.21, 5)).toEqual({ x: 29, y: 19 });
  });

  it("round-trips through tile bounds", () => {
    const { x, y } = latLonToTile(48.2082, 16.3738, 10);
    const b = tileToBounds(x, y, 10);
    expect(48.2082).toBeGreaterThanOrEqual(b.south);
    expect(48.2082).toBeLessThanOrEqual(b.north);
    expect(16.3738).toBeGreaterThanOrEqual(b.west);
    expect(16.3738).toBeLessThanOrEqual(b.east);
  });
});

describe("tileGrid", () => {
  it("returns a centered 3×3 window", () => {
    const grid = tileGrid(48.2082, 16.3738, 10);
    expect(grid).toHaveLength(9);
    expect(grid[4]).toEqual({ x: 558, y: 355 }); // center
    expect(grid[0]).toEqual({ x: 557, y: 354 }); // top-left
  });

  it("wraps x at the antimeridian and clamps y at the poles", () => {
    const grid = tileGrid(0, 179.9, 2); // center x=3 (n=4)
    expect(grid.map((t) => t.x)).toContain(0); // wrapped
    const south = tileGrid(-85, 0, 2); // raw center row overflows
    expect(Math.max(...south.map((t) => t.y))).toBe(3); // clamped
    const north = tileGrid(85, 0, 2);
    expect(Math.min(...north.map((t) => t.y))).toBe(0); // clamped
    for (const t of [...south, ...north]) {
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThanOrEqual(3);
    }
  });
});

describe("tile URLs", () => {
  it("builds OSM and RainViewer URLs", () => {
    expect(osmTileUrl(1, 2, 3)).toBe(
      "https://tile.openstreetmap.org/3/1/2.png",
    );
    expect(
      radarTileUrl("https://tilecache.rainviewer.com", "/v2/radar/1", 1, 2, 3),
    ).toBe("https://tilecache.rainviewer.com/v2/radar/1/256/3/1/2/2/1_1.png");
  });
});

describe("clampZoom", () => {
  it("keeps zoom in range with sane fallbacks", () => {
    expect(clampZoom(7)).toBe(7);
    expect(clampZoom(99)).toBe(10);
    expect(clampZoom(0)).toBe(4);
    expect(clampZoom(Number.NaN)).toBe(7);
  });
});

describe("formatFrameTime", () => {
  // epoch 1790676000 == 2026-09-29T10:00:00Z; Vienna offset +7200 → 12:00 local.
  it("shifts frame timestamps into location-local labels", () => {
    expect(formatFrameTime(1790676000, 7200, "24h")).toBe("12:00");
    expect(formatFrameTime(1790676000, 7200, "12h")).toBe("12:00 PM");
    expect(formatFrameTime(1790676000, -18000, "24h")).toBe("05:00");
    expect(formatFrameTime(1790676000, -18000, "12h")).toBe("5:00 AM");
  });
});

describe("fetchRadarFrames", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("combines past + nowcast frames", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              host: "https://tilecache.rainviewer.com",
              radar: {
                past: [{ time: 1, path: "/a" }],
                nowcast: [
                  { time: 2, path: "/b" },
                  { time: "bad", path: "/c" },
                ],
              },
            }),
          }) as Response,
      ),
    );
    const manifest = await fetchRadarFrames();
    expect(manifest.host).toContain("rainviewer");
    expect(manifest.frames).toHaveLength(2);
  });

  it("rejects empty manifests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({ host: "x", radar: {} }),
          }) as Response,
      ),
    );
    await expect(fetchRadarFrames()).rejects.toThrow();
  });
});
