"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Typography, Box, CircularProgress, Alert, Fade } from "@mui/material";
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
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  label: string; // For Autocomplete display
}

interface GeoResult {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  admin1?: string;
  postcode?: string[];
}

export default function Home() {
  const [city, setCity] = useState<string | null>("Vienna");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cityOptions, setCityOptions] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,surface_pressure,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=7`
      );
      setWeatherData(response.data);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCityOptions = useCallback(async (cityName: string) => {
    // setLoading(true); // Don't set main loading for options search
    // setError(null); // Don't set main error for options search
    setCityOptions([]); // Clear previous options

    if (!cityName.trim()) {
      // setLoading(false); // Don't set main loading
      return;
    }

    try {
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=10&language=en&format=json` // Request more results
      );

      if (response.data.results && response.data.results.length > 0) {
        const options: CityData[] = response.data.results.map((result: GeoResult) => {
          const state = result.admin1 ? `, ${result.admin1}` : "";
          const postal = result.postcode && result.postcode.length > 0 ? ` (${result.postcode[0]})` : "";

          return {
            id: result.id,
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country,
            label: `${result.name}${state}, ${result.country}${postal}`,
          };
        });

        setCityOptions(options);
      } else if (cityName.trim()) { // Only set error if search term was not empty
        // setError("City not found. Please try a different city."); // Don't set main error
      }
    } catch (err) {
      // setError("Failed to fetch city options. Please try again."); // Don't set main error
      console.error(err);
    } finally {
      // setLoading(false); // Don't set main loading
    }
  }, []);

  useEffect(() => {
    // Fetch weather data only when a city is explicitly selected
    if (selectedCity) {
      fetchWeatherData(selectedCity.latitude, selectedCity.longitude);
    } else {
      // Clear weather data if no city is selected
      setWeatherData(null);
    }
  }, [selectedCity, fetchWeatherData]);

  const handleSearchInputChange = (newCity: string) => {
    setCity(newCity);
    if (newCity.trim()) {
      fetchCityOptions(newCity); // Fetch options when user types
    } else {
      // Clear options if search bar is empty
      setCityOptions([]);
      setError(null);
    }
  };

  const handleCitySelect = (selected: CityData | null) => {
    setSelectedCity(selected);
    setCityOptions([]); // Clear options after selection
  };

  useEffect(() => {
    // Initial load for default city
    const loadDefaultCity = async () => {
      if (city === "Vienna" && !selectedCity) {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=Vienna&count=1&language=en&format=json`
          );
          if (response.data.results && response.data.results.length > 0) {
            const defaultCityData: CityData = {
              id: response.data.results[0].id,
              latitude: response.data.results[0].latitude,
              longitude: response.data.results[0].longitude,
              name: response.data.results[0].name,
              country: response.data.results[0].country,
              label: `${response.data.results[0].name}, ${response.data.results[0].country}`,
            };
            setSelectedCity(defaultCityData);
            setCity(defaultCityData.name);
          } else {
            setError("Default city (Vienna) not found.");
          }
        } catch (err) {
          setError("Failed to load default city. Please try again.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadDefaultCity();
  }, [city, selectedCity]);

  useEffect(() => {
    // Fetch weather data only when a city is explicitly selected
    if (selectedCity) {
      fetchWeatherData(selectedCity.latitude, selectedCity.longitude);
    } else {
      // Clear weather data if no city is selected
      setWeatherData(null);
    }
  }, [selectedCity, fetchWeatherData]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Weather Dashboard
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3, width: "100%", maxWidth: 600, margin: "0 auto" }}>
        <SearchBar onSearchInputChange={handleSearchInputChange} options={cityOptions} onCitySelect={handleCitySelect} />
      </Box>

      {(loading || error) && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4, width: "100%" }}>
          {loading && <CircularProgress />}
          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}
        </Box>
      )}

      {weatherData && !loading && !error && (
        <Fade in={weatherData && !loading && !error} timeout={1000}>
          <Box sx={{ width: "100%", mt: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom align="center">
              {selectedCity?.label}
            </Typography>
            <CurrentWeather data={weatherData.current} />
          </Box>
        </Fade>
      )}

      {weatherData && !loading && !error && (
        <Fade in={weatherData && !loading && !error} timeout={1000}>
          <Box sx={{ width: "100%", mt: 4 }}>
            <DailyForecast data={weatherData.daily} />
          </Box>
        </Fade>
      )}

      {weatherData && !loading && !error && (
        <Fade in={weatherData && !loading && !error} timeout={1000}>
          <Box sx={{ width: "100%", mt: 4 }}>
            <HourlyForecast data={weatherData.hourly} />
          </Box>
        </Fade>
      )}
    </Container>
  );
}