"use client";

import { Container, Typography, Box, CircularProgress, Alert, Fade } from "@mui/material";
import SearchBar from "../components/SearchBar";
import CurrentWeather from "../components/CurrentWeather";
import DailyForecast from "../components/DailyForecast";
import HourlyForecast from "../components/HourlyForecast";
import { useSearch } from "../hooks/useSearch";
import { useWeather } from "../hooks/useWeather";


export default function Home() {
  const { cityOptions, selectedCity, handleSearchInputChange, handleCitySelect } = useSearch();
  const { weatherData, loading, error } = useWeather(selectedCity);

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