import { useCallback, useEffect, useRef, useState } from "react";
import type { AirQuality, CityData } from "@/types/weather";
import { fetchAirQualityCached } from "@/lib/airQuality";

/**
 * Air-quality fetch with the same stale-response guard as useWeather.
 * Failures stay local (a small "unavailable" note) — they never blank the page.
 */
export function useAirQuality(selectedCity: CityData | null) {
  const [data, setData] = useState<AirQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);

  const load = useCallback(async (city: CityData) => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await fetchAirQualityCached(
        city.latitude,
        city.longitude,
        controller.signal,
      );
      if (requestId.current !== id) return;
      setData(result);
    } catch {
      if (requestId.current !== id || controller.signal.aborted) return;
      setData(null);
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      void load(selectedCity);
    } else {
      requestId.current++;
      activeController.current?.abort();
      setData(null);
      setLoading(false);
    }
    return () => {
      activeController.current?.abort();
    };
  }, [selectedCity, load]);

  return { data, loading };
}
