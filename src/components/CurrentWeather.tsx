"use client";

import {
  CloudFog,
  Droplets,
  Gauge,
  Leaf,
  Thermometer,
  Wind,
} from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import { Card } from "./ui/Card";
import { Stat } from "./ui/Stat";
import {
  formatSpeed,
  formatTemp,
  formatWindDirection,
  type SpeedUnit,
  type TempUnit,
} from "@/lib/units";
import { aqiBand } from "@/lib/airQuality";
import { getWeatherDescription } from "@/lib/weatherCodes";
import type { WeatherData } from "@/types/weather";

type CurrentWeatherProps = {
  current: WeatherData["current"];
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  /** Null while loading or when the AQI API is unavailable — tile shows "—". */
  aqi: number | null;
  pm25: number | null;
};

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  current,
  tempUnit,
  speedUnit,
  aqi,
  pm25,
}) => {
  const isDay = current.is_day === 1;
  const band = aqiBand(aqi ?? Number.NaN);

  return (
    <Card className="p-6 md:p-8" aria-label="Current weather">
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center text-center">
          <WeatherIcon
            code={current.weather_code}
            isDay={isDay}
            size={96}
            className="text-brand-300"
          />
          <p className="mt-2 text-6xl font-bold tracking-tight text-zinc-50">
            {formatTemp(current.temperature_2m, tempUnit)}
          </p>
          <p className="mt-1 text-lg text-zinc-300">
            {getWeatherDescription(current.weather_code)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat
            icon={<Wind className="h-4 w-4 text-zinc-400" aria-hidden="true" />}
            value={`${formatSpeed(current.wind_speed_10m, speedUnit)} ${formatWindDirection(current.wind_direction_10m)}`}
            label="Wind"
          />
          <Stat
            icon={
              <Droplets className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            }
            value={`${Math.round(current.relative_humidity_2m)}%`}
            label="Humidity"
          />
          <Stat
            icon={
              <Gauge className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            }
            value={`${Math.round(current.surface_pressure)} hPa`}
            label="Pressure"
          />
          <Stat
            icon={
              <Thermometer
                className="h-4 w-4 text-zinc-400"
                aria-hidden="true"
              />
            }
            value={formatTemp(current.apparent_temperature, tempUnit)}
            label="Feels like"
          />
          <Stat
            icon={<Leaf className="h-4 w-4 text-zinc-400" aria-hidden="true" />}
            value={aqi === null ? "—" : String(Math.round(aqi))}
            valueClassName={aqi === null ? undefined : band.text}
            label={aqi === null ? "Air quality" : `AQI · ${band.short}`}
          />
          <Stat
            icon={
              <CloudFog className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            }
            value={pm25 === null ? "—" : `${pm25.toFixed(1)}`}
            label="PM2.5 µg/m³"
          />
        </div>
      </div>
    </Card>
  );
};

export default CurrentWeather;
