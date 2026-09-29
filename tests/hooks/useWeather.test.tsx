import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { clearWeatherCache } from "@/lib/openMeteo";
import { useWeather } from "@/hooks/useWeather";
import type { CityData } from "@/types/weather";

const cityA: CityData = {
  id: 1,
  latitude: 48.2,
  longitude: 16.37,
  name: "A",
  country: "X",
  label: "A",
};
const cityB: CityData = {
  id: 2,
  latitude: 47.07,
  longitude: 15.43,
  name: "B",
  country: "X",
  label: "B",
};

function weatherFor() {
  return {
    latitude: 0,
    longitude: 0,
    utc_offset_seconds: 0,
    timezone: "UTC",
    current: {
      temperature_2m: 10,
      apparent_temperature: 9,
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
      temperature_2m_max: [],
      temperature_2m_min: [],
      sunrise: [],
      sunset: [],
      precipitation_probability_max: [],
      wind_speed_10m_max: [],
    },
    hourly: { time: [], temperature_2m: [], weather_code: [] },
  };
}

describe("useWeather", () => {
  beforeEach(() => {
    clearWeatherCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("drops a slow stale response when the city changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        // City A is slow, city B is fast.
        if (url.includes("16.37")) await new Promise((r) => setTimeout(r, 50));
        const body = weatherFor();
        if (!url.includes("16.37")) body.current.temperature_2m = 99;
        return { ok: true, status: 200, json: async () => body } as Response;
      }),
    );

    const { result, rerender } = renderHook(({ city }) => useWeather(city), {
      initialProps: { city: cityA },
    });
    rerender({ city: cityB });

    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    // Must show city B's data, never the late city-A response.
    expect(result.current.weatherData?.current.temperature_2m).toBe(99);
    expect(result.current.error).toBeNull();
  });

  it("surfaces errors and recovers via retry()", async () => {
    let fail = true;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        if (fail)
          return { ok: false, status: 500, json: async () => ({}) } as Response;
        return {
          ok: true,
          status: 200,
          json: async () => weatherFor(),
        } as Response;
      }),
    );

    const { result } = renderHook(() => useWeather(cityB));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.weatherData).toBeNull();

    fail = false;
    act(() => {
      result.current.retry();
    });
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    expect(result.current.error).toBeNull();
  });
});
