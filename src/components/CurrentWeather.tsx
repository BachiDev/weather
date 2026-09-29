"use client";

import { WeatherIcon } from "./WeatherIcon";
import { Card } from "./ui/Card";
import { Stat } from "./ui/Stat";
import {
  formatSpeed,
  formatTemp,
  formatTimeOfDay,
  formatWindDirection,
  type SpeedUnit,
  type TempUnit,
} from "@/lib/units";
import { getWeatherDescription } from "@/lib/weatherCodes";
import type { WeatherData } from "@/types/weather";

type CurrentWeatherProps = {
  current: WeatherData["current"];
  sunrise: string;
  sunset: string;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
};

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  current,
  sunrise,
  sunset,
  tempUnit,
  speedUnit,
}) => {
  const isDay = current.is_day === 1;

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
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-zinc-400">
            Feels like {formatTemp(current.apparent_temperature, tempUnit)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat
            value={`${formatSpeed(current.wind_speed_10m, speedUnit)} ${formatWindDirection(current.wind_direction_10m)}`}
            label="Wind"
          />
          <Stat
            value={`${Math.round(current.relative_humidity_2m)}%`}
            label="Humidity"
          />
          <Stat
            value={`${Math.round(current.surface_pressure)} hPa`}
            label="Pressure"
          />
          <Stat
            value={formatTemp(current.apparent_temperature, tempUnit)}
            label="Feels like"
          />
          <Stat value={formatTimeOfDay(sunrise)} label="Sunrise" />
          <Stat value={formatTimeOfDay(sunset)} label="Sunset" />
        </div>
      </div>
    </Card>
  );
};

export default CurrentWeather;
