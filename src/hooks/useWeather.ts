import { useCallback, useEffect, useRef, useState } from "react";
import type { CityData, WeatherData } from "@/types/weather";
import { fetchWeatherCached, WeatherApiError } from "@/lib/openMeteo";

function friendlyMessage(err: unknown): string {
  if (err instanceof WeatherApiError) {
    if (err.kind === "timeout")
      return "The request timed out. Please try again.";
    if (err.kind === "bad-response")
      return "The weather service returned unexpected data. Please try again.";
    return "Could not reach the weather service. Check your connection and try again.";
  }
  return "Failed to fetch weather data. Please try again.";
}

export const useWeather = (selectedCity: CityData | null) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Monotonic request id: a slow stale response never overwrites newer data.
  const requestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);
  const cityRef = useRef<CityData | null>(selectedCity);
  cityRef.current = selectedCity;

  const load = useCallback(async (city: CityData) => {
    activeController.current?.abort(); // cancel the superseded network leg
    const controller = new AbortController();
    activeController.current = controller;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherCached(
        city.latitude,
        city.longitude,
        controller.signal,
      );
      if (requestId.current !== id) return; // superseded — drop silently
      setWeatherData(data);
    } catch (err) {
      if (requestId.current !== id) return;
      // User-cancelled (city switch / unmount): not an error state.
      if (controller.signal.aborted) return;
      setError(friendlyMessage(err));
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (cityRef.current) void load(cityRef.current);
  }, [load]);

  useEffect(() => {
    if (selectedCity) {
      void load(selectedCity);
    } else {
      requestId.current++; // invalidate in-flight loads
      activeController.current?.abort();
      setWeatherData(null);
      setError(null);
      setLoading(false);
    }
    return () => {
      // Cancel the network leg on unmount / city switch; the request-id
      // guard drops any late resolution that still slips through.
      activeController.current?.abort();
    };
  }, [selectedCity, load]);

  return {
    weatherData,
    loading,
    error,
    retry,
  };
};
