"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';

interface HourlyForecastProps {
  data: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data }) => {
  const now = new Date();
  const currentHourIndex = data.time.findIndex(time => new Date(time).getHours() === now.getHours());
  const next24HoursData = data.time.slice(currentHourIndex, currentHourIndex + 24);
  const next24HoursTemperatures = data.temperature_2m.slice(currentHourIndex, currentHourIndex + 24);

  const chartData = next24HoursData.map((time, index) => ({
    hour: new Date(time).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
    temp: next24HoursTemperatures[index],
  }));

  return (
    <Paper elevation={3} sx={{
      p: 2, backgroundColor: "rgba(33, 33, 33, 0.7)", color: "white", borderRadius: 16,
      transition: "box-shadow 0.3s ease-in-out",
      "&:hover": {
        boxShadow: "0px 0px 20px 5px rgba(255, 255, 255, 0.5)", // White glow
      },
    }}>
      <Typography variant="h5" component="h3" gutterBottom align="center">
        24-Hour Forecast
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <LineChart
          series={[
            { data: chartData.map(d => d.temp), label: 'Temperature (°C)', color: '#ffffffff' },
          ]}
          xAxis={[{ scaleType: 'band', data: chartData.map(d => d.hour) }]} // Use band scale for categorical data
          yAxis={[{ label: 'Temperature (°C)' }]} // Label for Y-axis
          margin={{ left: 10, right: 10, top: 30, bottom: 30 }} // Adjust margins for labels
          grid={{ vertical: true, horizontal: true }} // Add grid lines
          slotProps={{
            legend: {
              position: { vertical: 'top', horizontal: 'center' },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default HourlyForecast;