"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';

interface DailyForecastProps {
  data: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

const DailyForecast: React.FC<DailyForecastProps> = ({ data }) => {
  const chartData = data.time.map((time, index) => ({
    day: new Date(time).toLocaleDateString("en-US", { weekday: "short" }),
    maxTemp: data.temperature_2m_max[index],
    minTemp: data.temperature_2m_min[index],
  }));

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: "rgba(33, 33, 33, 0.7)", color: "white", borderRadius: 16 }}>
      <Typography variant="h5" component="h3" gutterBottom align="center">
        7-Day Forecast
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <LineChart
          series={[
            { data: chartData.map(d => d.maxTemp), label: 'Max Temp (°C)', color: '#ff5252' },
            { data: chartData.map(d => d.minTemp), label: 'Min Temp (°C)', color: '#42a5f5' },
          ]}
          xAxis={[{ scaleType: 'band', data: chartData.map(d => d.day) }]} // Use band scale for categorical data
          yAxis={[{ label: 'Temperature (°C)' }]} // Label for Y-axis
          margin={{ left: 70, right: 20, top: 30, bottom: 50 }} // Adjust margins for labels
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

export default DailyForecast;