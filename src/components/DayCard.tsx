import { Droplets, Sunrise, Sunset, Wind } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import { cn } from "@/lib/cn";
import {
  formatDayLabel,
  formatSpeed,
  formatTemp,
  formatTimeOfDay,
  type HourFormat,
  type SpeedUnit,
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
  speedUnit: SpeedUnit;
  hourFormat: HourFormat;
  selected?: boolean;
  onSelect?: () => void;
};

/** One day of the 7-day outlook — a button drilling into that day's hours. */
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
  speedUnit,
  hourFormat,
  selected = false,
  onSelect,
}: DayCardProps) {
  const { weekday, date: dateLabel } = formatDayLabel(date);
  const description = getWeatherDescription(code);

  return (
    <li className="h-full">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${weekday} ${dateLabel}: ${description}, high ${formatTemp(max, tempUnit)}, low ${formatTemp(min, tempUnit)}. Show hourly forecast.`}
        className={cn(
          "flex h-full w-full flex-col items-center gap-1 rounded-2xl border px-3 py-4 text-center transition-colors",
          selected
            ? "border-brand-500/60 bg-brand-500/10"
            : "border-white/10 bg-white/[0.02] hover:border-brand-500/40",
        )}
      >
        {/* Spans, not p/dl: only phrasing content is valid inside <button>. */}
        <span className="block text-sm font-semibold text-zinc-100">
          {weekday}
        </span>
        <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          {dateLabel}
        </span>
        <WeatherIcon
          code={code}
          size={32}
          className="my-1 text-brand-300"
          label={description}
        />
        <span className="block text-sm text-zinc-300">
          <span className="font-bold text-zinc-50">
            {formatTemp(max, tempUnit)}
          </span>
          {" / "}
          <span className="text-zinc-400">{formatTemp(min, tempUnit)}</span>
        </span>
        <span className="sr-only">{description}</span>
        {/* Groups stay together (whitespace-nowrap); rows may wrap between groups on narrow cards. */}
        <span className="mt-2 flex w-full flex-wrap justify-center gap-x-1 gap-y-0.5 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Droplets className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="sr-only">Precipitation probability: </span>
            <span>
              {precipProbability === null
                ? "—"
                : `${Math.round(precipProbability)}%`}
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Wind className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="sr-only">Max wind speed: </span>
            <span>{formatSpeed(windMax, speedUnit)}</span>
          </span>
        </span>
        <span className="flex w-full flex-wrap justify-center gap-x-1 gap-y-0.5 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Sunrise className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="sr-only">Sunrise: </span>
            <span>{formatTimeOfDay(sunrise, hourFormat)}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Sunset className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="sr-only">Sunset: </span>
            <span>{formatTimeOfDay(sunset, hourFormat)}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

export type DailyData = WeatherData["daily"];
