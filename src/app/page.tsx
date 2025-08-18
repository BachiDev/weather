"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Typography, Box, CircularProgress, Alert, Grid } from "@mui/material";
import SearchBar from "../components/SearchBar";
import CurrentWeather from "../components/CurrentWeather";
import DailyForecast from "../components/DailyForecast";
import HourlyForecast from "../components/HourlyForecast";

interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    surface_pressure: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  latitude: number;
  longitude: number;
  timezone: string;
}

interface CityData {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

export default function Home() {
  const [city, setCity] = useState<string>("London");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,surface_pressure,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=7`
      );
      console.log("Open-Meteo API Response:", response.data);
      setWeatherData(response.data);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCityCoordinates = useCallback(async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
      );
      if (response.data.results && response.data.results.length > 0) {
        const { latitude, longitude, name, country } = response.data.results[0];
        setCity(`${name}, ${country}`);
        fetchWeatherData(latitude, longitude);
      } else {
        setError("City not found. Please try a different city.");
        setWeatherData(null);
      }
    } catch (err) {
      setError("Failed to fetch city coordinates. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchWeatherData]);

  useEffect(() => {
    fetchCityCoordinates(city);
  }, [city, fetchCityCoordinates]);

  const handleSearch = (newCity: string) => {
    setCity(newCity);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Weather Dashboard
      </Typography>
      <Grid container spacing={3} justifyContent="space-between" alignItems="flex-start">
        <Grid sx={{ xs: 12, md: 6, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: { xs: "center", md: "flex-start" } }}>
          <Box sx={{ mb: 3 }}>
            <SearchBar onSearch={handleSearch} />
          </Box>
        </Grid>
        <Grid sx={{ xs: 12, md: 6 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ my: 4, width: "100%" }}>
              {error}
            </Alert>
          )}
          {weatherData && !loading && !error && (
            <Box sx={{ width: "100%" }}>
              <Typography variant="h4" component="h2" gutterBottom align="center">
                {city}
              </Typography>
              <CurrentWeather data={weatherData.current} />
            </Box>
          )}
        </Grid>

        {weatherData && !loading && !error && (
          <>
            <Grid sx={{ xs: 12, md: 6 }}>
              <DailyForecast data={weatherData.daily} />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <HourlyForecast data={weatherData.hourly} />
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
}