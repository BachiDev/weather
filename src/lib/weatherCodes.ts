// WMO weather-code → human-readable label + Lucide glyph.
// Open-Meteo docs: https://open-meteo.com/en/docs
// Labels double as screen-reader text (icons alone say nothing).

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Snowflake,
  Sun,
  type LucideIcon,
} from "lucide-react";

const LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export function getWeatherDescription(code: number): string {
  return LABELS[code] ?? "Unknown conditions";
}

export type WeatherMeta = {
  label: string;
  Icon: LucideIcon;
};

/** Code → label + day/night-aware Lucide glyph. Unknown codes fall back to Cloud. */
export function getWeatherMeta(code: number, isDay = true): WeatherMeta {
  if (!(code in LABELS)) {
    return { label: "Unknown conditions", Icon: Cloud };
  }
  const label = LABELS[code];

  let Icon: LucideIcon = Cloud;
  if (code === 0) {
    Icon = isDay ? Sun : Moon;
  } else if (code === 1 || code === 2) {
    Icon = isDay ? CloudSun : CloudMoon;
  } else if (code === 3) {
    Icon = Cloudy;
  } else if (code === 45 || code === 48) {
    Icon = CloudFog;
  } else if (code >= 51 && code <= 57) {
    Icon = CloudDrizzle;
  } else if (code === 66 || code === 67 || code === 96 || code === 99) {
    Icon = CloudHail;
  } else if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    Icon = CloudRain;
  } else if (code === 77) {
    Icon = Snowflake;
  } else if ((code >= 71 && code <= 75) || code === 85 || code === 86) {
    Icon = CloudSnow;
  } else if (code >= 95) {
    Icon = CloudLightning;
  }

  return { label, Icon };
}
