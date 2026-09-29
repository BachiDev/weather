import { Droplets, Sunrise, Sunset, Wind } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import {
  formatDayLabel,
  formatTemp,
  formatTimeOfDay,
  type TempUnit,
} from "@/lib/units";
import { getWeatherDescription } from "@/lib/weatherCodes";
import type { WeatherData } from "@/types/weather";

type DayCardProps = {
  date: string;
  code: number;
  max: number;
  min: number;
  sunrise: string;
  sunset: string;
  precipProbability: number | null;
  windMax: number;
  tempUnit: TempUnit;
};

/** One day of the 7-day outlook — icon, hi/lo, precip, sun times. */
export function DayCard({
  date,
  code,
  max,
  min,
  sunrise,
  sunset,
  precipProbability,
  windMax,
  tempUnit,
}: DayCardProps) {
  const { weekday, date: dateLabel } = formatDayLabel(date);
  const description = getWeatherDescription(code);

  return (
    <li className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-4 text-center transition-colors hover:border-brand-500/40">
      <p className="text-sm font-semibold text-zinc-100">{weekday}</p>
      <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
        {dateLabel}
      </p>
      <WeatherIcon
        code={code}
        size={32}
        className="my-1 text-brand-300"
        label={description}
      />
      <p className="text-sm text-zinc-300">
        <span className="font-bold text-zinc-50">
          {formatTemp(max, tempUnit)}
        </span>
        {" / "}
        <span className="text-zinc-400">{formatTemp(min, tempUnit)}</span>
      </p>
      <p className="sr-only">{description}</p>
      <dl className="mt-2 flex w-full flex-col gap-1 text-[11px] text-zinc-400">
        <div className="flex items-center justify-center gap-1">
          <Droplets className="h-3 w-3" aria-hidden="true" />
          <dt className="sr-only">Precipitation probability</dt>
          <dd>
            {precipProbability === null
              ? "—"
              : `${Math.round(precipProbability)}%`}
          </dd>
          <span aria-hidden="true">·</span>
          <Wind className="h-3 w-3" aria-hidden="true" />
          <dt className="sr-only">Max wind speed</dt>
          <dd>{Math.round(windMax)} km/h</dd>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Sunrise className="h-3 w-3" aria-hidden="true" />
          <dt className="sr-only">Sunrise</dt>
          <dd>{formatTimeOfDay(sunrise)}</dd>
          <span aria-hidden="true">·</span>
          <Sunset className="h-3 w-3" aria-hidden="true" />
          <dt className="sr-only">Sunset</dt>
          <dd>{formatTimeOfDay(sunset)}</dd>
        </div>
      </dl>
    </li>
  );
}

export type DailyData = WeatherData["daily"];
