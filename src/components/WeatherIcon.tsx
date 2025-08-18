"use client";

import React from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Clear sky
import CloudIcon from '@mui/icons-material/Cloud'; // Cloudy
import AcUnitIcon from '@mui/icons-material/AcUnit'; // Snow
import UmbrellaIcon from '@mui/icons-material/Umbrella'; // Rain
import FlashOnIcon from '@mui/icons-material/FlashOn'; // Thunderstorm
import GrainIcon from '@mui/icons-material/Grain'; // Drizzle
import DehazeIcon from '@mui/icons-material/Dehaze'; // Fog
import { SvgIconProps } from '@mui/material/SvgIcon';

interface WeatherIconProps {
  weatherCode: number;
  sx?: SvgIconProps['sx'];
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ weatherCode, sx }) => {
  let IconComponent: React.ElementType = WbSunnyIcon; // Default to sunny

  // Open-Meteo Weather codes: https://www.open-meteo.com/en/docs
  if (weatherCode === 0) {
    IconComponent = WbSunnyIcon; // Clear sky
  } else if (weatherCode >= 1 && weatherCode <= 3) {
    IconComponent = CloudIcon; // Mainly clear, partly cloudy, and overcast
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    IconComponent = DehazeIcon; // Fog and depositing rime fog
  } else if (weatherCode >= 51 && weatherCode <= 57) {
    IconComponent = GrainIcon; // Drizzle: Light, moderate, and dense intensity
  } else if (weatherCode >= 61 && weatherCode <= 67) {
    IconComponent = UmbrellaIcon; // Rain: Slight, moderate, and heavy intensity
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    IconComponent = AcUnitIcon; // Snow fall: Slight, moderate, and heavy intensity
  } else if (weatherCode >= 80 && weatherCode <= 82) {
    IconComponent = UmbrellaIcon; // Rain showers: Slight, moderate, and violent
  } else if (weatherCode >= 85 && weatherCode <= 86) {
    IconComponent = AcUnitIcon; // Snow showers slight and heavy
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    IconComponent = FlashOnIcon; // Thunderstorm: Slight or moderate
  }

  return <IconComponent sx={sx} />;
};

export default WeatherIcon;
