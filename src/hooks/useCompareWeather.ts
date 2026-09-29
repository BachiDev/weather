import { useCallback, useEffect, useRef, useState } from "react";
import type { CityData, WeatherData } from "@/types/weather";
import { fetchWeatherCached } from "@/lib/openMeteo";

export type CompareEntry = {
  city: CityData;
  data: WeatherData | null;
  error: string | null;
};

/** Parallel weather fetch for up to N compare cities (cache makes it cheap). */
export function useCompareWeather(cities: CityData[]) {
  const [entries, setEntries] = useState<CompareEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);
  // `cities` identity changes every render — key on stable ids instead.
  const key = cities.map((c) => c.id).join(",");
  const citiesRef = useRef(cities);
  citiesRef.current = cities;

  useEffect(() => {
    const list = citiesRef.current;
    if (list.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }
    // Local flag (not a ref mutation in cleanup) invalidates late responses.
    let cancelled = false;
    setLoading(true);
    setEntries(list.map((city) => ({ city, data: null, error: null })));
    void Promise.all(
      list.map(async (city): Promise<CompareEntry> => {
        try {
          const data = await fetchWeatherCached(city.latitude, city.longitude);
          return { city, data, error: null };
        } catch {
          return { city, data: null, error: "Unavailable" };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setEntries(results);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [key, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  return { entries, loading, retry };
}
