import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { clearAirQualityCache } from "@/lib/airQuality";
import { useAirQuality } from "@/hooks/useAirQuality";
import { DEFAULT_CITY } from "@/lib/defaultCity";

describe("useAirQuality", () => {
  afterEach(() => {
    clearAirQualityCache();
    vi.unstubAllGlobals();
  });

  it("loads air quality for the selected city", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              current: { us_aqi: 48, pm2_5: 6.1, ozone: 66 },
            }),
          }) as Response,
      ),
    );
    const { result } = renderHook(() => useAirQuality(DEFAULT_CITY));
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.current.us_aqi).toBe(48);
    expect(result.current.loading).toBe(false);
  });

  it("stays empty (no page-level error) when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({ ok: false, status: 500, json: async () => ({}) }) as Response,
      ),
    );
    const { result } = renderHook(() => useAirQuality(DEFAULT_CITY));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });
});
