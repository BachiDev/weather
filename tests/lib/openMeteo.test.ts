import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearWeatherCache,
  fetchWeather,
  fetchWeatherCached,
  mapGeoResultToCityData,
  searchCities,
  WeatherApiError,
} from "@/lib/openMeteo";

const weatherFixture = {
  latitude: 48.2,
  longitude: 16.37,
  utc_offset_seconds: 7200,
  timezone: "Europe/Vienna",
  current: {
    temperature_2m: 18.5,
    apparent_temperature: 17.0,
    is_day: 1,
    wind_speed_10m: 12.3,
    wind_direction_10m: 270,
    relative_humidity_2m: 55,
    surface_pressure: 1013,
    weather_code: 2,
  },
  daily: {
    time: ["2026-09-29"],
    weather_code: [2],
    temperature_2m_max: [20],
    temperature_2m_min: [12],
    sunrise: ["2026-09-29T07:00"],
    sunset: ["2026-09-29T19:00"],
    precipitation_probability_max: [10],
    wind_speed_10m_max: [15],
  },
  hourly: {
    time: ["2026-09-29T00:00"],
    temperature_2m: [14],
    weather_code: [2],
  },
};

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

describe("mapGeoResultToCityData", () => {
  it("builds labels with state and postcode", () => {
    const city = mapGeoResultToCityData({
      id: 1,
      latitude: 48.2,
      longitude: 16.37,
      name: "Vienna",
      country: "Austria",
      admin1: "Wien",
      postcode: ["1010"],
    });
    expect(city.label).toBe("Vienna, Wien, Austria (1010)");
  });

  it("handles missing optional fields", () => {
    const city = mapGeoResultToCityData({
      id: 2,
      latitude: 0,
      longitude: 0,
      name: "Nowhere",
      country: "Noland",
    });
    expect(city.label).toBe("Nowhere, Noland");
  });
});

describe("searchCities", () => {
  beforeEach(() => {
    clearWeatherCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("URL-encodes the query and maps results", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toContain("name=S%C3%A3o+Paulo");
      return jsonResponse({
        results: [
          {
            id: 1,
            latitude: -23.5,
            longitude: -46.6,
            name: "São Paulo",
            country: "Brazil",
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const cities = await searchCities("São Paulo");
    expect(cities).toHaveLength(1);
    expect(cities[0].name).toBe("São Paulo");
  });

  it("returns [] when the API has no results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({})),
    );
    await expect(searchCities("xyz-no-such-city")).resolves.toEqual([]);
  });

  it("throws a typed error on HTTP failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, false, 500)),
    );
    await expect(searchCities("Vienna")).rejects.toMatchObject({
      name: "WeatherApiError",
    });
  });
});

describe("fetchWeather", () => {
  beforeEach(() => {
    clearWeatherCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns validated weather data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(weatherFixture)),
    );
    const data = await fetchWeather(48.2, 16.37);
    expect(data.current.temperature_2m).toBe(18.5);
    expect(data.daily.precipitation_probability_max).toEqual([10]);
  });

  it("rejects malformed payloads with bad-response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ current: {} })),
    );
    const err = await fetchWeather(48.2, 16.37).catch((e) => e);
    expect(err).toBeInstanceOf(WeatherApiError);
    expect((err as WeatherApiError).kind).toBe("bad-response");
  });

  it("serves repeat coordinates from cache without refetching", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(weatherFixture));
    vi.stubGlobal("fetch", fetchMock);
    await fetchWeatherCached(48.2082, 16.37);
    await fetchWeatherCached(48.20821, 16.37001); // same 4-decimal bucket
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
