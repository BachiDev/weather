"use client";

import { WeatherIcon } from "./WeatherIcon";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import { sliceDayHours, sliceNext24Hours } from "@/lib/forecast";
import {
  formatHourLabel,
  formatTemp,
  type HourFormat,
  type TempUnit,
} from "@/lib/units";
import { getWeatherDescription } from "@/lib/weatherCodes";
import type { WeatherData } from "@/types/weather";

type HourlyForecastProps = {
  data: WeatherData["hourly"];
  /** Location-local "now" (`locationNowIso`) — anchors the 24h window without TZ math. */
  currentTime: string;
  tempUnit: TempUnit;
  hourFormat: HourFormat;
  /** Drill-down: show this daily index instead of the next 24h. */
  dayIndex?: number | null;
  dayLabel?: string | null;
  onResetDay?: () => void;
};

/**
 * Next-24-hours (or one drilled-down day) as a wrapping grid: readable on
 * mobile, no chart weight, every hour carries icon + temperature +
 * screen-reader description.
 */
const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  currentTime,
  tempUnit,
  hourFormat,
  dayIndex = null,
  dayLabel = null,
  onResetDay,
}) => {
  const drilled = dayIndex !== null;
  const points = drilled
    ? sliceDayHours(data, dayIndex)
    : sliceNext24Hours(data, currentTime);

  return (
    <Card>
      <SectionHeading
        level={3}
        eyebrow={drilled && dayLabel ? dayLabel : "Next 24 hours"}
        title={drilled ? "Hourly for this day" : "Hourly forecast"}
      />
      {drilled && onResetDay && (
        <div className="-mt-3 mb-4 text-center">
          <button
            type="button"
            onClick={onResetDay}
            className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
          >
            ← Back to next 24 hours
          </button>
        </div>
      )}
      <ol
        className="flex flex-wrap gap-2"
        aria-label={
          drilled && dayLabel
            ? `Hourly temperature for ${dayLabel}`
            : "Hourly temperature for the next 24 hours"
        }
      >
        {points.map((point) => {
          const description = getWeatherDescription(point.code);
          return (
            <li
              key={point.time}
              className="flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-center"
              aria-label={`${formatHourLabel(point.time, hourFormat)}: ${formatTemp(point.temp, tempUnit)}, ${description}`}
            >
              <span
                className="font-mono text-[11px] uppercase text-zinc-400"
                aria-hidden="true"
              >
                {formatHourLabel(point.time, hourFormat)}
              </span>
              <WeatherIcon
                code={point.code}
                size={24}
                className="text-brand-300"
              />
              <span
                className="text-sm font-semibold text-zinc-100"
                aria-hidden="true"
              >
                {formatTemp(point.temp, tempUnit)}
              </span>
              <span className="sr-only">{description}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};

export default HourlyForecast;
