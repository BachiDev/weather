"use client";

import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import WeatherIcon from "./WeatherIcon";

interface CurrentWeatherProps {
  data: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    surface_pressure: number;
    weather_code: number;
  };
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: "rgba(33, 33, 33, 0.7)", color: "white", borderRadius: 16 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid sx={{ xs: 12, md: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <WeatherIcon weatherCode={data.weather_code} sx={{ fontSize: 100, mb: 1 }} />
          <Typography variant="h2" component="div">
            {data.temperature_2m}°C
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Feels like: {data.apparent_temperature}°C
          </Typography>
        </Grid>
        <Grid sx={{ xs: 12, md: 6 }}>
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="body1">Wind Speed: {data.wind_speed_10m} km/h</Typography>
            <Typography variant="body1">Humidity: {data.relative_humidity_2m}%</Typography>
            <Typography variant="body1">Pressure: {data.surface_pressure} hPa</Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CurrentWeather;
