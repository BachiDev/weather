import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { clearWeatherCache } from "@/lib/openMeteo";
import { useCompareWeather } from "@/hooks/useCompareWeather";
import { DEFAULT_CITY } from "@/lib/defaultCity";
import type { CityData } from "@/types/weather";

const graz: CityData = {
  id: 2778067,
  latitude: 47.07,
  longitude: 15.43,
  name: "Graz",
  country: "Austria",
  label: "Graz",
};

function weatherJson(temp: number) {
  return {
    latitude: 0,
    longitude: 0,
    utc_offset_seconds: 0,
    timezone: "UTC",
    current: {
      temperature_2m: temp,
      apparent_temperature: temp,
      is_day: 1,
      wind_speed_10m: 5,
      wind_direction_10m: 0,
      relative_humidity_2m: 50,
      surface_pressure: 1010,
      weather_code: 0,
    },
    daily: {
      time: [],
      weather_code: [],
      temperature_2m_max: [temp],
      temperature_2m_min: [temp],
      sunrise: [],
      sunset: [],
      precipitation_probability_max: [],
      wind_speed_10m_max: [],
    },
    hourly: { time: [], temperature_2m: [], weather_code: [] },
  };
}

describe("useCompareWeather", () => {
  afterEach(() => {
    clearWeatherCache();
    vi.unstubAllGlobals();
  });

  it("fetches all cities in parallel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (url: string) =>
          ({
            ok: true,
            status: 200,
            json: async () => weatherJson(url.includes("15.43") ? 25 : 18),
          }) as Response,
      ),
    );
    const { result } = renderHook(() =>
      useCompareWeather([DEFAULT_CITY, graz]),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[0].data?.current.temperature_2m).toBe(18);
    expect(result.current.entries[1].data?.current.temperature_2m).toBe(25);
  });

  it("marks failed cities without failing the rest", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("15.43"))
          return { ok: false, status: 500, json: async () => ({}) } as Response;
        return {
          ok: true,
          status: 200,
          json: async () => weatherJson(18),
        } as Response;
      }),
    );
    const { result } = renderHook(() =>
      useCompareWeather([DEFAULT_CITY, graz]),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries[0].data).not.toBeNull();
    expect(result.current.entries[1].error).toBe("Unavailable");
  });

  it("stays empty for an empty list", () => {
    const { result } = renderHook(() => useCompareWeather([]));
    expect(result.current.entries).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
