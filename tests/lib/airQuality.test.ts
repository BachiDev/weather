import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  aqiBand,
  clearAirQualityCache,
  fetchAirQuality,
  fetchAirQualityCached,
} from "@/lib/airQuality";
import { WeatherApiError } from "@/lib/openMeteo";

const fixture = {
  current: { us_aqi: 48, pm2_5: 6.1, ozone: 66 },
};

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

describe("aqiBand", () => {
  it("labels every US AQI band", () => {
    expect(aqiBand(12).label).toBe("Good");
    expect(aqiBand(50).label).toBe("Good");
    expect(aqiBand(75).label).toBe("Moderate");
    expect(aqiBand(125).label).toBe("Unhealthy for some");
    expect(aqiBand(125).short).toBe("USG");
    expect(aqiBand(175).label).toBe("Unhealthy");
    expect(aqiBand(250).label).toBe("Very unhealthy");
    expect(aqiBand(250).short).toBe("V. unhealthy");
    expect(aqiBand(400).label).toBe("Hazardous");
  });

  it("exposes purge-safe styling for every band", () => {
    for (const aqi of [5, 75, 125, 175, 250, 400]) {
      const band = aqiBand(aqi);
      expect(band.pill).toContain("ring-");
      expect(band.text).toMatch(/^text-/);
    }
  });

  it("handles invalid input without crashing", () => {
    expect(aqiBand(-1).label).toBe("Unknown");
    expect(aqiBand(Number.NaN).label).toBe("Unknown");
  });
});

describe("fetchAirQuality", () => {
  beforeEach(() => {
    clearAirQualityCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns validated air-quality data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(fixture)),
    );
    const data = await fetchAirQuality(48.2, 16.37);
    expect(data.current.us_aqi).toBe(48);
  });

  it("rejects malformed payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ current: {} })),
    );
    const err = await fetchAirQuality(48.2, 16.37).catch((e) => e);
    expect(err).toBeInstanceOf(WeatherApiError);
    expect((err as WeatherApiError).kind).toBe("bad-response");
  });

  it("caches repeat coordinates", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(fixture));
    vi.stubGlobal("fetch", fetchMock);
    await fetchAirQualityCached(48.2, 16.37);
    await fetchAirQualityCached(48.2, 16.37);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
