import { useState, useEffect, useCallback } from "react";
import { WeatherData, CityData } from "../app/interfaces";
import { fetchWeatherData } from "../app/api";

export const useWeather = (selectedCity: CityData | null) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherDataCallback = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWeatherData(lat, lon);
      setWeatherData(response);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchWeatherDataCallback(selectedCity.latitude, selectedCity.longitude);
    } else {
      setWeatherData(null);
    }
  }, [selectedCity, fetchWeatherDataCallback]);

  return {
    weatherData,
    loading,
    error,
  };
};